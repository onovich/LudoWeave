import { describe, expect, it } from "vitest";

import { normalizeFocusGraph, normalizeFocusGraphNode } from "../src/focus-graph.js";

describe("focus graph metadata", () => {
  it("normalizes serializable focus graph nodes", () => {
    const node = normalizeFocusGraphNode({
      id: " prompt.primary ",
      nodeId: "node.prompt.primary",
      rect: { x: 96, y: 512, width: 320, height: 48 },
      scopeId: "hud",
      directionalNeighbors: {
        up: "objective",
        down: "pause",
      },
      priority: 10,
      disabledReason: "host-disabled",
    });

    expect(node).toEqual({
      id: "prompt.primary",
      nodeId: "node.prompt.primary",
      rect: { x: 96, y: 512, width: 320, height: 48 },
      scopeId: "hud",
      directionalNeighbors: {
        up: "objective",
        down: "pause",
      },
      priority: 10,
      disabledReason: "host-disabled",
    });
    expect(JSON.parse(JSON.stringify(node))).toEqual(node);
  });

  it("normalizes a focus graph with current and restore focus references", () => {
    const graph = normalizeFocusGraph({
      scopeId: " pause.dialog ",
      currentFocusId: "resume",
      restoreFocusId: "pause-button",
      nodes: [
        {
          id: "resume",
          rect: { x: 440, y: 320, width: 240, height: 44 },
          directionalNeighbors: { down: "quit" },
          priority: 1,
        },
        {
          id: "quit",
          rect: { x: 440, y: 376, width: 240, height: 44 },
          directionalNeighbors: { up: "resume" },
          priority: 2,
        },
        {
          id: "pause-button",
          scopeId: "hud",
          rect: { x: 24, y: 24, width: 48, height: 48 },
        },
      ],
    });

    expect(graph).toEqual({
      scopeId: "pause.dialog",
      nodes: [
        {
          id: "resume",
          nodeId: "resume",
          rect: { x: 440, y: 320, width: 240, height: 44 },
          scopeId: "pause.dialog",
          directionalNeighbors: { down: "quit" },
          priority: 1,
        },
        {
          id: "quit",
          nodeId: "quit",
          rect: { x: 440, y: 376, width: 240, height: 44 },
          scopeId: "pause.dialog",
          directionalNeighbors: { up: "resume" },
          priority: 2,
        },
        {
          id: "pause-button",
          nodeId: "pause-button",
          rect: { x: 24, y: 24, width: 48, height: 48 },
          scopeId: "hud",
          priority: 0,
        },
      ],
      currentFocusId: "resume",
      restoreFocusId: "pause-button",
    });
    expect(JSON.parse(JSON.stringify(graph))).toEqual(graph);
  });

  it("rejects platform-like rects, duplicate ids, missing neighbors, and invalid reasons", () => {
    class PlatformRect {
      x = 0;
      y = 0;
      width = 100;
      height = 24;
    }

    expect(() =>
      normalizeFocusGraphNode({
        id: "button",
        rect: new PlatformRect(),
      }),
    ).toThrow(/rect must be a plain object/);

    expect(() =>
      normalizeFocusGraph({
        nodes: [
          { id: "button", rect: { x: 0, y: 0, width: 100, height: 24 } },
          { id: "button", rect: { x: 0, y: 32, width: 100, height: 24 } },
        ],
      }),
    ).toThrow(/must be unique/);

    expect(() =>
      normalizeFocusGraph({
        nodes: [
          {
            id: "button",
            rect: { x: 0, y: 0, width: 100, height: 24 },
            directionalNeighbors: { down: "missing" },
          },
        ],
      }),
    ).toThrow(/neighbor "missing"/);

    expect(() =>
      normalizeFocusGraphNode({
        id: "button",
        rect: { x: 0, y: 0, width: 100, height: 24 },
        disabledReason: "callback-required" as never,
      }),
    ).toThrow(/disabledReason/);
  });
});
