import { Objective } from "@ludoweave/components";
import {
  createLayoutEnvironment,
  normalizeUiNode,
  resolveAbsoluteAnchor,
  type ActionRef,
  type ResolvedRect,
  type ResolvedUiFrame,
  type UiNode,
} from "@ludoweave/core";

export function createObjectiveFrameFixture(): ResolvedUiFrame {
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
  const box = createObjectiveBox();
  const props = requireProps(objectiveNode);
  const action = requireAction(objectiveNode);
  const title = getStringProp(objectiveNode, "title");
  const body = getStringProp(objectiveNode, "body");

  return {
    frameId: 4,
    viewport: createLayoutEnvironment({
      viewport: {
        width: 1280,
        height: 720,
        devicePixelRatio: 1,
      },
    }).viewport,
    nodes: [
      {
        id: "root/key:objective.delivery",
        path: ["root", "key:objective.delivery"],
        type: objectiveNode.type,
        key: requireKey(objectiveNode),
        index: 0,
        box,
        props,
        action,
      },
    ],
    paint: [
      {
        id: "paint.objective.card",
        kind: "box",
        nodeId: "root/key:objective.delivery",
        box,
        fill: "#0f172a",
        stroke: "#38bdf8",
        radius: 8,
      },
      {
        id: "paint.objective.title",
        kind: "text",
        nodeId: "root/key:objective.delivery",
        box: insetBox(box, 16, 12, 16, 36),
        text: title,
        color: "#f8fafc",
        fontSize: 18,
      },
      {
        id: "paint.objective.body",
        kind: "text",
        nodeId: "root/key:objective.delivery",
        box: insetBox(box, 16, 44, 16, 16),
        text: body,
        color: "#cbd5e1",
        fontSize: 14,
      },
    ],
    semantics: [
      {
        id: "semantics.objective.delivery",
        nodeId: "root/key:objective.delivery",
        role: "surface",
        label: `${title}. ${body}`,
      },
    ],
    actions: [
      {
        id: "action.objective.delivery",
        nodeId: "root/key:objective.delivery",
        path: ["root", "key:objective.delivery"],
        action,
        box,
        label: title,
      },
    ],
    diagnostics: [],
  };
}

function createObjectiveBox(): ResolvedRect {
  const environment = createLayoutEnvironment({
    viewport: {
      width: 1280,
      height: 720,
      devicePixelRatio: 1,
    },
  });

  return resolveAbsoluteAnchor({
    container: environment.contentBox,
    size: { width: 360, height: 112 },
    anchor: {
      horizontal: "start",
      vertical: "start",
      inset: {
        top: 48,
        left: 48,
      },
    },
  });
}

function insetBox(
  box: ResolvedRect,
  left: number,
  top: number,
  right: number,
  bottom: number,
): ResolvedRect {
  return {
    x: box.x + left,
    y: box.y + top,
    width: box.width - left - right,
    height: box.height - top - bottom,
  };
}

function getStringProp(node: UiNode, propName: string): string {
  const value = node.props?.[propName];
  if (typeof value !== "string") {
    throw new TypeError(`Objective fixture expected string prop ${propName}.`);
  }
  return value;
}

function requireKey(node: UiNode): string {
  if (node.key === undefined) {
    throw new TypeError("Objective fixture expected a key.");
  }
  return node.key;
}

function requireProps(node: UiNode): NonNullable<UiNode["props"]> {
  if (node.props === undefined) {
    throw new TypeError("Objective fixture expected props.");
  }
  return node.props;
}

function requireAction(node: UiNode): ActionRef {
  if (node.action === undefined) {
    throw new TypeError("Objective fixture expected an ActionRef.");
  }
  return node.action;
}
