import { Prompt } from "@ludoweave/components";
import {
  createLayoutEnvironment,
  normalizeUiNode,
  resolveAbsoluteAnchor,
  type ActionRef,
  type ResolvedUiFrame,
  type UiNode,
} from "@ludoweave/core";

export function createPromptFrameFixture(): ResolvedUiFrame {
  const promptNode = normalizeUiNode(Prompt.render({}));
  const key = requireKey(promptNode);
  const props = requireProps(promptNode);
  const label = getStringProp(promptNode, "label");
  const action = requireAction(promptNode);
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
        type: promptNode.type,
        key,
        index: 0,
        box,
        props,
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
        label,
      },
    ],
    actions: [
      {
        id: "action.prompt",
        nodeId: "root/key:prompt",
        path: ["root", "key:prompt"],
        action,
        box,
        label,
      },
    ],
    diagnostics: [],
  };
}

function getStringProp(node: UiNode, propName: string): string {
  const value = node.props?.[propName];
  if (typeof value !== "string") {
    throw new TypeError(`Prompt fixture expected string prop ${propName}.`);
  }
  return value;
}

function requireKey(node: UiNode): string {
  if (node.key === undefined) {
    throw new TypeError("Prompt fixture expected a key.");
  }
  return node.key;
}

function requireProps(node: UiNode): NonNullable<UiNode["props"]> {
  if (node.props === undefined) {
    throw new TypeError("Prompt fixture expected props.");
  }
  return node.props;
}

function requireAction(node: UiNode): ActionRef {
  if (node.action === undefined) {
    throw new TypeError("Prompt fixture expected an ActionRef.");
  }
  return node.action;
}
