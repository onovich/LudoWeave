import { describe, expect, it } from "vitest";

import {
  gateDemoRuntimeUIViewModel,
  mapRuntimeUIViewModelToComponentProps,
  mapRuntimeUIViewModelToUiNodes,
} from "../src/index.js";

describe("Sinan-like RuntimeUIViewModel mapping", () => {
  it("maps prompt and subtitle elements to LudoWeave component props", () => {
    expect(mapRuntimeUIViewModelToComponentProps(gateDemoRuntimeUIViewModel)).toEqual({
      prompts: [
        {
          key: "prompt.interact.switch_a",
          label: "Press E",
          action: {
            type: "runtime.gameplay.interact",
            payload: {
              targetId: "switch_a",
            },
          },
        },
      ],
      subtitles: [
        {
          key: "subtitle.gate.hum",
          text: "The gate hums softly.",
        },
      ],
      objectives: [
        {
          key: "objective.delivery.cell",
          title: "Deliver the cell",
          body: "Bring the energy cell to the gate.",
          status: "active",
          action: {
            type: "runtime.objective.inspect",
            payload: {
              objectiveId: "delivery",
            },
          },
        },
      ],
      pauses: [
        {
          key: "pause.menu",
          title: "Paused",
          confirmAction: "runtime.pause.resume",
          cancelAction: "runtime.pause.close",
          focus: {
            scopeId: "pause.menu.focus",
            initialFocusKey: "confirm",
            restoreFocusKey: "prompt.interact.switch_a",
          },
          inputShield: {
            blockedScopes: ["gameplay"],
          },
        },
      ],
      editableOverlayCandidates: [
        {
          type: "editable-text",
          key: "editable.gate-code",
          props: {
            label: "Gate access code",
            value: "",
            multiline: false,
            requiredCapability: "overlay.text-input",
            overlayCandidate: true,
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
            placeholder: "Enter gate code",
            inputMode: "text",
            fallbackAction: {
              type: "runtime.input.open-host-modal",
              payload: {
                field: "gate-code",
                reason: "missing-overlay-capability",
              },
            },
          },
          style: {
            themeToken: "runtime-ui.dialog.controls",
          },
        },
      ],
    });
  });

  it("renders Gate Demo nodes in fixture order, including pause and editable overlay candidate", () => {
    const nodes = mapRuntimeUIViewModelToUiNodes(gateDemoRuntimeUIViewModel);

    expect(nodes.map((node) => [node.type, node.key])).toEqual([
      ["button", "prompt.interact.switch_a"],
      ["text", "subtitle.gate.hum"],
      ["objective", "objective.delivery.cell"],
      ["dialog", "pause.menu"],
      ["editable-text", "editable.gate-code"],
    ]);
    expect(nodes[3]).toMatchObject({
      type: "dialog",
      key: "pause.menu",
      props: {
        title: "Paused",
        modal: true,
        focusScopeId: "pause.menu.focus",
        inputShieldBlockedScopes: ["gameplay"],
      },
    });
    expect(nodes[4]).toMatchObject({
      type: "editable-text",
      key: "editable.gate-code",
      props: {
        label: "Gate access code",
        requiredCapability: "overlay.text-input",
        overlayCandidate: true,
        fallbackAction: {
          type: "runtime.input.open-host-modal",
          payload: {
            field: "gate-code",
            reason: "missing-overlay-capability",
          },
        },
      },
    });
  });
});
