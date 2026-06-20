import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { resolveStackLayout } from "../src/layout.js";

describe("resolveStackLayout", () => {
  it("resolves row stacks with deterministic gap", () => {
    expect(
      resolveStackLayout({
        direction: "row",
        origin: { x: 10, y: 20 },
        gap: 6,
        children: [
          { id: "a", width: 40, height: 10 },
          { id: "b", width: 50, height: 12 },
          { id: "c", width: 20, height: 14 },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "box": {
            "height": 10,
            "width": 40,
            "x": 10,
            "y": 20,
          },
          "id": "a",
        },
        {
          "box": {
            "height": 12,
            "width": 50,
            "x": 56,
            "y": 20,
          },
          "id": "b",
        },
        {
          "box": {
            "height": 14,
            "width": 20,
            "x": 112,
            "y": 20,
          },
          "id": "c",
        },
      ]
    `);
  });

  it("resolves column stacks with deterministic gap", () => {
    expect(
      resolveStackLayout({
        direction: "column",
        origin: { x: 4, y: 8 },
        gap: 3,
        children: [
          { id: "title", width: 120, height: 24 },
          { id: "body", width: 220, height: 48 },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "box": {
            "height": 24,
            "width": 120,
            "x": 4,
            "y": 8,
          },
          "id": "title",
        },
        {
          "box": {
            "height": 48,
            "width": 220,
            "x": 4,
            "y": 35,
          },
          "id": "body",
        },
      ]
    `);
  });

  it("reports invalid gap and size diagnostics", () => {
    const diagnostics = createDiagnosticSink();

    expect(
      resolveStackLayout({
        direction: "row",
        diagnostics,
        gap: -1,
        children: [{ id: "broken", width: -10, height: Number.NaN }],
      }),
    ).toEqual([
      {
        id: "broken",
        box: { x: 0, y: 0, width: 0, height: 0 },
      },
    ]);
    expect(diagnostics.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "stack.gap must be a non-negative finite number.",
          "path": [
            "stack.gap",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "stack.children.0.width must be a non-negative finite number.",
          "path": [
            "stack.children.0.width",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "stack.children.0.height must be a non-negative finite number.",
          "path": [
            "stack.children.0.height",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
