import { describe, expect, it } from "vitest";

import { createHeadlessRenderer } from "../src/index.js";
import { createObjectiveFrameFixture } from "./fixtures/objective-frame.js";

describe("Objective headless fixture", () => {
  it("outputs node, paint, semantics, and action target surfaces", () => {
    const frame = createObjectiveFrameFixture();

    expect(frame.nodes).toHaveLength(1);
    expect(frame.paint).toHaveLength(3);
    expect(frame.semantics).toHaveLength(1);
    expect(frame.actions).toHaveLength(1);
    expect(frame.actions[0]?.action).toEqual({
      type: "runtime.objective.inspect",
      payload: {
        objectiveId: "delivery",
      },
    });
  });

  it("serializes a deterministic objective frame snapshot", () => {
    const renderer = createHeadlessRenderer({ id: "objective.headless" });

    expect(renderer.render(createObjectiveFrameFixture()).snapshot).toMatchInlineSnapshot(`
      "{
        "actions": [
          {
            "action": {
              "payload": {
                "objectiveId": "delivery"
              },
              "type": "runtime.objective.inspect"
            },
            "box": {
              "height": 112,
              "width": 360,
              "x": 48,
              "y": 48
            },
            "id": "action.objective.delivery",
            "label": "Deliver the cell",
            "nodeId": "root/key:objective.delivery",
            "path": [
              "root",
              "key:objective.delivery"
            ]
          }
        ],
        "diagnostics": [],
        "frameId": 4,
        "nodes": [
          {
            "action": {
              "payload": {
                "objectiveId": "delivery"
              },
              "type": "runtime.objective.inspect"
            },
            "box": {
              "height": 112,
              "width": 360,
              "x": 48,
              "y": 48
            },
            "id": "root/key:objective.delivery",
            "index": 0,
            "key": "objective.delivery",
            "path": [
              "root",
              "key:objective.delivery"
            ],
            "props": {
              "body": "Bring the energy cell to the gate.",
              "status": "active",
              "title": "Deliver the cell"
            },
            "type": "objective"
          }
        ],
        "paint": [
          {
            "box": {
              "height": 112,
              "width": 360,
              "x": 48,
              "y": 48
            },
            "fill": "#0f172a",
            "id": "paint.objective.card",
            "kind": "box",
            "nodeId": "root/key:objective.delivery",
            "radius": 8,
            "stroke": "#38bdf8"
          },
          {
            "box": {
              "height": 64,
              "width": 328,
              "x": 64,
              "y": 60
            },
            "color": "#f8fafc",
            "fontSize": 18,
            "id": "paint.objective.title",
            "kind": "text",
            "nodeId": "root/key:objective.delivery",
            "text": "Deliver the cell"
          },
          {
            "box": {
              "height": 52,
              "width": 328,
              "x": 64,
              "y": 92
            },
            "color": "#cbd5e1",
            "fontSize": 14,
            "id": "paint.objective.body",
            "kind": "text",
            "nodeId": "root/key:objective.delivery",
            "text": "Bring the energy cell to the gate."
          }
        ],
        "semantics": [
          {
            "id": "semantics.objective.delivery",
            "label": "Deliver the cell. Bring the energy cell to the gate.",
            "nodeId": "root/key:objective.delivery",
            "role": "surface"
          }
        ],
        "viewport": {
          "devicePixelRatio": 1,
          "height": 720,
          "safeArea": {
            "bottom": 0,
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
});
