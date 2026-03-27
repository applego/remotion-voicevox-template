import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Types ─────────────────────────────────────────────
export interface QuoteSegment {
  id: number;
  /** Main quote text displayed large */
  quoteText: string;
  /** Attribution: author / source */
  attribution?: string;
  /** Subtitle / explanation text (smaller) */
  subtitle?: string;
  /** Words to highlight in color */
  highlightWords?: string[];
  /** Voice narration file */
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  /** Optional sound effect */
  soundEffect?: string;
  /** Background gradient override */
  gradient?: [string, string];
}

export interface QuoteConfig {
  segments: QuoteSegment[];
  bgm?: { src: string; volume: number };
  /** Default gradient: [topColor, bottomColor] */
  defaultGradient?: [string, string];
  style?: {
    quoteColor?: string;
    highlightColor?: string;
    quoteFontSize?: number;
    attributionColor?: string;
  };
}

// ─── Default config ─────────────────────────────────────
const DEFAULT_GRADIENT: [string, string] = ["#0f0c29", "#302b63"];
const DEFAULT_STYLE = {
  quoteColor: "#FFFFFF",
  highlightColor: "#FFD700",
  quoteFontSize: 62,
  attributionColor: "#a0a0c8",
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
  segment: QuoteSegment;
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
        "
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
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
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
          — {segment.attribution}
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

// ─── Particle Effect (subtle background dots) ────────────
const BackgroundParticles: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: (i * 37 + 15) % 100,
    y: (i * 53 + 20) % 100,
    size: 2 + (i % 3),
    speed: 0.3 + (i % 5) * 0.1,
    phase: (i * 41) % 100,
  }));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((p, i) => {
        const drift = Math.sin((frame / fps) * p.speed + p.phase) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y + drift}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Main QuoteShort Component ───────────────────────────
export const QuoteShort: React.FC<{ config: QuoteConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = { ...DEFAULT_STYLE, ...config.style };

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

  const gradient = currentSegment.gradient ?? config.defaultGradient ?? DEFAULT_GRADIENT;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
    >
      {/* Subtle particle background */}
      <BackgroundParticles frame={frame} fps={fps} />

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
