# Remotion + VOICEVOX 動画テンプレート

ずんだもん＆めたんの掛け合い紹介動画を作成するためのテンプレートです。

---

## Claude Code Skillの導入（推奨）

Claude Codeをより効率的に使うために、専用のSkillを導入できます。

### 導入方法

```bash
# 1. skillsディレクトリを作成
mkdir -p ~/.claude/skills/remotion-video

# 2. SKILL.mdをダウンロード
curl -o ~/.claude/skills/remotion-video/SKILL.md \
  https://raw.githubusercontent.com/nyanko3141592/remotion-voicevox-template/master/SKILL.md
```

### Skillを入れると何が変わる？

- Claude Codeがこのテンプレートの使い方を理解している状態で会話を始められる
- 「紹介動画を作りたい」と言うだけで、適切なワークフローを案内してくれる
- 英語→カタカナ変換、音声生成、動画出力の手順を熟知した状態になる

### 手動でSkillを追加する場合

`~/.claude/skills/remotion-video/SKILL.md` に以下のURLの内容をコピー：
https://github.com/nyanko3141592/remotion-voicevox-template/blob/master/SKILL.md

---

## 重要: コンテンツ表示のルール

**コンテンツは画面全体を使って最大限大きく表示します。無駄な余白は作りません。**

### 基本方針
- スクリーンショットや図解は**画面いっぱいに表示**
- 不要なパディングやマージンを入れない
- 字幕とキャラクターはコンテンツの上に重ねて表示（下部のみ）
- コンテンツが見切れる場合のみ、必要最小限の余白を設ける

### コンテンツ配置の優先順位
1. **コンテンツを画面全体に表示**（最優先）
2. 字幕は画面下部に重ねて表示
3. キャラクターは左右下端に重ねて表示

### 実装時の注意
- 画像・動画は `width: 100%` または `height: 100%` でフィット
- 上下左右の余白は原則0px
- 字幕が重要な情報を隠す場合のみ、コンテンツを上にずらす

---

## このテンプレートでできること

- ずんだもん（右下）とめたん（左下）の掛け合い動画
- VOICEVOXによる自動音声生成
- 口パクアニメーション
- 袋文字スタイルの字幕（キャラクターごとに色分け）
- シーン別のビジュアル

**出力例**: 1920x1080 Full HD、30fps、1.2倍速再生

---

## 必要なもの

| 必須 | 説明 |
|------|------|
| Node.js 18+ | https://nodejs.org/ |
| VOICEVOX | https://voicevox.hiroshiba.jp/ （無料の音声合成ソフト） |

| 任意 | 説明 |
|------|------|
| Claude Code | 対話的に動画を作成できる |
| キャラクター画像 | なくてもプレースホルダーが表示される |

---

## クイックスタート

```bash
# 1. テンプレートをコピー
git clone https://github.com/nyanko3141592/remotion-voicevox-template.git my-video
cd my-video
npm install

# 2. VOICEVOXを起動

# 3. Claude Codeで開く
claude
```

---

## Claude Codeでの使い方（推奨）

このテンプレートはClaude Codeと一緒に使うことで、プログラミング知識がなくても動画を作成できます。

### 基本の流れ

```
┌─────────────────────────────────────────────┐
│ 1. 作りたい動画の内容を伝える                  │
│    ↓                                        │
│ 2. Claudeがセリフを作成                       │
│    ↓                                        │
│ 3. 「音声生成して」と指示                      │
│    ↓                                        │
│ 4. 「プレビュー見せて」で確認                  │
│    ↓                                        │
│ 5. 修正があれば指示                           │
│    ↓                                        │
│ 6. 「動画出力して」で完成                      │
└─────────────────────────────────────────────┘
```

### 指示の具体例

#### 新しい動画を作る

```
「〇〇の紹介動画を作りたい」
```

```
「Pythonの基礎を説明する動画を作って。初心者向けに」
```

```
「このアプリの使い方動画を作りたい。
特徴：
- 〇〇ができる
- △△に対応
対象：初心者」
```

```
「以下の内容で紹介動画を作って：
1. オープニング（挨拶）
2. 〇〇の説明
3. 使い方のデモ
4. エンディング」
```

#### セリフを修正する

```
「ID 5のセリフを『〇〇〇』に変更して」
```

```
「シーン2のセリフをもっと短くして」
```

```
「めたんのセリフをもっと増やして」
```

```
「ずんだもんの口調をもっと元気にして」
```

```
「専門用語を減らしてもっとわかりやすくして」
```

#### 発音を修正する

```
「Homebrewがおかしいのでカタカナのホームブルーにして」
```

```
「英語の発音がおかしいところを全部カタカナにして」
```

```
「GitHubをギットハブって発音させて」
```

#### 音声・動画の生成

```
「音声を生成して」
```

```
「プレビューを見せて」
```

```
「動画を出力して」
```

```
「音声生成してからプレビュー見せて」
```

#### 問題を報告する

```
「音声と字幕がずれてる」
```

```
「ID 3の発音がおかしい」
```

```
「シーン2の音声が抜けてる」
```

```
「キャラクターが表示されない」
```

### 実際の会話例

#### 例1: シンプルな紹介動画

```
あなた: Homebrewの使い方を紹介する動画を作りたい

Claude: Homebrewの紹介動画のスクリプトを作成します。
        [script.ts を編集]

        以下のような構成で作成しました：
        - シーン1: オープニング（Homebrewとは）
        - シーン2: インストール方法
        - シーン3: 基本的な使い方
        - シーン4: エンディング

        音声を生成しますか？

あなた: はい

Claude: [VOICEVOXで音声生成中...]
        音声生成が完了しました。プレビューで確認しますか？

あなた: 確認する

Claude: [npm start を実行]
        http://localhost:3000 でプレビューできます。

あなた: ID 3のHomebrew、発音がおかしい

Claude: VOICEVOXは英語をうまく発音できないので、
        カタカナ「ホームブルー」に変更し、
        字幕は「Homebrew」のままにします。
        [script.ts を修正]
        音声を再生成しますか？

あなた: はい、あと動画も出力して

Claude: [音声再生成]
        [npm run build を実行]
        out/video.mp4 に出力しました！
```

#### 例2: 修正を重ねる

```
あなた: シーン2の説明がわかりにくい

Claude: シーン2のセリフを確認します。
        現在の内容：「〇〇〇...」

        どのように修正しましょうか？
        1. もっとシンプルにする
        2. 具体例を追加する
        3. 別の説明方法にする

あなた: 1で

Claude: シンプルな表現に修正しました。
        [script.ts を修正]

        変更前：「〇〇〇...」
        変更後：「△△△...」

        音声を再生成しますか？
```

#### 例3: 構成を変更する

```
あなた: シーン3と4の順番を入れ替えたい

Claude: シーン3と4を入れ替えます。
        [script.ts を修正]

        変更後の構成：
        - シーン1: オープニング
        - シーン2: 〇〇の説明
        - シーン3: （元シーン4）△△について
        - シーン4: （元シーン3）□□のデモ
        - シーン5: エンディング

        音声を再生成しますか？
```

---

## 手動で使う場合

### 1. セリフを編集

`src/data/script.ts` を編集：

```typescript
export const scriptData: ScriptLine[] = [
  {
    id: 1,                              // ユニークなID（連番）
    character: "zundamon",              // "zundamon" または "metan"
    text: "こんにちは！",                // セリフ（音声生成用）
    // displayText: "...",              // 字幕用（英語表記など、省略可）
    scene: 1,                           // シーン番号
    voiceFile: "01_zundamon.wav",       // 音声ファイル名
    durationInFrames: 100,              // 長さ（音声生成後に自動更新）
    pauseAfter: 10,                     // セリフ後の間（フレーム数）
    emotion: "happy",                   // 感情（省略可）
  },
  // 続きのセリフ...
];
```

### 2. 音声生成

```bash
# VOICEVOXが起動していることを確認してから
npm run voices
```

### 3. プレビュー

```bash
npm start
# http://localhost:3000 で確認
```

### 4. 動画出力

```bash
npm run build
# out/video.mp4 に出力
```

---

## 英語の発音問題

VOICEVOXは英語を正しく発音できません。`displayText` フィールドを使って対応します。

```typescript
{
  id: 3,
  character: "zundamon",
  text: "ホームブルーでインストールするのだ！",      // 音声用（カタカナ）
  displayText: "Homebrewでインストールするのだ！", // 字幕用（英語）
  // ...
}
```

### よく使う変換表

| 英語 | カタカナ |
|------|---------|
| macOS | マックオーエス |
| iPhone | アイフォン |
| GitHub | ギットハブ |
| API | エーピーアイ |
| AI | エーアイ |
| Homebrew | ホームブルー |
| brew install | ブリューインストール |
| Ctrl+S | コントロールプラスエス |
| IME | アイエムイー |

---

## キャラクター設定

| ID | 名前 | VOICEVOX ID | 画面位置 | 字幕色 |
|----|------|-------------|----------|--------|
| metan | 四国めたん | 2 | 左下 | ピンク |
| zundamon | ずんだもん | 3 | 右下 | 緑 |

### キャラクター画像の配置

口パクアニメーション用に2種類の画像が必要：

```
public/images/
├── zundamon/
│   ├── mouth_open.png   # 口開き
│   └── mouth_close.png  # 口閉じ
└── metan/
    ├── mouth_open.png   # 口開き
    └── mouth_close.png  # 口閉じ
```

**デフォルト**: シンプルなプレースホルダー画像が含まれています。

### キャラクター画像の入手方法

公式の立ち絵素材を使用する場合は、以下から入手できます：

**ずんだもん**
- 公式立ち絵: https://zunko.jp/con_illust.html
- ニコニ・コモンズ: 「ずんだもん 立ち絵」で検索
- 坂本アヒル様の立ち絵素材が有名

**四国めたん**
- 公式立ち絵: https://zunko.jp/con_illust.html
- ニコニ・コモンズ: 「四国めたん 立ち絵」で検索

**利用時の注意**
- 各素材の利用規約を必ず確認してください
- クレジット表記が必要な場合があります
- 商用利用の可否を確認してください

**画像の準備**
1. 立ち絵素材をダウンロード
2. 口開き・口閉じの差分を用意
3. `public/images/{character}/` に配置
4. `src/config.ts` でファイル名を設定

**画像の向き**: めたんは自動で右向きに反転されます（元画像が左向きの場合）。
`src/config.ts` の `flipX` で変更可能。

---

## ファイル構成

```
├── src/
│   ├── data/
│   │   └── script.ts        # ★ セリフデータ（主にここを編集）
│   ├── components/
│   │   ├── Character.tsx    # キャラクター表示・口パク
│   │   ├── Subtitle.tsx     # 字幕（袋文字）
│   │   └── SceneVisuals.tsx # シーン別ビジュアル
│   ├── config.ts            # 動画・キャラクター設定
│   ├── Main.tsx             # メインコンポーネント
│   └── Root.tsx             # Remotionルート
├── public/
│   ├── images/              # キャラクター画像
│   └── voices/              # 音声ファイル（自動生成）
├── scripts/
│   └── generate-voices.ts   # 音声生成スクリプト
└── out/
    └── video.mp4            # 出力動画
```

---

## 画像・動画素材の収集

### キャラクター画像
キャラクター画像（立ち絵）はユーザーが手動で入手・配置します。自動取得は行いません。

- 画像を配置したら `src/config.ts` の `USE_CHARACTER_IMAGES` を `true` に変更
- 画像がない場合はプレースホルダーが表示されます

### 解説に必要な素材
動画の解説でスクリーンショットや動画クリップが必要な場合、Claudeがスクリプト作成時にコメントで記載します：

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

これを見て、必要な素材を `public/` ディレクトリに配置してください。素材の入手先が知りたい場合は、Claudeに「〇〇の素材を探して」と依頼できます。

---

## シーン管理

`src/data/script.ts` でシーンを定義：

```typescript
export const scenes: SceneInfo[] = [
  { id: 1, title: "オープニング", background: "gradient" },
  { id: 2, title: "メインコンテンツ", background: "solid" },
  { id: 3, title: "エンディング", background: "gradient" },
];
```

シーンごとのビジュアルは `src/components/SceneVisuals.tsx` でカスタマイズ。

---

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm start` | プレビューサーバー起動（http://localhost:3000） |
| `npm run voices` | 音声生成（VOICEVOX起動必須） |
| `npm run build` | 動画出力（out/video.mp4） |
| `npm run sync-settings` | YAML設定を反映（通常は自動実行） |

---

## video-settings.yaml（スタイル設定）

動画のスタイルは `video-settings.yaml` で簡単にカスタマイズできます。

### 設定例

```yaml
# フォント設定
font:
  family: "Noto Sans JP"      # フォント名
  size: 48                     # フォントサイズ（ピクセル）
  weight: "bold"               # 太さ（normal, bold, 100-900）
  color: "character"           # "character"=キャラクター色、または "#ffffff" など
  outlineColor: "#000000"      # 外側アウトライン（黒）
  innerOutlineColor: "#ffffff" # 内側アウトライン（白）

# 字幕設定
subtitle:
  bottomOffset: 40             # 画面下からの距離（ピクセル）
  maxWidthPercent: 55          # 最大幅（パーセント）
  maxWidthPixels: 1000         # 最大幅（ピクセル上限）
  outlineWidth: 14             # 外側アウトラインの太さ
  innerOutlineWidth: 8         # 内側アウトラインの太さ

# キャラクター設定
character:
  height: 367                  # キャラクターの高さ（ピクセル）
  useImages: false             # true: 画像使用, false: プレースホルダー

# カラー設定
colors:
  background: "#f8fafc"        # 背景色
  zundamon: "#059669"          # ずんだもん色（緑）
  metan: "#db2777"             # めたん色（ピンク）
```

### 設定の反映

`npm start` や `npm run build` を実行すると自動的に設定が反映されます。

### おすすめフォント

| フォント名 | 特徴 |
|-----------|------|
| Noto Sans JP | 標準的、読みやすい |
| M PLUS Rounded 1c | 丸ゴシック、かわいい |
| Kosugi Maru | 丸ゴシック、親しみやすい |
| Zen Maru Gothic | 丸ゴシック、やわらかい |

---

## 技術仕様

- **解像度**: 1920x1080 (Full HD)
- **フレームレート**: 30fps
- **再生速度**: 1.2倍速（`config.ts` で変更可能）
- **durationInFrames計算**: `秒数 × 30fps × 1.2playbackRate`

---

## トラブルシューティング

### VOICEVOXに接続できない

```
Error: ECONNREFUSED
```

→ VOICEVOXアプリが起動しているか確認してください。

### 音声と字幕がずれる

→ `npm run voices` を実行すると `durationInFrames` が自動修正されます。

### 英語の発音がおかしい

→ `text` をカタカナに、`displayText` に英語表記を設定してください。

### キャラクター画像が表示されない

→ `public/images/{character}/` に画像があるか確認してください。
→ 画像がない場合はプレースホルダーが表示されます。

### 動画出力が遅い

→ Remotionの仕様です。長い動画ほど時間がかかります。
→ プレビューで確認してから出力することをお勧めします。

### 音声ファイルが見つからない

```
Error: Could not find file: voices/XX_zundamon.wav
```

→ `npm run voices` で音声を生成してください。

---

## Tips

### 最後の「バイバイ」を二人で合わせる

エンディングで二人が声を合わせて「バイバイ」と言う場合：

```typescript
// めたんの後すぐにずんだもんのセリフを入れる
{
  id: 44,
  character: "metan",
  text: "バイバイ〜！",
  voiceFile: "44_metan.wav",
  durationInFrames: 50,
  pauseAfter: 0,  // 間を0にして同時感を出す
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
