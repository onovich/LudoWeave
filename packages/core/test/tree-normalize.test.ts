import { describe, expect, it } from "vitest";

import { normalizeUiTree } from "../src/tree-normalize.js";

describe("normalizeUiTree", () => {
  it("produces deterministic keyed paths and fallback index paths", () => {
    const tree = normalizeUiTree({
      type: "surface",
      key: "hud.main",
      children: [
        {
          type: "text",
          key: "subtitle.line",
        },
        {
          type: "button",
        },
      ],
    });

    expect(
      tree.nodes.map((node) => ({
        id: node.id,
        index: node.index,
        ...(node.parentId === undefined ? {} : { parentId: node.parentId }),
        path: node.path,
        type: node.type,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": "root",
          "index": 0,
          "path": [
            "root",
          ],
          "type": "surface",
        },
        {
          "id": "root/key:subtitle.line",
          "index": 0,
          "parentId": "root",
          "path": [
            "root",
            "key:subtitle.line",
          ],
          "type": "text",
        },
        {
          "id": "root/index:0001:button",
          "index": 1,
          "parentId": "root",
          "path": [
            "root",
            "index:0001:button",
          ],
          "type": "button",
        },
      ]
    `);
  });

  it("emits diagnostics for duplicate sibling keys", () => {
    const tree = normalizeUiTree({
      type: "surface",
      children: [
        { type: "text", key: "duplicate" },
        { type: "button", key: "duplicate" },
      ],
    });

    expect(tree.diagnostics).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_UI_NODE",
          "details": {
            "key": "duplicate",
            "parentId": "root",
          },
          "message": "Duplicate sibling key 'duplicate' will share an identity segment.",
          "path": [
            "root",
          ],
          "severity": "warning",
        },
      ]
    `);
  });
});
