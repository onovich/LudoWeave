import { describe, expect, it } from "vitest";

import type { ResolvedUiFrame } from "../src/resolved-frame.js";

describe("ResolvedUiFrame", () => {
  it("keeps nodes, paint, semantics, and action targets serializable", () => {
    const frame = {
      frameId: 1,
      viewport: {
        width: 1280,
        height: 720,
        devicePixelRatio: 1,
        safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      nodes: [
        {
          id: "root",
          path: ["root"],
          type: "surface",
          index: 0,
          children: ["root/key:prompt"],
          box: { x: 0, y: 0, width: 1280, height: 720 },
        },
        {
          id: "root/key:prompt",
          path: ["root", "key:prompt"],
          type: "button",
          key: "prompt",
          parentId: "root",
          index: 0,
          box: { x: 520, y: 620, width: 240, height: 48 },
          props: { label: "Press E" },
          action: { type: "runtime.gameplay.interact" },
        },
      ],
      paint: [
        {
          id: "paint.prompt.box",
          kind: "box",
          nodeId: "root/key:prompt",
          box: { x: 520, y: 620, width: 240, height: 48 },
          fill: "#111827",
          radius: 4,
        },
        {
          id: "paint.prompt.text",
          kind: "text",
          nodeId: "root/key:prompt",
          box: { x: 544, y: 632, width: 192, height: 24 },
          text: "Press E",
          color: "#ffffff",
          fontSize: 16,
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
    } satisfies ResolvedUiFrame;

    expect(JSON.parse(JSON.stringify(frame))).toEqual(frame);
    expect(frame).toMatchInlineSnapshot(`
      {
        "actions": [
          {
            "action": {
              "type": "runtime.gameplay.interact",
            },
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 620,
            },
            "id": "action.prompt",
            "label": "Press E",
            "nodeId": "root/key:prompt",
            "path": [
              "root",
              "key:prompt",
            ],
          },
        ],
        "diagnostics": [],
        "frameId": 1,
        "nodes": [
          {
            "box": {
              "height": 720,
              "width": 1280,
              "x": 0,
              "y": 0,
            },
            "children": [
              "root/key:prompt",
            ],
            "id": "root",
            "index": 0,
            "path": [
              "root",
            ],
            "type": "surface",
          },
          {
            "action": {
              "type": "runtime.gameplay.interact",
            },
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 620,
            },
            "id": "root/key:prompt",
            "index": 0,
            "key": "prompt",
            "parentId": "root",
            "path": [
              "root",
              "key:prompt",
            ],
            "props": {
              "label": "Press E",
            },
            "type": "button",
          },
        ],
        "paint": [
          {
            "box": {
              "height": 48,
              "width": 240,
              "x": 520,
              "y": 620,
            },
            "fill": "#111827",
            "id": "paint.prompt.box",
            "kind": "box",
            "nodeId": "root/key:prompt",
            "radius": 4,
          },
          {
            "box": {
              "height": 24,
              "width": 192,
              "x": 544,
              "y": 632,
            },
            "color": "#ffffff",
            "fontSize": 16,
            "id": "paint.prompt.text",
            "kind": "text",
            "nodeId": "root/key:prompt",
            "text": "Press E",
          },
        ],
        "semantics": [
          {
            "id": "semantics.prompt",
            "label": "Press E",
            "nodeId": "root/key:prompt",
            "role": "button",
          },
        ],
        "viewport": {
          "devicePixelRatio": 1,
          "height": 720,
          "safeArea": {
            "bottom": 0,
            "left": 0,
            "right": 0,
            "top": 0,
          },
          "width": 1280,
        },
      }
    `);
  });
});
