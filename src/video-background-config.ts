export interface VideoBgSegment {
  id: number;
  quoteText?: string;
  attribution?: string;
  subtitle?: string;
  highlightWords?: string[];
  voiceFile?: string;
  durationInFrames: number;
  pauseAfter: number;
  soundEffect?: string;
  clip?: { src: string; trimBefore?: number; volume?: number };
  /** Optional per-segment background video override */
  backgroundVideo?: string;
}

export interface VideoBgConfig {
  segments: VideoBgSegment[];
  layout?: "background-quote" | "title-stage";
  title?: { text: string; subtitle?: string };
  stage?: { top?: number; captionBottom?: number };
  captions?: Array<{ startFrame: number; endFrame: number; text: string }>;
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


export const normalizeVideoBgConfig = (props: any): VideoBgConfig => {
  // Flat props remain supported; explicit flat segments override merged defaults.
  const { config: nestedConfig, ...flatConfig } = props ?? {};
  const config = props?.segments !== undefined ? flatConfig : nestedConfig;
  if (!config || !Array.isArray(config.segments) || config.segments.length === 0) {
    throw new Error("VideoBackgroundShort requires nonempty config.segments");
  }
  if (config.layout && !["background-quote", "title-stage"].includes(config.layout)) throw new Error("Invalid video layout");
  const ids = new Set();
  const segments = config.segments.map((segment: VideoBgSegment) => {
    if (!segment || ids.has(segment.id)) throw new Error("Segment IDs must be unique");
    ids.add(segment.id);
    if (!Number.isInteger(segment.durationInFrames) || segment.durationInFrames <= 0 ||
        !Number.isInteger(segment.pauseAfter ?? 0) || (segment.pauseAfter ?? 0) < 0) throw new Error("Invalid segment duration");
    if (segment.clip && (!segment.clip.src || !Number.isInteger(segment.clip.trimBefore ?? 0) || (segment.clip.trimBefore ?? 0) < 0 || !Number.isFinite(segment.clip.volume ?? 1) || (segment.clip.volume ?? 1) < 0)) throw new Error("Invalid clip settings");
    if (config.layout === "title-stage" && !(segment.clip?.src || segment.backgroundVideo || config.backgroundVideo)) throw new Error("title-stage requires video for every segment");
    return { ...segment, pauseAfter: segment.pauseAfter ?? 0 };
  });
  if (config.videoSettings?.playbackRate !== undefined && (!Number.isFinite(config.videoSettings.playbackRate) || config.videoSettings.playbackRate <= 0)) throw new Error("Invalid playback rate");
  const duration = videoBgDuration({ ...config, segments });
  for (const cue of config.captions ?? []) {
    if (!Number.isInteger(cue.startFrame) || !Number.isInteger(cue.endFrame) || cue.startFrame < 0 || cue.endFrame <= cue.startFrame || cue.endFrame > duration || typeof cue.text !== "string") throw new Error("Invalid caption interval");
  }
  if (config.stage && ((!Number.isFinite(config.stage.top ?? 560)) || (config.stage.top ?? 560) < 0 || (config.stage.top ?? 560) > 1312 || !Number.isFinite(config.stage.captionBottom ?? 64) || (config.stage.captionBottom ?? 64) < 0 || (config.stage.captionBottom ?? 64) > 450)) throw new Error("Invalid stage safe area");
  return { ...config, segments };
};

export const videoBgDuration = (config: VideoBgConfig): number =>
  config.segments.reduce((sum, segment) => sum + segment.durationInFrames + segment.pauseAfter, 0);

export const videoBgPositions = (config: VideoBgConfig) => {
  let startFrame = 0;
  return config.segments.map((segment) => {
    const result = { ...segment, startFrame };
    startFrame += segment.durationInFrames + segment.pauseAfter;
    return result;
  });
};

// Legacy global backgrounds are continuous; explicit shot clips are local.
export const globalVideoBgSource = (config: VideoBgConfig): string | undefined =>
  config.layout === "title-stage" ? undefined : config.backgroundVideo;
export const segmentVideoBgSource = (config: VideoBgConfig, segment: VideoBgSegment): string | undefined =>
  segment.clip?.src ?? segment.backgroundVideo ?? (config.layout === "title-stage" ? config.backgroundVideo : undefined);
