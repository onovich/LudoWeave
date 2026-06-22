import { normalizeVirtualWindowMetadataFrame } from "@ludoweave/core";
import { describe, expect, it } from "vitest";

import {
  createGateDemoVirtualListSequence,
  gateDemoVirtualListSequenceVersion,
} from "../src/index.js";

describe("Gate Demo virtual list sequence", () => {
  it("creates a deterministic host-owned virtual list sequence with registry results", () => {
    const result = createGateDemoVirtualListSequence();

    expect(result.version).toBe(gateDemoVirtualListSequenceVersion);
    expect(result.frameId).toBe("gate-demo:1024");
    expect(result.virtualWindowMetadata.activeWindowId).toBe("gate-demo-quest-window");
    expect(result.intents.map((intent) => intent.kind)).toEqual([
      "select-item",
      "activate-item",
      "move-selection",
      "request-window",
      "restore-selection",
    ]);
    expect(result.registryResults.map((entry) => entry.routingResult)).toEqual([
      "accepted",
      "accepted",
      "accepted",
      "accepted",
      "accepted",
    ]);
    expect(result.rendererTrace).toMatchObject({
      kind: "virtual-window-trace",
      frameId: 1024,
      result: "windows",
      windows: [
        {
          windowId: "gate-demo-quest-window",
          realizedRange: { startIndex: 2, endIndex: 5 },
          overscanRange: { startIndex: 1, endIndex: 7 },
          actionTargetIds: [
            "action.quest:2.activate",
            "action.quest:3.activate",
            "action.quest:4.activate",
          ],
        },
      ],
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("surfaces deterministic registry failures for collection ActionRefs", () => {
    const result = createGateDemoVirtualListSequence({
      registryOptions: {
        disabledActionTypes: ["runtime.collection.intent"],
      },
    });

    expect(result.registryResults).toHaveLength(5);
    expect(result.registryResults.every((entry) => entry.routingResult === "disabled")).toBe(true);
    expect(result.registryResults[0]?.diagnostics[0]?.code).toBe(
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
    );
  });

  it("can surface renderer trace failures separately from registry routing", () => {
    const result = createGateDemoVirtualListSequence({
      virtualWindowMetadata: normalizeVirtualWindowMetadataFrame({
        windows: [],
      }),
    });

    expect(result.rendererTrace).toEqual({
      kind: "virtual-window-trace",
      frameId: 1024,
      result: "no-window",
      windows: [],
    });
    expect(result.registryResults).toEqual([]);
  });
});
