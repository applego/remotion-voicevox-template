import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Img,
  Sequence,
  staticFile,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Types ─────────────────────────────────────────────
export type NarrationSegmentType = "hook" | "body" | "tip" | "cta" | "closing";

export interface NarrationSegment {
  id: number;
  type: NarrationSegmentType;
  /** Narration text (spoken) */
  narration: string;
  /** Display text (shown on screen — shorter than narration) */
  displayText: string;
  /** Optional sub-text below the main display text */
  subText?: string;
  /** Words to highlight */
  highlightWords?: string[];
  /** Optional image (public/content/) */
  imageSrc?: string;
  /** Icon emoji or unicode character */
  icon?: string;
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  soundEffect?: string;
  /** Override background for this segment */
  bgColor?: string;
}

export interface NarrationConfig {
  segments: NarrationSegment[];
  bgm?: { src: string; volume: number };
  /** Channel/show title shown in corner */
  channelLabel?: string;
  style?: {
    /** Primary theme color (used for accents) */
    accentColor?: string;
    /** Secondary/background color */
    bgColor?: string;
    bodyFontSize?: number;
    hookFontSize?: number;
    textColor?: string;
    subTextColor?: string;
  };
}

// ─── Defaults ───────────────────────────────────────────
const SEGMENT_COLORS: Record<NarrationSegmentType, string> = {
  hook: "#1a1a2e",
  body: "#0d1b2a",
  tip: "#1b2838",
  cta: "#16213e",
  closing: "#0f0c29",
};

/**
 * Visual scenes: the backgrounds a viewer (and a scene detector) can actually
 * tell apart.
 *
 * Measured 2026-09-04: a rendered 53.8s episode had **zero** detected scene
 * changes, even with ffmpeg's threshold lowered from 0.30 to 0.04. The role
 * model cuts every 7.121s (median). The cause was not the per-type background
 * idea but the palette: the five SEGMENT_COLORS above are all the same near
 * black navy, within a few percent of each other in luminance. Nine tenths of
 * the frame never moved, so the video was one slide held for 53 seconds.
 *
 * These stay inside the channel's dark palette — this is not a redesign — but
 * each step is a real change in hue and luminance, so a cut reads as a cut.
 */
export const SCENE_BACKGROUNDS: readonly string[] = [
  "#0d1b2a", // deep navy — where the channel already lives
  "#24243e", // violet-leaning slate
  "#0b3a52", // colder blue
  "#2b1b33", // plum
  "#0f2a2a", // teal-leaning
  "#2a1f1a", // warm brown, the widest departure
];

/**
 * How many segments share one background.
 *
 * Segments run ~3.5s, so grouping three of them puts a cut roughly every 10s:
 * about 5 cuts in a 53s episode = ~5.6 cuts/min. That sits inside the role
 * model's measured density band (0.0-5.21/min, +15% tolerance) and inside its
 * cut-interval band (1.414-18.484s). Aiming at the median density (2.12/min)
 * instead would mean two cuts in a whole episode, which is how the static
 * version passed the check in the first place.
 */
export const SEGMENTS_PER_SCENE = 3;

export const sceneIndexFor = (segmentIndex: number): number =>
  Math.floor(segmentIndex / SEGMENTS_PER_SCENE);

export const sceneBackgroundFor = (segmentIndex: number): string =>
  SCENE_BACKGROUNDS[sceneIndexFor(segmentIndex) % SCENE_BACKGROUNDS.length];

/**
 * Where the scene's light sits, as a CSS radial-gradient position.
 *
 * Measured 2026-09-04: changing only the background colour moved ffmpeg's
 * scene score to at most 0.153, against the 0.30 threshold the role model was
 * measured with — about half of what a cut needs. `scene` compares whole
 * frames, so a uniform tint shift of ~23/255 cannot read as a cut no matter
 * which two dark navies are chosen.
 *
 * Moving a large soft light across the frame changes a wide area's luminance
 * instead, which is what a real cut does. The positions walk the frame rather
 * than drifting, so consecutive scenes differ in where the frame is bright.
 */
const SCENE_LIGHT_POSITIONS: readonly string[] = [
  "22% 26%",
  "78% 68%",
  "50% 14%",
  "18% 74%",
  "82% 30%",
  "50% 86%",
];

/** The lift each scene's light adds, over the flat background. */
const SCENE_LIGHT_COLORS: readonly string[] = [
  "rgba(79,195,247,0.30)",
  "rgba(149,117,205,0.30)",
  "rgba(77,182,172,0.28)",
  "rgba(240,98,146,0.24)",
  "rgba(255,183,77,0.22)",
  "rgba(129,212,250,0.28)",
];

export const sceneLightFor = (segmentIndex: number): string => {
  const i = sceneIndexFor(segmentIndex);
  const pos = SCENE_LIGHT_POSITIONS[i % SCENE_LIGHT_POSITIONS.length];
  const color = SCENE_LIGHT_COLORS[i % SCENE_LIGHT_COLORS.length];
  return `radial-gradient(circle at ${pos}, ${color} 0%, rgba(0,0,0,0) 62%)`;
};
const DEFAULT_STYLE = {
  /** Scene backgrounds and the moving light. Set false for a single ground. */
  sceneBackgrounds: true as boolean,
  accentColor: "#4FC3F7",
  bgColor: "#0d1b2a",
  bodyFontSize: 52,
  hookFontSize: 64,
  textColor: "#FFFFFF",
  subTextColor: "#90CAF9",
};

// ─── TopLabel ────────────────────────────────────────────
const TopLabel: React.FC<{
  type: NarrationSegmentType;
  accentColor: string;
  opacity: number;
}> = ({ type, accentColor, opacity }) => {
  const labels: Record<NarrationSegmentType, string> = {
    hook: "💡",
    body: "📌",
    tip: "🔑",
    cta: "▶",
    closing: "✅",
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 60,
        backgroundColor: accentColor,
        borderRadius: 8,
        padding: "6px 18px",
        opacity,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 28,
          fontWeight: 700,
          color: "#000",
        }}
      >
        {labels[type]}
      </span>
    </div>
  );
};

// ─── MainTextBlock ────────────────────────────────────────
const MainTextBlock: React.FC<{
  segment: NarrationSegment;
  localFrame: number;
  fps: number;
  style: typeof DEFAULT_STYLE;
  hasImage: boolean;
}> = ({ segment, localFrame, fps, style, hasImage }) => {
  const fadeOpacity = interpolate(localFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const slideY = interpolate(localFrame, [0, fps * 0.4], [24, 0], {
    extrapolateRight: "clamp",
  });

  const fontSize =
    segment.type === "hook" ? style.hookFontSize : style.bodyFontSize;

  const renderHighlighted = (text: string) => {
    const words = segment.highlightWords ?? [];
    if (words.length === 0) return text;
    let result: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    for (const word of words) {
      const idx = remaining.indexOf(word);
      if (idx === -1) continue;
      if (idx > 0) {
        result.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      }
      result.push(
        <span
          key={key++}
          style={{ color: style.accentColor, fontWeight: 900 }}
        >
          {word}
        </span>
      );
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) result.push(<span key={key++}>{remaining}</span>);
    return result.length > 0 ? result : text;
  };

  const textAreaTop = hasImage ? "52%" : "20%";

  return (
    <div
      style={{
        position: "absolute",
        top: textAreaTop,
        left: 0,
        right: 0,
        bottom: "5%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 50px",
        opacity: fadeOpacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      {/* Icon */}
      {segment.icon && (
        <div
          style={{
            fontSize: 72,
            marginBottom: 12,
            textShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {segment.icon}
        </div>
      )}

      {/* Main text */}
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight: 700,
          color: style.textColor,
          lineHeight: 1.5,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {renderHighlighted(segment.displayText)}
      </div>

      {/* Sub-text */}
      {segment.subText && (
        <div
          style={{
            fontFamily,
            fontSize: 30,
            fontWeight: 400,
            color: style.subTextColor,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.5,
            opacity: 0.9,
          }}
        >
          {segment.subText}
        </div>
      )}
    </div>
  );
};

// ─── ImageBlock ───────────────────────────────────────────
const ImageBlock: React.FC<{
  src: string;
  localFrame: number;
  fps: number;
}> = ({ src, localFrame, fps }) => {
  // ビート境界はフェードではなくカットにする。
  //
  // 実測 2026-09-09: 0.3秒(9フレーム)かけて入れ替えると、1フレーム間の差が
  // 全変化量の1/9にしかならず、ffmpeg の scene スコアは 0.05〜0.10 に留まった。
  // 模倣ゲートの閾値は 0.30 で、これは模倣元の実測にも使っている値なので下げられない
  // （下げれば比較そのものが無効になる）。模倣元は実際にカットで切り替わっており、
  // ここを漸進的に混ぜていたことが「90秒のスライドショー」に見えていた原因。
  // 1フレーム目だけ 0 から入るのは、黒からの立ち上がりを残すため。
  const opacity = localFrame <= 0 ? 0 : 1;
  // Ken Burns: subtle zoom
  const scale = interpolate(localFrame, [0, fps * 5], [1.0, 1.06], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "52%",
        overflow: "hidden",
        opacity,
      }}
    >
      <Img
        src={staticFile(`content/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      {/* Gradient fade to background */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(to bottom, transparent, rgba(13,27,42,1))",
        }}
      />
    </div>
  );
};

// ─── ProgressBar ─────────────────────────────────────────
const ProgressBar: React.FC<{
  current: number;
  total: number;
  accentColor: string;
}> = ({ current, total, accentColor }) => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      left: 60,
      right: 60,
      height: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 2,
    }}
  >
    <div
      style={{
        width: `${((current + 1) / total) * 100}%`,
        height: "100%",
        backgroundColor: accentColor,
        borderRadius: 2,
        transition: "width 0.3s ease",
      }}
    />
  </div>
);

// ─── Main NarrationShort Component ───────────────────────
export const NarrationShort: React.FC<{ config: NarrationConfig }> = ({
  config,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = { ...DEFAULT_STYLE, ...config.style };

  // Build segment positions
  let accumulated = 0;
  const segmentPositions = config.segments.map((s) => {
    const start = accumulated;
    accumulated += s.durationInFrames + s.pauseAfter;
    return { ...s, startFrame: start };
  });

  // Find current
  let currentIdx = 0;
  let currentSegment = segmentPositions[0];
  let localFrame = 0;
  for (let i = 0; i < segmentPositions.length; i++) {
    const sp = segmentPositions[i];
    if (
      frame >= sp.startFrame &&
      frame < sp.startFrame + sp.durationInFrames + sp.pauseAfter
    ) {
      currentIdx = i;
      currentSegment = sp;
      localFrame = frame - sp.startFrame;
      break;
    }
  }

  // Scenes are on by default: every NarrationShort channel had the same
  // one-static-frame problem. A channel that deliberately wants a single
  // ground can say so with `style.sceneBackgrounds: false`, and then the old
  // chain applies unchanged — that opt-out is what keeps SEGMENT_COLORS and
  // `style.bgColor` reachable rather than dead.
  //
  // Without the opt-out this silently overrode the per-channel `style.bgColor`
  // that yaml_to_narration_config.py sets, which is a behaviour change no
  // channel asked for.
  const scenesEnabled = style.sceneBackgrounds !== false;
  const bgColor =
    currentSegment.bgColor ??
    (scenesEnabled ? sceneBackgroundFor(currentIdx) : undefined) ??
    SEGMENT_COLORS[currentSegment.type] ??
    style.bgColor;
  const hasImage = Boolean(currentSegment.imageSrc);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Scene light: the large soft area that actually makes a cut read as a
          cut. Sits above the flat background and below everything else.
          Follows the same opt-out as the scene backgrounds. */}
      {scenesEnabled && (
        <AbsoluteFill
          style={{ background: sceneLightFor(currentIdx), pointerEvents: "none" }}
        />
      )}

      {/* Image section (top half) */}
      {hasImage && currentSegment.imageSrc && (
        <ImageBlock
          src={currentSegment.imageSrc}
          localFrame={localFrame}
          fps={fps}
        />
      )}

      {/* Accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: style.accentColor,
        }}
      />

      {/* Segment type label */}
      <TopLabel
        type={currentSegment.type}
        accentColor={style.accentColor}
        opacity={interpolate(localFrame, [0, fps * 0.3], [0, 1], {
          extrapolateRight: "clamp",
        })}
      />

      {/* Channel label */}
      {config.channelLabel && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            fontFamily,
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {config.channelLabel}
        </div>
      )}

      {/* Main content */}
      <MainTextBlock
        segment={currentSegment}
        localFrame={localFrame}
        fps={fps}
        style={style}
        hasImage={hasImage}
      />

      {/* Progress indicator */}
      <ProgressBar
        current={currentIdx}
        total={segmentPositions.length}
        accentColor={style.accentColor}
      />

      {/* Voice */}
      {segmentPositions.map((sp) => (
        <Sequence
          key={sp.id}
          from={sp.startFrame}
          durationInFrames={sp.durationInFrames}
        >
          <Audio src={staticFile(`voices/${sp.voiceFile}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* SFX */}
      {segmentPositions
        .filter((sp) => sp.soundEffect)
        .map((sp) => (
          <Sequence
            key={`se-${sp.id}`}
            from={sp.startFrame}
            durationInFrames={30}
          >
            <Audio src={staticFile(`se/${sp.soundEffect}`)} volume={0.5} />
          </Sequence>
        ))}

      {/* BGM */}
      {config.bgm && (
        <Audio
          src={staticFile(`bgm/${config.bgm.src}`)}
          volume={config.bgm.volume}
          loop
        />
      )}
    </AbsoluteFill>
  );
};
