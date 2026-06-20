import { describe, expect, it } from "vitest";

import { normalizeActionRef } from "../src/action-ref.js";

describe("normalizeActionRef", () => {
  it("normalizes string shorthand into an ActionRef", () => {
    expect(normalizeActionRef(" runtime.gameplay.interact ")).toEqual({
      type: "runtime.gameplay.interact",
    });
  });

  it("preserves serializable payload data", () => {
    expect(
      normalizeActionRef({
        type: "dialogue.next",
        payload: {
          lineId: "line.001",
          options: ["continue", "skip"],
          meta: { priority: 2, seen: false },
        },
      }),
    ).toEqual({
      type: "dialogue.next",
      payload: {
        lineId: "line.001",
        options: ["continue", "skip"],
        meta: { priority: 2, seen: false },
      },
    });
  });

  it("rejects arbitrary callback payloads", () => {
    expect(() =>
      normalizeActionRef({
        type: "runtime.gameplay.interact",
        payload: {
          onPress: () => undefined,
        },
      } as never),
    ).toThrow(/payload\.onPress must be a JsonValue/);
  });

  it("rejects non-json payload values", () => {
    expect(() =>
      normalizeActionRef({
        type: "debug.nan",
        payload: { value: Number.NaN },
      }),
    ).toThrow(/payload\.value must be a finite JSON number/);
  });

  it("rejects empty action types", () => {
    expect(() => normalizeActionRef("   ")).toThrow(/must not be empty/);
  });
});
