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
export type { VideoBgConfig } from "./video-background-config";
import { VideoBgConfig, VideoBgSegment, normalizeVideoBgConfig, videoBgPositions, globalVideoBgSource, segmentVideoBgSource } from "./video-background-config";

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
        {renderHighlighted(segment.quoteText ?? "")}
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
  trimBefore?: number;
  muted?: boolean;
  volume?: number;
}> = ({ src, frame, fps, kenBurns, playbackRate = 1.0, trimBefore = 0, muted = true, volume = 1 }) => {
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
        startFrom={trimBefore}
        playbackRate={playbackRate}
        muted={muted}
        volume={volume}
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

// Existing composition supports either the quote layout or a bounded acting stage.
export const VideoBackgroundShort: React.FC<{ config: VideoBgConfig }> = (props) => {
  const config = normalizeVideoBgConfig(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const positions = videoBgPositions(config);
  const active = positions.find((segment) => frame >= segment.startFrame && frame < segment.startFrame + segment.durationInFrames + segment.pauseAfter);
  const staged = config.layout === "title-stage";
  const stageTop = config.stage?.top ?? 560;
  const stageHeight = width * 9 / 16;
  const videoSettings = config.videoSettings ?? {};
  const resolve = (src: string) => /^https?:\/\//.test(src) ? src : staticFile(src);
  const style = { ...DEFAULT_STYLE, ...config.style };
  const continuousBackground = globalVideoBgSource(config);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {continuousBackground && <BackgroundVideoLayer
        src={resolve(continuousBackground)} frame={frame} fps={fps}
        kenBurns={config.kenBurns ?? true} playbackRate={videoSettings.playbackRate ?? 0.8}
        muted={videoSettings.muted ?? true}
      />}
      {positions.map((segment) => {
        const src = segmentVideoBgSource(config, segment);
        return src ? (
          <Sequence key={`clip-${segment.id}`} from={segment.startFrame} durationInFrames={segment.durationInFrames + segment.pauseAfter}>
            <div style={{ position: "absolute", top: staged ? stageTop : 0, left: 0, width: "100%", height: staged ? stageHeight : "100%", overflow: "hidden" }}>
              {staged ? (
                <Video src={resolve(src)} startFrom={segment.clip?.trimBefore ?? 0} playbackRate={videoSettings.playbackRate ?? 1} muted={videoSettings.muted ?? false} volume={segment.clip?.volume ?? 1} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <BackgroundVideoLayer src={resolve(src)} frame={frame - segment.startFrame} fps={fps} kenBurns={config.kenBurns ?? true} playbackRate={videoSettings.playbackRate ?? 0.8} trimBefore={segment.clip?.trimBefore ?? 0} muted={videoSettings.muted ?? true} volume={segment.clip?.volume ?? 1} />
              )}
            </div>
          </Sequence>
        ) : null;
      })}
      {staged ? (
        <>
          {config.title && <div style={{ position: "absolute", top: 80, left: 70, right: 70, height: Math.max(0, stageTop - 120), color: "white", textAlign: "center", fontFamily, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.2 }}>{config.title.text}</div>
            {config.title.subtitle && <div style={{ fontSize: 38, marginTop: 24 }}>{config.title.subtitle}</div>}
          </div>}
          {(config.captions ?? []).filter((cue) => frame >= cue.startFrame && frame < cue.endFrame).map((cue, index) => <div key={index} style={{ position: "absolute", top: stageTop, height: stageHeight, left: 64, right: 120, paddingBottom: config.stage?.captionBottom ?? 64, boxSizing: "border-box", display: "flex", alignItems: "flex-end", justifyContent: "center", color: "white", fontFamily, fontSize: config.style?.quoteFontSize ?? 64, fontWeight: 900, textAlign: "center", whiteSpace: "pre-wrap", lineHeight: 1.25, textShadow: "0 3px 6px black, 2px 0 black, -2px 0 black" }}>{cue.text}</div>)}
        </>
      ) : <>
        <DarkOverlay color={config.overlay?.color} opacity={config.overlay?.opacity ?? 1} gradient={config.overlay?.gradient ?? true} />
        {active && <QuoteTextBlock segment={active} localFrame={frame - active.startFrame} fps={fps} style={style} />}
      </>}
      {positions.filter((segment) => segment.voiceFile).map((segment) => <Sequence key={`voice-${segment.id}`} from={segment.startFrame} durationInFrames={segment.durationInFrames}><Audio src={staticFile(`voices/${segment.voiceFile}`)} volume={1} /></Sequence>)}
      {positions.filter((segment) => segment.soundEffect).map((segment) => <Sequence key={`se-${segment.id}`} from={segment.startFrame} durationInFrames={Math.min(30, segment.durationInFrames)}><Audio src={staticFile(`se/${segment.soundEffect}`)} volume={0.5} /></Sequence>)}
      {config.bgm && <Audio src={staticFile(`bgm/${config.bgm.src}`)} volume={config.bgm.volume} loop />}
    </AbsoluteFill>
  );
};
