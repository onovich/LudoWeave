import { describe, expect, it } from "vitest";

import { gateDemoRuntimeUIViewModelEnvelope } from "../../../examples/sinan-runtime-ui/src/fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "../../../examples/sinan-runtime-ui/src/resolved-frame-adapter.js";
import {
  traceCanvas2DActionHitTest,
  traceCanvas2DTextInputOverlayCoordination,
} from "../src/index.js";

describe("Canvas2D Gate Demo trace", () => {
  it("traces the Gate Demo prompt action target without dispatching it", () => {
    const frame = requireGateDemoFrame();
    const promptTarget = requireActionTarget(frame, "action.prompt.interact.switch_a");
    const trace = traceCanvas2DActionHitTest(frame, {
      x: promptTarget.box.x + 8,
      y: promptTarget.box.y + 8,
    });

    expect(trace).toEqual({
      kind: "action-hit-test",
      frameId: 1024,
      point: {
        x: promptTarget.box.x + 8,
        y: promptTarget.box.y + 8,
      },
      result: "target",
      target: {
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        box: promptTarget.box,
        action: {
          type: "runtime.gameplay.interact",
          payload: {
            targetId: "switch_a",
          },
        },
        label: "Press E",
      },
    });
    expect(JSON.stringify(trace)).not.toContain("dispatch");
  });

  it("coordinates the Gate Demo editable overlay candidate for the host bridge", () => {
    const frame = requireGateDemoFrame();
    const editableNode = requireNode(frame, "runtime.main/key:editable.gate-code");

    expect(
      traceCanvas2DTextInputOverlayCoordination(frame, {
        overlayId: "overlay.gate-code",
        nodeId: editableNode.id,
        value: "A-17",
        selection: { start: 4, end: 4, direction: "none" },
      }),
    ).toEqual({
      kind: "text-input-overlay-coordination",
      frameId: 1024,
      nodeId: "runtime.main/key:editable.gate-code",
      result: "request",
      request: {
        overlayId: "overlay.gate-code",
        nodeId: "runtime.main/key:editable.gate-code",
        box: editableNode.box,
        value: "A-17",
        selection: { start: 4, end: 4, direction: "none" },
        placeholder: "Enter gate code",
        inputMode: "text",
        multiline: false,
        ariaLabel: "Gate access code",
        themeToken: "runtime-ui.dialog.controls",
        commitAction: {
          type: "runtime.input.commit",
          payload: {
            field: "gate-code",
          },
        },
        cancelAction: {
          type: "runtime.input.cancel",
          payload: {
            field: "gate-code",
          },
        },
        diagnosticPath: ["frame", "nodes", "runtime.main/key:editable.gate-code"],
      },
      diagnostics: [],
    });
  });
});

function requireGateDemoFrame() {
  const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope);

  if (result.frame === undefined) {
    throw new Error("Expected Gate Demo adapter to produce a ResolvedUiFrame.");
  }

  return result.frame;
}

function requireActionTarget(frame: ReturnType<typeof requireGateDemoFrame>, id: string) {
  const action = frame.actions.find((candidate) => candidate.id === id);

  if (action === undefined) {
    throw new Error(`Expected action target ${id}.`);
  }

  return action;
}

function requireNode(frame: ReturnType<typeof requireGateDemoFrame>, id: string) {
  const node = frame.nodes.find((candidate) => candidate.id === id);

  if (node === undefined) {
    throw new Error(`Expected node ${id}.`);
  }

  return node;
}
