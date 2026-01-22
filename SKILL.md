# Remotion + VOICEVOX 動画作成スキル

ずんだもん＆めたんの掛け合い紹介動画を作成するためのスキルです。

## このスキルを使うタイミング

- ユーザーが「紹介動画を作りたい」「解説動画を作りたい」と言った
- ユーザーが「ずんだもん」「めたん」「VOICEVOX」に言及した
- プロジェクトに `src/data/script.ts` が存在する
- ユーザーが「音声を生成して」「動画を出力して」と言った

---

## 重要: 字幕とコンテンツの配置ルール

**字幕はコンテンツに被らないように配置する。コンテンツはできるだけ大きく表示する。**

### コンテンツ表示エリア（1920x1080の場合）
- 上部余白: 50px
- 左右余白: 各100px
- 下部余白: 450px（字幕+キャラクター領域）
- **実効表示エリア: 1720 x 580px**

### レイアウトの優先順位
1. コンテンツを最大限大きく表示
2. 字幕は画面下部に固定（キャラクターと被らない位置）
3. キャラクターは左右下端に配置

---

## プロジェクト構成

```
├── src/
│   ├── data/script.ts       # ★ セリフデータ（主に編集）
│   ├── config.ts            # 動画・キャラクター設定
│   ├── Main.tsx             # メインコンポーネント
│   └── components/
│       ├── Character.tsx    # キャラクター表示・口パク
│       ├── Subtitle.tsx     # 字幕（袋文字）
│       └── SceneVisuals.tsx # シーン別ビジュアル
├── public/
│   ├── images/              # キャラクター画像
│   └── voices/              # 音声ファイル
└── out/video.mp4            # 出力動画
```

---

## セリフデータの形式

### ファイル: `src/data/script.ts`

```typescript
export interface ScriptLine {
  id: number;               // ユニークID（連番）
  character: "zundamon" | "metan";
  text: string;             // 音声生成用（カタカナ可）
  displayText?: string;     // 字幕用（英語表記など、省略可）
  scene: number;            // シーン番号
  voiceFile: string;        // 例: "01_zundamon.wav"
  durationInFrames: number; // 音声生成後に更新
  pauseAfter: number;       // セリフ後の間（フレーム数）
  emotion?: string;         // "normal" | "happy" | "surprised" | "thinking"
}
```

---

## キャラクター設定

| character | 名前 | VOICEVOX Speaker ID | 画面位置 |
|-----------|------|---------------------|----------|
| metan | 四国めたん | 2 | 左下 |
| zundamon | ずんだもん | 3 | 右下 |

### 口調の特徴

**ずんだもん（説明役）**:
- 語尾: 「〜なのだ！」「〜のだ」
- 性格: 元気、明るい、好奇心旺盛

**めたん（聞き役・ツッコミ）**:
- 語尾: 「〜わ」「〜ね」「〜かしら？」
- 性格: 落ち着いた、大人っぽい、質問上手

---

## 英語の発音問題（重要）

VOICEVOXは英語を正しく発音できません。`text`にカタカナ、`displayText`に英語を設定：

```typescript
{
  text: "ホームブルーでインストールするのだ！",      // 音声用
  displayText: "Homebrewでインストールするのだ！", // 字幕用
}
```

### よく使う変換

| 英語 | カタカナ |
|------|---------|
| macOS | マックオーエス |
| iPhone | アイフォン |
| GitHub | ギットハブ |
| API | エーピーアイ |
| AI | エーアイ |
| Homebrew | ホームブルー |
| Ctrl+S | コントロールプラスエス |
| IME | アイエムイー |

---

## 音声生成

### VOICEVOX API

```bash
# 起動確認
curl -s http://localhost:50021/version

# 音声生成
TEXT="セリフ"
SPEAKER=3  # ずんだもん=3, めたん=2
curl -s "http://localhost:50021/audio_query?speaker=${SPEAKER}&text=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TEXT'))")" -X POST | \
  curl -s "http://localhost:50021/synthesis?speaker=${SPEAKER}" -X POST -H "Content-Type: application/json" -d @- -o output.wav
```

### durationInFrames計算

```
durationInFrames = 音声秒数 × 30fps × 1.2playbackRate
```

---

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm start` | プレビュー（http://localhost:3000） |
| `npm run voices` | 音声一括生成 |
| `npm run build` | 動画出力（out/video.mp4） |
| `npm run sync-settings` | YAML設定を反映 |

---

## video-settings.yaml（スタイル設定）

動画のスタイルは `video-settings.yaml` で設定：

```yaml
# フォント設定
font:
  family: "Noto Sans JP"      # フォント名
  size: 48                     # フォントサイズ
  weight: "bold"               # 太さ
  color: "character"           # "character" または "#ffffff" など
  outlineColor: "#000000"      # 外側アウトライン色
  innerOutlineColor: "#ffffff" # 内側アウトライン色

# 字幕設定
subtitle:
  bottomOffset: 40             # 画面下からの距離
  maxWidthPercent: 55          # 最大幅（%）

# キャラクター設定
character:
  height: 367                  # キャラクターの高さ
  useImages: false             # true: 画像使用, false: プレースホルダー

# カラー設定
colors:
  zundamon: "#059669"          # ずんだもん色
  metan: "#db2777"             # めたん色
```

設定変更後は `npm start` で自動反映される。

---

## 動画構成のテンプレート

### セリフの流れ

```
ずんだもん: 〇〇を紹介するのだ！
めたん: それは何かしら？
ずんだもん: △△ができるのだ！
めたん: 便利ね。どうやって使うの？
ずんだもん: こうするのだ！
めたん: なるほど、簡単ね
ずんだもん: みんなも使ってみてほしいのだ！
めたん: それじゃあまたね
二人: バイバイ〜！（声を合わせて）
```

### 最後の「バイバイ」の実装

二人で声を合わせる場合、めたんの後すぐにずんだもんのセリフを入れる：

```typescript
{
  id: 44,
  character: "metan",
  text: "バイバイ〜！",
  voiceFile: "44_metan.wav",
  durationInFrames: 50,
  pauseAfter: 0,  // 間を0にして同時感
},
{
  id: 45,
  character: "zundamon",
  text: "バイバイなのだ〜！",
  voiceFile: "45_zundamon.wav",
  durationInFrames: 60,
  pauseAfter: 60,
},
```

---

## 画像・動画素材の収集

### キャラクター画像
キャラクター画像（立ち絵）はユーザーが手動で入手・配置する。自動取得は行わない。

### 解説に必要な素材
動画の解説で必要なスクリーンショットや動画クリップがある場合、スクリプト作成時にコメントで記載する：

```typescript
{
  id: 5,
  character: "zundamon",
  text: "こんな感じでインストールするのだ！",
  scene: 2,
  voiceFile: "05_zundamon.wav",
  durationInFrames: 100,
  pauseAfter: 10,
  // <<ターミナルでbrew installを実行している画面のスクリーンショット>>
},
```

### 記載フォーマット
```
<<○○の画像>>
<<○○のスクリーンショット>>
<<○○の動画クリップ>>
```

ユーザーの要望があれば、WebSearchで素材の入手先を調べることもできる。

---

## 新規プロジェクト作成

```bash
git clone https://github.com/nyanko3141592/remotion-voicevox-template.git my-video
cd my-video
npm install
```

---

## キャラクター画像の入手

公式の立ち絵素材を使用する場合：

| キャラクター | 入手先 |
|-------------|--------|
| ずんだもん | https://zunko.jp/con_illust.html |
| 四国めたん | https://zunko.jp/con_illust.html |

ニコニ・コモンズで「ずんだもん 立ち絵」「四国めたん 立ち絵」で検索も可能。

**注意**: 各素材の利用規約を確認してください。

テンプレートにはシンプルなプレースホルダー画像が含まれています。
