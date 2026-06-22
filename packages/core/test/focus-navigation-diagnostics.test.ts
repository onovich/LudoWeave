import { describe, expect, it } from "vitest";

import { resolveDirectionalFocus } from "../src/directional-navigation.js";
import {
  createFocusNavigationDiagnostic,
  focusNavigationDiagnosticCodes,
} from "../src/focus-navigation-diagnostics.js";
import { normalizeFocusGraph, type FocusGraph } from "../src/focus-graph.js";

describe("focus navigation diagnostics", () => {
  it("uses stable diagnostic codes for disabled, stale, missing, empty, and capability gaps", () => {
    expect(focusNavigationDiagnosticCodes).toEqual({
      disabledTarget: "LW_FOCUS_DISABLED_TARGET",
      emptyGraph: "LW_FOCUS_EMPTY_GRAPH",
      missingHostCapability: "LW_FOCUS_MISSING_HOST_CAPABILITY",
      missingTarget: "LW_FOCUS_MISSING_TARGET",
      staleFocusKey: "LW_FOCUS_STALE_KEY",
    });
  });

  it("reports disabled explicit targets", () => {
    const graph = normalizeFocusGraph({
      nodes: [
        {
          id: "resume",
          rect: { x: 0, y: 0, width: 100, height: 40 },
          directionalNeighbors: { down: "quit" },
        },
        {
          id: "quit",
          rect: { x: 0, y: 80, width: 100, height: 40 },
          disabledReason: "host-disabled",
        },
      ],
    });

    expect(resolveDirectionalFocus(graph, "resume", "down")).toEqual({
      status: "no-target",
      fromId: "resume",
      direction: "down",
      targetId: "quit",
      blockedReason: "disabled-target",
      diagnostic: {
        code: "LW_FOCUS_DISABLED_TARGET",
        severity: "warning",
        message: "Focus navigation target is disabled.",
        details: {
          fromId: "resume",
          direction: "down",
          targetId: "quit",
        },
      },
    });
  });

  it("reports stale focus keys, empty graphs, and missing explicit targets", () => {
    const graph: FocusGraph = {
      scopeId: "root",
      nodes: [
        {
          id: "resume",
          nodeId: "resume",
          rect: { x: 0, y: 0, width: 100, height: 40 },
          scopeId: "root",
          directionalNeighbors: { down: "missing" },
          priority: 0,
        },
        {
          id: "quit",
          nodeId: "quit",
          rect: { x: 0, y: 80, width: 100, height: 40 },
          scopeId: "root",
          priority: 0,
        },
      ],
    };

    expect(resolveDirectionalFocus(graph, "stale", "down").diagnostic?.code).toBe(
      "LW_FOCUS_STALE_KEY",
    );
    expect(
      resolveDirectionalFocus(normalizeFocusGraph({ nodes: [] }), "resume", "down").diagnostic
        ?.code,
    ).toBe("LW_FOCUS_EMPTY_GRAPH");
    expect(resolveDirectionalFocus(graph, "resume", "down").diagnostic?.code).toBe(
      "LW_FOCUS_MISSING_TARGET",
    );
  });

  it("reports missing host capability as an error diagnostic", () => {
    expect(
      createFocusNavigationDiagnostic("missingHostCapability", {
        capability: "host.focusNavigation",
      }),
    ).toEqual({
      code: "LW_FOCUS_MISSING_HOST_CAPABILITY",
      severity: "error",
      message: "Host focus navigation capability is missing.",
      details: {
        capability: "host.focusNavigation",
      },
    });
  });
});
