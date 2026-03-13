import { CharacterId } from "../config";

// アニメーションの型定義
export type AnimationType = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn" | "bounce";

// ビジュアルの型定義
export interface VisualContent {
  type: "image" | "text" | "none";
  src?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  animation?: AnimationType;
}

// 効果音の型定義
export interface SoundEffect {
  src: string;
  volume?: number;
}

// BGM設定
export interface BGMConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

// BGM設定（動画全体で使用）
export const bgmConfig: BGMConfig | null = null;

// セリフデータの型定義
export interface ScriptLine {
  id: number;
  character: CharacterId;
  text: string;
  displayText?: string;
  scene: number;
  voiceFile: string;
  durationInFrames: number;
  pauseAfter: number;
  emotion?: "normal" | "happy" | "surprised" | "thinking" | "sad";
  visual?: VisualContent;
  se?: SoundEffect;
}

// シーン定義
export interface SceneInfo {
  id: number;
  title: string;
  background: string;
}

export const scenes: SceneInfo[] = [
  { id: 1, title: "オープニング", background: "gradient" },
  { id: 2, title: "メインコンテンツ", background: "solid" },
  { id: 3, title: "エンディング", background: "gradient" },
];

// このファイルは config/script.yaml から自動生成されます
// 編集する場合は config/script.yaml を編集して npm run sync-script を実行してください
export const scriptData: ScriptLine[] = [
  {
    "id": 1,
    "character": "announcer",
    "text": "あなたの人生を変える、たった一つの言葉があります",
    "scene": 1,
    "pauseAfter": 20,
    "visual": {
      "type": "text",
      "text": "あなたの人生を変える\nたった一つの言葉",
      "fontSize": 72,
      "color": "#ffffff",
      "animation": "fadeIn"
    },
    "voiceFile": "01_announcer.wav",
    "durationInFrames": 130
  },
  {
    "id": 2,
    "character": "announcer",
    "text": "多くの人は、成功するために何か特別なことが必要だと思っています",
    "scene": 2,
    "pauseAfter": 15,
    "visual": {
      "type": "text",
      "text": "成功には\n特別なことが必要？",
      "fontSize": 64,
      "color": "#ffffff",
      "animation": "slideUp"
    },
    "voiceFile": "02_announcer.wav",
    "durationInFrames": 179
  },
  {
    "id": 3,
    "character": "announcer",
    "text": "でも、実は...",
    "scene": 2,
    "pauseAfter": 25,
    "voiceFile": "03_announcer.wav",
    "durationInFrames": 47
  },
  {
    "id": 4,
    "character": "announcer",
    "text": "成功と失敗の違いは、たった一つの習慣から生まれるのです",
    "scene": 2,
    "pauseAfter": 20,
    "visual": {
      "type": "text",
      "text": "違いは\nたった一つの「習慣」",
      "fontSize": 72,
      "color": "#FFD700",
      "animation": "zoomIn"
    },
    "voiceFile": "04_announcer.wav",
    "durationInFrames": 158
  },
  {
    "id": 5,
    "character": "announcer",
    "text": "アリストテレスはこう言いました",
    "scene": 3,
    "pauseAfter": 15,
    "visual": {
      "type": "text",
      "text": "アリストテレス\n（古代ギリシャ哲学者）",
      "fontSize": 56,
      "color": "#ffffff",
      "animation": "fadeIn"
    },
    "voiceFile": "05_announcer.wav",
    "durationInFrames": 68
  },
  {
    "id": 6,
    "character": "announcer",
    "text": "私たちは繰り返し行うことの集積である。だから優秀さとは、行為ではなく習慣なのだ",
    "scene": 3,
    "pauseAfter": 30,
    "visual": {
      "type": "text",
      "text": "「優秀さとは\n行為ではなく習慣なのだ」\n— アリストテレス",
      "fontSize": 56,
      "color": "#FFD700",
      "animation": "fadeIn"
    },
    "voiceFile": "06_announcer.wav",
    "durationInFrames": 234
  },
  {
    "id": 7,
    "character": "announcer",
    "text": "つまり、今日あなたが繰り返し選ぶ小さな行動が、明日のあなたを形作るのです",
    "scene": 4,
    "pauseAfter": 20,
    "visual": {
      "type": "text",
      "text": "今日の小さな行動が\n明日のあなたを作る",
      "fontSize": 64,
      "color": "#ffffff",
      "animation": "slideUp"
    },
    "voiceFile": "07_announcer.wav",
    "durationInFrames": 212
  },
  {
    "id": 8,
    "character": "announcer",
    "text": "朝の5分の読書。夜の10分の振り返り。毎日の感謝の言葉。",
    "scene": 4,
    "pauseAfter": 15,
    "visual": {
      "type": "text",
      "text": "朝5分の読書\n夜10分の振り返り\n毎日の感謝",
      "fontSize": 56,
      "color": "#90EE90",
      "animation": "slideLeft"
    },
    "voiceFile": "08_announcer.wav",
    "durationInFrames": 185
  },
  {
    "id": 9,
    "character": "announcer",
    "text": "これらの小さな習慣が、あなたの人生を根本から変えていきます",
    "scene": 4,
    "pauseAfter": 20,
    "voiceFile": "09_announcer.wav",
    "durationInFrames": 166
  },
  {
    "id": 10,
    "character": "announcer",
    "text": "今日から始めませんか？たった一つでいい。繰り返せる小さな習慣を。",
    "scene": 5,
    "pauseAfter": 20,
    "visual": {
      "type": "text",
      "text": "今日から始めよう\nたった一つの習慣を",
      "fontSize": 72,
      "color": "#FFD700",
      "animation": "zoomIn"
    },
    "voiceFile": "10_announcer.wav",
    "durationInFrames": 188
  },
  {
    "id": 11,
    "character": "announcer",
    "text": "あなたの未来は、今この瞬間の選択から始まります",
    "scene": 5,
    "pauseAfter": 30,
    "visual": {
      "type": "text",
      "text": "未来は\n今この瞬間の選択から",
      "fontSize": 64,
      "color": "#ffffff",
      "animation": "fadeIn"
    },
    "voiceFile": "11_announcer.wav",
    "durationInFrames": 138
  }
];

// VOICEVOXスクリプト生成用
export const generateVoicevoxScript = (
  data: ScriptLine[],
  characterSpeakerMap: Record<CharacterId, number>
) => {
  return data.map((line) => ({
    id: line.id,
    character: line.character,
    speakerId: characterSpeakerMap[line.character],
    text: line.text,
    outputFile: line.voiceFile,
  }));
};
