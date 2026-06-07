import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";
import {
  remotionTemplateCatalog,
  templateCatalogUpdatedAt,
} from "./templates/catalog";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"] });

const CARD_COLORS = ["#1f6feb", "#d29922", "#2ea043", "#db61a2", "#8b5cf6"];

const TemplateCard: React.FC<{
  index: number;
  title: string;
  compositionId: string;
  channels: string[];
  visualLanguage: string;
}> = ({ index, title, compositionId, channels, visualLanguage }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [index * 5, index * 5 + 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [index * 5, index * 5 + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div
      style={{
        background: "#111827",
        border: `3px solid ${color}`,
        borderRadius: 8,
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.28)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 250,
        opacity,
        padding: 24,
        transform: `translateY(${enter}px)`,
      }}
    >
      <div
        style={{
          color,
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {compositionId}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15 }}>
        {title}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 22, lineHeight: 1.35 }}>
        {visualLanguage}
      </div>
      <div
        style={{
          borderTop: "1px solid #334155",
          color: "#e2e8f0",
          fontSize: 20,
          lineHeight: 1.3,
          marginTop: "auto",
          paddingTop: 12,
        }}
      >
        {channels.slice(0, 3).join(" / ")}
      </div>
    </div>
  );
};

export const TemplateGallery: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "#0b1020",
        color: "#ffffff",
        fontFamily,
        padding: 56,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              color: "#38bdf8",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            YouTube Studio Remotion
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, marginTop: 8 }}>
            Template Catalog
          </div>
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            color: "#94a3b8",
            fontSize: 22,
            textAlign: "right",
          }}
        >
          5 reusable templates
          <br />
          updated {templateCatalogUpdatedAt}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 22,
          gridTemplateColumns: "repeat(5, 1fr)",
          marginTop: 52,
        }}
      >
        {remotionTemplateCatalog.map((template, index) => (
          <TemplateCard
            key={template.id}
            index={index}
            title={template.name}
            compositionId={template.compositionId}
            channels={template.bestFor}
            visualLanguage={template.visualLanguage}
          />
        ))}
      </div>

      <div
        style={{
          bottom: 36,
          color: "#64748b",
          fontSize: 22,
          left: 56,
          position: "absolute",
          right: 56,
        }}
      >
        Source: src/templates/catalog.ts. Use each proofCommand before channel-specific rendering.
      </div>
    </AbsoluteFill>
  );
};
