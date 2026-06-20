import { describe, expect, it } from "vitest";

import { resolveStackLayout } from "../src/layout.js";

describe("resolveStackLayout alignment", () => {
  it("centers row children on both axes inside a container", () => {
    expect(
      resolveStackLayout({
        direction: "row",
        container: { x: 0, y: 0, width: 200, height: 50 },
        justify: "center",
        align: "center",
        gap: 10,
        children: [
          { id: "a", width: 40, height: 10 },
          { id: "b", width: 60, height: 20 },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "box": {
            "height": 10,
            "width": 40,
            "x": 45,
            "y": 20,
          },
          "id": "a",
        },
        {
          "box": {
            "height": 20,
            "width": 60,
            "x": 95,
            "y": 15,
          },
          "id": "b",
        },
      ]
    `);
  });

  it("end-aligns column children and justifies them to the bottom", () => {
    expect(
      resolveStackLayout({
        direction: "column",
        container: { x: 10, y: 5, width: 100, height: 120 },
        justify: "end",
        align: "end",
        gap: 5,
        children: [
          { id: "title", width: 40, height: 20 },
          { id: "body", width: 80, height: 30 },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "box": {
            "height": 20,
            "width": 40,
            "x": 70,
            "y": 70,
          },
          "id": "title",
        },
        {
          "box": {
            "height": 30,
            "width": 80,
            "x": 30,
            "y": 95,
          },
          "id": "body",
        },
      ]
    `);
  });
});
