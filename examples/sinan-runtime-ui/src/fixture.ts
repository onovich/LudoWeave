import type { RuntimeUIViewModel } from "./view-model.js";

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
      ],
    },
  ],
} satisfies RuntimeUIViewModel;
