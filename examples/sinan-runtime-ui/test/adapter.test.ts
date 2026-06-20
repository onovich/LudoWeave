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
    });
  });

  it("renders the same Prompt and Subtitle components used by the standalone path", () => {
    expect(mapRuntimeUIViewModelToUiNodes(gateDemoRuntimeUIViewModel)).toMatchInlineSnapshot(`
      [
        {
          "action": {
            "payload": {
              "targetId": "switch_a",
            },
            "type": "runtime.gameplay.interact",
          },
          "key": "prompt.interact.switch_a",
          "props": {
            "label": "Press E",
          },
          "type": "button",
        },
        {
          "key": "subtitle.gate.hum",
          "props": {
            "text": "The gate hums softly.",
          },
          "type": "text",
        },
      ]
    `);
  });
});
