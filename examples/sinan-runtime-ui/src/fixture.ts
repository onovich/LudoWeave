import type { RuntimeUIViewModel } from "./view-model.js";
import {
  runtimeUIViewModelEnvelopeCapabilities,
  runtimeUIViewModelEnvelopeVersion,
  type RuntimeUIViewModelEnvelope,
} from "./envelope.js";

export const gateDemoRuntimeUIViewModel = {
  frame: 1024,
  source: "sinan-like",
  layers: [
    {
      id: "runtime.main",
      zIndex: 10,
      elements: [
        {
          type: "prompt",
          id: "prompt.interact.switch_a",
          text: "Press E",
          action: {
            type: "runtime.gameplay.interact",
            payload: {
              targetId: "switch_a",
            },
          },
        },
        {
          type: "subtitle",
          id: "subtitle.gate.hum",
          speaker: "Gate",
          text: "The gate hums softly.",
        },
        {
          type: "objective",
          id: "objective.delivery.cell",
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
    },
  ],
} satisfies RuntimeUIViewModel;

export const gateDemoRuntimeUIViewModelEnvelope = {
  version: runtimeUIViewModelEnvelopeVersion,
  frameId: "gate-demo:1024",
  surface: "gate-demo",
  capabilities: runtimeUIViewModelEnvelopeCapabilities,
  fallbackPolicy: {
    renderer: "sinan-owned-fallback",
    missingCapability: "emit-diagnostic",
    unsupportedSurface: "use-host-runtime-ui",
  },
  viewModel: gateDemoRuntimeUIViewModel,
} satisfies RuntimeUIViewModelEnvelope;
