/**
 * IrasutoyaShort — 偉人 Shorts テンプレート
 *
 * 視覚フォーミュラ（伸びている Shorts を分析して判明）:
 *   白背景 + 実写/いらすとや画像 中央 + 上に問い → 下に答えが遅延 reveal
 *
 * Remotion v4 最新機能使用:
 *   - @remotion/transitions (TransitionSeries + slide / fade / wipe)
 *   - spring() でテキスト pop-in
 *   - getInputProps() で --props CLI から直接 YAML→JSON を受け取る
 *     (固定 TS データファイル不要)
 *
 * レンダリング方法:
 *   npx remotion render src/index.ts IrasutoyaShort out/ep001.mp4 \
 *     --props="$(python3 scripts/episode-to-props.py episode.yaml)"
 */

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
  getInputProps,
} from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"] });

// ─── 型定義 ──────────────────────────────────────────────────────────────────

export interface IrasutoyaSegment {
  id: number;
  /** ナレーション（音声合成用）*/
  narration: string;
  /** 上部に表示する問い（1〜2行）*/
  question: string;
  /** 下部に遅延 reveal する答え（空なら表示なし）*/
  answer?: string;
  /** 答えが表示されるタイミング 0.0〜1.0（デフォルト 0.5）*/
  answer_reveal_at?: number;
  /** public/content/ 内の画像パス */
  image: string;
  /** public/voices/ 内の音声ファイル */
  voice: string;
  duration: number;
  pause: number;
  sound_effect?: string;
  bg_color?: string;
  answer_color?: string;
}

export interface IrasutoyaConfig {
  segments: IrasutoyaSegment[];
  channel_label?: string;
  bgm?: { src: string; volume: number };
  /** セグメント間のトランジション: "slide" | "fade" | "wipe" */
  transition?: "slide" | "fade" | "wipe";
  transition_frames?: number;
}

// ─── デフォルト値 ─────────────────────────────────────────────────────────────

const DEFAULTS = {
  bg_color: "#FFFFFF",
  answer_color: "#e8254a",
  answer_reveal_at: 0.5,
  transition: "slide" as const,
  transition_frames: 12,
};

// ─── 1 セグメント分の画面 ────────────────────────────────────────────────────

const SegmentScene: React.FC<{
  seg: IrasutoyaSegment;
}> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgColor = seg.bg_color ?? DEFAULTS.bg_color;
  const answerColor = seg.answer_color ?? DEFAULTS.answer_color;
  const revealAt = seg.answer_reveal_at ?? DEFAULTS.answer_reveal_at;
  const revealFrame = Math.floor(seg.duration * revealAt);

  // 問いテキスト: spring で pop-in
  const questionScale = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120, mass: 0.6 },
    durationInFrames: 20,
  });
  const questionOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 画像: spring で下からスライドイン
  const imgY = interpolate(
    spring({ fps, frame: frame - 4, config: { damping: 22, stiffness: 180 }, durationInFrames: 24 }),
    [0, 1],
    [60, 0]
  );
  const imgOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 答え: reveal タイミングで spring pop-in
  const answerFrame = frame - revealFrame;
  const answerScale = answerFrame >= 0
    ? spring({
        fps,
        frame: answerFrame,
        config: { damping: 14, stiffness: 200, mass: 0.5 },
        durationInFrames: 16,
      })
    : 0;
  const answerOpacity = answerFrame >= 0
    ? interpolate(answerFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  // 答え reveal 時にキャラが軽くズーム
  const imgScale = answerFrame >= 0
    ? interpolate(
        spring({ fps, frame: answerFrame, config: { damping: 20, stiffness: 150 }, durationInFrames: 20 }),
        [0, 1],
        [1, 1.04]
      )
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* ── 上テキスト（問い）─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: "4%",
          right: "4%",
          textAlign: "center",
          opacity: questionOpacity,
          transform: `scale(${questionScale})`,
          transformOrigin: "top center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 86,
            color: "#111111",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            display: "inline-block",
          }}
        >
          {seg.question}
        </span>
      </div>

      {/* ── キャラクター画像（中央）──────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "19%",
          left: "50%",
          width: "88%",
          height: "58%",
          transform: `translateX(-50%) translateY(${imgY}px) scale(${imgScale})`,
          transformOrigin: "bottom center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: imgOpacity,
        }}
      >
        <Img
          src={staticFile(`content/${seg.image}`)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* ── 下テキスト（答え・遅延 reveal）──────────────── */}
      {seg.answer && (
        <div
          style={{
            position: "absolute",
            bottom: "4%",
            left: "3%",
            right: "3%",
            textAlign: "center",
            opacity: answerOpacity,
            transform: `scale(${answerScale})`,
            transformOrigin: "bottom center",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 90,
              color: answerColor,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              display: "inline-block",
              whiteSpace: "pre-wrap",
            }}
          >
            {seg.answer}
          </span>
        </div>
      )}

      {/* ── チャンネルラベル ─────────────────────────────── */}
    </AbsoluteFill>
  );
};

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export const IrasutoyaShort: React.FC<{ config?: IrasutoyaConfig }> = ({
  config: propConfig,
}) => {
  // --props CLI または prop 経由でどちらでも受け取れる
  const inputProps = getInputProps() as Partial<IrasutoyaConfig>;
  const config: IrasutoyaConfig = propConfig ?? {
    segments: inputProps.segments ?? [],
    channel_label: inputProps.channel_label,
    bgm: inputProps.bgm,
    transition: inputProps.transition ?? DEFAULTS.transition,
    transition_frames: inputProps.transition_frames ?? DEFAULTS.transition_frames,
  };

  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const transitionFrames = config.transition_frames ?? DEFAULTS.transition_frames;

  // トランジション presentation を選択
  const getPresentation = () => {
    switch (config.transition ?? DEFAULTS.transition) {
      case "fade":   return fade();
      case "wipe":   return slide({ direction: "from-right" });
      default:       return slide({ direction: "from-right" });
    }
  };

  // BGM / 音声の開始位置を計算（TransitionSeries のオーバーラップを考慮）
  const segAudioOffsets: number[] = [];
  let audioAcc = 0;
  for (let i = 0; i < config.segments.length; i++) {
    segAudioOffsets.push(audioAcc);
    audioAcc += config.segments[i].duration + config.segments[i].pause;
    if (i < config.segments.length - 1) {
      audioAcc -= transitionFrames; // オーバーラップ分を引く
    }
  }

  return (
    <AbsoluteFill>
      {/* ── セグメント（TransitionSeries でつなぐ）─────── */}
      <TransitionSeries>
        {config.segments.map((seg, i) => (
          <React.Fragment key={seg.id}>
            <TransitionSeries.Sequence
              durationInFrames={seg.duration + seg.pause}
            >
              <SegmentScene seg={seg} />
            </TransitionSeries.Sequence>
            {i < config.segments.length - 1 && (
              <TransitionSeries.Transition
                presentation={getPresentation()}
                timing={springTiming({
                  durationInFrames: transitionFrames,
                  config: { damping: 20, stiffness: 200 },
                })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* ── チャンネルラベル（常時表示）────────────────── */}
      {config.channel_label && (
        <div
          style={{
            position: "absolute",
            top: "1.5%",
            right: "3%",
            fontFamily,
            fontSize: 30,
            fontWeight: 700,
            color: "#bbbbbb",
            zIndex: 100,
          }}
        >
          {config.channel_label}
        </div>
      )}

      {/* ── 音声（セグメントごと）──────────────────────── */}
      {config.segments.map((seg, i) => (
        <Sequence key={`voice-${seg.id}`} from={segAudioOffsets[i]} durationInFrames={seg.duration}>
          <Audio src={staticFile(`voices/${seg.voice}`)} volume={1.0} />
        </Sequence>
      ))}

      {/* ── 効果音 ─────────────────────────────────────── */}
      {config.segments
        .filter((s) => s.sound_effect)
        .map((s, i) => (
          <Sequence key={`se-${s.id}`} from={segAudioOffsets[i]} durationInFrames={30}>
            <Audio src={staticFile(`se/${s.sound_effect}`)} volume={0.5} />
          </Sequence>
        ))}

      {/* ── BGM ─────────────────────────────────────────── */}
      {config.bgm && (
        <Audio src={staticFile(`bgm/${config.bgm.src}`)} volume={config.bgm.volume} loop />
      )}
    </AbsoluteFill>
  );
};
