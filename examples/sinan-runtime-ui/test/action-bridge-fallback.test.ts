import { describe, expect, it } from "vitest";

import {
  createSinanActionRefBridge,
  gateDemoRuntimeUIViewModel,
  mapRuntimeUIViewModelToComponentProps,
  mapRuntimeUIViewModelToUiNodes,
  renderRuntimeUIViewModelFallback,
} from "../src/index.js";

describe("Sinan-like ActionRef bridge", () => {
  it("records ActionRef-only commands for host dispatch", () => {
    const [promptNode] = mapRuntimeUIViewModelToUiNodes(gateDemoRuntimeUIViewModel);

    if (promptNode?.action === undefined) {
      throw new Error("Expected the prompt node to expose an ActionRef.");
    }

    const bridge = createSinanActionRefBridge();
    const command = bridge.dispatch(promptNode.action, {
      nodeId: promptNode.key,
      label: String(promptNode.props?.label),
    });

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
        nodeId: "prompt.interact.switch_a",
        label: "Press E",
      },
    });
    expect(bridge.actionLogSnapshot()).toEqual([
      {
        sequence: 1,
        action: {
          type: "runtime.gameplay.interact",
          payload: {
            targetId: "switch_a",
          },
        },
        nodeId: "prompt.interact.switch_a",
        label: "Press E",
      },
    ]);
  });
});

describe("Sinan-like fallback renderer", () => {
  it("renders a stable fallback snapshot from the host-owned view model", () => {
    expect(renderRuntimeUIViewModelFallback(gateDemoRuntimeUIViewModel)).toMatchInlineSnapshot(`
      {
        "frame": 1024,
        "layers": [
          {
            "elements": [
              {
                "action": {
                  "payload": {
                    "targetId": "switch_a",
                  },
                  "type": "runtime.gameplay.interact",
                },
                "id": "prompt.interact.switch_a",
                "text": "Press E",
                "type": "prompt",
              },
              {
                "id": "subtitle.gate.hum",
                "speaker": "Gate",
                "text": "The gate hums softly.",
                "type": "subtitle",
              },
            ],
            "id": "runtime.main",
            "zIndex": 10,
          },
        ],
        "source": "sinan-fallback",
      }
    `);
  });

  it("keeps fallback prompt actions aligned with component mapping", () => {
    const fallback = renderRuntimeUIViewModelFallback(gateDemoRuntimeUIViewModel);
    const componentProps = mapRuntimeUIViewModelToComponentProps(gateDemoRuntimeUIViewModel);
    const [fallbackPrompt] = fallback.layers[0]?.elements ?? [];
    const [promptProps] = componentProps.prompts;

    expect(fallbackPrompt?.type).toBe("prompt");
    expect(promptProps?.action).toEqual(
      fallbackPrompt?.type === "prompt" ? fallbackPrompt.action : undefined,
    );
  });
});
