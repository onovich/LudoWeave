import {
  createLayoutEnvironment,
  normalizeUiDiagnostic,
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
  type UiDiagnostic,
  type UiNodeInput,
} from "@ludoweave/core";

import { mapRuntimeUIViewModelToUiNodes } from "./adapter.js";
import { validateRuntimeUIViewModelEnvelope } from "./envelope.js";
import {
  createGateDemoHostCapabilitySnapshot,
  createHostCapabilitySnapshotDiagnostics,
  type RuntimeUIHostCapabilitySnapshot,
} from "./host-capabilities.js";
import type { RuntimeUIElement, RuntimeUIViewModel } from "./view-model.js";

export const runtimeUIAdapterDiagnosticCodes = Object.freeze({
  version: "LW_EXAMPLE_SINAN_ADAPTER_VERSION",
  schema: "LW_EXAMPLE_SINAN_ADAPTER_SCHEMA",
  capability: "LW_EXAMPLE_SINAN_ADAPTER_CAPABILITY",
  unsupportedElement: "LW_EXAMPLE_SINAN_ADAPTER_UNSUPPORTED_ELEMENT",
});

export type RuntimeUIAdapterDiagnosticLayer =
  | "version"
  | "schema"
  | "capability"
  | "unsupported-element";

export interface RuntimeUIResolvedFrameMappingOptions {
  readonly hostCapabilities?: RuntimeUIHostCapabilitySnapshot;
}

export interface RuntimeUIResolvedFrameMappingResult {
  readonly ok: boolean;
  readonly envelopeFrameId?: string;
  readonly uiNodes: readonly UiNodeInput[];
  readonly frame?: ResolvedUiFrame;
  readonly diagnostics: readonly UiDiagnostic[];
}

const supportedElementTypes = new Set<RuntimeUIElement["type"]>([
  "prompt",
  "subtitle",
  "objective",
  "pause",
  "editable-overlay-candidate",
]);

export function mapRuntimeUIViewModelEnvelopeToResolvedFrame(
  input: unknown,
  options: RuntimeUIResolvedFrameMappingOptions = {},
): RuntimeUIResolvedFrameMappingResult {
  const envelopeValidation = validateRuntimeUIViewModelEnvelope(input);
  const envelopeDiagnostics = envelopeValidation.diagnostics.map((diagnostic) =>
    mapEnvelopeDiagnostic(diagnostic),
  );

  if (!envelopeValidation.valid || envelopeValidation.envelope === undefined) {
    return {
      ok: false,
      uiNodes: [],
      diagnostics: envelopeDiagnostics,
    };
  }

  const envelope = envelopeValidation.envelope;
  const hostCapabilities = options.hostCapabilities ?? createGateDemoHostCapabilitySnapshot();
  const unsupportedElementDiagnostics = createUnsupportedElementDiagnostics(envelope.viewModel);
  const capabilityDiagnostics = createAdapterCapabilityDiagnostics(hostCapabilities);
  const diagnostics = [
    ...envelopeDiagnostics,
    ...unsupportedElementDiagnostics,
    ...capabilityDiagnostics,
  ];

  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    return {
      ok: false,
      envelopeFrameId: envelope.frameId,
      uiNodes: [],
      diagnostics,
    };
  }

  const uiNodes = mapRuntimeUIViewModelToUiNodes(envelope.viewModel);
  const frame = resolveGateDemoUiNodesToFrame({
    frameId: envelope.viewModel.frame,
    uiNodes,
    diagnostics,
  });

  return {
    ok: true,
    envelopeFrameId: envelope.frameId,
    uiNodes,
    frame,
    diagnostics,
  };
}

function mapEnvelopeDiagnostic(
  diagnostic: ReturnType<typeof validateRuntimeUIViewModelEnvelope>["diagnostics"][number],
): UiDiagnostic {
  const layer: RuntimeUIAdapterDiagnosticLayer =
    diagnostic.code === "sinan-envelope.unsupported-version" ? "version" : "schema";
  const code =
    layer === "version"
      ? runtimeUIAdapterDiagnosticCodes.version
      : runtimeUIAdapterDiagnosticCodes.schema;

  return normalizeUiDiagnostic({
    code,
    severity: diagnostic.severity,
    message: diagnostic.message,
    path: ["adapter", layer, ...pathFromEnvelopeDiagnostic(diagnostic.path)],
    details: {
      layer,
      sourceCode: diagnostic.code,
      sourcePath: diagnostic.path,
    },
  });
}

function createUnsupportedElementDiagnostics(
  viewModel: RuntimeUIViewModel,
): readonly UiDiagnostic[] {
  const diagnostics: UiDiagnostic[] = [];

  for (const layer of viewModel.layers) {
    for (const element of layer.elements as readonly {
      readonly type?: unknown;
      readonly id?: unknown;
    }[]) {
      if (
        typeof element.type === "string" &&
        supportedElementTypes.has(element.type as RuntimeUIElement["type"])
      ) {
        continue;
      }

      diagnostics.push(
        normalizeUiDiagnostic({
          code: runtimeUIAdapterDiagnosticCodes.unsupportedElement,
          severity: "error",
          message: `Unsupported Runtime UI element "${String(element.type)}".`,
          path: ["adapter", "unsupported-element", String(layer.id), String(element.id)],
          details: {
            layer: "unsupported-element",
            elementType: typeof element.type === "string" ? element.type : null,
            elementId: typeof element.id === "string" ? element.id : null,
          },
        }),
      );
    }
  }

  return diagnostics;
}

function createAdapterCapabilityDiagnostics(
  hostCapabilities: RuntimeUIHostCapabilitySnapshot,
): readonly UiDiagnostic[] {
  return createHostCapabilitySnapshotDiagnostics(hostCapabilities).map((diagnostic) =>
    normalizeUiDiagnostic({
      code: runtimeUIAdapterDiagnosticCodes.capability,
      severity: diagnostic.severity,
      message: diagnostic.message,
      path: ["adapter", "capability", ...(diagnostic.path ?? [])],
      details: {
        layer: "capability",
        sourceCode: diagnostic.code,
        capabilityStatus: diagnostic.details?.capabilityStatus ?? null,
        lifecycleReason: diagnostic.details?.lifecycleReason ?? null,
      },
    }),
  );
}

function resolveGateDemoUiNodesToFrame(options: {
  readonly frameId: number;
  readonly uiNodes: readonly UiNodeInput[];
  readonly diagnostics: readonly UiDiagnostic[];
}): ResolvedUiFrame {
  const root: UiNodeInput = {
    type: "layer",
    key: "runtime.main",
    children: options.uiNodes,
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
    frameId: options.frameId,
    viewport: environment.viewport,
    nodes,
    paint: nodes.flatMap((node) => resolvePaint(node)),
    semantics: nodes.map((node) => resolveSemantics(node)),
    actions: nodes.flatMap((node) => resolveAction(node)),
    diagnostics: [...tree.diagnostics, ...options.diagnostics],
  };
}

function pathFromEnvelopeDiagnostic(path: string): readonly string[] {
  if (path === "$") {
    return ["envelope"];
  }

  return ["envelope", ...path.replace(/^\$\./, "").split(".").filter(Boolean)];
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
    [
      "runtime.main/key:pause.menu",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 360, height: 160 },
        anchor: {
          horizontal: "end",
          vertical: "start",
          inset: {
            top: 48,
            right: 48,
          },
        },
      }),
    ],
    [
      "runtime.main/key:pause.menu/key:confirm",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 120, height: 44 },
        anchor: {
          horizontal: "end",
          vertical: "start",
          inset: {
            top: 132,
            right: 196,
          },
        },
      }),
    ],
    [
      "runtime.main/key:pause.menu/key:cancel",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 120, height: 44 },
        anchor: {
          horizontal: "end",
          vertical: "start",
          inset: {
            top: 132,
            right: 64,
          },
        },
      }),
    ],
    [
      "runtime.main/key:editable.gate-code",
      resolveAbsoluteAnchor({
        container: contentBox,
        size: { width: 320, height: 44 },
        anchor: {
          horizontal: "center",
          vertical: "end",
          inset: {
            bottom: 168,
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
        id: `paint.${node.key ?? node.id}`,
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

  if (node.type === "dialog") {
    return [
      {
        id: "paint.pause.menu",
        kind: "box",
        nodeId: node.id,
        box: node.box,
        fill: "#1f2937",
      },
    ];
  }

  if (node.type === "editable-text") {
    return [
      {
        id: "paint.editable.gate-code",
        kind: "box",
        nodeId: node.id,
        box: node.box,
        fill: "#111827",
      },
      {
        id: "paint.editable.gate-code.label",
        kind: "text",
        nodeId: node.id,
        box: node.box,
        text: getLabel(node),
        color: "#e5e7eb",
        fontSize: 16,
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

  return [
    {
      id: actionTargetIdForNode(node),
      nodeId: node.id,
      path: node.path,
      action: node.action,
      box: node.box,
      label: getLabel(node),
    },
  ];
}

function actionTargetIdForNode(node: ResolvedNode): string {
  if (node.key === "prompt.interact.switch_a") {
    return "action.prompt.interact.switch_a";
  }

  if (node.key === "objective.delivery.cell") {
    return "action.objective.delivery.cell";
  }

  return `action.${node.key ?? node.type}`;
}

function requireBox(boxes: ReadonlyMap<string, ResolvedRect>, nodeId: string): ResolvedRect {
  const box = boxes.get(nodeId);
  if (box === undefined) {
    throw new Error(`Missing fixture box for ${nodeId}.`);
  }
  return box;
}

function getRole(node: ResolvedNode): SemanticRole {
  if (node.type === "button") {
    return "button";
  }

  if (node.type === "text" || node.type === "editable-text") {
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
  props?: NonNullable<ResolvedNode["props"]>;
  style?: NonNullable<ResolvedNode["style"]>;
  action?: NonNullable<ResolvedNode["action"]>;
};

type MutableSemanticNode = {
  id: string;
  nodeId: string;
  role: SemanticRole;
  parentId?: string;
  children?: readonly string[];
  label?: string;
};
