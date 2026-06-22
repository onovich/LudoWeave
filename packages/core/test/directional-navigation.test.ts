import { describe, expect, it } from "vitest";

import { resolveDirectionalFocus } from "../src/directional-navigation.js";
import type { FocusDirection } from "../src/focus-graph.js";
import { normalizeFocusGraph } from "../src/focus-graph.js";

describe("directional focus resolver", () => {
  it("prefers explicit directional neighbors", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "resume",
          rect: { x: 100, y: 100, width: 80, height: 40 },
          directionalNeighbors: { down: "settings" },
        },
        {
          id: "quit",
          rect: { x: 100, y: 160, width: 80, height: 40 },
        },
        {
          id: "settings",
          rect: { x: 300, y: 320, width: 80, height: 40 },
        },
      ],
    });

    expect(resolveDirectionalFocus(graph, "resume", "down")).toEqual({
      status: "resolved",
      fromId: "resume",
      direction: "down",
      targetId: "settings",
      method: "explicit-neighbor",
    });
  });

  it("falls back to the nearest directional target", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "prompt",
          rect: { x: 200, y: 200, width: 100, height: 40 },
        },
        {
          id: "objective",
          rect: { x: 190, y: 120, width: 100, height: 40 },
        },
        {
          id: "pause",
          rect: { x: 420, y: 120, width: 100, height: 40 },
        },
      ],
    });

    expect(resolveDirectionalFocus(graph, "prompt", "up")).toEqual({
      status: "resolved",
      fromId: "prompt",
      direction: "up",
      targetId: "objective",
      method: "nearest-target",
    });
  });

  it("uses priority and id as stable tie-breakers", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "center",
          rect: { x: 100, y: 100, width: 40, height: 40 },
        },
        {
          id: "alpha",
          rect: { x: 80, y: 180, width: 40, height: 40 },
          priority: 1,
        },
        {
          id: "beta",
          rect: { x: 80, y: 180, width: 40, height: 40 },
          priority: 5,
        },
        {
          id: "gamma",
          rect: { x: 80, y: 180, width: 40, height: 40 },
          priority: 5,
        },
      ],
    });

    expect(resolveDirectionalFocus(graph, "center", "down")).toEqual({
      status: "resolved",
      fromId: "center",
      direction: "down",
      targetId: "beta",
      method: "nearest-target",
    });
  });

  it("returns no-target when there is no directional candidate", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "top",
          rect: { x: 100, y: 100, width: 80, height: 40 },
        },
      ],
    });

    expect(resolveDirectionalFocus(graph, "top", "up")).toEqual({
      status: "no-target",
      fromId: "top",
      direction: "up",
    });
  });

  it("snapshots deterministic directional results", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "center",
          rect: { x: 100, y: 100, width: 40, height: 40 },
        },
        {
          id: "up",
          rect: { x: 100, y: 40, width: 40, height: 40 },
        },
        {
          id: "right",
          rect: { x: 180, y: 100, width: 40, height: 40 },
        },
        {
          id: "down",
          rect: { x: 100, y: 180, width: 40, height: 40 },
        },
        {
          id: "left",
          rect: { x: 40, y: 100, width: 40, height: 40 },
        },
      ],
    });

    expect(
      (["up", "right", "down", "left"] satisfies readonly FocusDirection[]).map((direction) =>
        resolveDirectionalFocus(graph, "center", direction),
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "direction": "up",
          "fromId": "center",
          "method": "nearest-target",
          "status": "resolved",
          "targetId": "up",
        },
        {
          "direction": "right",
          "fromId": "center",
          "method": "nearest-target",
          "status": "resolved",
          "targetId": "right",
        },
        {
          "direction": "down",
          "fromId": "center",
          "method": "nearest-target",
          "status": "resolved",
          "targetId": "down",
        },
        {
          "direction": "left",
          "fromId": "center",
          "method": "nearest-target",
          "status": "resolved",
          "targetId": "left",
        },
      ]
    `);
  });
});
