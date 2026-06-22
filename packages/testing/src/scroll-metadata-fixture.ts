import {
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type ScrollMetadataFrame,
  type ScrollOffsetNormalizationResult,
  type SemanticNode,
} from "@ludoweave/core";

export interface ClippedScrollContentFixture {
  readonly name: "clipped-scroll-content";
  readonly frame: ResolvedUiFrame;
  readonly scrollMetadata: ScrollMetadataFrame;
  readonly visibleContentBox: ResolvedRect;
  readonly offset: ScrollOffsetNormalizationResult;
  readonly note: "metadata-only-no-css-overflow-or-virtual-list";
}

export function createClippedScrollContentFixture(): ClippedScrollContentFixture {
  const viewport: ResolvedRect = { x: 0, y: 0, width: 1280, height: 720 };
  const containerBox: ResolvedRect = { x: 80, y: 120, width: 360, height: 220 };
  const contentRect: ResolvedRect = { x: 80, y: 120, width: 360, height: 640 };
  const viewportRect: ResolvedRect = containerBox;
  const offsetInput = { x: 0, y: 180, revision: 3 };
  const scrollMetadata = normalizeScrollMetadataFrame({
    activeContainerId: "quest-log-scroll",
    containers: [
      {
        id: "quest-log-scroll",
        nodeId: "runtime.overlay/key:quest-log",
        contentRect,
        viewportRect,
        axis: "y",
        offset: offsetInput,
        extent: { width: contentRect.width, height: contentRect.height },
        hostCapability: { status: "available" },
      },
    ],
  });
  const container = scrollMetadata.containers[0];
  if (container === undefined) {
    throw new Error("Expected clipped scroll fixture to create one scroll container.");
  }

  return {
    name: "clipped-scroll-content",
    frame: {
      frameId: 4600,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        devicePixelRatio: 1,
      },
      nodes: createNodes({ viewport, containerBox, contentRect }),
      paint: createPaint({ containerBox }),
      semantics: createSemantics(),
      actions: createActions(containerBox),
      diagnostics: [],
    },
    scrollMetadata,
    visibleContentBox: {
      x: offsetInput.x,
      y: offsetInput.y,
      width: viewportRect.width,
      height: viewportRect.height,
    },
    offset: normalizeScrollOffsetForContainer(container),
    note: "metadata-only-no-css-overflow-or-virtual-list",
  };
}

function createNodes(boxes: {
  readonly viewport: ResolvedRect;
  readonly containerBox: ResolvedRect;
  readonly contentRect: ResolvedRect;
}): readonly ResolvedNode[] {
  return [
    {
      id: "runtime.overlay",
      path: ["runtime.overlay"],
      type: "surface",
      key: "runtime.overlay",
      index: 0,
      children: ["runtime.overlay/key:quest-log"],
      box: boxes.viewport,
    },
    {
      id: "runtime.overlay/key:quest-log",
      path: ["runtime.overlay", "key:quest-log"],
      type: "section",
      key: "quest-log",
      parentId: "runtime.overlay",
      index: 0,
      children: [
        "runtime.overlay/key:quest-log/key:quest-1",
        "runtime.overlay/key:quest-log/key:quest-2",
        "runtime.overlay/key:quest-log/key:quest-3",
      ],
      box: boxes.containerBox,
      props: {
        scrollContainerId: "quest-log-scroll",
        scrollContract: "metadata-only",
      },
    },
    {
      id: "runtime.overlay/key:quest-log/key:quest-1",
      path: ["runtime.overlay", "key:quest-log", "key:quest-1"],
      type: "text",
      key: "quest-1",
      parentId: "runtime.overlay/key:quest-log",
      index: 0,
      box: { x: boxes.contentRect.x + 16, y: boxes.contentRect.y + 24, width: 320, height: 40 },
      props: {
        text: "Restore the gate relays.",
      },
    },
    {
      id: "runtime.overlay/key:quest-log/key:quest-2",
      path: ["runtime.overlay", "key:quest-log", "key:quest-2"],
      type: "text",
      key: "quest-2",
      parentId: "runtime.overlay/key:quest-log",
      index: 1,
      box: { x: boxes.contentRect.x + 16, y: boxes.contentRect.y + 220, width: 320, height: 40 },
      props: {
        text: "Cross the flooded archive.",
      },
    },
    {
      id: "runtime.overlay/key:quest-log/key:quest-3",
      path: ["runtime.overlay", "key:quest-log", "key:quest-3"],
      type: "button",
      key: "quest-3",
      parentId: "runtime.overlay/key:quest-log",
      index: 2,
      box: { x: boxes.contentRect.x + 16, y: boxes.contentRect.y + 520, width: 320, height: 48 },
      props: {
        label: "Track final conduit",
      },
      action: {
        type: "runtime.quest.track",
        payload: {
          questId: "final-conduit",
        },
      },
    },
  ];
}

function createPaint(boxes: { readonly containerBox: ResolvedRect }): readonly RenderCommand[] {
  return [
    {
      id: "paint.quest-log.panel",
      kind: "box",
      nodeId: "runtime.overlay/key:quest-log",
      box: boxes.containerBox,
      fill: "#111827",
      stroke: "#38bdf8",
      radius: 6,
    },
  ];
}

function createSemantics(): readonly SemanticNode[] {
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
      children: ["semantics.quest-1", "semantics.quest-2", "semantics.quest-3"],
    },
    {
      id: "semantics.quest-1",
      nodeId: "runtime.overlay/key:quest-log/key:quest-1",
      role: "text",
      parentId: "semantics.quest-log",
      label: "Restore the gate relays.",
    },
    {
      id: "semantics.quest-2",
      nodeId: "runtime.overlay/key:quest-log/key:quest-2",
      role: "text",
      parentId: "semantics.quest-log",
      label: "Cross the flooded archive.",
    },
    {
      id: "semantics.quest-3",
      nodeId: "runtime.overlay/key:quest-log/key:quest-3",
      role: "button",
      parentId: "semantics.quest-log",
      label: "Track final conduit",
    },
  ];
}

function createActions(containerBox: ResolvedRect): readonly ResolvedActionTarget[] {
  return [
    {
      id: "action.quest.track-final-conduit",
      nodeId: "runtime.overlay/key:quest-log/key:quest-3",
      path: ["runtime.overlay", "key:quest-log", "key:quest-3"],
      action: {
        type: "runtime.quest.track",
        payload: {
          questId: "final-conduit",
        },
      },
      box: {
        x: containerBox.x + 16,
        y: containerBox.y + 520,
        width: 320,
        height: 48,
      },
      label: "Track final conduit",
    },
  ];
}
