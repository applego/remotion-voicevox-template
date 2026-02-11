# パラドックス動画 台本生成プロンプト

## あなたの役割

ずんだもん＆めたんの掛け合い形式で、パラドックスを紹介する動画の台本を作成してください。

## キャラクター設定

- **ずんだもん**: 解説役。「〜なのだ！」「〜のだ」で話す。知識豊富だが親しみやすい。
- **めたん**: 視聴者代表。「〜わね」「〜かしら？」で話す。論理的に考え、素直に驚く。

## 台本構造

以下の流れで構成してください：

1. **hook** (5秒): 衝撃的な問いかけで始める
2. **setup** (10秒): パラドックスの名前と概要
3. **scenario** (15秒): 状況を詳しく説明 [図解指示を含める]
4. **think** (8秒): 視聴者に考える時間を与える
5. **reveal** (20秒): 答えと解説
6. **mindblown** (8秒): めたんの驚きリアクション
7. **deeper** (15秒): 応用・深掘り
8. **cta** (8秒): コメント促進

## 出力形式

```typescript
export const scriptData: ScriptLine[] = [
  {
    id: 1,
    character: "zundamon",
    text: "セリフ（VOICEVOXで読み上げ）",
    displayText: "字幕に表示するテキスト（英語等がある場合）",
    scene: 1,
    voiceFile: "01_zundamon.wav",
    durationInFrames: 0,  // 後で自動計算
    pauseAfter: 15,
    emotion: "normal",  // normal, happy, surprised, thinking, sad
    visual: {
      type: "text",
      text: "表示するテキスト",
    },
  },
];
```

## ビジュアル指示

重要なポイントには `visual` を追加：

```typescript
// テキスト表示
visual: { type: "text", text: "モンティ・ホール問題", fontSize: 80 }

// 画像表示（指示のみ、画像は別途用意）
visual: { type: "image", src: "paradox-diagram.png", description: "3つのドアの図" }
```

## ストーリーテリング (参照: .agent/skills/storytelling/SKILL.md)

### 必須チェック
- [ ] hook: 大袈裟な前置きで衝撃を演出（「脳みそがバグる話をするのだ！」）
- [ ] scenario: 描写を具体的にする（擬音・たとえで映像化）
- [ ] reveal: フリオチ構造で「裏切り」の瞬間を演出
- [ ] cta前: オチで締める（パラドックスならではの余韻を残す）

### オチパターン
- 脳みそバグ型: 「考えれば考えるほどバグるわね…」で共感
- 日常に持ち帰り型: パラドックスを日常シーンに当てはめて笑い
- 無限ループ型: オチ自体がパラドックスになる構造

## 注意点

- 英語はカタカナで `text` に、英語表記は `displayText` に
- 考える間は `pauseAfter: 45` (1.5秒) 以上に
- 驚きポイントでは `emotion: "surprised"` を使う
- 難しい概念は身近な例えに置き換える

## 入力

パラドックス名: {paradox_name}
カテゴリ: {category}
追加指示: {additional_instructions}

## 出力

台本（script.ts形式）を生成してください。
