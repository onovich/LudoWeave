import { describe, expect, it } from "vitest";

import { createHeadlessRenderer } from "../src/index.js";
import {
  createDeterministicTextMeasure,
  createSubtitleFrameFixture,
} from "./fixtures/subtitle-frame.js";

describe("Subtitle headless fixture", () => {
  it("injects deterministic text measure into the subtitle frame", () => {
    const frame = createSubtitleFrameFixture({
      text: "ABCD",
      measureText: createDeterministicTextMeasure({
        characterWidth: 10,
        lineHeight: 20,
      }),
    });

    expect(frame.nodes[0]?.box).toEqual({
      x: 620,
      y: 628,
      width: 40,
      height: 20,
    });
  });

  it("serializes a deterministic subtitle frame snapshot", () => {
    const renderer = createHeadlessRenderer({ id: "subtitle.headless" });

    expect(renderer.render(createSubtitleFrameFixture()).snapshot).toMatchInlineSnapshot(`
      "{
        "actions": [],
        "diagnostics": [],
        "frameId": 2,
        "nodes": [
          {
            "box": {
              "height": 24,
              "width": 168,
              "x": 556,
              "y": 624
            },
            "id": "root/key:subtitle",
            "index": 0,
            "key": "subtitle",
            "path": [
              "root",
              "key:subtitle"
            ],
            "props": {
              "text": "The gate hums softly."
            },
            "type": "text"
          }
        ],
        "paint": [
          {
            "box": {
              "height": 24,
              "width": 168,
              "x": 556,
              "y": 624
            },
            "color": "#f8fafc",
            "fontSize": 18,
            "id": "paint.subtitle.text",
            "kind": "text",
            "nodeId": "root/key:subtitle",
            "text": "The gate hums softly."
          }
        ],
        "semantics": [
          {
            "id": "semantics.subtitle",
            "label": "The gate hums softly.",
            "nodeId": "root/key:subtitle",
            "role": "text"
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
});
