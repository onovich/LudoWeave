import { Prompt, Subtitle } from "@ludoweave/components";
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
  const promptBox = resolveAbsoluteAnchor({
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
  const subtitleMeasure = resolveTextMeasure({
    text: requireStringProp(subtitleNode, "text"),
    fontSize: 18,
    maxWidth: Math.max(240, environment.contentBox.width * 0.8),
    measureText: ({ text, maxWidth }) => ({
      width: Math.min(text.length * 8, maxWidth),
      height: 24,
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
          bottom: 112,
        },
      },
    }),
  });
  const prompt = createResolvedSurfaces({
    id: "root/key:prompt",
    node: promptNode,
    box: promptBox,
    role: "button",
    paintId: "paint.prompt.box",
    actionId: "action.prompt",
    fill: "#111827",
  });
  const subtitle = createResolvedSurfaces({
    id: "root/key:subtitle",
    node: subtitleNode,
    box: subtitleBox,
    role: "text",
    paintId: "paint.subtitle.text",
    color: "#f8fafc",
    fontSize: 18,
  });

  return {
    frameId: 1,
    viewport: environment.viewport,
    nodes: [prompt.node, subtitle.node],
    paint: [prompt.paint, subtitle.paint],
    semantics: [prompt.semantic, subtitle.semantic],
    actions: prompt.action === undefined ? [] : [prompt.action],
    diagnostics: [],
  };
}

function createResolvedSurfaces(input: {
  readonly id: string;
  readonly node: UiNode;
  readonly box: ResolvedRect;
  readonly role: "button" | "text";
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
  const path = ["root", `key:${key}`];
  const label = getLabel(input.node);
  const resolvedNode: ResolvedNode = {
    id: input.id,
    path,
    type: input.node.type,
    key,
    index: input.role === "button" ? 0 : 1,
    box: input.box,
    props: requireProps(input.node),
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

  return requireStringProp(node, "text");
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
