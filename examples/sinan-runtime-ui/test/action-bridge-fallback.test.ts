import { describe, expect, it } from "vitest";

import {
  createSinanActionRefBridge,
  gateDemoRuntimeUIViewModel,
  mapRuntimeUIViewModelToComponentProps,
  mapRuntimeUIViewModelToUiNodes,
  renderRuntimeUIViewModelFallback,
} from "../src/index.js";
import type { RuntimeUIViewModel } from "../src/index.js";

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

  it("supports source-less string actions and clears bridge snapshots", () => {
    const bridge = createSinanActionRefBridge();

    expect(bridge.dispatch("runtime.ui.pause")).toEqual({
      sequence: 1,
      channel: "runtime-ui",
      type: "runtime-ui.dispatch-action",
      action: {
        type: "runtime.ui.pause",
      },
    });
    expect(bridge.snapshot()).toEqual([
      {
        sequence: 1,
        channel: "runtime-ui",
        type: "runtime-ui.dispatch-action",
        action: {
          type: "runtime.ui.pause",
        },
      },
    ]);

    bridge.clear();

    expect(bridge.snapshot()).toEqual([]);
    expect(bridge.actionLogSnapshot()).toEqual([]);
  });

  it("rejects non-serializable action payloads before host dispatch", () => {
    const bridge = createSinanActionRefBridge();
    const actionWithCallback = {
      type: "runtime.invalid",
      payload: {
        callback: () => undefined,
      },
    } as unknown as Parameters<typeof bridge.dispatch>[0];

    expect(() => bridge.dispatch(actionWithCallback)).toThrow(
      "payload.callback must be a JsonValue.",
    );
    expect(bridge.snapshot()).toEqual([]);
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

  it("normalizes string actions and host-side payload overrides", () => {
    const fallback = renderRuntimeUIViewModelFallback(hardenedRuntimeUIViewModel);
    const [overridePrompt, stringPrompt] = fallback.layers[0]?.elements ?? [];

    expect(overridePrompt).toEqual({
      type: "prompt",
      id: "prompt.override",
      text: "Open",
      action: {
        type: "runtime.gameplay.open",
        payload: {
          targetId: "door_a",
          promptId: "prompt.override",
        },
      },
    });
    expect(stringPrompt).toEqual({
      type: "prompt",
      id: "prompt.string",
      text: "Pause",
      action: {
        type: "runtime.ui.pause",
      },
    });
  });
});

const hardenedRuntimeUIViewModel = {
  frame: 2048,
  source: "sinan-like",
  layers: [
    {
      id: "runtime.edge",
      zIndex: 20,
      elements: [
        {
          type: "prompt",
          id: "prompt.override",
          text: "Open",
          action: {
            type: "runtime.gameplay.open",
            payload: {
              targetId: "stale",
            },
          },
          payload: {
            targetId: "door_a",
            promptId: "prompt.override",
          },
        },
        {
          type: "prompt",
          id: "prompt.string",
          text: "Pause",
          action: "runtime.ui.pause",
        },
      ],
    },
  ],
} satisfies RuntimeUIViewModel;
