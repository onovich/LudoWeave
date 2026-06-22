import { describe, expect, it } from "vitest";
import { normalizeScrollMetadataFrame } from "@ludoweave/core";

import { createGateDemoScrollSequence, gateDemoScrollSequenceVersion } from "../src/index.js";

describe("Gate Demo scroll sequence", () => {
  it("creates a deterministic host-owned scroll sequence with registry results", () => {
    const result = createGateDemoScrollSequence();

    expect(result.version).toBe(gateDemoScrollSequenceVersion);
    expect(result.frameId).toBe("gate-demo:1024");
    expect(result.scrollMetadata.activeContainerId).toBe("gate-demo-objective-scroll");
    expect(result.intents.map((intent) => intent.kind)).toEqual([
      "line",
      "page",
      "edge",
      "restore",
    ]);
    expect(result.registryResults.map((entry) => entry.routingResult)).toEqual([
      "accepted",
      "accepted",
      "accepted",
      "accepted",
    ]);
    expect(result.rendererTrace).toMatchObject({
      kind: "scroll-metadata-trace",
      frameId: 1024,
      result: "containers",
      containers: [
        {
          containerId: "gate-demo-objective-scroll",
          actionTargetIds: ["action.objective.delivery.cell"],
          offset: { x: 0, y: 96, revision: 1 },
        },
      ],
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("surfaces deterministic registry failures for scroll ActionRefs", () => {
    const result = createGateDemoScrollSequence({
      registryOptions: {
        disabledActionTypes: ["runtime.scroll.intent"],
      },
    });

    expect(result.registryResults).toHaveLength(4);
    expect(result.registryResults.every((entry) => entry.routingResult === "disabled")).toBe(true);
    expect(result.registryResults[0]?.diagnostics[0]?.code).toBe(
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
    );
  });

  it("can surface renderer trace failures separately from registry routing", () => {
    const result = createGateDemoScrollSequence({
      scrollMetadata: normalizeScrollMetadataFrame({
        containers: [],
      }),
    });

    expect(result.rendererTrace).toEqual({
      kind: "scroll-metadata-trace",
      frameId: 1024,
      result: "no-container",
      containers: [],
    });
    expect(result.registryResults).toEqual([]);
  });
});
