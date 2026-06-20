import {
  createLayoutEnvironment,
  resolveAbsoluteAnchor,
  type ResolvedUiFrame,
} from "@ludoweave/core";

export function createPromptFrameFixture(): ResolvedUiFrame {
  const environment = createLayoutEnvironment({
    viewport: {
      width: 1280,
      height: 720,
      devicePixelRatio: 1,
      safeArea: {
        top: 0,
        right: 0,
        bottom: 24,
        left: 0,
      },
    },
  });
  const box = resolveAbsoluteAnchor({
    container: environment.contentBox,
    size: { width: 240, height: 48 },
    anchor: {
      horizontal: "center",
      vertical: "end",
      inset: {
        bottom: 52,
      },
    },
  });

  return {
    frameId: 1,
    viewport: environment.viewport,
    nodes: [
      {
        id: "root/key:prompt",
        path: ["root", "key:prompt"],
        type: "button",
        key: "prompt",
        index: 0,
        box,
        props: { label: "Press E" },
      },
    ],
    paint: [
      {
        id: "paint.prompt.box",
        kind: "box",
        nodeId: "root/key:prompt",
        box,
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
        box,
        label: "Press E",
      },
    ],
    diagnostics: [],
  };
}
