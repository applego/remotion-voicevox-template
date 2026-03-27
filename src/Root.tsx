import { Composition } from "remotion";
import { Main } from "./Main";
import { TriviaShort } from "./TriviaShort";
import { QuoteShort } from "./QuoteShort";
import { NarrationShort } from "./NarrationShort";
import { KidsShort } from "./KidsShort";
import { scriptData } from "./data/script";
import { triviaConfig } from "./data/trivia-script";
import { quoteConfig } from "./data/quote-script";
import { narrationConfig } from "./data/narration-script";
import { kidsConfig } from "./data/kids-script";
import { VIDEO_CONFIG } from "./config";

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
  const mainFrames = calculateMainFrames();
  const triviaFrames = calcSegmentFrames(triviaConfig.frames);
  const quoteFrames = calcSegmentFrames(quoteConfig.segments);
  const narrationFrames = calcSegmentFrames(narrationConfig.segments);
  const kidsFrames = calcSegmentFrames(kidsConfig.segments);

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
    </>
  );
};
