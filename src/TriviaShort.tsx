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
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Types ─────────────────────────────────────────────
export interface TriviaFrame {
  id: number;
  narration: string;
  displayText: string;        // 画面に表示するテキスト（短く）
  highlightWords?: string[];  // 色を変えるキーワード
  imageSrc: string;           // public/content/ 内の画像パス
  voiceFile: string;          // public/voices/ 内の音声
  durationInFrames: number;   // 音声の長さ（自動設定）
  pauseAfter: number;         // 次のフレームまでの間
  soundEffect?: string;       // public/se/ 内のSE
}

export interface TriviaConfig {
  frames: TriviaFrame[];
  bgm?: { src: string; volume: number };
  textStyle?: {
    color?: string;
    highlightColor?: string;
    fontSize?: number;
    strokeColor?: string;
  };
}

// ─── Default Style ─────────────────────────────────────
const DEFAULT_STYLE = {
  color: "#FFFFFF",
  highlightColor: "#FFD700",  // ゴールド
  fontSize: 56,
  strokeColor: "#000000",
};

// ─── FullscreenImage Component ─────────────────────────
const FullscreenImage: React.FC<{
  src: string;
  frame: number;
  fps: number;
}> = ({ src, frame, fps }) => {
  // Ken Burns effect: ゆっくりズーム
  const scale = interpolate(frame, [0, fps * 4], [1.0, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(`content/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── AnimatedText Component ────────────────────────────
const AnimatedText: React.FC<{
  text: string;
  highlightWords?: string[];
  frame: number;
  fps: number;
  style: typeof DEFAULT_STYLE;
}> = ({ text, highlightWords = [], frame, fps, style }) => {
  // テキストがフェードイン + 少し上にスライド
  const opacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, fps * 0.4], [30, 0], {
    extrapolateRight: "clamp",
  });

  // ハイライトワードを色変え
  const renderText = () => {
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
        <span key={key++} style={{ color: style.highlightColor, fontWeight: 900 }}>
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
        bottom: "15%",
        left: "5%",
        right: "5%",
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: style.fontSize,
          fontWeight: 700,
          color: style.color,
          lineHeight: 1.5,
          textShadow: `
            3px 3px 0 ${style.strokeColor},
            -3px -3px 0 ${style.strokeColor},
            3px -3px 0 ${style.strokeColor},
            -3px 3px 0 ${style.strokeColor},
            0 3px 0 ${style.strokeColor},
            0 -3px 0 ${style.strokeColor},
            3px 0 0 ${style.strokeColor},
            -3px 0 0 ${style.strokeColor}
          `,
          whiteSpace: "pre-wrap",
        }}
      >
        {renderText()}
      </div>
    </div>
  );
};

// ─── Main TriviaShort Component ────────────────────────
export const TriviaShort: React.FC<{ config: TriviaConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = { ...DEFAULT_STYLE, ...config.textStyle };

  // フレームの開始位置を計算
  let accumulatedFrames = 0;
  const framePositions = config.frames.map((f) => {
    const start = accumulatedFrames;
    accumulatedFrames += f.durationInFrames + f.pauseAfter;
    return { ...f, startFrame: start };
  });

  // 現在のフレームを特定
  let currentTriviaFrame = framePositions[0];
  let localFrame = 0;
  for (const fp of framePositions) {
    if (frame >= fp.startFrame && frame < fp.startFrame + fp.durationInFrames + fp.pauseAfter) {
      currentTriviaFrame = fp;
      localFrame = frame - fp.startFrame;
      break;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 全画面背景画像 with Ken Burns */}
      <FullscreenImage
        src={currentTriviaFrame.imageSrc}
        frame={localFrame}
        fps={fps}
      />

      {/* テキストオーバーレイ */}
      <AnimatedText
        text={currentTriviaFrame.displayText}
        highlightWords={currentTriviaFrame.highlightWords}
        frame={localFrame}
        fps={fps}
        style={style}
      />

      {/* ナレーション音声 */}
      {framePositions.map((fp) => (
        <Sequence key={fp.id} from={fp.startFrame} durationInFrames={fp.durationInFrames}>
          <Audio src={staticFile(`voices/${fp.voiceFile}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* 効果音 */}
      {framePositions
        .filter((fp) => fp.soundEffect)
        .map((fp) => (
          <Sequence key={`se-${fp.id}`} from={fp.startFrame} durationInFrames={30}>
            <Audio src={staticFile(`se/${fp.soundEffect}`)} volume={0.6} />
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
