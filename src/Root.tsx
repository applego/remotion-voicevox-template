import { Composition } from "remotion";
import { Main } from "./Main";
import { TriviaShort } from "./TriviaShort";
import { QuoteShort } from "./QuoteShort";
import { NarrationShort } from "./NarrationShort";
import { KidsShort } from "./KidsShort";
import { IrasutoyaShort, IrasutoyaConfig } from "./IrasutoyaShort";
import { VideoBackgroundShort, VideoBgConfig } from "./VideoBackgroundShort";
import { AbatarouShort } from "./AbatarouShort";
import { OkasanDemo } from "./OkasanDemo";
import { TemplateGallery } from "./TemplateGallery";
import {
  MusicMV,
  MusicMVConfig,
  calculateMusicMVFrames,
  defaultMusicMVConfig,
} from "./MusicMV";
import { scriptData } from "./data/script";
import { triviaConfig } from "./data/trivia-script";
import { quoteConfig } from "./data/quote-script";
import { narrationConfig } from "./data/narration-script";
import { kidsConfig } from "./data/kids-script";
import { irasutoyaConfig } from "./data/irasutoya-script";
import { abatarouConfig } from "./data/abatarou-script";
import { VIDEO_CONFIG } from "./config";
import { getInputProps } from "remotion";

// ─── Frame calculators ──────────────────────────────────

/** キャラ対話型 (Main): script lines + intro/outro padding */
const calculateMainFrames = () => {
  let total = 60; // intro padding
  for (const line of scriptData) {
    total += line.durationInFrames + line.pauseAfter;
  }
  total += 60; // outro padding
  return total;
};

/** Generic segment-based frame calculator */
const calcSegmentFrames = (
  segments: Array<{ durationInFrames: number; pauseAfter: number }>,
  headPad = 15,
  tailPad = 30
) => {
  let total = headPad;
  for (const s of segments) {
    total += s.durationInFrames + s.pauseAfter;
  }
  total += tailPad;
  return total;
};

export const RemotionRoot: React.FC = () => {
  const rootInputProps = getInputProps() as Record<string, unknown>;
  const mainFrames = calculateMainFrames();
  const triviaFrames = calcSegmentFrames(triviaConfig.frames);
  const quoteFrames = calcSegmentFrames(quoteConfig.segments);
  const narrationFrames = calcSegmentFrames(narrationConfig.segments);
  const kidsFrames = calcSegmentFrames(kidsConfig.segments);
  // --props から受け取った場合はそちらを優先、なければ irasutoya-script.ts のデフォルト
  const inputProps = rootInputProps as Partial<IrasutoyaConfig>;
  const activeIrasutoyaConfig: IrasutoyaConfig =
    inputProps.segments && inputProps.segments.length > 0
      ? (inputProps as IrasutoyaConfig)
      : irasutoyaConfig;
  const transitionFrames = activeIrasutoyaConfig.transition_frames ?? 12;
  const irasutoyaSegCount = activeIrasutoyaConfig.segments.length;
  // IrasutoyaSegment は duration/pause フィールドを使用（durationInFrames/pauseAfter とは別）
  const irasutoyaRawFrames = activeIrasutoyaConfig.segments.reduce(
    (acc, s) => acc + (s.duration ?? 0) + (s.pause ?? 0),
    15 + 30 // head + tail padding
  );
  // TransitionSeries はセグメント間でオーバーラップする分を引く
  const irasutoyaFrames = Math.max(
    60,
    irasutoyaRawFrames - Math.max(0, irasutoyaSegCount - 1) * transitionFrames
  );
  const activeMusicMVConfig: MusicMVConfig =
    rootInputProps.adapter === "youtube-channel-harness/music-mv" &&
    Array.isArray(rootInputProps.visualClips)
      ? (rootInputProps as unknown as MusicMVConfig)
      : defaultMusicMVConfig;
  const musicMVFrames = calculateMusicMVFrames(activeMusicMVConfig, 30);

  return (
    <>
      {/* ─── Main: キャラ対話型 (landscape) ─────────────────── */}
      {/* 用途: anime-story-ja, chibi-sf-ja, science-explainer, today-in-history */}
      <Composition
        id="Main"
        component={Main}
        durationInFrames={mainFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />

      {/* ─── TriviaShort: 雑学ナレーション (portrait 9:16) ──── */}
      {/* 用途: shorts-trivia-ja, shorts-japan-trivia-en, stoic-wisdom (image+text) */}
      <Composition
        id="TriviaShort"
        component={() => <TriviaShort config={triviaConfig} />}
        durationInFrames={triviaFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── QuoteShort: 名言・哲学 (portrait 9:16) ─────────── */}
      {/* 用途: stoic-wisdom-en/ja, wise-quotes, 偉人名言 */}
      <Composition
        id="QuoteShort"
        component={() => <QuoteShort config={quoteConfig} />}
        durationInFrames={quoteFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── NarrationShort: ナレーション+テキスト (portrait 9:16) ─ */}
      {/* 用途: bizdev-tips-en/ja, ai-tools-review-ja, tech-news-ja, trading-alpha-ja */}
      <Composition
        id="NarrationShort"
        component={() => <NarrationShort config={narrationConfig} />}
        durationInFrames={narrationFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── KidsShort: キッズ教育 (portrait 9:16) ───────────── */}
      {/* 用途: kids-science-ja, kids-ehon-ja, kids-songs-ja */}
      <Composition
        id="KidsShort"
        component={() => <KidsShort config={kidsConfig} />}
        durationInFrames={kidsFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── IrasutoyaShort: 偉人転換点 (portrait 9:16) ─────── */}
      {/* 用途: great-figures-ja, trivia-facts-ja             */}
      {/* 白背景 + 実写/いらすとや + 上問い・下答えサンドイッチ  */}
      <Composition
        id="IrasutoyaShort"
        component={() => <IrasutoyaShort config={activeIrasutoyaConfig} />}
        durationInFrames={irasutoyaFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── AbatarouShort: アバタロー型 知的解説 (16:9) ──────── */}
      {/* 用途: wise-quotes-ja (アバタロー模倣), 人物紹介, 書籍紹介 */}
      {/* 暗背景 + 大テキスト中央 + 話者別色分け + ゆっくりフェード */}
      <Composition
        id="AbatarouShort"
        component={() => <AbatarouShort config={abatarouConfig} />}
        durationInFrames={calcSegmentFrames(abatarouConfig.segments)}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ─── AbatarouVertical: アバタロー型 縦型版 (9:16) ──────── */}
      <Composition
        id="AbatarouVertical"
        component={() => <AbatarouShort config={abatarouConfig} />}
        durationInFrames={calcSegmentFrames(abatarouConfig.segments)}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── VideoBackgroundShort: 動画背景 + 自然TTS (9:16) ── */}
      {/* 用途: wise-quotes V2, stoic-wisdom (video bg)        */}
      {/* stock映像 or AI映像を背景に。Ken Burns効果付き。    */}
      {/* inputProps で VideoBgConfig を受け取る               */}
      <Composition
        id="VideoBackgroundShort"
        component={VideoBackgroundShort}
        durationInFrames={quoteFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          getInputProps() as Partial<VideoBgConfig> || quoteConfig
        }
      />
      {/* ─── MusicMV: channel-harness music video preview (16:9) ── */}
      <Composition
        id="MusicMV"
        component={() => <MusicMV config={activeMusicMVConfig} />}
        durationInFrames={musicMVFrames}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* ─── OkasanDemo: 2.5Dレイヤーアニメ (9:16) ─────────── */}
      <Composition
        id="OkasanDemo"
        component={OkasanDemo}
        durationInFrames={240}
        fps={30}
        width={720}
        height={1280}
      />

      {/* ─── TemplateGallery: 5 reusable Remotion templates catalog ── */}
      <Composition
        id="TemplateGallery"
        component={TemplateGallery}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
