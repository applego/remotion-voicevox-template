import { describe, expect, it } from "vitest";

/**
 * 画のズームは「画が変わってから」を起点にする。ビート単位ではない。
 *
 * 守っている実害（実測 2026-09-09、shorts-trivia-ja/ep04）: imageSrc はシーン単位
 * （複数ビートで1枚）なのに、ImageBlock へビート単位の localFrame を渡していたため、
 * 同じ画のままズームが毎ビート 1.06 → 1.0 に戻り、それが画面転換として検出された。
 *
 *     15セグメント/3シーンの ep04   6.70回/分（模倣元の帯 ≤5.21 を超過）
 *      6セグメントの ep05-07        3.79〜4.57回/分
 *   差はシーン数ではなくビート数に比例していた。修正後は 2.23〜2.76回/分 で、
 *   模倣元の中央 2.12回/分 にほぼ一致した。
 *
 * ここは NarrationShort.tsx の imageStartFrame の求め方を、同じ規則で独立に
 * 再現して固定する。実装が localFrame へ戻ると落ちる。
 */

type Seg = { startFrame: number; imageSrc?: string };

/** 実装と同じ規則: 今の画と同じ imageSrc が続く限り起点を前へ遡る。 */
const imageStartFrame = (segs: Seg[], currentIdx: number): number => {
  let start = segs[currentIdx].startFrame;
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (segs[i].imageSrc !== segs[currentIdx].imageSrc) break;
    start = segs[i].startFrame;
  }
  return start;
};

const scene = (src: string, n: number, from: number, step = 100): Seg[] =>
  Array.from({ length: n }, (_, i) => ({ startFrame: from + i * step, imageSrc: src }));

describe("image zoom scope", () => {
  it("keeps one origin for every beat that shares a picture", () => {
    const segs = [...scene("a.png", 3, 0), ...scene("b.png", 3, 300)];
    // a.png の3ビートは全て同じ起点
    expect(imageStartFrame(segs, 0)).toBe(0);
    expect(imageStartFrame(segs, 1)).toBe(0);
    expect(imageStartFrame(segs, 2)).toBe(0);
  });

  it("moves the origin only when the picture changes", () => {
    const segs = [...scene("a.png", 3, 0), ...scene("b.png", 3, 300)];
    expect(imageStartFrame(segs, 3)).toBe(300);
    expect(imageStartFrame(segs, 5)).toBe(300);
  });

  it("does not reset inside a scene — the bug this replaces", () => {
    // ビート単位の起点なら 100, 200 と動いてしまう。動かないことを固定する。
    const segs = scene("a.png", 3, 0);
    const origins = segs.map((_, i) => imageStartFrame(segs, i));
    expect(new Set(origins).size).toBe(1);
  });

  it("handles a picture that appears again later as a separate run", () => {
    // 同じファイルが離れて再登場したら、別の run として起点は前へ遡らない。
    const segs = [
      ...scene("a.png", 2, 0),
      ...scene("b.png", 2, 200),
      ...scene("a.png", 2, 400),
    ];
    expect(imageStartFrame(segs, 4)).toBe(400);
  });

  it("the composition passes the picture-relative frame, not the beat-relative one", async () => {
    const fs = await import("fs");
    const src = fs.readFileSync(
      new URL("../NarrationShort.tsx", import.meta.url),
      "utf-8"
    );
    expect(src).toContain("localFrame={frame - imageStartFrame}");
    expect(src).toContain("let imageStartFrame = currentSegment.startFrame;");
  });
});
