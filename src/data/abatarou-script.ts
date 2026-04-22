import { AbatarouConfig } from "../AbatarouShort";

/**
 * アバタロースタイル サンプル: 松下幸之助
 *
 * 実際のアバタロー動画の構成:
 *   冒頭: 書籍表紙を全画面表示
 *   本編: フリー写真素材(Pexels/Pixabay) + 下部字幕 + ナレーション
 *   BGM:  一貫した穏やかなピアノ
 *
 * backgroundImage は public/content/ 以下に配置すること。
 * Pexels/Pixabay等からダウンロードしたフリー素材を使用。
 */
export const abatarouConfig: AbatarouConfig = {
  // 冒頭: 書籍表紙
  bookCover: {
    src: "matsushita-book-cover.jpg", // public/content/ に配置
    durationInFrames: 90, // 3秒
  },

  segments: [
    {
      id: 1,
      text: "経営の神様・松下幸之助は、自分の「学がない」ことを武器にした。",
      backgroundImage: "business-leader.jpg", // ビジネスリーダーのフリー素材
      voiceFile: "01_zundamon.wav",
      durationInFrames: 150,
      pauseAfter: 8,
    },
    {
      id: 2,
      text: "わからないから人に聞く。聞かれた部下が考える。それが強い組織だった。",
      backgroundImage: "team-meeting.jpg", // チームミーティングの写真
      voiceFile: "02_metan.wav",
      durationInFrames: 150,
      pauseAfter: 8,
    },
    {
      id: 3,
      text: "弱みが……強さだったということ？",
      backgroundImage: "thinking-person.jpg", // 考える人
      voiceFile: "03_zundamon.wav",
      durationInFrames: 90,
      pauseAfter: 10,
    },
    {
      id: 4,
      text: "「学歴がないから、人を頼るしかなかった。それが私の最大の財産だった」",
      backgroundImage: "old-japanese-factory.jpg", // 古い日本の工場/昭和の経営者
      voiceFile: "04_metan.wav",
      durationInFrames: 180,
      pauseAfter: 10,
    },
    {
      id: 5,
      text: "できないことを隠すことが、一番の損失なのだ。",
      backgroundImage: "stressed-worker.jpg", // ストレスを抱える人
      voiceFile: "05_zundamon.wav",
      durationInFrames: 120,
      pauseAfter: 12,
    },
    {
      id: 6,
      text: "あなたは今、「わからない」と言えているだろうか。",
      backgroundImage: "sunset-silhouette.jpg", // 夕景シルエット（問いかけの余韻）
      voiceFile: "06_metan.wav",
      durationInFrames: 120,
      pauseAfter: 45, // 最後は長めの余韻
    },
  ],

  bgm: {
    src: "ambient-piano.mp3",
    volume: 0.12,
  },

  style: {
    fontSize: 42,
    textColor: "#FFFFFF",
    kenBurnsScale: 1.08,
    overlayOpacity: 0.7,
  },
};
