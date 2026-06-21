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
    });
  });

  it("renders the same Prompt, Subtitle, and Objective components used by the standalone path", () => {
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
          "style": {
            "themeToken": "runtime-ui.prompt.root",
          },
          "type": "button",
        },
        {
          "key": "subtitle.gate.hum",
          "props": {
            "text": "The gate hums softly.",
          },
          "style": {
            "themeToken": "runtime-ui.subtitle.root",
          },
          "type": "text",
        },
        {
          "action": {
            "payload": {
              "objectiveId": "delivery",
            },
            "type": "runtime.objective.inspect",
          },
          "key": "objective.delivery.cell",
          "props": {
            "body": "Bring the energy cell to the gate.",
            "status": "active",
            "title": "Deliver the cell",
          },
          "style": {
            "themeToken": "runtime-ui.objective.root",
          },
          "type": "objective",
        },
      ]
    `);
  });
});
