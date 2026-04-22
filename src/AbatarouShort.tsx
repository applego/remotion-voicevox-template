import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
  Img,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Types ─────────────────────────────────────────────

export interface AbatarouSegment {
  id: number;
  /** Narration text (displayed as bottom subtitle) */
  text: string;
  /** Background image file (in public/content/) */
  backgroundImage: string;
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
}

export interface AbatarouConfig {
  segments: AbatarouSegment[];
  bgm?: { src: string; volume: number };
  /** Opening book cover image (full screen, shown before segments) */
  bookCover?: { src: string; durationInFrames: number };
  style?: Partial<typeof DEFAULT_STYLE>;
}

// ─── Defaults ──────────────────────────────────────────

const DEFAULT_STYLE = {
  /** Subtitle font size */
  fontSize: 42,
  /** Subtitle text color */
  textColor: "#FFFFFF",
  /** Ken Burns zoom amount (1.0 = no zoom) */
  kenBurnsScale: 1.10,
  /** Dark gradient at bottom for subtitle readability */
  overlayOpacity: 0.7,
};

// ─── Ken Burns on static image ─────────────────────────

const KenBurnsImage: React.FC<{
  src: string;
  frame: number;
  totalFrames: number;
  fps: number;
  maxScale: number;
  /** Alternate pan direction per segment for variety */
  direction: number;
}> = ({ src, frame, totalFrames, fps, maxScale, direction }) => {
  const scale = interpolate(frame, [0, totalFrames], [1.0, maxScale], {
    extrapolateRight: "clamp",
  });
  const panX = interpolate(frame, [0, totalFrames], [0, 15 * direction], {
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, totalFrames], [0, -8], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`content/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Bottom gradient overlay ───────────────────────────

const BottomGradient: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(
        to bottom,
        transparent 0%,
        transparent 55%,
        rgba(0,0,0,${opacity * 0.3}) 70%,
        rgba(0,0,0,${opacity * 0.85}) 90%,
        rgba(0,0,0,${opacity}) 100%
      )`,
    }}
  />
);

// ─── TV-style subtitle (bottom, bold, outlined) ────────

const Subtitle: React.FC<{
  text: string;
  localFrame: number;
  totalFrames: number;
  fps: number;
  style: typeof DEFAULT_STYLE;
}> = ({ text, localFrame, totalFrames, fps, style }) => {
  // Fade in quickly, fade out at end
  const fadeIn = interpolate(localFrame, [0, fps * 0.25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    localFrame,
    [totalFrames - fps * 0.2, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Thick black outline via multiple text-shadows (TV subtitle style)
  const outlineSize = 3;
  const outline = [
    `${outlineSize}px ${outlineSize}px 0 #000`,
    `${-outlineSize}px ${outlineSize}px 0 #000`,
    `${outlineSize}px ${-outlineSize}px 0 #000`,
    `${-outlineSize}px ${-outlineSize}px 0 #000`,
    `${outlineSize}px 0 0 #000`,
    `${-outlineSize}px 0 0 #000`,
    `0 ${outlineSize}px 0 #000`,
    `0 ${-outlineSize}px 0 #000`,
    `0 4px 12px rgba(0,0,0,0.8)`,
  ].join(", ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: "6%",
        left: "5%",
        right: "5%",
        opacity,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: style.fontSize,
          fontWeight: 900,
          color: style.textColor,
          lineHeight: 1.6,
          textShadow: outline,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Book cover opening ────────────────────────────────

const BookCoverOpening: React.FC<{
  src: string;
  frame: number;
  totalFrames: number;
  fps: number;
}> = ({ src, frame, totalFrames, fps }) => {
  const scale = interpolate(frame, [0, totalFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame,
    [totalFrames - fps * 0.5, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <Img
        src={staticFile(`content/${src}`)}
        style={{
          maxWidth: "60%",
          maxHeight: "80%",
          objectFit: "contain",
          transform: `scale(${scale})`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Main Component ────────────────────────────────────

export const AbatarouShort: React.FC<{ config: AbatarouConfig }> = ({
  config,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = { ...DEFAULT_STYLE, ...config.style };

  // Book cover offset
  const coverDur = config.bookCover?.durationInFrames ?? 0;

  // Build timeline (after book cover)
  let accumulated = coverDur;
  const timeline = config.segments.map((s, i) => {
    const start = accumulated;
    accumulated += s.durationInFrames + s.pauseAfter;
    return { ...s, startFrame: start, index: i };
  });

  // Find active segment
  let active = timeline[0];
  let localFrame = 0;
  for (const t of timeline) {
    if (frame >= t.startFrame && frame < t.startFrame + t.durationInFrames + t.pauseAfter) {
      active = t;
      localFrame = frame - t.startFrame;
      break;
    }
  }

  // Is book cover still showing?
  const showingCover = config.bookCover && frame < coverDur;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Book cover opening */}
      {config.bookCover && frame < coverDur && (
        <BookCoverOpening
          src={config.bookCover.src}
          frame={frame}
          totalFrames={coverDur}
          fps={fps}
        />
      )}

      {/* Main segments: photo background + subtitle */}
      {!showingCover && active && (
        <>
          {/* Ken Burns background image */}
          <KenBurnsImage
            src={active.backgroundImage}
            frame={localFrame}
            totalFrames={active.durationInFrames + active.pauseAfter}
            fps={fps}
            maxScale={style.kenBurnsScale}
            direction={active.index % 2 === 0 ? 1 : -1}
          />

          {/* Bottom gradient for subtitle readability */}
          <BottomGradient opacity={style.overlayOpacity} />

          {/* TV-style subtitle at bottom */}
          {localFrame < active.durationInFrames && (
            <Subtitle
              text={active.text}
              localFrame={localFrame}
              totalFrames={active.durationInFrames}
              fps={fps}
              style={style}
            />
          )}
        </>
      )}

      {/* Voice audio per segment */}
      {timeline.map((t) => (
        <Sequence key={t.id} from={t.startFrame} durationInFrames={t.durationInFrames}>
          <Audio src={staticFile(`voices/${t.voiceFile}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* BGM */}
      {config.bgm && (
        <Audio src={staticFile(`bgm/${config.bgm.src}`)} volume={config.bgm.volume} loop />
      )}
    </AbsoluteFill>
  );
};
