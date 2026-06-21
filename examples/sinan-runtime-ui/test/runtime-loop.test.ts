import { createHeadlessRenderer } from "@ludoweave/renderer-headless";
import {
  createLayoutEnvironment,
  normalizeUiTree,
  resolveAbsoluteAnchor,
  type NormalizedUiNode,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type SemanticNode,
  type SemanticRole,
  type UiNodeInput,
} from "@ludoweave/core";
import { describe, expect, it } from "vitest";

import {
  createSinanActionRefBridge,
  gateDemoRuntimeUIViewModel,
  mapRuntimeUIViewModelToUiNodes,
} from "../src/index.js";

describe("Sinan-like runtime UI loop", () => {
  it("keeps the fixture path compatible with core frames, headless snapshots, and ActionRef bridge", () => {
    const frame = resolveSinanRuntimeFixtureFrame();
    const renderer = createHeadlessRenderer({ id: "sinan-runtime-loop" });
    const result = renderer.render(frame);
    const bridge = createSinanActionRefBridge();
    const actionTarget = requireFirstAction(frame);
    const command = bridge.dispatch(actionTarget.action, {
      actionTargetId: actionTarget.id,
      nodeId: actionTarget.nodeId,
      label: actionTarget.label,
    });

    expect(result.rendererId).toBe("sinan-runtime-loop");
    expect(result.frameId).toBe(1024);
    expect(result.snapshot).toContain('"runtime.gameplay.interact"');
    expect(result.snapshot).toContain('"Deliver the cell"');
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
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        label: "Press E",
      },
    });
  });
});

function resolveSinanRuntimeFixtureFrame(): ResolvedUiFrame {
  const viewModel = gateDemoRuntimeUIViewModel;
  const root: UiNodeInput = {
    type: "layer",
    key: "runtime.main",
    children: mapRuntimeUIViewModelToUiNodes(viewModel),
  };
  const tree = normalizeUiTree(root, { rootPath: "runtime.main" });
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
  const boxes = resolveFixtureBoxes(environment.contentBox);
  const nodes = tree.nodes.map((node) => resolveNode(node, requireBox(boxes, node.id)));

  return {
    frameId: viewModel.frame,
    viewport: environment.viewport,
    nodes,
    paint: nodes.flatMap((node) => resolvePaint(node)),
    semantics: nodes.map((node) => resolveSemantics(node)),
    actions: nodes.flatMap((node) => resolveAction(node)),
    diagnostics: tree.diagnostics,
  };
}

function resolveFixtureBoxes(contentBox: ResolvedRect): ReadonlyMap<string, ResolvedRect> {
  return new Map([
    ["runtime.main", contentBox],
    [
      "runtime.main/key:prompt.interact.switch_a",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 240, height: 48 },
        anchor: {
          horizontal: "center",
          vertical: "end",
          inset: {
            bottom: 52,
          },
        },
      }),
    ],
    [
      "runtime.main/key:subtitle.gate.hum",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 420, height: 32 },
        anchor: {
          horizontal: "center",
          vertical: "end",
          inset: {
            bottom: 112,
          },
        },
      }),
    ],
    [
      "runtime.main/key:objective.delivery.cell",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 360, height: 112 },
        anchor: {
          horizontal: "start",
          vertical: "start",
          inset: {
            top: 48,
            left: 48,
          },
        },
      }),
    ],
  ]);
}

function resolveNode(node: NormalizedUiNode, box: ResolvedRect): ResolvedNode {
  const resolved: MutableResolvedNode = {
    id: node.id,
    path: node.path,
    type: node.type,
    index: node.index,
    box,
  };

  if (node.key !== undefined) {
    resolved.key = node.key;
  }

  if (node.parentId !== undefined) {
    resolved.parentId = node.parentId;
  }

  if (node.children !== undefined) {
    resolved.children = node.children.map((child) => child.id);
  }

  if (node.props !== undefined) {
    resolved.props = node.props;
  }

  if (node.style !== undefined) {
    resolved.style = node.style;
  }

  if (node.action !== undefined) {
    resolved.action = node.action;
  }

  return resolved;
}

function resolvePaint(node: ResolvedNode): readonly RenderCommand[] {
  if (node.type === "button") {
    return [
      {
        id: "paint.prompt.interact.switch_a",
        kind: "box",
        nodeId: node.id,
        box: node.box,
        fill: "#111827",
      },
    ];
  }

  if (node.type === "text") {
    return [
      {
        id: "paint.subtitle.gate.hum",
        kind: "text",
        nodeId: node.id,
        box: node.box,
        text: getLabel(node),
        color: "#f9fafb",
        fontSize: 18,
      },
    ];
  }

  if (node.type === "objective") {
    return [
      {
        id: "paint.objective.delivery.cell",
        kind: "box",
        nodeId: node.id,
        box: node.box,
        fill: "#0f172a",
      },
    ];
  }

  return [];
}

function resolveSemantics(node: ResolvedNode): SemanticNode {
  const semantic: MutableSemanticNode = {
    id: `semantics.${node.id}`,
    nodeId: node.id,
    role: getRole(node),
  };
  const label = getLabel(node);

  if (node.parentId !== undefined) {
    semantic.parentId = node.parentId;
  }

  if (node.children !== undefined) {
    semantic.children = node.children;
  }

  if (label.length > 0) {
    semantic.label = label;
  }

  return semantic;
}

function resolveAction(node: ResolvedNode): readonly ResolvedActionTarget[] {
  if (node.action === undefined) {
    return [];
  }

  if (node.type === "objective") {
    return [
      {
        id: "action.objective.delivery.cell",
        nodeId: node.id,
        path: node.path,
        action: node.action,
        box: node.box,
        label: getLabel(node),
      },
    ];
  }

  return [
    {
      id: "action.prompt.interact.switch_a",
      nodeId: node.id,
      path: node.path,
      action: node.action,
      box: node.box,
      label: getLabel(node),
    },
  ];
}

function requireBox(boxes: ReadonlyMap<string, ResolvedRect>, nodeId: string): ResolvedRect {
  const box = boxes.get(nodeId);
  if (box === undefined) {
    throw new Error(`Missing fixture box for ${nodeId}.`);
  }
  return box;
}

function requireFirstAction(frame: ResolvedUiFrame): ResolvedActionTarget {
  const action = frame.actions[0];
  if (action === undefined) {
    throw new Error("Expected the Sinan runtime fixture to produce an action target.");
  }
  return action;
}

function getRole(node: ResolvedNode): SemanticRole {
  if (node.type === "button") {
    return "button";
  }

  if (node.type === "text") {
    return "text";
  }

  return "surface";
}

function getLabel(node: ResolvedNode): string {
  const label = node.props?.label;
  if (typeof label === "string") {
    return label;
  }

  const text = node.props?.text;
  if (typeof text === "string") {
    return text;
  }

  const title = node.props?.title;
  if (typeof title === "string") {
    return title;
  }

  return "";
}

type MutableResolvedNode = {
  id: string;
  path: NormalizedUiNode["path"];
  type: string;
  key?: string;
  parentId?: string;
  index: number;
  children?: readonly string[];
  box: ResolvedRect;
  props?: ResolvedNode["props"];
  style?: ResolvedNode["style"];
  action?: ResolvedNode["action"];
};

type MutableSemanticNode = {
  id: string;
  nodeId: string;
  role: SemanticRole;
  parentId?: string;
  children?: readonly string[];
  label?: string;
};
