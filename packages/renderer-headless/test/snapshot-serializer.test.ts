import { describe, expect, it } from "vitest";

import type { ResolvedUiFrame } from "@ludoweave/core";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";

describe("serializeHeadlessFrame", () => {
  it("serializes frames with deterministic object key ordering", () => {
    const frame = createFrame();
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
              "y": 620
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
              "y": 620
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
              "y": 620
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
          "width": 1280
        }
      }
      "
    `);
  });

  it("returns the deterministic snapshot from render", () => {
    const renderer = createHeadlessRenderer({ id: "test.headless" });
    const result = renderer.render(createFrame());

    expect(result.rendererId).toBe("test.headless");
    expect(result.snapshot).toBe(serializeHeadlessFrame(result.frame));

    renderer.dispose();
    expect(() => renderer.render(createFrame())).toThrow(/disposed/);
  });
});

function createFrame(): ResolvedUiFrame {
  return {
    frameId: 1,
    viewport: {
      width: 1280,
      height: 720,
      devicePixelRatio: 1,
    },
    nodes: [
      {
        id: "root/key:prompt",
        path: ["root", "key:prompt"],
        type: "button",
        key: "prompt",
        index: 0,
        box: { x: 520, y: 620, width: 240, height: 48 },
        props: { label: "Press E" },
      },
    ],
    paint: [
      {
        id: "paint.prompt.box",
        kind: "box",
        nodeId: "root/key:prompt",
        box: { x: 520, y: 620, width: 240, height: 48 },
        fill: "#111827",
      },
    ],
    semantics: [
      {
        id: "semantics.prompt",
        nodeId: "root/key:prompt",
        role: "button",
        label: "Press E",
      },
    ],
    actions: [
      {
        id: "action.prompt",
        nodeId: "root/key:prompt",
        path: ["root", "key:prompt"],
        action: { type: "runtime.gameplay.interact" },
        box: { x: 520, y: 620, width: 240, height: 48 },
        label: "Press E",
      },
    ],
    diagnostics: [],
  };
}
