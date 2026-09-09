import { defineConfig } from "vitest/config";

/**
 * この repo 自身の vitest 設定。
 *
 * 実測 2026-09-09: src/__tests__/visual-scenes.test.ts (11件) は 2026-09-04 に
 * 書かれてから一度も走っていなかった。設定が無いので親リポの vitest 設定を拾い、
 * そちらは include が `**|*.vitest.ts`（このファイルは *.test.ts）で、しかも
 * exclude に `hohho-youtube-studio` が入っていたため、二重に対象外だった。
 *
 * 「テストを書いた」と「テストが走っている」は別。ここを置かないと、次に足す
 * テストも同じように沈黙する。
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
    exclude: ["node_modules", "out", "public"],
  },
});
