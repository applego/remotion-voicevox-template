import React from "react";
import {
  AbsoluteFill,
  Audio,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

export interface MusicMVVisualClip {
  id: string;
  src: string;
  section: string;
  durationSeconds: number;
  prompt: string;
}

export interface MusicMVConfig {
  schema_version: number;
  dry_run: boolean;
  adapter: string;
  jobId: string;
  composition: string;
  template: string;
  channel: {
    id: string;
    display_name: string;
    made_for_kids: boolean;
    children_may_watch: boolean;
  };
  track: {
    id: string;
    title: string;
    subtitle?: string;
    artist_display_name: string;
  };
  audio: {
    src: string;
    title: string;
    artist: string;
  };
  lyrics: {
    src: string;
  };
  visualClips: MusicMVVisualClip[];
  render: {
    aspectRatio: string;
    output: string;
  };
  publishing: {
    enabled: boolean;
    dry_run_only: boolean;
    rights_review_required: boolean;
  };
}

export const defaultMusicMVConfig: MusicMVConfig = {
  schema_version: 1,
  dry_run: true,
  adapter: "youtube-channel-harness/music-mv",
  jobId: "preview",
  composition: "MusicMV",
  template: "music-mv",
  channel: {
    id: "preview",
    display_name: "Music MV Preview",
    made_for_kids: false,
    children_may_watch: true,
  },
  track: {
    id: "preview-track",
    title: "Untitled",
    artist_display_name: "artist-001",
  },
  audio: {
    src: "",
    title: "Untitled",
    artist: "artist-001",
  },
  lyrics: {
    src: "",
  },
  visualClips: [
    {
      id: "preview-scene",
      src: "",
      section: "preview",
      durationSeconds: 8,
      prompt: "Cinematic original music video preview",
    },
  ],
  render: {
    aspectRatio: "16:9",
    output: "out/music-mv-preview.mp4",
  },
  publishing: {
    enabled: false,
    dry_run_only: true,
    rights_review_required: true,
  },
};

export const calculateMusicMVFrames = (config: MusicMVConfig, fps = 30) => {
  const seconds = config.visualClips.reduce(
    (total, clip) => total + Math.max(1, clip.durationSeconds),
    0
  );
  return Math.max(120, seconds * fps);
};

const pickCurrentClip = (config: MusicMVConfig, frame: number, fps: number) => {
  let cursor = 0;
  for (const clip of config.visualClips) {
    const duration = Math.max(1, clip.durationSeconds) * fps;
    if (frame >= cursor && frame < cursor + duration) {
      return { clip, localFrame: frame - cursor, duration };
    }
    cursor += duration;
  }
  const fallback = config.visualClips[config.visualClips.length - 1] ?? defaultMusicMVConfig.visualClips[0];
  return { clip: fallback, localFrame: 0, duration: Math.max(1, fallback.durationSeconds) * fps };
};

const paletteForSection = (section: string) => {
  if (section.includes("chorus")) {
    return {
      bg: "linear-gradient(135deg, #080b18 0%, #12346f 52%, #e6f2ff 130%)",
      accent: "#6ee7ff",
      secondary: "#ffdc7a",
    };
  }
  if (section.includes("outro")) {
    return {
      bg: "linear-gradient(135deg, #111827 0%, #30445f 58%, #f3d3a4 135%)",
      accent: "#f3d3a4",
      secondary: "#8bd3ff",
    };
  }
  if (section.includes("verse")) {
    return {
      bg: "linear-gradient(135deg, #05070c 0%, #0d2445 55%, #395b7a 120%)",
      accent: "#8bd3ff",
      secondary: "#d7e9ff",
    };
  }
  return {
    bg: "linear-gradient(135deg, #05060a 0%, #101a33 54%, #4f74a3 130%)",
    accent: "#90cdf4",
    secondary: "#f8fafc",
  };
};

const splitPrompt = (prompt: string) => {
  const words = prompt.split(/,\s*/).filter(Boolean);
  return words.slice(0, 3).join("\n");
};

const resolveMediaSource = (src: string) => {
  const trimmed = src.trim();
  if (!trimmed) {
    return null;
  }
  if (/^(https?:|data:|blob:|file:)/.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return typeof window === "undefined" ? `file://${trimmed}` : trimmed;
  }
  return staticFile(trimmed.replace(/^\.?\//, "").replace(/^public\//, ""));
};

export const MusicMV: React.FC<{ config: MusicMVConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { clip, localFrame, duration } = pickCurrentClip(config, frame, fps);
  const palette = paletteForSection(clip.section);
  const clipSource = config.dry_run ? null : resolveMediaSource(clip.src);
  const audioSource = resolveMediaSource(config.audio.src);
  const isDiagnosticPreview = config.dry_run || !clipSource;
  const progress = Math.min(1, localFrame / Math.max(1, duration));
  const titleOpacity = interpolate(localFrame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(localFrame, [0, fps * 0.8], [28, 0], {
    extrapolateRight: "clamp",
  });
  const horizonShift = interpolate(progress, [0, 1], [-80, 80]);
  const lightPulse = interpolate(progress, [0, 0.5, 1], [0.25, 0.55, 0.28]);

  return (
    <AbsoluteFill style={{ background: "#05060a", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: palette.bg,
        }}
      />
      {clipSource ? (
        <Video
          src={clipSource}
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}
      {audioSource ? <Audio src={audioSource} /> : null}
      {isDiagnosticPreview ? (
        <>
          <div
            style={{
              position: "absolute",
              left: "-12%",
              right: "-12%",
              bottom: 160 + horizonShift,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
              boxShadow: `0 0 80px ${palette.accent}`,
              opacity: 0.75,
              transform: "rotate(-6deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "18%",
              bottom: 0,
              width: 520,
              height: 760,
              background: `radial-gradient(circle at 50% 18%, ${palette.secondary} 0, rgba(255,255,255,0.18) 6%, rgba(255,255,255,0.06) 18%, transparent 48%)`,
              opacity: 0.72,
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12%",
              top: "20%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              border: `1px solid ${palette.accent}`,
              opacity: lightPulse,
              boxShadow: `0 0 120px ${palette.accent}`,
            }}
          />
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.28) 46%, rgba(0,0,0,0.74))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 86,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 34,
            color: palette.accent,
            fontWeight: 700,
            letterSpacing: 0,
            marginBottom: 16,
          }}
        >
          {config.channel.display_name}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 94,
            lineHeight: 1.05,
            color: "#fff",
            fontWeight: 900,
            letterSpacing: 0,
            textShadow: "0 8px 40px rgba(0,0,0,0.64)",
          }}
        >
          {config.track.title}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 34,
            color: "rgba(255,255,255,0.78)",
            fontWeight: 700,
            marginTop: 12,
          }}
        >
          {config.track.artist_display_name} / {clip.section}
        </div>
      </div>

      {isDiagnosticPreview ? (
        <div
          style={{
            position: "absolute",
            top: 92,
            right: 96,
            width: 700,
            fontFamily,
            fontSize: 30,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.76)",
            textAlign: "right",
            whiteSpace: "pre-wrap",
            textShadow: "0 4px 28px rgba(0,0,0,0.6)",
          }}
        >
          {splitPrompt(clip.prompt)}
        </div>
      ) : null}

      {isDiagnosticPreview ? (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 64,
            fontFamily,
            fontSize: 22,
            color: "rgba(255,255,255,0.54)",
            fontWeight: 700,
        }}
      >
          {config.dry_run ? "DRY RUN PREVIEW" : "MISSING CLIP SOURCE"} ·{" "}
          {config.jobId}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
