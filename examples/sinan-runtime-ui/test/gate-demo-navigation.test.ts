import { describe, expect, it } from "vitest";
import { normalizeFocusGraph } from "@ludoweave/core";

import {
  createGateDemoNavigationSequence,
  gateDemoNavigationSequenceVersion,
} from "../src/index.js";

describe("Gate Demo navigation sequence", () => {
  it("creates a deterministic gamepad navigation sequence with registry results", () => {
    const result = createGateDemoNavigationSequence();

    expect(result.version).toBe(gateDemoNavigationSequenceVersion);
    expect(result.frameId).toBe("gate-demo:1024");
    expect(result.focusGraph.nodes.map((node) => node.id)).toEqual(["resume", "cancel"]);
    expect(result.sequence.entries.map((entry) => entry.result.status)).toEqual([
      "navigated",
      "action",
      "action",
    ]);
    expect(result.sequence.actionLog.map((entry) => entry.action.type)).toEqual([
      "runtime.pause.close",
      "runtime.pause.close",
    ]);
    expect(result.registryResults.map((entry) => entry.routingResult)).toEqual([
      "accepted",
      "accepted",
    ]);
    expect(result.rendererTrace).toMatchObject({
      kind: "focus-graph-trace",
      frameId: 1024,
      scopeId: "pause.dialog",
      result: "targets",
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("surfaces deterministic registry failures for navigation ActionRefs", () => {
    const result = createGateDemoNavigationSequence({
      registryOptions: {
        disabledActionTypes: ["runtime.pause.close"],
      },
    });

    expect(result.registryResults).toHaveLength(2);
    expect(result.registryResults.every((entry) => entry.routingResult === "disabled")).toBe(true);
    expect(result.registryResults[0]?.diagnostics[0]?.code).toBe(
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
    );
  });

  it("can surface renderer trace failures separately from registry routing", () => {
    const result = createGateDemoNavigationSequence({
      focusGraph: normalizeFocusGraph({
        scopeId: "pause.dialog",
        nodes: [],
      }),
    });

    expect(result.rendererTrace).toEqual({
      kind: "focus-graph-trace",
      frameId: 1024,
      scopeId: "pause.dialog",
      result: "no-target",
      targets: [],
    });
    expect(result.registryResults).toEqual([]);
  });
});
