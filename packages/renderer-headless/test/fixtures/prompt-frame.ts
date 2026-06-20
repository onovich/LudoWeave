import type { ResolvedUiFrame } from "@ludoweave/core";

export function createPromptFrameFixture(): ResolvedUiFrame {
  return {
    frameId: 1,
    viewport: {
      width: 1280,
      height: 720,
      devicePixelRatio: 1,
    },
    nodes: [
      {
        id: "root/key:prompt",
        path: ["root", "key:prompt"],
        type: "button",
        key: "prompt",
        index: 0,
        box: { x: 520, y: 620, width: 240, height: 48 },
        props: { label: "Press E" },
      },
    ],
    paint: [
      {
        id: "paint.prompt.box",
        kind: "box",
        nodeId: "root/key:prompt",
        box: { x: 520, y: 620, width: 240, height: 48 },
        fill: "#111827",
      },
    ],
    semantics: [
      {
        id: "semantics.prompt",
        nodeId: "root/key:prompt",
        role: "button",
        label: "Press E",
      },
    ],
    actions: [
      {
        id: "action.prompt",
        nodeId: "root/key:prompt",
        path: ["root", "key:prompt"],
        action: { type: "runtime.gameplay.interact" },
        box: { x: 520, y: 620, width: 240, height: 48 },
        label: "Press E",
      },
    ],
    diagnostics: [],
  };
}
