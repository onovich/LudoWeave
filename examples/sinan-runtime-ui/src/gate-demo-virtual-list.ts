import {
  calculateFixedVirtualWindowRange,
  normalizeHostCollectionIntent,
  normalizeVirtualWindowMetadataFrame,
  type HostCollectionIntent,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type SemanticNode,
  type UiDiagnostic,
  type VirtualWindowMetadataFrame,
} from "@ludoweave/core";
import {
  traceCanvas2DVirtualWindow,
  type Canvas2DVirtualWindowTrace,
} from "@ludoweave/renderer-canvas2d";

import {
  createSinanUIActionRefRegistryMock,
  type CreateSinanUIActionRefRegistryMockOptions,
  type SinanUIActionRegistryAuditEntry,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const gateDemoVirtualListSequenceVersion = "ludoweave.sinan-gate-demo.virtual-list.v0.7";

export interface GateDemoVirtualListSequenceResult {
  readonly version: typeof gateDemoVirtualListSequenceVersion;
  readonly frameId?: string;
  readonly frame: ResolvedUiFrame;
  readonly virtualWindowMetadata: VirtualWindowMetadataFrame;
  readonly intents: readonly HostCollectionIntent[];
  readonly registryResults: readonly SinanUIActionRegistryAuditEntry[];
  readonly rendererTrace: Canvas2DVirtualWindowTrace;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface CreateGateDemoVirtualListSequenceOptions {
  readonly frame?: ResolvedUiFrame;
  readonly frameId?: string;
  readonly registryOptions?: CreateSinanUIActionRefRegistryMockOptions;
  readonly virtualWindowMetadata?: VirtualWindowMetadataFrame;
}

export function createGateDemoVirtualListSequence(
  options: CreateGateDemoVirtualListSequenceOptions = {},
): GateDemoVirtualListSequenceResult {
  const mapping =
    options.frame === undefined
      ? mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope)
      : undefined;
  const sourceFrame = options.frame ?? mapping?.frame;
  const frameId = options.frameId ?? mapping?.envelopeFrameId;
  const frame = createGateDemoVirtualListFrame(requireFrame(sourceFrame));
  const virtualWindowMetadata =
    options.virtualWindowMetadata ?? createGateDemoVirtualWindowMetadata();
  const rendererTrace = traceCanvas2DVirtualWindow(frame, virtualWindowMetadata);
  const firstWindow = rendererTrace.result === "windows" ? rendererTrace.windows[0] : undefined;
  const intents =
    firstWindow === undefined ? [] : createHostCollectionIntentSequence(firstWindow.windowId);
  const registry = createSinanUIActionRefRegistryMock(options.registryOptions ?? {});

  for (const intent of intents) {
    registry.route(intent.action, {
      ...(frameId === undefined ? {} : { frameId }),
      ...(firstWindow === undefined ? {} : { nodeId: firstWindow.nodeId }),
      label: "Gate Demo virtual list intent",
    });
  }

  return {
    version: gateDemoVirtualListSequenceVersion,
    ...(frameId === undefined ? {} : { frameId }),
    frame,
    virtualWindowMetadata,
    intents,
    registryResults: registry.auditLogSnapshot(),
    rendererTrace,
    diagnostics:
      rendererTrace.result === "windows"
        ? rendererTrace.windows.flatMap((window) => window.diagnostics)
        : [],
  };
}

function createGateDemoVirtualListFrame(frame: ResolvedUiFrame): ResolvedUiFrame {
  const listBox: ResolvedRect = { x: 72, y: 176, width: 380, height: 132 };
  const items = createVirtualListItems(listBox);

  return {
    ...frame,
    nodes: [...frame.nodes, createListNode(listBox, items), ...items.map((item) => item.node)],
    paint: [...frame.paint, createListPaint(listBox), ...items.map((item) => item.paint)],
    semantics: [
      ...frame.semantics,
      createListSemantic(items),
      ...items.map((item) => item.semantic),
    ],
    actions: [...frame.actions, ...items.map((item) => item.action)],
  };
}

function createGateDemoVirtualWindowMetadata(): VirtualWindowMetadataFrame {
  const range = calculateFixedVirtualWindowRange({
    totalCount: 8,
    itemExtent: 44,
    viewportExtent: 132,
    scrollOffset: 88,
    overscan: { before: 1, after: 2 },
  });

  return normalizeVirtualWindowMetadataFrame({
    activeWindowId: "gate-demo-quest-window",
    windows: [
      {
        id: "gate-demo-quest-window",
        nodeId: "runtime.main/key:quest-log",
        itemKeyNamespace: "quest",
        totalCount: range.totalCount,
        realizedRange: range.realizedRange,
        overscanRange: range.overscanRange,
        estimatedItemSize: { width: 380, height: range.itemExtent },
        viewportRect: { x: 72, y: 176, width: 380, height: 132 },
        scrollContainerId: "gate-demo-quest-scroll",
        selection: { selectedKey: "quest:3", focusedKey: "quest:3", revision: 1 },
        hostCapability: { status: "available" },
      },
    ],
  });
}

function createHostCollectionIntentSequence(windowId: string): readonly HostCollectionIntent[] {
  return [
    normalizeHostCollectionIntent({
      kind: "select-item",
      windowId,
      itemKeyNamespace: "quest",
      itemKey: "quest:3",
    }),
    normalizeHostCollectionIntent({
      kind: "activate-item",
      windowId,
      itemKeyNamespace: "quest",
      itemKey: "quest:3",
    }),
    normalizeHostCollectionIntent({
      kind: "move-selection",
      windowId,
      itemKeyNamespace: "quest",
      direction: "next",
    }),
    normalizeHostCollectionIntent({
      kind: "request-window",
      windowId,
      itemKeyNamespace: "quest",
      requestedRange: { startIndex: 4, endIndex: 7 },
    }),
    normalizeHostCollectionIntent({
      kind: "restore-selection",
      windowId,
      itemKeyNamespace: "quest",
      restoreSelection: { selectedKey: "quest:3", focusedKey: "quest:3", revision: 1 },
    }),
  ];
}

function createVirtualListItems(listBox: ResolvedRect): readonly GateDemoVirtualListItem[] {
  return ["Restore the relay", "Open the archive", "Track final conduit"].map((label, offset) => {
    const itemIndex = offset + 2;
    const itemKey = `quest:${itemIndex}`;
    const nodeId = `runtime.main/key:quest-log/key:${itemKey}`;
    const box = {
      x: listBox.x + 12,
      y: listBox.y + offset * 44,
      width: listBox.width - 24,
      height: 36,
    };

    return {
      node: {
        id: nodeId,
        path: ["runtime.main", "key:quest-log", `key:${itemKey}`],
        type: "button",
        key: itemKey,
        parentId: "runtime.main/key:quest-log",
        index: offset,
        box,
        props: {
          label,
          itemIndex,
          itemKey,
        },
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "activate-item",
            windowId: "gate-demo-quest-window",
            itemKeyNamespace: "quest",
            repeat: false,
            itemKey,
          },
        },
      },
      paint: {
        id: `paint.${itemKey}.row`,
        kind: "box",
        nodeId,
        box,
        fill: itemKey === "quest:3" ? "#164e63" : "#1f2937",
        radius: 4,
      },
      semantic: {
        id: `semantics.${itemKey}`,
        nodeId,
        role: "button",
        parentId: "semantics.quest-log",
        label,
      },
      action: {
        id: `action.${itemKey}.activate`,
        nodeId,
        path: ["runtime.main", "key:quest-log", `key:${itemKey}`],
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "activate-item",
            windowId: "gate-demo-quest-window",
            itemKeyNamespace: "quest",
            repeat: false,
            itemKey,
          },
        },
        box,
        label,
      },
    };
  });
}

interface GateDemoVirtualListItem {
  readonly node: ResolvedNode;
  readonly paint: RenderCommand;
  readonly semantic: SemanticNode;
  readonly action: ResolvedActionTarget;
}

function createListNode(
  listBox: ResolvedRect,
  items: readonly GateDemoVirtualListItem[],
): ResolvedNode {
  return {
    id: "runtime.main/key:quest-log",
    path: ["runtime.main", "key:quest-log"],
    type: "section",
    key: "quest-log",
    parentId: "runtime.main",
    index: 20,
    children: items.map((item) => item.node.id),
    box: listBox,
    props: {
      virtualWindowId: "gate-demo-quest-window",
      virtualListContract: "metadata-only",
      selectedKey: "quest:3",
      focusedKey: "quest:3",
    },
  };
}

function createListPaint(listBox: ResolvedRect): RenderCommand {
  return {
    id: "paint.gate-demo.quest-log",
    kind: "box",
    nodeId: "runtime.main/key:quest-log",
    box: listBox,
    fill: "#101820",
    stroke: "#2dd4bf",
    radius: 6,
  };
}

function createListSemantic(items: readonly GateDemoVirtualListItem[]): SemanticNode {
  return {
    id: "semantics.quest-log",
    nodeId: "runtime.main/key:quest-log",
    role: "generic",
    parentId: "semantics.runtime.main",
    label: "Quest log",
    children: items.map((item) => item.semantic.id),
  };
}

function requireFrame(frame: ResolvedUiFrame | undefined): ResolvedUiFrame {
  if (frame === undefined) {
    throw new Error("Gate Demo virtual list sequence requires a resolved frame.");
  }

  return frame;
}
