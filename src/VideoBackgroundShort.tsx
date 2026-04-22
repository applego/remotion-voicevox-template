import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  Video,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Types ─────────────────────────────────────────────
export interface VideoBgSegment {
  id: number;
  quoteText: string;
  attribution?: string;
  subtitle?: string;
  highlightWords?: string[];
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  soundEffect?: string;
  /** Optional per-segment background video override */
  backgroundVideo?: string;
}

export interface VideoBgConfig {
  segments: VideoBgSegment[];
  bgm?: { src: string; volume: number };
  /** Global background video (used when segment has no override) */
  backgroundVideo?: string;
  /** Video playback settings */
  videoSettings?: {
    loop?: boolean;
    playbackRate?: number;
    muted?: boolean;
  };
  /** Dark overlay for text readability */
  overlay?: {
    color?: string;
    opacity?: number;
    gradient?: boolean;
  };
  /** Ken Burns effect (slow zoom/pan on background) */
  kenBurns?: boolean;
  style?: {
    quoteColor?: string;
    highlightColor?: string;
    quoteFontSize?: number;
    attributionColor?: string;
  };
}

const DEFAULT_STYLE = {
  quoteColor: "#FFFFFF",
  highlightColor: "#FFD700",
  quoteFontSize: 62,
  attributionColor: "#d0d0e8",
};

// ─── DecorativeLine ─────────────────────────────────────
const DecorativeLine: React.FC<{ opacity: number; color: string }> = ({
  opacity,
  color,
}) => (
  <div
    style={{
      width: 80,
      height: 4,
      backgroundColor: color,
      borderRadius: 2,
      opacity,
      margin: "16px auto",
    }}
  />
);

// ─── QuoteTextBlock ──────────────────────────────────────
const QuoteTextBlock: React.FC<{
  segment: VideoBgSegment;
  localFrame: number;
  fps: number;
  style: typeof DEFAULT_STYLE;
}> = ({ segment, localFrame, fps, style }) => {
  const opacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(localFrame, [0, fps * 0.5], [0.92, 1.0], {
    extrapolateRight: "clamp",
  });

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
          style={{ color: style.highlightColor, fontWeight: 900 }}
        >
          {word}
        </span>
      );
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) result.push(<span key={key++}>{remaining}</span>);
    return result.length > 0 ? result : text;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Opening quote mark */}
      <div
        style={{
          fontFamily,
          fontSize: 120,
          color: style.highlightColor,
          lineHeight: 0.6,
          opacity: 0.5,
          marginBottom: 16,
          fontWeight: 900,
        }}
      >
        &ldquo;
      </div>

      {/* Main quote */}
      <div
        style={{
          fontFamily,
          fontSize: style.quoteFontSize,
          fontWeight: 700,
          color: style.quoteColor,
          lineHeight: 1.6,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          textShadow: "0 2px 20px rgba(0,0,0,0.7)",
        }}
      >
        {renderHighlighted(segment.quoteText)}
      </div>

      {/* Decorative line */}
      <DecorativeLine opacity={0.8} color={style.highlightColor} />

      {/* Attribution */}
      {segment.attribution && (
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: style.attributionColor,
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          &mdash; {segment.attribution}
        </div>
      )}

      {/* Subtitle */}
      {segment.subtitle && (
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 400,
            color: style.attributionColor,
            textAlign: "center",
            marginTop: 16,
            opacity: 0.8,
          }}
        >
          {segment.subtitle}
        </div>
      )}
    </div>
  );
};

// ─── BackgroundVideo with Ken Burns ──────────────────────
const BackgroundVideoLayer: React.FC<{
  src: string;
  frame: number;
  fps: number;
  kenBurns?: boolean;
  playbackRate?: number;
}> = ({ src, frame, fps, kenBurns, playbackRate = 1.0 }) => {
  const zoomScale = kenBurns
    ? interpolate(frame, [0, fps * 60], [1.0, 1.12], {
        extrapolateRight: "clamp",
      })
    : 1.0;

  const panX = kenBurns
    ? interpolate(frame, [0, fps * 60], [0, -30], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={src}
        startFrom={0}
        playbackRate={playbackRate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoomScale}) translateX(${panX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Dark Overlay ────────────────────────────────────────
const DarkOverlay: React.FC<{
  color?: string;
  opacity?: number;
  gradient?: boolean;
}> = ({ color = "rgba(0,0,0,0.45)", opacity = 1.0, gradient = true }) => {
  const bgStyle = gradient
    ? {
        background: `linear-gradient(to bottom, ${color}, rgba(0,0,0,0.55) 50%, ${color})`,
      }
    : { backgroundColor: color };

  return (
    <AbsoluteFill
      style={{
        ...bgStyle,
        opacity,
      }}
    />
  );
};

// ─── Main VideoBackgroundShort Component ─────────────────
export const VideoBackgroundShort: React.FC<{
  config: VideoBgConfig;
}> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = { ...DEFAULT_STYLE, ...config.style };

  const videoSettings = config.videoSettings ?? {};
  const overlaySettings = config.overlay ?? {};

  // Calculate segment start positions
  let accumulated = 0;
  const segmentPositions = config.segments.map((s) => {
    const start = accumulated;
    accumulated += s.durationInFrames + s.pauseAfter;
    return { ...s, startFrame: start };
  });

  // Find current segment
  let currentSegment = segmentPositions[0];
  let localFrame = 0;
  for (const sp of segmentPositions) {
    if (
      frame >= sp.startFrame &&
      frame < sp.startFrame + sp.durationInFrames + sp.pauseAfter
    ) {
      currentSegment = sp;
      localFrame = frame - sp.startFrame;
      break;
    }
  }

  // Determine background video: per-segment override > global default
  const bgVideoSrc = currentSegment.backgroundVideo
    ? staticFile(currentSegment.backgroundVideo)
    : config.backgroundVideo
      ? staticFile(config.backgroundVideo)
      : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background video layer */}
      {bgVideoSrc && (
        <BackgroundVideoLayer
          src={bgVideoSrc}
          frame={frame}
          fps={fps}
          kenBurns={config.kenBurns ?? true}
          playbackRate={videoSettings.playbackRate ?? 0.8}
        />
      )}

      {/* Dark overlay for text readability */}
      <DarkOverlay
        color={overlaySettings.color}
        opacity={overlaySettings.opacity ?? 1.0}
        gradient={overlaySettings.gradient ?? true}
      />

      {/* Quote text */}
      <QuoteTextBlock
        segment={currentSegment}
        localFrame={localFrame}
        fps={fps}
        style={style}
      />

      {/* Voice audio */}
      {segmentPositions.map((sp) => (
        <Sequence
          key={sp.id}
          from={sp.startFrame}
          durationInFrames={sp.durationInFrames}
        >
          <Audio src={staticFile(`voices/${sp.voiceFile}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* Sound effects */}
      {segmentPositions
        .filter((sp) => sp.soundEffect)
        .map((sp) => (
          <Sequence
            key={`se-${sp.id}`}
            from={sp.startFrame}
            durationInFrames={30}
          >
            <Audio
              src={staticFile(`se/${sp.soundEffect}`)}
              volume={0.5}
            />
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
