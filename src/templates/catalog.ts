export type TemplateAspect = "vertical" | "landscape";

export interface RemotionTemplateSpec {
  id: string;
  name: string;
  compositionId: string;
  aspect: TemplateAspect;
  pipelineType: "A" | "A-en" | "B" | "C" | "D" | "E";
  bestFor: string[];
  requiredAssets: string[];
  visualLanguage: string;
  motionLanguage: string;
  defaultDurationSeconds: number;
  proofCommand: string;
}

export const remotionTemplateCatalog: RemotionTemplateSpec[] = [
  {
    id: "wisdom-quote-vertical",
    name: "Wisdom Quote Vertical",
    compositionId: "QuoteShort",
    aspect: "vertical",
    pipelineType: "A",
    bestFor: ["wise-quotes-ja", "stoic-wisdom-ja", "stoic-wisdom-en"],
    requiredAssets: ["quote YAML", "voice wav files", "optional ambient BGM"],
    visualLanguage: "dark gradient, large centered quote, attribution line",
    motionLanguage: "slow scale-in, subtle particles, segment fades",
    defaultDurationSeconds: 45,
    proofCommand: "npm run preview -- --composition=QuoteShort",
  },
  {
    id: "business-narration-vertical",
    name: "Business Narration Vertical",
    compositionId: "NarrationShort",
    aspect: "vertical",
    pipelineType: "A",
    bestFor: ["bizdev-tips-ja", "bizdev-tips-en", "ai-tools-review-ja"],
    requiredAssets: ["short-form narration YAML", "voice wav files", "optional icon/image"],
    visualLanguage: "clean dark panels, type badges, high-contrast key point text",
    motionLanguage: "slide-up text blocks, top labels, image reveal",
    defaultDurationSeconds: 60,
    proofCommand: "npm run preview -- --composition=NarrationShort",
  },
  {
    id: "image-trivia-vertical",
    name: "Image Trivia Vertical",
    compositionId: "TriviaShort",
    aspect: "vertical",
    pipelineType: "A",
    bestFor: ["today-in-history-ja", "great-figures-ja", "zen-moments-ja"],
    requiredAssets: ["fact frames", "content images", "voice wav files"],
    visualLanguage: "full-bleed image, bottom caption, strong keyword highlight",
    motionLanguage: "Ken Burns image zoom, text fade/slide",
    defaultDurationSeconds: 50,
    proofCommand: "npm run preview -- --composition=TriviaShort",
  },
  {
    id: "kids-learning-vertical",
    name: "Kids Learning Vertical",
    compositionId: "KidsShort",
    aspect: "vertical",
    pipelineType: "C",
    bestFor: ["kids-science-ja", "kids-ehon-ja", "kids-songs-ja"],
    requiredAssets: ["kids segments", "emoji/image cues", "voice wav files", "friendly BGM"],
    visualLanguage: "bright color blocks, large emoji, rounded learning bubbles",
    motionLanguage: "spring bounce, star drift, question-answer rhythm",
    defaultDurationSeconds: 45,
    proofCommand: "npm run preview -- --composition=KidsShort",
  },
  {
    id: "cinematic-video-quote",
    name: "Cinematic Video Quote",
    compositionId: "VideoBackgroundShort",
    aspect: "vertical",
    pipelineType: "A",
    bestFor: ["wise-quotes-ja", "stoic-wisdom-en", "great-figures-en"],
    requiredAssets: ["quote segments", "background video", "voice wav files", "optional BGM"],
    visualLanguage: "video background with dark overlay, premium quote typography",
    motionLanguage: "background video loop, Ken Burns layer movement, quote scale-in",
    defaultDurationSeconds: 45,
    proofCommand: "npm run preview -- --composition=VideoBackgroundShort",
  },
];

export const templateCatalogUpdatedAt = "2026-06-08";
