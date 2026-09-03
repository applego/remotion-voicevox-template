/**
 * Keep the frame moving, and keep honest about how far that gets us.
 *
 * Measured 2026-09-04 by rendering after each step and running ffmpeg's
 * `scene` detector over the output (the same instrument used to measure the
 * role model):
 *
 *   flat single background                 max score 0.043   0 cuts at any threshold
 *   + distinguishable scene colours        max score 0.153   0 cuts at 0.30
 *   + a large moving light                 max score 0.189   4 cuts at 0.15
 *   + moving the text block per scene      max score 0.189   no change — removed
 *
 * The role model was measured at threshold 0.30, so this composition still
 * does not cut the way it cuts. What changed is real (54% of pixels differ by
 * more than 16/255 between scenes, against a frame that never moved before),
 * but a text-on-colour slideshow appears to have a ceiling here: its frames
 * stay structurally "dark ground, white text" no matter the tint. Clearing
 * 0.30 looks to need actual images, which sits behind the paid-generation
 * gate. That is an owner decision, not something to fake by tuning colours.
 *
 * These tests fix what the code must keep doing. They deliberately do NOT
 * assert that the output lands in the role model's band — it does not, and a
 * test claiming otherwise would be the same false green this work exists to
 * remove.
 */

import { describe, expect, it } from "vitest";

import {
  SCENE_BACKGROUNDS,
  SEGMENTS_PER_SCENE,
  sceneBackgroundFor,
  sceneIndexFor,
  sceneLightFor,
} from "../NarrationShort";

/** sRGB relative luminance, 0 (black) to 1 (white). */
const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 0xff) +
    0.7152 * channel((n >> 8) & 0xff) +
    0.0722 * channel(n & 0xff)
  );
};

/** Largest per-channel gap, 0-255. A cheap stand-in for "looks different". */
const channelDistance = (a: string, b: string): number => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  return Math.max(
    Math.abs(((pa >> 16) & 0xff) - ((pb >> 16) & 0xff)),
    Math.abs(((pa >> 8) & 0xff) - ((pb >> 8) & 0xff)),
    Math.abs((pa & 0xff) - (pb & 0xff)),
  );
};

describe("scene backgrounds", () => {
  it("puts a visible step between consecutive scenes", () => {
    // The five original SEGMENT_COLORS sat within ~14/255 of each other and
    // produced zero detected cuts at any threshold. Require a real step.
    for (let i = 0; i < SCENE_BACKGROUNDS.length; i++) {
      const a = SCENE_BACKGROUNDS[i];
      const b = SCENE_BACKGROUNDS[(i + 1) % SCENE_BACKGROUNDS.length];
      expect(channelDistance(a, b), `${a} -> ${b}`).toBeGreaterThanOrEqual(20);
    }
  });

  it("stays dark enough for white text", () => {
    // Moving the frame must not cost legibility — this channel puts white text
    // straight on the background.
    for (const bg of SCENE_BACKGROUNDS) {
      expect(luminance(bg), bg).toBeLessThan(0.12);
    }
  });

  it("changes every SEGMENTS_PER_SCENE segments", () => {
    for (let i = 0; i < SEGMENTS_PER_SCENE * 4; i++) {
      expect(sceneIndexFor(i)).toBe(Math.floor(i / SEGMENTS_PER_SCENE));
      expect(sceneBackgroundFor(i)).toBe(
        SCENE_BACKGROUNDS[sceneIndexFor(i) % SCENE_BACKGROUNDS.length],
      );
    }
  });

  it("does not reuse a background inside one episode", () => {
    // 15 segments / 3 per scene = 5 scenes. With 6 backgrounds none repeats,
    // so no two scenes in an episode look like the same shot.
    const scenesPerEpisode = Math.ceil(15 / SEGMENTS_PER_SCENE);
    expect(SCENE_BACKGROUNDS.length).toBeGreaterThanOrEqual(scenesPerEpisode);
    const used = new Set(
      Array.from({ length: 15 }, (_, i) => sceneBackgroundFor(i)),
    );
    expect(used.size).toBe(scenesPerEpisode);
  });
});

describe("scene light", () => {
  it("moves the light instead of only re-tinting the frame", () => {
    // Colour alone reached 0.153 against a 0.30 threshold. The light is what
    // took it to 0.189, because it changes where the frame is bright rather
    // than shifting every pixel by the same amount.
    const positions = new Set(
      Array.from({ length: 15 }, (_, i) =>
        /circle at ([^,]+),/.exec(sceneLightFor(i))?.[1],
      ),
    );
    expect(positions.size).toBe(Math.ceil(15 / SEGMENTS_PER_SCENE));
  });

  it("fades out well before the frame edge so it reads as light, not a shape", () => {
    for (let i = 0; i < SCENE_BACKGROUNDS.length * SEGMENTS_PER_SCENE; i++) {
      expect(sceneLightFor(i)).toMatch(/rgba\(0,0,0,0\) 6[0-9]%\)$/);
    }
  });

  it("keeps every scene's light subtle enough not to wash out the text", () => {
    for (let i = 0; i < SCENE_BACKGROUNDS.length * SEGMENTS_PER_SCENE; i++) {
      const alpha = Number(
        /rgba\([^)]*,([0-9.]+)\) 0%/.exec(sceneLightFor(i))?.[1] ?? "1",
      );
      expect(alpha).toBeLessThanOrEqual(0.32);
    }
  });
});

describe("the cut cadence this aims at", () => {
  it("puts a scene change roughly every ten seconds", () => {
    // Role model, measured 2026-09-03 over 12 videos:
    //   cut_interval_seconds p10 1.414  p50 7.121  p90 18.484
    // A typical episode is 15 segments over ~53s. Grouping three segments puts
    // a change about every 10s, inside that interval band. Whether the change
    // is *large enough* to count as a cut is a separate question the render
    // measurement answers — and today it does not reach 0.30.
    const segments = 15;
    const runtimeSec = 53;
    const changes = Math.floor((segments - 1) / SEGMENTS_PER_SCENE);
    const interval = runtimeSec / (changes + 1);
    expect(interval).toBeGreaterThanOrEqual(1.414);
    expect(interval).toBeLessThanOrEqual(18.484);
  });
});

describe("the opt-out keeps the old behaviour reachable", () => {
  // Without it, sceneBackgroundFor always returns a colour and the
  // SEGMENT_COLORS / style.bgColor chain below it is dead code — and, worse,
  // the per-channel style.bgColor that yaml_to_narration_config.py sets is
  // silently overridden for every channel (#1 review).
  const resolve = (
    segmentBg: string | undefined,
    scenesEnabled: boolean,
    typeColor: string | undefined,
    styleBg: string,
    index: number,
  ) =>
    segmentBg ??
    (scenesEnabled ? sceneBackgroundFor(index) : undefined) ??
    typeColor ??
    styleBg;

  it("uses the scene colour when scenes are on", () => {
    expect(resolve(undefined, true, "#111111", "#222222", 0)).toBe(
      sceneBackgroundFor(0),
    );
  });

  it("falls back to the channel's own colours when scenes are off", () => {
    expect(resolve(undefined, false, "#111111", "#222222", 0)).toBe("#111111");
    expect(resolve(undefined, false, undefined, "#222222", 0)).toBe("#222222");
  });

  it("always lets an explicit per-segment colour win", () => {
    expect(resolve("#abcdef", true, "#111111", "#222222", 0)).toBe("#abcdef");
    expect(resolve("#abcdef", false, "#111111", "#222222", 0)).toBe("#abcdef");
  });
});
