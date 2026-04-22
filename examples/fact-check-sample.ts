// ファクトチェック班キャラクター使用例
// announcer (No.7アナウンス) と kenzaki (剣崎雌雄) のサンプル台本

export const factCheckSampleScript = [
  {
    id: 1,
    character: "zundamon",
    text: "今日は歴史上最大の誤解があった日なのだ！",
    scene: 1,
    voiceFile: "01_zundamon.wav",
    pauseAfter: 15,
  },
  {
    id: 2,
    character: "metan",
    text: "誤解って何の話？気になるわ〜",
    scene: 1,
    voiceFile: "02_metan.wav",
    pauseAfter: 10,
  },
  {
    id: 3,
    character: "announcer",
    text: "実は、多くの人がコロンブスがアメリカ大陸を発見したと思っておりますが...",
    scene: 1,
    voiceFile: "03_announcer.wav",
    pauseAfter: 20,
    emotion: "normal",
  },
  {
    id: 4,
    character: "kenzaki",
    text: "待った。正確には、コロンブスは1492年にカリブ海の島々に到達しただけです。",
    scene: 1,
    voiceFile: "04_kenzaki.wav",
    pauseAfter: 18,
    emotion: "serious",
  },
  {
    id: 5,
    character: "zundamon",
    text: "えっ！アメリカ大陸じゃないのだ!?",
    scene: 1,
    voiceFile: "05_zundamon.wav",
    pauseAfter: 15,
    emotion: "surprised",
  },
  {
    id: 6,
    character: "announcer",
    text: "そうなのです。実際にアメリカ本土に初めて足を踏み入れたヨーロッパ人は、バイキングのレイフ・エリクソンと考えられています。",
    scene: 1,
    voiceFile: "06_announcer.wav",
    pauseAfter: 22,
  },
  {
    id: 7,
    character: "kenzaki",
    text: "時期は西暦1000年頃。コロンブスより約500年も早いのです。",
    scene: 1,
    voiceFile: "07_kenzaki.wav",
    pauseAfter: 18,
  },
  {
    id: 8,
    character: "metan",
    text: "500年も！歴史の教科書って結構大ざっぱなのね...",
    scene: 1,
    voiceFile: "08_metan.wav",
    pauseAfter: 15,
  },
  {
    id: 9,
    character: "zundamon",
    text: "でも、なんでコロンブスの方が有名になったのだ？",
    scene: 1,
    voiceFile: "09_zundamon.wav",
    pauseAfter: 15,
  },
  {
    id: 10,
    character: "announcer",
    text: "コロンブスの航海は記録が詳細で、その後のヨーロッパによる大規模な植民地化の始まりとなったからです。",
    scene: 1,
    voiceFile: "10_announcer.wav",
    pauseAfter: 20,
  },
  {
    id: 11,
    character: "kenzaki",
    text: "つまり、『発見』ではなく『記録された接触の始まり』が正確な表現でしょう。",
    scene: 1,
    voiceFile: "11_kenzaki.wav",
    pauseAfter: 18,
  },
  {
    id: 12,
    character: "metan",
    text: "ファクトチェックって大事ね。思い込みで歴史を語っちゃダメってことか〜",
    scene: 1,
    voiceFile: "12_metan.wav",
    pauseAfter: 20,
  },
];

// キャラクター特性メモ:
// announcer: 正式で丁寧な口調、事実を整理して伝える
// kenzaki: 簡潔で的確、数字や根拠を重視する分析型