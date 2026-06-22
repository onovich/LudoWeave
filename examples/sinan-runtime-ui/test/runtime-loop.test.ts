import type { ResolvedActionTarget, ResolvedUiFrame } from "@ludoweave/core";
import { createHeadlessRenderer } from "@ludoweave/renderer-headless";
import { describe, expect, it } from "vitest";

import {
  createSinanActionRefBridge,
  gateDemoRuntimeUIViewModelEnvelope,
  mapRuntimeUIViewModelEnvelopeToResolvedFrame,
} from "../src/index.js";

describe("Sinan-like runtime UI loop", () => {
  it("keeps the fixture path compatible with core frames, headless snapshots, and ActionRef bridge", () => {
    const frame = resolveSinanRuntimeFixtureFrame();
    const renderer = createHeadlessRenderer({ id: "sinan-runtime-loop" });
    const result = renderer.render(frame);
    const bridge = createSinanActionRefBridge();
    const actionTarget = requireFirstAction(frame);
    const command = bridge.dispatch(actionTarget.action, {
      actionTargetId: actionTarget.id,
      nodeId: actionTarget.nodeId,
      label: actionTarget.label,
    });

    expect(result.rendererId).toBe("sinan-runtime-loop");
    expect(result.frameId).toBe(1024);
    expect(result.snapshot).toContain('"runtime.gameplay.interact"');
    expect(result.snapshot).toContain('"Deliver the cell"');
    expect(result.snapshot).toContain('"Paused"');
    expect(result.snapshot).toContain('"Gate access code"');
    expect(command).toEqual({
      sequence: 1,
      channel: "runtime-ui",
      type: "runtime-ui.dispatch-action",
      action: {
        type: "runtime.gameplay.interact",
        payload: {
          targetId: "switch_a",
        },
      },
      source: {
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        label: "Press E",
      },
    });
  });
});

function resolveSinanRuntimeFixtureFrame(): ResolvedUiFrame {
  const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope);

  expect(result.ok).toBe(true);
  expect(result.diagnostics).toEqual([]);

  if (result.frame === undefined) {
    throw new Error("Expected the Sinan runtime fixture to produce a ResolvedUiFrame.");
  }

  return result.frame;
}

function requireFirstAction(frame: ResolvedUiFrame): ResolvedActionTarget {
  const action = frame.actions[0];
  if (action === undefined) {
    throw new Error("Expected the Sinan runtime fixture to produce an action target.");
  }
  return action;
}
