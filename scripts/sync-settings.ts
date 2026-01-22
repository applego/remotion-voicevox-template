/**
 * video-settings.yaml を読み込んで src/settings.generated.ts に変換するスクリプト
 *
 * 使用方法: npm run sync-settings
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

const YAML_PATH = path.join(__dirname, "..", "video-settings.yaml");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "settings.generated.ts");

interface VideoSettings {
  font: {
    family: string;
    size: number;
    weight: string;
    color: string;
    outlineColor: string;
    innerOutlineColor: string;
  };
  subtitle: {
    bottomOffset: number;
    maxWidthPercent: number;
    maxWidthPixels: number;
    outlineWidth: number;
    innerOutlineWidth: number;
  };
  character: {
    height: number;
    useImages: boolean;
  };
  content: {
    topPadding: number;
    sidePadding: number;
    bottomPadding: number;
  };
  video: {
    width: number;
    height: number;
    fps: number;
    playbackRate: number;
  };
  colors: {
    background: string;
    text: string;
    zundamon: string;
    metan: string;
  };
}

function main() {
  console.log("📖 video-settings.yaml を読み込み中...");

  const yamlContent = fs.readFileSync(YAML_PATH, "utf-8");
  const settings: VideoSettings = yaml.parse(yamlContent);

  console.log("✨ 設定を変換中...");

  const tsContent = `// このファイルは自動生成されます
// 編集する場合は video-settings.yaml を編集してください
// npm run sync-settings で再生成されます

export const SETTINGS = ${JSON.stringify(settings, null, 2)} as const;

export type VideoSettings = typeof SETTINGS;
`;

  fs.writeFileSync(OUTPUT_PATH, tsContent);

  console.log("✅ src/settings.generated.ts を生成しました");
}

main();
