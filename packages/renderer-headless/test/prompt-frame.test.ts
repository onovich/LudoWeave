import { describe, expect, it } from "vitest";

import { createPromptFrameFixture } from "./fixtures/prompt-frame.js";

describe("Prompt headless fixture", () => {
  it("outputs node, paint, semantics, and action target surfaces", () => {
    const frame = createPromptFrameFixture();

    expect(frame.nodes).toHaveLength(1);
    expect(frame.paint).toHaveLength(1);
    expect(frame.semantics).toHaveLength(1);
    expect(frame.actions).toHaveLength(1);
    expect(frame.actions[0]?.action).toEqual({
      type: "runtime.gameplay.interact",
    });
  });
});
