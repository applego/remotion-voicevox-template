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
  { id: 1, title: "めっきとは？", background: "gradient" },
  { id: 2, title: "めっきのルーツ", background: "solid" },
  { id: 3, title: "めっきの分類", background: "gradient" },
  { id: 4, title: "めっきの種類", background: "solid" },
  { id: 5, title: "めっきの利用目的", background: "gradient" },
  { id: 6, title: "電気めっき", background: "solid" },
  { id: 7, title: "無電解めっき", background: "gradient" },
  { id: 8, title: "イオン化傾向", background: "solid" },
];

// メッキ解説動画の台本（音声生成済み・durationInFrames更新済み）
export const scriptData: ScriptLine[] = [
  // ===== シーン1: 「めっき」とは？ =====
  {
    id: 1,
    character: "zundamon",
    text: "今日はめっきについて解説するのだ！",
    scene: 1,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "めっき入門\n〜金属コーティングの世界〜",
      fontSize: 72,
      color: "#ffffff",
      animation: "zoomIn",
    },
    voiceFile: "01_zundamon.wav",
    durationInFrames: 101,
  },
  {
    id: 2,
    character: "metan",
    text: "めっき？なんだか難しそうね。",
    scene: 1,
    pauseAfter: 10,
    emotion: "thinking",
    voiceFile: "02_metan.wav",
    durationInFrames: 96,
  },
  {
    id: 3,
    character: "zundamon",
    text: "簡単に言うと、金属の表面を別の金属でコーティングすることなのだ！",
    scene: 1,
    pauseAfter: 10,
    voiceFile: "03_zundamon.wav",
    durationInFrames: 218,
  },
  {
    id: 4,
    character: "metan",
    text: "スマホのキラキラした部分とかかしら？",
    scene: 1,
    pauseAfter: 10,
    voiceFile: "04_metan.wav",
    durationInFrames: 89,
  },
  {
    id: 5,
    character: "zundamon",
    text: "そうなのだ！スマホ、車、アクセサリー、身近なところにたくさんあるのだ！",
    scene: 1,
    pauseAfter: 15,
    emotion: "happy",
    voiceFile: "05_zundamon.wav",
    durationInFrames: 235,
  },

  // ===== シーン2: めっきのルーツとは？ =====
  {
    id: 6,
    character: "zundamon",
    text: "めっきの歴史はとても古いのだ！",
    scene: 2,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "めっきの歴史",
      fontSize: 80,
      color: "#ffffff",
      animation: "fadeIn",
    },
    voiceFile: "06_zundamon.wav",
    durationInFrames: 91,
  },
  {
    id: 7,
    character: "metan",
    text: "どのくらい昔からあるの？",
    scene: 2,
    pauseAfter: 10,
    voiceFile: "07_metan.wav",
    durationInFrames: 69,
  },
  {
    id: 8,
    character: "zundamon",
    text: "なんと紀元前から！古代エジプトやメソポタミアで金めっきが使われていたのだ！",
    scene: 2,
    pauseAfter: 10,
    emotion: "surprised",
    voiceFile: "08_zundamon.wav",
    durationInFrames: 221,
  },
  {
    id: 9,
    character: "metan",
    text: "そんなに昔から！驚きだわ。",
    scene: 2,
    pauseAfter: 10,
    emotion: "surprised",
    voiceFile: "09_metan.wav",
    durationInFrames: 85,
  },
  {
    id: 10,
    character: "zundamon",
    text: "日本では奈良の大仏に金めっきが施されているのだ。アマルガム法という技術なのだ！",
    scene: 2,
    pauseAfter: 15,
    voiceFile: "10_zundamon.wav",
    durationInFrames: 247,
  },

  // ===== シーン3: めっきの分類について =====
  {
    id: 11,
    character: "zundamon",
    text: "めっきは大きく分けて2種類あるのだ！",
    scene: 3,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "めっきの分類\n湿式 vs 乾式",
      fontSize: 72,
      color: "#ffffff",
      animation: "slideUp",
    },
    voiceFile: "11_zundamon.wav",
    durationInFrames: 106,
  },
  {
    id: 12,
    character: "metan",
    text: "どんな分類なの？",
    scene: 3,
    pauseAfter: 10,
    voiceFile: "12_metan.wav",
    durationInFrames: 52,
  },
  {
    id: 13,
    character: "zundamon",
    text: "湿式めっきと乾式めっきなのだ。湿式は液体を使う方法なのだ！",
    scene: 3,
    pauseAfter: 10,
    voiceFile: "13_zundamon.wav",
    durationInFrames: 204,
  },
  {
    id: 14,
    character: "metan",
    text: "じゃあ乾式は液体を使わないってことね。",
    scene: 3,
    pauseAfter: 10,
    voiceFile: "14_metan.wav",
    durationInFrames: 104,
  },
  {
    id: 15,
    character: "zundamon",
    text: "正解なのだ！乾式は真空中で金属を蒸発させてコーティングするのだ！",
    scene: 3,
    pauseAfter: 15,
    emotion: "happy",
    voiceFile: "15_zundamon.wav",
    durationInFrames: 225,
  },

  // ===== シーン4: めっきの種類について =====
  {
    id: 16,
    character: "zundamon",
    text: "めっきには色々な種類があるのだ！",
    scene: 4,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "めっきの種類\n金・銀・ニッケル・クロム...",
      fontSize: 64,
      color: "#ffffff",
      animation: "fadeIn",
    },
    voiceFile: "16_zundamon.wav",
    durationInFrames: 98,
  },
  {
    id: 17,
    character: "metan",
    text: "金めっきは聞いたことあるわ。",
    scene: 4,
    pauseAfter: 10,
    voiceFile: "17_metan.wav",
    durationInFrames: 70,
  },
  {
    id: 18,
    character: "zundamon",
    text: "金、銀、ニッケル、クロム、亜鉛、銅など、目的によって使い分けるのだ！",
    scene: 4,
    pauseAfter: 10,
    voiceFile: "18_zundamon.wav",
    durationInFrames: 307,
  },
  {
    id: 19,
    character: "metan",
    text: "それぞれ特徴があるのかしら？",
    scene: 4,
    pauseAfter: 10,
    emotion: "thinking",
    voiceFile: "19_metan.wav",
    durationInFrames: 78,
  },
  {
    id: 20,
    character: "zundamon",
    text: "金は腐食に強く、ニッケルは硬くて丈夫、クロムはピカピカに光るのだ！",
    scene: 4,
    pauseAfter: 15,
    voiceFile: "20_zundamon.wav",
    durationInFrames: 223,
  },

  // ===== シーン5: めっきがなぜ利用されるの？ =====
  {
    id: 21,
    character: "zundamon",
    text: "めっきを使う理由を説明するのだ！",
    scene: 5,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "めっきの目的\n防錆・装飾・機能付与",
      fontSize: 64,
      color: "#ffffff",
      animation: "slideLeft",
    },
    voiceFile: "21_zundamon.wav",
    durationInFrames: 106,
  },
  {
    id: 22,
    character: "metan",
    text: "見た目をキレイにするため？",
    scene: 5,
    pauseAfter: 10,
    voiceFile: "22_metan.wav",
    durationInFrames: 66,
  },
  {
    id: 23,
    character: "zundamon",
    text: "それも正解！装飾目的なのだ。でも他にも重要な目的があるのだ！",
    scene: 5,
    pauseAfter: 10,
    voiceFile: "23_zundamon.wav",
    durationInFrames: 225,
  },
  {
    id: 24,
    character: "metan",
    text: "他にも目的があるの？",
    scene: 5,
    pauseAfter: 10,
    voiceFile: "24_metan.wav",
    durationInFrames: 62,
  },
  {
    id: 25,
    character: "zundamon",
    text: "錆を防ぐ防錆、電気を通しやすくする、摩耗に強くするなど、機能を付与できるのだ！",
    scene: 5,
    pauseAfter: 15,
    voiceFile: "25_zundamon.wav",
    durationInFrames: 282,
  },

  // ===== シーン6: 電気めっきについて =====
  {
    id: 26,
    character: "zundamon",
    text: "ここからは電気めっきを詳しく解説するのだ！",
    scene: 6,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "電気めっき\n〜電流で金属をつける〜",
      fontSize: 64,
      color: "#ffffff",
      animation: "zoomIn",
    },
    voiceFile: "26_zundamon.wav",
    durationInFrames: 133,
  },
  {
    id: 27,
    character: "metan",
    text: "電気を使うってことよね？",
    scene: 6,
    pauseAfter: 10,
    voiceFile: "27_metan.wav",
    durationInFrames: 70,
  },
  {
    id: 28,
    character: "zundamon",
    text: "そうなのだ！金属イオンを含む溶液に電流を流すと、金属が析出するのだ！",
    scene: 6,
    pauseAfter: 10,
    voiceFile: "28_zundamon.wav",
    durationInFrames: 248,
  },
  {
    id: 29,
    character: "metan",
    text: "析出って何かしら？",
    scene: 6,
    pauseAfter: 10,
    emotion: "thinking",
    voiceFile: "29_metan.wav",
    durationInFrames: 61,
  },
  {
    id: 30,
    character: "zundamon",
    text: "溶けていた金属が固体になって出てくることなのだ！めっきしたい物の表面にくっつくのだ！",
    scene: 6,
    pauseAfter: 15,
    voiceFile: "30_zundamon.wav",
    durationInFrames: 248,
  },

  // ===== シーン7: 無電解めっきについて =====
  {
    id: 31,
    character: "zundamon",
    text: "次は無電解めっきなのだ！",
    scene: 7,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "無電解めっき\n〜化学反応で金属をつける〜",
      fontSize: 64,
      color: "#ffffff",
      animation: "fadeIn",
    },
    voiceFile: "31_zundamon.wav",
    durationInFrames: 82,
  },
  {
    id: 32,
    character: "metan",
    text: "電気を使わないめっきがあるの？",
    scene: 7,
    pauseAfter: 10,
    emotion: "surprised",
    voiceFile: "32_metan.wav",
    durationInFrames: 83,
  },
  {
    id: 33,
    character: "zundamon",
    text: "あるのだ！化学反応だけで金属を析出させる方法なのだ！",
    scene: 7,
    pauseAfter: 10,
    voiceFile: "33_zundamon.wav",
    durationInFrames: 189,
  },
  {
    id: 34,
    character: "metan",
    text: "電気めっきとどう違うのかしら？",
    scene: 7,
    pauseAfter: 10,
    voiceFile: "34_metan.wav",
    durationInFrames: 80,
  },
  {
    id: 35,
    character: "zundamon",
    text: "複雑な形状にも均一にめっきできるのが特徴なのだ！プラスチックにもめっきできるのだ！",
    scene: 7,
    pauseAfter: 15,
    emotion: "happy",
    voiceFile: "35_zundamon.wav",
    durationInFrames: 255,
  },

  // ===== シーン8: イオン化傾向について =====
  {
    id: 36,
    character: "zundamon",
    text: "最後にイオン化傾向について説明するのだ！",
    scene: 8,
    pauseAfter: 10,
    visual: {
      type: "text",
      text: "イオン化傾向\nK Ca Na Mg Al Zn Fe...",
      fontSize: 64,
      color: "#ffffff",
      animation: "slideUp",
    },
    voiceFile: "36_zundamon.wav",
    durationInFrames: 129,
  },
  {
    id: 37,
    character: "metan",
    text: "イオン化傾向？化学の授業で聞いたことあるわ。",
    scene: 8,
    pauseAfter: 10,
    voiceFile: "37_metan.wav",
    durationInFrames: 132,
  },
  {
    id: 38,
    character: "zundamon",
    text: "金属がイオンになりやすい順番のことなのだ！めっきの原理に深く関係しているのだ！",
    scene: 8,
    pauseAfter: 10,
    voiceFile: "38_zundamon.wav",
    durationInFrames: 244,
  },
  {
    id: 39,
    character: "metan",
    text: "どう関係するの？",
    scene: 8,
    pauseAfter: 10,
    voiceFile: "39_metan.wav",
    durationInFrames: 54,
  },
  {
    id: 40,
    character: "zundamon",
    text: "イオン化傾向が大きい金属は、小さい金属を押し出して析出させるのだ！",
    scene: 8,
    pauseAfter: 10,
    voiceFile: "40_zundamon.wav",
    durationInFrames: 225,
  },
  {
    id: 41,
    character: "metan",
    text: "なるほど、金属同士の力関係みたいなものね。",
    scene: 8,
    pauseAfter: 10,
    emotion: "happy",
    voiceFile: "41_metan.wav",
    durationInFrames: 135,
  },
  {
    id: 42,
    character: "zundamon",
    text: "その通りなのだ！めっきは化学の面白さが詰まった技術なのだ！",
    scene: 8,
    pauseAfter: 15,
    emotion: "happy",
    voiceFile: "42_zundamon.wav",
    durationInFrames: 185,
  },
  {
    id: 43,
    character: "metan",
    text: "勉強になったわ。ありがとう！",
    scene: 8,
    pauseAfter: 10,
    emotion: "happy",
    voiceFile: "43_metan.wav",
    durationInFrames: 80,
  },
  {
    id: 44,
    character: "zundamon",
    text: "また見てくれると嬉しいのだ！バイバイなのだ！",
    scene: 8,
    pauseAfter: 0,
    emotion: "happy",
    voiceFile: "44_zundamon.wav",
    durationInFrames: 128,
  },
  {
    id: 45,
    character: "metan",
    text: "バイバイ！",
    scene: 8,
    pauseAfter: 30,
    emotion: "happy",
    voiceFile: "45_metan.wav",
    durationInFrames: 25,
  },
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
