import { Dialog, Objective, Prompt, Subtitle } from "@ludoweave/components";
import {
  createLayoutEnvironment,
  normalizeUiNode,
  resolveAbsoluteAnchor,
  resolveTextMeasure,
  snapRectToPixelGrid,
  type BoxRenderCommand,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type SemanticNode,
  type SemanticRole,
  type TextRenderCommand,
  type UiNode,
} from "@ludoweave/core";

export interface PlaygroundFrameOptions {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio: number;
}

export function createPlaygroundFrame(options: PlaygroundFrameOptions): ResolvedUiFrame {
  const environment = createLayoutEnvironment({
    viewport: {
      width: options.width,
      height: options.height,
      devicePixelRatio: options.devicePixelRatio,
      safeArea: {
        top: 0,
        right: 0,
        bottom: 24,
        left: 0,
      },
    },
  });
  const promptNode = normalizeUiNode(Prompt.render({}));
  const subtitleNode = normalizeUiNode(
    Subtitle.render({
      text: "The gate hums softly.",
    }),
  );
  const objectiveNode = normalizeUiNode(
    Objective.render({
      key: "objective.delivery",
      title: "Deliver the cell",
      body: "Bring the energy cell to the gate.",
      action: {
        type: "runtime.objective.inspect",
        payload: {
          objectiveId: "delivery",
        },
      },
    }),
  );
  const dialogNode = normalizeUiNode(
    Dialog.render({
      key: "pause",
      title: "Pause",
      confirmAction: "runtime.pause.resume",
      cancelAction: "runtime.pause.close",
      focus: {
        scopeId: "pause.dialog",
        restoreFocusKey: "prompt",
      },
    }),
  );
  const confirmNode = requireChild(dialogNode, "confirm");
  const cancelNode = requireChild(dialogNode, "cancel");
  const isCompact = environment.contentBox.width < 720;
  const hudInset = isCompact ? 16 : 32;
  const promptBox = resolveAbsoluteAnchor({
    container: environment.contentBox,
    size: { width: isCompact ? 220 : 240, height: isCompact ? 44 : 48 },
    anchor: {
      horizontal: "center",
      vertical: "end",
      inset: {
        bottom: isCompact ? 24 : 52,
      },
    },
  });
  const subtitleMeasure = resolveTextMeasure({
    text: requireStringProp(subtitleNode, "text"),
    fontSize: 18,
    maxWidth: Math.max(240, environment.contentBox.width * 0.8),
    measureText: ({ text, maxWidth }) => ({
      width: Math.min(text.length * 10, maxWidth),
      height: 28,
    }),
  });
  const subtitleBox = snapRectToPixelGrid({
    devicePixelRatio: environment.viewport.devicePixelRatio,
    rect: resolveAbsoluteAnchor({
      container: environment.contentBox,
      size: subtitleMeasure,
      anchor: {
        horizontal: "center",
        vertical: "end",
        inset: {
          bottom: isCompact ? 76 : 112,
        },
      },
    }),
  });
  const objectiveBox = snapRectToPixelGrid({
    devicePixelRatio: environment.viewport.devicePixelRatio,
    rect: resolveAbsoluteAnchor({
      container: environment.contentBox,
      size: {
        width: isCompact
          ? Math.max(220, environment.contentBox.width - hudInset * 2)
          : Math.min(360, environment.contentBox.width * 0.36),
        height: isCompact ? 64 : 96,
      },
      anchor: {
        horizontal: isCompact ? "center" : "start",
        vertical: "start",
        inset: {
          top: hudInset,
          left: hudInset,
        },
      },
    }),
  });
  const dialogBox = snapRectToPixelGrid({
    devicePixelRatio: environment.viewport.devicePixelRatio,
    rect: resolveAbsoluteAnchor({
      container: environment.contentBox,
      size: {
        width: isCompact
          ? Math.max(220, environment.contentBox.width - hudInset * 2)
          : Math.min(340, environment.contentBox.width * 0.32),
        height: isCompact ? 104 : 156,
      },
      anchor: {
        horizontal: isCompact ? "center" : "end",
        vertical: "start",
        inset: {
          top: isCompact ? hudInset + 76 : hudInset,
          right: hudInset,
        },
      },
    }),
  });
  const confirmBox = snapRectToPixelGrid({
    devicePixelRatio: environment.viewport.devicePixelRatio,
    rect: {
      x: dialogBox.x + 20,
      y: dialogBox.y + dialogBox.height - 56,
      width: Math.max(112, (dialogBox.width - 52) / 2),
      height: 36,
    },
  });
  const cancelBox = snapRectToPixelGrid({
    devicePixelRatio: environment.viewport.devicePixelRatio,
    rect: {
      x: confirmBox.x + confirmBox.width + 12,
      y: confirmBox.y,
      width: confirmBox.width,
      height: confirmBox.height,
    },
  });
  const prompt = createResolvedSurfaces({
    id: "root/key:prompt",
    node: promptNode,
    index: 0,
    box: promptBox,
    role: "button",
    paintId: "paint.prompt.box",
    actionId: "action.prompt.interact",
    fill: "#111827",
  });
  const subtitle = createResolvedSurfaces({
    id: "root/key:subtitle",
    node: subtitleNode,
    index: 1,
    box: subtitleBox,
    role: "text",
    paintId: "paint.subtitle.text",
    color: "#f8fafc",
    fontSize: 18,
  });
  const objective = createResolvedSurfaces({
    id: "root/key:objective.delivery",
    node: objectiveNode,
    index: 2,
    box: objectiveBox,
    role: "button",
    paintId: "paint.objective.delivery",
    actionId: "action.objective.delivery",
    fill: "#1f2937",
  });
  const dialog = createResolvedSurfaces({
    id: "root/key:pause",
    node: dialogNode,
    index: 3,
    box: dialogBox,
    role: "dialog",
    paintId: "paint.pause.dialog",
    fill: "#0f172a",
  });
  const confirm = createResolvedSurfaces({
    id: "root/key:pause/key:confirm",
    node: confirmNode,
    index: 4,
    parentId: dialog.node.id,
    parentPath: dialog.node.path,
    box: confirmBox,
    role: "button",
    paintId: "paint.pause.confirm",
    actionId: "action.pause.confirm",
    fill: "#14532d",
  });
  const cancel = createResolvedSurfaces({
    id: "root/key:pause/key:cancel",
    node: cancelNode,
    index: 5,
    parentId: dialog.node.id,
    parentPath: dialog.node.path,
    box: cancelBox,
    role: "button",
    paintId: "paint.pause.cancel",
    actionId: "action.pause.cancel",
    fill: "#3f1d1d",
  });

  return {
    frameId: 1,
    viewport: environment.viewport,
    nodes: [prompt.node, subtitle.node, objective.node, dialog.node, confirm.node, cancel.node],
    paint: [
      prompt.paint,
      subtitle.paint,
      objective.paint,
      dialog.paint,
      confirm.paint,
      cancel.paint,
    ],
    semantics: [
      prompt.semantic,
      subtitle.semantic,
      objective.semantic,
      {
        ...dialog.semantic,
        children: [confirm.semantic.id, cancel.semantic.id],
      },
      {
        ...confirm.semantic,
        parentId: dialog.semantic.id,
      },
      {
        ...cancel.semantic,
        parentId: dialog.semantic.id,
      },
    ],
    actions: collectActions(prompt, objective, confirm, cancel),
    diagnostics: [],
  };
}

function createResolvedSurfaces(input: {
  readonly id: string;
  readonly node: UiNode;
  readonly index: number;
  readonly parentId?: string;
  readonly parentPath?: readonly string[];
  readonly box: ResolvedRect;
  readonly role: SemanticRole;
  readonly paintId: string;
  readonly actionId?: string;
  readonly fill?: string;
  readonly color?: string;
  readonly fontSize?: number;
}): {
  readonly node: ResolvedNode;
  readonly paint: RenderCommand;
  readonly semantic: SemanticNode;
  readonly action?: ResolvedActionTarget;
} {
  const key = requireKey(input.node);
  const path = [...(input.parentPath ?? ["root"]), `key:${key}`];
  const label = getLabel(input.node);
  const resolvedNode: ResolvedNode = {
    id: input.id,
    path,
    type: input.node.type,
    key,
    index: input.index,
    ...(input.parentId === undefined ? {} : { parentId: input.parentId }),
    box: input.box,
    props: requireProps(input.node),
    ...(input.node.style === undefined ? {} : { style: input.node.style }),
    ...(input.node.action === undefined ? {} : { action: input.node.action }),
  };
  const paint =
    input.role === "text"
      ? createTextPaint(input.paintId, input.id, input.box, label, input.color, input.fontSize)
      : createBoxPaint(input.paintId, input.id, input.box, input.fill);
  const semantic: SemanticNode = {
    id: `semantics.${key}`,
    nodeId: input.id,
    role: input.role,
    label,
  };
  const action =
    input.node.action === undefined || input.actionId === undefined
      ? undefined
      : {
          id: input.actionId,
          nodeId: input.id,
          path,
          action: input.node.action,
          box: input.box,
          label,
        };

  return action === undefined
    ? {
        node: resolvedNode,
        paint,
        semantic,
      }
    : {
        node: resolvedNode,
        paint,
        semantic,
        action,
      };
}

function createTextPaint(
  id: string,
  nodeId: string,
  box: ResolvedRect,
  text: string,
  color: string | undefined,
  fontSize: number | undefined,
): TextRenderCommand {
  const command: MutableTextRenderCommand = {
    id,
    kind: "text",
    nodeId,
    box,
    text,
  };

  if (color !== undefined) {
    command.color = color;
  }

  if (fontSize !== undefined) {
    command.fontSize = fontSize;
  }

  return command;
}

function createBoxPaint(
  id: string,
  nodeId: string,
  box: ResolvedRect,
  fill: string | undefined,
): BoxRenderCommand {
  const command: MutableBoxRenderCommand = {
    id,
    kind: "box",
    nodeId,
    box,
  };

  if (fill !== undefined) {
    command.fill = fill;
  }

  return command;
}

type MutableTextRenderCommand = {
  id: string;
  kind: "text";
  nodeId: string;
  box: ResolvedRect;
  text: string;
  color?: string;
  fontSize?: number;
};

type MutableBoxRenderCommand = {
  id: string;
  kind: "box";
  nodeId: string;
  box: ResolvedRect;
  fill?: string;
};

function getLabel(node: UiNode): string {
  const label = node.props?.label;
  if (typeof label === "string") {
    return label;
  }

  const text = node.props?.text;
  if (typeof text === "string") {
    return text;
  }

  return requireStringProp(node, "title");
}

function requireStringProp(node: UiNode, propName: string): string {
  const value = node.props?.[propName];
  if (typeof value !== "string") {
    throw new TypeError(`Expected string prop ${propName}.`);
  }
  return value;
}

function requireKey(node: UiNode): string {
  if (node.key === undefined) {
    throw new TypeError("Expected keyed playground node.");
  }
  return node.key;
}

function requireProps(node: UiNode): NonNullable<UiNode["props"]> {
  if (node.props === undefined) {
    throw new TypeError("Expected playground node props.");
  }
  return node.props;
}

function requireChild(node: UiNode, key: string): UiNode {
  const child = node.children?.find((entry) => entry.key === key);
  if (child === undefined) {
    throw new TypeError(`Expected playground child ${key}.`);
  }
  return child;
}

function collectActions(
  ...surfaces: readonly ReturnType<typeof createResolvedSurfaces>[]
): readonly ResolvedActionTarget[] {
  return surfaces.flatMap((surface) => (surface.action === undefined ? [] : [surface.action]));
}
