import { describe, expect, it } from "vitest";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";
import { createPromptFrameFixture } from "./fixtures/prompt-frame.js";

describe("serializeHeadlessFrame", () => {
  it("serializes frames with deterministic object key ordering", () => {
    const frame = createPromptFrameFixture();
    const sameFrameDifferentKeyOrder = {
      diagnostics: frame.diagnostics,
      actions: frame.actions,
      semantics: frame.semantics,
      paint: frame.paint,
      nodes: frame.nodes,
      viewport: frame.viewport,
      frameId: frame.frameId,
    } satisfies ResolvedUiFrame;

    expect(serializeHeadlessFrame(frame)).toBe(serializeHeadlessFrame(sameFrameDifferentKeyOrder));
    expect(serializeHeadlessFrame(frame)).toMatchInlineSnapshot(`
      "{
        "actions": [
          {
            "action": {
              "type": "runtime.gameplay.interact"
            },
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 596
            },
            "id": "action.prompt",
            "label": "Press E",
            "nodeId": "root/key:prompt",
            "path": [
              "root",
              "key:prompt"
            ]
          }
        ],
        "diagnostics": [],
        "frameId": 1,
        "nodes": [
          {
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 596
            },
            "id": "root/key:prompt",
            "index": 0,
            "key": "prompt",
            "path": [
              "root",
              "key:prompt"
            ],
            "props": {
              "label": "Press E"
            },
            "type": "button"
          }
        ],
        "paint": [
          {
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 596
            },
            "fill": "#111827",
            "id": "paint.prompt.box",
            "kind": "box",
            "nodeId": "root/key:prompt"
          }
        ],
        "semantics": [
          {
            "id": "semantics.prompt",
            "label": "Press E",
            "nodeId": "root/key:prompt",
            "role": "button"
          }
        ],
        "viewport": {
          "devicePixelRatio": 1,
          "height": 720,
          "safeArea": {
            "bottom": 24,
            "left": 0,
            "right": 0,
            "top": 0
          },
          "width": 1280
        }
      }
      "
    `);
  });

  it("returns the deterministic snapshot from render", () => {
    const renderer = createHeadlessRenderer({ id: "test.headless" });
    const result = renderer.render(createPromptFrameFixture());

    expect(result.rendererId).toBe("test.headless");
    expect(result.snapshot).toBe(serializeHeadlessFrame(result.frame));

    renderer.dispose();
    expect(() => renderer.render(createPromptFrameFixture())).toThrow(/disposed/);
  });
});
