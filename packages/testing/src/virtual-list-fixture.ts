import {
  calculateFixedVirtualWindowRange,
  createHostCollectionIntentActionRef,
  normalizeVirtualWindowMetadata,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type SemanticNode,
  type VirtualWindowMetadata,
  type FixedVirtualWindowRangeResult,
} from "@ludoweave/core";

export interface RealizedVirtualListItem {
  readonly index: number;
  readonly key: string;
  readonly label: string;
  readonly nodeId: string;
  readonly box: ResolvedRect;
}

export interface RealizedVirtualListFixture {
  readonly name: "realized-virtual-list";
  readonly frame: ResolvedUiFrame;
  readonly virtualWindow: VirtualWindowMetadata;
  readonly range: FixedVirtualWindowRangeResult;
  readonly realizedItems: readonly RealizedVirtualListItem[];
  readonly note: "host-selected-realized-items-no-datasource-or-dom-recycling";
}

export function createRealizedVirtualListFixture(): RealizedVirtualListFixture {
  const viewport: ResolvedRect = { x: 0, y: 0, width: 1280, height: 720 };
  const listBox: ResolvedRect = { x: 80, y: 120, width: 420, height: 144 };
  const range = calculateFixedVirtualWindowRange({
    totalCount: 12,
    itemExtent: 48,
    viewportExtent: listBox.height,
    scrollOffset: 192,
    overscan: { before: 1, after: 2 },
  });
  const realizedItems = createRealizedItems({
    listBox,
    startIndex: range.realizedRange.startIndex,
  });
  const virtualWindow = normalizeVirtualWindowMetadata({
    id: "quest-log-window",
    nodeId: "runtime.overlay/key:quest-log",
    itemKeyNamespace: "quest",
    totalCount: range.totalCount,
    realizedRange: range.realizedRange,
    overscanRange: range.overscanRange,
    estimatedItemSize: { width: listBox.width, height: range.itemExtent },
    viewportRect: listBox,
    scrollContainerId: "quest-log-scroll",
    selection: {
      selectedKey: "quest:5",
      focusedKey: "quest:5",
      revision: 2,
    },
    hostCapability: { status: "available" },
  });

  return {
    name: "realized-virtual-list",
    frame: {
      frameId: 4700,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        devicePixelRatio: 1,
      },
      nodes: createNodes({ viewport, listBox, realizedItems }),
      paint: createPaint({ listBox, realizedItems }),
      semantics: createSemantics(realizedItems),
      actions: createActions(realizedItems),
      diagnostics: [],
    },
    virtualWindow,
    range,
    realizedItems,
    note: "host-selected-realized-items-no-datasource-or-dom-recycling",
  };
}

function createRealizedItems(input: {
  readonly listBox: ResolvedRect;
  readonly startIndex: number;
}): readonly RealizedVirtualListItem[] {
  const labels = ["Restore the gate relays", "Cross the flooded archive", "Track final conduit"];

  return labels.map((label, offset) => {
    const index = input.startIndex + offset;
    const key = `quest:${index}`;

    return {
      index,
      key,
      label,
      nodeId: `runtime.overlay/key:quest-log/key:${key}`,
      box: {
        x: input.listBox.x + 12,
        y: input.listBox.y + offset * 48,
        width: input.listBox.width - 24,
        height: 40,
      },
    };
  });
}

function createNodes(input: {
  readonly viewport: ResolvedRect;
  readonly listBox: ResolvedRect;
  readonly realizedItems: readonly RealizedVirtualListItem[];
}): readonly ResolvedNode[] {
  return [
    {
      id: "runtime.overlay",
      path: ["runtime.overlay"],
      type: "surface",
      key: "runtime.overlay",
      index: 0,
      children: ["runtime.overlay/key:quest-log"],
      box: input.viewport,
    },
    {
      id: "runtime.overlay/key:quest-log",
      path: ["runtime.overlay", "key:quest-log"],
      type: "section",
      key: "quest-log",
      parentId: "runtime.overlay",
      index: 0,
      children: input.realizedItems.map((item) => item.nodeId),
      box: input.listBox,
      props: {
        virtualWindowId: "quest-log-window",
        virtualListContract: "metadata-only",
      },
    },
    ...input.realizedItems.map((item, index): ResolvedNode => {
      return {
        id: item.nodeId,
        path: ["runtime.overlay", "key:quest-log", `key:${item.key}`],
        type: "button",
        key: item.key,
        parentId: "runtime.overlay/key:quest-log",
        index,
        box: item.box,
        props: {
          label: item.label,
          itemIndex: item.index,
          itemKey: item.key,
        },
        action: createHostCollectionIntentActionRef({
          kind: "activate-item",
          handoff: "host",
          windowId: "quest-log-window",
          itemKeyNamespace: "quest",
          repeat: false,
          itemKey: item.key,
        }),
      };
    }),
  ];
}

function createPaint(input: {
  readonly listBox: ResolvedRect;
  readonly realizedItems: readonly RealizedVirtualListItem[];
}): readonly RenderCommand[] {
  return [
    {
      id: "paint.quest-log.window",
      kind: "box",
      nodeId: "runtime.overlay/key:quest-log",
      box: input.listBox,
      fill: "#101820",
      stroke: "#2dd4bf",
      radius: 6,
    },
    ...input.realizedItems.map((item): RenderCommand => {
      return {
        id: `paint.${item.key}.row`,
        kind: "box",
        nodeId: item.nodeId,
        box: item.box,
        fill: item.key === "quest:5" ? "#164e63" : "#1f2937",
        radius: 4,
      };
    }),
  ];
}

function createSemantics(items: readonly RealizedVirtualListItem[]): readonly SemanticNode[] {
  return [
    {
      id: "semantics.runtime.overlay",
      nodeId: "runtime.overlay",
      role: "surface",
      children: ["semantics.quest-log"],
    },
    {
      id: "semantics.quest-log",
      nodeId: "runtime.overlay/key:quest-log",
      role: "generic",
      parentId: "semantics.runtime.overlay",
      label: "Quest log",
      children: items.map((item) => `semantics.${item.key}`),
    },
    ...items.map((item): SemanticNode => {
      return {
        id: `semantics.${item.key}`,
        nodeId: item.nodeId,
        role: "button",
        parentId: "semantics.quest-log",
        label: item.label,
      };
    }),
  ];
}

function createActions(items: readonly RealizedVirtualListItem[]): readonly ResolvedActionTarget[] {
  return items.map((item) => {
    return {
      id: `action.${item.key}.activate`,
      nodeId: item.nodeId,
      path: ["runtime.overlay", "key:quest-log", `key:${item.key}`],
      action: createHostCollectionIntentActionRef({
        kind: "activate-item",
        handoff: "host",
        windowId: "quest-log-window",
        itemKeyNamespace: "quest",
        repeat: false,
        itemKey: item.key,
      }),
      box: item.box,
      label: item.label,
    };
  });
}
