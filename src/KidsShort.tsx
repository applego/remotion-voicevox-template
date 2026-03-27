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
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/MPLUSRounded1c";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"] });

// ─── Types ─────────────────────────────────────────────
export type KidsSegmentType = "question" | "answer" | "fun_fact" | "intro" | "outro";

export interface KidsSegment {
  id: number;
  type: KidsSegmentType;
  /** Text displayed on screen (keep short) */
  displayText: string;
  /** Narration / voice text */
  narration: string;
  /** Optional image (public/content/) */
  imageSrc?: string;
  /** Big emoji for visual interest */
  emoji?: string;
  /** Optional sub-text below main text */
  subText?: string;
  /** Words to highlight */
  highlightWords?: string[];
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  soundEffect?: string;
}

export interface KidsConfig {
  segments: KidsSegment[];
  bgm?: { src: string; volume: number };
  /** Character name shown as host */
  hostName?: string;
  style?: {
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
    questionColor?: string;
    answerColor?: string;
    fontSize?: number;
  };
}

// ─── Defaults ────────────────────────────────────────────
const SEGMENT_BG: Record<KidsSegmentType, string> = {
  intro: "#1a237e",
  question: "#880e4f",
  answer: "#1b5e20",
  fun_fact: "#e65100",
  outro: "#311b92",
};

const DEFAULT_STYLE = {
  bgColor: "#1a237e",
  textColor: "#FFFFFF",
  accentColor: "#FFD600",
  questionColor: "#FF80AB",
  answerColor: "#69F0AE",
  fontSize: 60,
};

// ─── StarDecoration ───────────────────────────────────────
const StarDecoration: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const stars = Array.from({ length: 8 }, (_, i) => ({
    x: (i * 29 + 10) % 90,
    y: (i * 43 + 5) % 80,
    size: 18 + (i % 3) * 8,
    phase: (i * 37) % 100,
    symbol: ["⭐", "✨", "💫", "🌟"][i % 4],
  }));
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => {
        const wobble = Math.sin((frame / fps) * 2 + s.phase * 0.1) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y + wobble}%`,
              fontSize: s.size,
              opacity: 0.25,
            }}
          >
            {s.symbol}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── BounceEmoji ──────────────────────────────────────────
const BounceEmoji: React.FC<{
  emoji: string;
  localFrame: number;
  fps: number;
}> = ({ emoji, localFrame, fps }) => {
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 8, stiffness: 120, mass: 0.5 },
    from: 0,
    to: 1,
  });
  const bounce = Math.sin((localFrame / fps) * 3) * 12;
  return (
    <div
      style={{
        fontSize: 140,
        transform: `scale(${scale}) translateY(${bounce}px)`,
        marginBottom: 12,
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
      }}
    >
      {emoji}
    </div>
  );
};

// ─── QuestionBubble ───────────────────────────────────────
const TextBubble: React.FC<{
  text: string;
  subText?: string;
  highlightWords: string[];
  type: KidsSegmentType;
  localFrame: number;
  fps: number;
  style: typeof DEFAULT_STYLE;
}> = ({ text, subText, highlightWords, type, localFrame, fps, style }) => {
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.4 },
    from: 0.7,
    to: 1,
  });
  const opacity = interpolate(localFrame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bubbleColor = type === "question" ? "#AD1457" : "#1B5E20";

  const renderHighlighted = (text: string) => {
    if (highlightWords.length === 0) return text;
    let result: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    for (const word of highlightWords) {
      const idx = remaining.indexOf(word);
      if (idx === -1) continue;
      if (idx > 0) {
        result.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      }
      result.push(
        <span key={key++} style={{ color: style.accentColor, fontWeight: 900 }}>
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
        backgroundColor: bubbleColor,
        borderRadius: 24,
        padding: "28px 40px",
        maxWidth: "85%",
        opacity,
        transform: `scale(${scale})`,
        border: `4px solid ${style.accentColor}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px ${bubbleColor}`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: style.fontSize,
          fontWeight: 900,
          color: style.textColor,
          lineHeight: 1.5,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {renderHighlighted(text)}
      </div>
      {subText && (
        <div
          style={{
            fontFamily,
            fontSize: Math.floor(style.fontSize * 0.55),
            fontWeight: 700,
            color: `${style.textColor}cc`,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 1.4,
          }}
        >
          {subText}
        </div>
      )}
    </div>
  );
};

// ─── Main KidsShort Component ────────────────────────────
export const KidsShort: React.FC<{ config: KidsConfig }> = ({ config }) => {
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

  const bgColor = SEGMENT_BG[currentSegment.type] ?? style.bgColor;
  const labelMap: Record<KidsSegmentType, string> = {
    intro: "はじめに",
    question: "なんで？",
    answer: "こたえ！",
    fun_fact: "びっくり！",
    outro: "まとめ",
  };

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${bgColor}cc 0%, ${bgColor} 100%)`,
      }}
    >
      {/* Background stars */}
      <StarDecoration frame={frame} fps={fps} />

      {/* Top label pill */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: style.accentColor,
          borderRadius: 40,
          padding: "8px 32px",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 900,
            color: "#000",
          }}
        >
          {labelMap[currentSegment.type]}
        </span>
      </div>

      {/* Image (if available) */}
      {currentSegment.imageSrc && (
        <div
          style={{
            position: "absolute",
            top: 130,
            left: "10%",
            right: "10%",
            height: "35%",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(`content/${currentSegment.imageSrc}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Central content */}
      <div
        style={{
          position: "absolute",
          top: currentSegment.imageSrc ? "52%" : "15%",
          left: 0,
          right: 0,
          bottom: "8%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Emoji */}
        {currentSegment.emoji && !currentSegment.imageSrc && (
          <BounceEmoji
            emoji={currentSegment.emoji}
            localFrame={localFrame}
            fps={fps}
          />
        )}

        {/* Text bubble */}
        <TextBubble
          text={currentSegment.displayText}
          subText={currentSegment.subText}
          highlightWords={currentSegment.highlightWords ?? []}
          type={currentSegment.type}
          localFrame={localFrame}
          fps={fps}
          style={style}
        />

        {/* Host name tag */}
        {config.hostName && (
          <div
            style={{
              fontFamily,
              fontSize: 26,
              fontWeight: 700,
              color: `${style.accentColor}cc`,
              marginTop: 8,
            }}
          >
            {config.hostName}
          </div>
        )}
      </div>

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
            <Audio src={staticFile(`se/${sp.soundEffect}`)} volume={0.7} />
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
