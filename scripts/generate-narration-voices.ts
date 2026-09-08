#!/usr/bin/env npx ts-node

/**
 * Narration Voice Generator (VOICEVOX + Qwen3-TTS)
 *
 * Reads narration-voice-manifest.json and generates WAV files for each segment.
 * Routes to VOICEVOX or Qwen3-TTS based on the "provider" field in the manifest.
 * Updates narration-script.ts with actual durationInFrames from generated audio.
 *
 * Usage:
 *   cd remotion && npx ts-node scripts/generate-narration-voices.ts
 *
 * Prerequisites:
 *   - VOICEVOX running on localhost:50021 (for voicevox provider)
 *   - Qwen3-TTS deps installed (for qwen3_tts provider); falls back to VOICEVOX if unavailable
 *   - narration-voice-manifest.json in src/data/
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, "src/data/narration-voice-manifest.json");
const NARRATION_SCRIPT_PATH = path.join(ROOT_DIR, "src/data/narration-script.ts");
const OUTPUT_DIR = path.join(ROOT_DIR, "public/voices");
const VOICEVOX_HOST = "http://localhost:50021";
const FPS = 30;

// Path to TTS adapter (relative to remotion root)
const TTS_ADAPTER_PATH = path.resolve(
  ROOT_DIR,
  "../../companies/voice-clone-company/lib/tts_adapter.py"
);

interface VoiceManifestEntry {
  id: number;
  voiceFile: string;
  text: string;
  speakerId: number;
  provider?: string;   // "voicevox" | "qwen3_tts" (default: "voicevox")
  refAudio?: string;   // Qwen3-TTS: reference audio path for voice cloning
  refText?: string;    // Qwen3-TTS: reference audio transcript
  speedScale?: number; // VOICEVOX narration speed from tools.tts.voice_speed
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkVoicevox(): Promise<boolean> {
  try {
    const response = await fetch(`${VOICEVOX_HOST}/version`);
    if (response.ok) {
      const version = await response.text();
      console.log(`VOICEVOX version: ${version}`);
      return true;
    }
  } catch {
    // not available
  }
  return false;
}

async function ensureVoicevox(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (await checkVoicevox()) return true;
    console.log(`VOICEVOX not available (attempt ${attempt}/${maxRetries}). Restarting...`);
    try {
      execSync('open -a VOICEVOX', { stdio: 'ignore' });
    } catch { /* ignore */ }
    // Wait for VOICEVOX to start (progressively longer)
    const waitSec = 8 + (attempt - 1) * 5;
    console.log(`  Waiting ${waitSec}s for VOICEVOX to start...`);
    await sleep(waitSec * 1000);
  }
  return false;
}

async function getAudioQuery(
  text: string,
  speakerId: number,
  speedScale?: number
): Promise<any> {
  const encoded = encodeURIComponent(text);
  const res = await fetch(
    `${VOICEVOX_HOST}/audio_query?speaker=${speakerId}&text=${encoded}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`audio_query failed: ${res.statusText}`);
  // `fetch().json()` は unknown を返す。2026-08-20 に下の speedScale 行を足した時、
  // ここを unknown のまま書き換えたので TS18046 で ts-node が起動時に落ちるようになり、
  // 呼び出し側の `|| WARNING` がそれを飲み込んで、以後20日間すべてのレンダが
  // 8/20 に合成した別エピソードの音声を使い続けた（実測 2026-09-09）。
  const query = (await res.json()) as Record<string, unknown>;
  // The Shorts playbook builds retention on fast delivery, and channel configs say so
  // in `tools.tts.voice_speed`. Until 2026-08-20 the query went to /synthesis exactly
  // as returned, so that setting did nothing and every channel spoke at 1.0x — the
  // first six Shorts renders came out 91-207s against scripts written for 50-55s.
  if (typeof speedScale === "number" && Number.isFinite(speedScale) && speedScale > 0) {
    query.speedScale = speedScale;
  }
  return query;
}

async function synthesize(query: any, speakerId: number): Promise<ArrayBuffer> {
  const res = await fetch(`${VOICEVOX_HOST}/synthesis?speaker=${speakerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!res.ok) throw new Error(`synthesis failed: ${res.statusText}`);
  return res.arrayBuffer();
}

function isQwen3TTSAvailable(): boolean {
  try {
    execSync(
      `python3 "${TTS_ADAPTER_PATH}" --status 2>&1 | grep -q "qwen3_tts: OK"`,
      { stdio: "ignore" }
    );
    return true;
  } catch {
    return false;
  }
}

async function synthesizeQwen3TTS(
  entry: VoiceManifestEntry,
  outputPath: string
): Promise<boolean> {
  const args = [
    `python3 "${TTS_ADAPTER_PATH}"`,
    JSON.stringify(entry.text),
    `--output "${outputPath}"`,
    `--provider qwen3_tts`,
  ];
  if (entry.refAudio) {
    // Resolve ref_audio relative to voice-clone-company dir
    const refAudioAbs = path.resolve(
      ROOT_DIR,
      "../../companies/voice-clone-company",
      entry.refAudio
    );
    args.push(`--ref-audio "${refAudioAbs}"`);
  }
  if (entry.refText) {
    args.push(`--ref-text ${JSON.stringify(entry.refText)}`);
  }
  try {
    execSync(args.join(" "), { stdio: "pipe" });
    return true;
  } catch (e) {
    return false;
  }
}

function getWavDuration(filePath: string): number {
  try {
    const result = execSync(
      `python3 -c "import wave; w=wave.open('${filePath}','r'); print(w.getnframes()/w.getframerate())"`,
      { encoding: "utf-8" }
    );
    return parseFloat(result.trim());
  } catch {
    console.error(`Failed to get duration for ${filePath}`);
    return 3.0; // fallback
  }
}

/** manifest の「何を・誰の声で・どの速度で喋るか」だけを内容アドレス化する。 */
function manifestDigest(manifest: VoiceManifestEntry[]): string {
  const canonical = manifest.map((e) => ({
    voiceFile: e.voiceFile,
    text: e.text,
    provider: e.provider ?? "voicevox",
    speakerId: e.speakerId ?? 3,
    speedScale: e.speedScale ?? 1,
  }));
  return crypto.createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found: ${MANIFEST_PATH}`);
    console.error("Run yaml_to_narration_config.py first to generate the manifest.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest: VoiceManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf-8")
  );

  // Determine which providers are needed
  const providers = new Set(manifest.map((e) => e.provider ?? "voicevox"));
  console.log(`Providers in manifest: ${[...providers].join(", ")}`);

  // Check VOICEVOX if needed
  let voicevoxAvailable = false;
  if (providers.has("voicevox")) {
    voicevoxAvailable = await ensureVoicevox();
    if (!voicevoxAvailable) {
      console.error("ERROR: VOICEVOX required but not available");
      process.exit(1);
    }
  }

  // Check Qwen3-TTS if needed
  let qwen3ttsAvailable = false;
  if (providers.has("qwen3_tts")) {
    qwen3ttsAvailable = isQwen3TTSAvailable();
    if (!qwen3ttsAvailable) {
      console.warn(
        "WARNING: Qwen3-TTS is not available (GPU/deps missing). Falling back to VOICEVOX for qwen3_tts segments."
      );
      // Ensure VOICEVOX is available as fallback
      if (!voicevoxAvailable) {
        voicevoxAvailable = await ensureVoicevox();
        if (!voicevoxAvailable) {
          console.error("ERROR: VOICEVOX fallback also unavailable");
          process.exit(1);
        }
      }
    }
  }

  console.log(`Processing ${manifest.length} narration segments...`);

  const durations: Record<string, number> = {};
  // 合成できなかった分。1本でも欠けたら音声は台本と一致しないので、
  // 最後に throw して呼び出し側へ非ゼロで返す（従来はログだけ出して "Done!" だった）。
  const failed: string[] = [];

  for (const entry of manifest) {
    const outputPath = path.join(OUTPUT_DIR, entry.voiceFile);
    const preview = entry.text.substring(0, 40).replace(/\n/g, " ");
    const provider = entry.provider ?? "voicevox";

    console.log(`  [${entry.id}] [${provider}] Generating: ${entry.voiceFile} - "${preview}..."`);

    try {
      let generated = false;

      // Try Qwen3-TTS if requested and available
      if (provider === "qwen3_tts" && qwen3ttsAvailable) {
        generated = await synthesizeQwen3TTS(entry, outputPath);
        if (!generated) {
          console.warn(`  [${entry.id}] Qwen3-TTS failed, falling back to VOICEVOX`);
        }
      }

      // Use VOICEVOX (primary or fallback)
      if (!generated) {
        const speakerId = entry.speakerId ?? 3;
        const query = await getAudioQuery(entry.text, speakerId, entry.speedScale);
        const audio = await synthesize(query, speakerId);
        fs.writeFileSync(outputPath, Buffer.from(audio));
        generated = true;
      }

      const duration = getWavDuration(outputPath);
      const frames = Math.ceil(duration * FPS);
      durations[entry.voiceFile] = frames;

      console.log(`       -> ${duration.toFixed(2)}s, ${frames} frames`);
    } catch (e) {
      console.error(`  ERROR: ${entry.voiceFile}:`, e);
      failed.push(`${entry.voiceFile}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Save durations
  const durationsPath = path.join(OUTPUT_DIR, "narration-durations.json");
  fs.writeFileSync(durationsPath, JSON.stringify(durations, null, 2));
  console.log(`\nDurations saved: ${durationsPath}`);

  // Update narration-script.ts with actual durations
  if (fs.existsSync(NARRATION_SCRIPT_PATH)) {
    let tsContent = fs.readFileSync(NARRATION_SCRIPT_PATH, "utf-8");
    let updated = 0;

    for (const [voiceFile, frames] of Object.entries(durations)) {
      // Find the segment containing this voiceFile and update durationInFrames
      const pattern = new RegExp(
        `(voiceFile:\\s*"${voiceFile.replace(".", "\\.")}"[\\s\\S]*?durationInFrames:\\s*)\\d+`,
        "g"
      );
      const newContent = tsContent.replace(pattern, `$1${frames}`);
      if (newContent !== tsContent) {
        tsContent = newContent;
        updated++;
      }
    }

    if (updated > 0) {
      fs.writeFileSync(NARRATION_SCRIPT_PATH, tsContent);
      console.log(`Updated ${updated} durationInFrames in narration-script.ts`);
    }
  }

  if (failed.length > 0) {
    throw new Error(
      `narration synthesis failed for ${failed.length}/${manifest.length} segment(s):\n  ` +
        failed.join("\n  ")
    );
  }

  // 内容アドレスの証跡。これが今の manifest と一致しない限り、レンダは通さない。
  // mtime ではなく内容で見るのは、git checkout や touch が mtime を動かすため。
  const stampPath = path.join(OUTPUT_DIR, "narration-voice-stamp.json");
  fs.writeFileSync(
    stampPath,
    JSON.stringify(
      {
        manifest_sha256: manifestDigest(manifest),
        segment_count: manifest.length,
        generated_at: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`Voice stamp: ${stampPath}`);

  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
