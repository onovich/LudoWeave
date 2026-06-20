import { describe, expect, it } from "vitest";

import { normalizeUiNode } from "../src/ui-node.js";

describe("normalizeUiNode", () => {
  it("normalizes a serializable fixture with children and action refs", () => {
    const node = normalizeUiNode({
      type: "surface",
      key: "hud.main",
      props: {
        visible: true,
      },
      style: {
        layout: "column",
        gap: 8,
      },
      children: [
        {
          type: "text",
          key: "subtitle.line",
          props: {
            text: "The gate hums softly.",
          },
        },
        null,
        false,
        {
          type: "button",
          key: "prompt.interact",
          props: {
            label: "Press E",
          },
          action: "runtime.gameplay.interact",
        },
      ],
    });

    expect(JSON.parse(JSON.stringify(node))).toEqual(node);
    expect(node).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "key": "subtitle.line",
            "props": {
              "text": "The gate hums softly.",
            },
            "type": "text",
          },
          {
            "action": {
              "type": "runtime.gameplay.interact",
            },
            "key": "prompt.interact",
            "props": {
              "label": "Press E",
            },
            "type": "button",
          },
        ],
        "key": "hud.main",
        "props": {
          "visible": true,
        },
        "style": {
          "gap": 8,
          "layout": "column",
        },
        "type": "surface",
      }
    `);
  });

  it("rejects non-serializable props", () => {
    expect(() =>
      normalizeUiNode({
        type: "button",
        props: {
          onPress: () => undefined,
        },
      } as never),
    ).toThrow(/props\.onPress must be a JsonValue/);
  });
});
