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
  { id: 1, title: "オープニング（フック）", background: "gradient" },
  { id: 2, title: "トムジェリ誕生", background: "solid" },
  { id: 3, title: "驚きの名前", background: "gradient" },
  { id: 4, title: "シンデレラストーリー", background: "solid" },
  { id: 5, title: "オチ＆CTA", background: "gradient" },
];

// 2月10日: トムとジェリー誕生日 台本 (v2: storytelling skill applied)
export const scriptData: ScriptLine[] = [
  { id: 1, character: "zundamon", text: "今日はヤバすぎるニュースがあるのだ！聞いて驚くなよ？", scene: 1, pauseAfter: 15, emotion: "happy", visual: { type: "text", text: "⚡ 2月10日 ⚡\n衝撃の歴史", fontSize: 100, color: "#ffffff", animation: "zoomIn" }, voiceFile: "01_zundamon.wav", durationInFrames: 156 },
  { id: 2, character: "metan", text: "えっ、なになに？そんなに煽られると気になるじゃない！", scene: 1, pauseAfter: 10, emotion: "surprised", voiceFile: "02_metan.wav", durationInFrames: 156 },
  { id: 3, character: "zundamon", text: "世界で一番有名なケンカが始まった日なのだ！", scene: 1, pauseAfter: 15, voiceFile: "03_zundamon.wav", durationInFrames: 139 },
  { id: 4, character: "zundamon", text: "1940年の今日、トムとジェリーがドカーンと映画館に登場したのだ！", scene: 2, pauseAfter: 10, visual: { type: "text", text: "🐱🐭\n1940年2月10日\nトムとジェリー誕生！", fontSize: 72, color: "#ffffff", animation: "bounce" }, voiceFile: "04_zundamon.wav", durationInFrames: 224 },
  { id: 5, character: "metan", text: "84年前!? あのネコとネズミのバチバチが始まった日ってこと？", scene: 2, pauseAfter: 10, emotion: "surprised", voiceFile: "05_metan.wav", durationInFrames: 177 },
  { id: 6, character: "zundamon", text: "でもね、最初の名前を聞いたらひっくり返るのだ！", scene: 3, pauseAfter: 15, visual: { type: "text", text: "⚡ 衝撃の事実 ⚡", fontSize: 72, color: "#ffff00", animation: "bounce" }, voiceFile: "06_zundamon.wav", durationInFrames: 146 },
  { id: 7, character: "zundamon", text: "トムじゃなくてジャスパー！ジェリーじゃなくてジンクス！だったのだ！", displayText: "トムじゃなくて「ジャスパー」！ジェリーじゃなくて「ジンクス」！だったのだ！", scene: 3, pauseAfter: 10, emotion: "surprised", visual: { type: "text", text: "トム → ジャスパー\nジェリー → ジンクス", fontSize: 64, color: "#ffffff", animation: "slideUp" }, voiceFile: "07_zundamon.wav", durationInFrames: 175 },
  { id: 8, character: "metan", text: "ジャスパーとジンクス!? それってドラえもんをタヌキロボって呼ぶくらい違和感あるわね！", displayText: "ジャスパーとジンクス!? それってドラえもんを「タヌキロボ」って呼ぶくらい違和感あるわね！", scene: 3, pauseAfter: 10, emotion: "surprised", voiceFile: "08_metan.wav", durationInFrames: 192 },
  { id: 9, character: "zundamon", text: "改名大成功すぎマンなのだ！", scene: 3, pauseAfter: 10, emotion: "happy", voiceFile: "09_zundamon.wav", durationInFrames: 96 },
  { id: 10, character: "zundamon", text: "しかもね、第1作は宣伝ゼロ！エスエヌエスもない時代に、ひっそり公開されたのだ！", displayText: "しかもね、第1作は宣伝ゼロ！SNSもない時代に、ひっそり公開されたのだ！", scene: 4, pauseAfter: 10, voiceFile: "10_zundamon.wav", durationInFrames: 268 },
  { id: 11, character: "metan", text: "宣伝なしって、バズらせる気なかったんかい！", scene: 4, pauseAfter: 10, emotion: "surprised", voiceFile: "11_metan.wav", durationInFrames: 111 },
  { id: 12, character: "zundamon", text: "ところがどっこい！なんとアカデミー賞にノミネートされたのだ！", scene: 4, pauseAfter: 10, emotion: "happy", visual: { type: "text", text: "🏆 アカデミー賞\nノミネート！", fontSize: 72, color: "#ffd700", animation: "zoomIn" }, voiceFile: "12_zundamon.wav", durationInFrames: 172 },
  { id: 13, character: "metan", text: "宣伝ゼロからアカデミー賞って、逆転ホームランどころじゃないわ！満塁サヨナラホームランよ！", scene: 4, pauseAfter: 10, emotion: "happy", voiceFile: "13_metan.wav", durationInFrames: 236 },
  { id: 14, character: "zundamon", text: "名前を変えて、宣伝なしで、世界一のアニメになったのだ。", scene: 5, pauseAfter: 10, visual: { type: "text", text: "【学び】\n大事なのは中身！\n名前じゃない！", fontSize: 64, color: "#ffffff", animation: "fadeIn" }, voiceFile: "14_zundamon.wav", durationInFrames: 186 },
  { id: 15, character: "metan", text: "つまり、大事なのは名前じゃなくて中身ってことね。", scene: 5, pauseAfter: 10, emotion: "thinking", voiceFile: "15_metan.wav", durationInFrames: 130 },
  { id: 16, character: "zundamon", text: "84年間追いかけっこしてるけど、夢も追いかけ続けた結果なのだ！", scene: 5, pauseAfter: 10, emotion: "happy", voiceFile: "16_zundamon.wav", durationInFrames: 211 },
  { id: 17, character: "metan", text: "世界一有名なケンカが、世界一愛されるアニメになるなんてね。やっぱりヤバい歴史だったわ！", scene: 5, pauseAfter: 10, emotion: "happy", voiceFile: "17_metan.wav", durationInFrames: 243 },
  { id: 18, character: "zundamon", text: "気になる歴史があったらコメントで教えてほしいのだ！バイバイなのだ〜！", scene: 5, pauseAfter: 0, emotion: "happy", voiceFile: "18_zundamon.wav", durationInFrames: 188 },
  { id: 19, character: "metan", text: "バイバイ〜！", scene: 5, pauseAfter: 5, emotion: "happy", voiceFile: "19_metan.wav", durationInFrames: 25 },
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
