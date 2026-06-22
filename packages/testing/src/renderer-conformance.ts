import {
  createLayoutEnvironment,
  resolveAbsoluteAnchor,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type RichTextMetadata,
  type ScrollMetadataFrame,
  type ScrollOffsetNormalizationResult,
  type SemanticNode,
  type VirtualWindowMetadata,
  normalizeRichTextMetadata,
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
  normalizeVirtualWindowMetadata,
} from "@ludoweave/core";

export interface RendererConformanceFixture {
  readonly name: "runtime-overlay-conformance";
  readonly frame: ResolvedUiFrame;
  readonly scrollMetadata: ScrollMetadataFrame;
  readonly scrollVisibleContentBox: ResolvedRect;
  readonly scrollOffset: ScrollOffsetNormalizationResult;
  readonly virtualWindow: VirtualWindowMetadata;
  readonly virtualWindowRealizedNodeIds: readonly string[];
  readonly richTextMetadata: RichTextMetadata;
  readonly expectedDomNodes: readonly RendererConformanceDomNodeExpectation[];
}

export interface RendererConformanceDomNodeExpectation {
  readonly nodeId: string;
  readonly tagName: "button" | "div" | "section" | "span";
  readonly textContent?: string;
  readonly attributes?: Readonly<Record<string, string>>;
  readonly box: ResolvedRect;
}

export function createRendererConformanceFixture(): RendererConformanceFixture {
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
  const contentBox = environment.contentBox;
  const promptBox = resolveAbsoluteAnchor({
    container: contentBox,
    size: { width: 240, height: 48 },
    anchor: {
      horizontal: "center",
      vertical: "end",
      inset: {
        bottom: 52,
      },
    },
  });
  const subtitleBox = resolveAbsoluteAnchor({
    container: contentBox,
    size: { width: 420, height: 32 },
    anchor: {
      horizontal: "center",
      vertical: "end",
      inset: {
        bottom: 112,
      },
    },
  });
  const dialogBox = resolveAbsoluteAnchor({
    container: contentBox,
    size: { width: 400, height: 220 },
    anchor: {
      horizontal: "center",
      vertical: "center",
    },
  });
  const virtualListBox: ResolvedRect = { x: 80, y: 120, width: 360, height: 96 };
  const virtualItemBoxes = [
    { x: 92, y: 128, width: 336, height: 36 },
    { x: 92, y: 176, width: 336, height: 36 },
  ] as const;
  const nodes = createNodes({
    contentBox,
    promptBox,
    subtitleBox,
    dialogBox,
    virtualListBox,
    virtualItemBoxes,
  });
  const scrollMetadata = normalizeScrollMetadataFrame({
    activeContainerId: "pause-dialog-scroll",
    containers: [
      {
        id: "pause-dialog-scroll",
        nodeId: "runtime.overlay/key:pause.dialog",
        contentRect: { ...dialogBox, height: 420 },
        viewportRect: dialogBox,
        axis: "y",
        offset: { x: 0, y: 84, revision: 2 },
        extent: { width: dialogBox.width, height: 420 },
        hostCapability: { status: "available" },
      },
    ],
  });
  const scrollContainer = scrollMetadata.containers[0];
  if (scrollContainer === undefined) {
    throw new Error("Expected renderer conformance fixture to create scroll metadata.");
  }

  return {
    name: "runtime-overlay-conformance",
    frame: {
      frameId: 3600,
      viewport: environment.viewport,
      nodes,
      paint: createPaint({ promptBox, subtitleBox, dialogBox }),
      semantics: createSemantics(),
      actions: createActions({ promptBox, virtualItemBoxes }),
      diagnostics: [],
    },
    scrollMetadata,
    scrollVisibleContentBox: {
      x: 0,
      y: 84,
      width: dialogBox.width,
      height: dialogBox.height,
    },
    scrollOffset: normalizeScrollOffsetForContainer(scrollContainer),
    virtualWindow: normalizeVirtualWindowMetadata({
      id: "quest-log-window",
      nodeId: "runtime.overlay/key:quest-log",
      itemKeyNamespace: "quest",
      totalCount: 6,
      realizedRange: { startIndex: 2, endIndex: 4 },
      overscanRange: { startIndex: 1, endIndex: 5 },
      estimatedItemSize: { width: virtualListBox.width, height: 48 },
      viewportRect: virtualListBox,
      scrollContainerId: "pause-dialog-scroll",
      selection: { selectedKey: "quest:3", focusedKey: "quest:3", revision: 1 },
      hostCapability: { status: "available" },
    }),
    virtualWindowRealizedNodeIds: [
      "runtime.overlay/key:quest-log/key:quest:2",
      "runtime.overlay/key:quest-log/key:quest:3",
    ],
    richTextMetadata: normalizeRichTextMetadata({
      id: "subtitle.rich-text",
      nodeId: "runtime.overlay/key:subtitle.primary",
      localeHint: "en-US",
      plainTextFallback: "The gate hums softly.",
      spans: [
        {
          id: "tone.soft",
          kind: "tone",
          label: "soft",
          rendererHints: ["muted"],
          themeTokenRefs: ["runtime-ui.subtitle.text"],
        },
      ],
      runs: [
        {
          id: "run.subtitle.body",
          text: "The gate hums softly.",
          spanIds: ["tone.soft"],
          themeTokenRefs: ["runtime-ui.subtitle.text"],
          rendererHints: ["muted"],
        },
      ],
      hostPolicy: {
        localizedContent: "approved",
        markupPolicy: "approved",
        sanitization: "approved",
        accessibilityReview: "approved",
      },
      a11y: {
        label: "The gate hums softly.",
        liveRegion: "off",
        reviewStatus: "approved",
      },
    }),
    expectedDomNodes: [
      {
        nodeId: "runtime.overlay",
        tagName: "div",
        box: contentBox,
      },
      {
        nodeId: "runtime.overlay/key:prompt.primary",
        tagName: "button",
        textContent: "Press E",
        attributes: {
          type: "button",
          "aria-label": "Press E",
        },
        box: promptBox,
      },
      {
        nodeId: "runtime.overlay/key:subtitle.primary",
        tagName: "span",
        textContent: "The gate hums softly.",
        box: subtitleBox,
      },
      {
        nodeId: "runtime.overlay/key:pause.dialog",
        tagName: "section",
        attributes: {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Paused",
        },
        box: dialogBox,
      },
      {
        nodeId: "runtime.overlay/key:quest-log",
        tagName: "div",
        attributes: {
          "aria-label": "Quest log",
        },
        box: virtualListBox,
      },
      {
        nodeId: "runtime.overlay/key:quest-log/key:quest:2",
        tagName: "button",
        textContent: "Restore the gate relays",
        attributes: {
          type: "button",
          "aria-label": "Restore the gate relays",
        },
        box: virtualItemBoxes[0],
      },
      {
        nodeId: "runtime.overlay/key:quest-log/key:quest:3",
        tagName: "button",
        textContent: "Cross the flooded archive",
        attributes: {
          type: "button",
          "aria-label": "Cross the flooded archive",
        },
        box: virtualItemBoxes[1],
      },
    ],
  };
}

function createNodes(boxes: {
  readonly contentBox: ResolvedRect;
  readonly promptBox: ResolvedRect;
  readonly subtitleBox: ResolvedRect;
  readonly dialogBox: ResolvedRect;
  readonly virtualListBox: ResolvedRect;
  readonly virtualItemBoxes: readonly [ResolvedRect, ResolvedRect];
}): readonly ResolvedNode[] {
  return [
    {
      id: "runtime.overlay",
      path: ["runtime.overlay"],
      type: "surface",
      key: "runtime.overlay",
      index: 0,
      children: [
        "runtime.overlay/key:prompt.primary",
        "runtime.overlay/key:subtitle.primary",
        "runtime.overlay/key:pause.dialog",
        "runtime.overlay/key:quest-log",
      ],
      box: boxes.contentBox,
    },
    {
      id: "runtime.overlay/key:prompt.primary",
      path: ["runtime.overlay", "key:prompt.primary"],
      type: "button",
      key: "prompt.primary",
      parentId: "runtime.overlay",
      index: 0,
      box: boxes.promptBox,
      props: {
        label: "Press E",
      },
      action: {
        type: "runtime.gameplay.interact",
        payload: {
          targetId: "switch_a",
        },
      },
    },
    {
      id: "runtime.overlay/key:subtitle.primary",
      path: ["runtime.overlay", "key:subtitle.primary"],
      type: "text",
      key: "subtitle.primary",
      parentId: "runtime.overlay",
      index: 1,
      box: boxes.subtitleBox,
      props: {
        text: "The gate hums softly.",
        richTextBlockId: "subtitle.rich-text",
        richTextContract: "metadata-only",
      },
    },
    {
      id: "runtime.overlay/key:pause.dialog",
      path: ["runtime.overlay", "key:pause.dialog"],
      type: "dialog",
      key: "pause.dialog",
      parentId: "runtime.overlay",
      index: 2,
      box: boxes.dialogBox,
      props: {
        title: "Paused",
        modal: true,
      },
    },
    {
      id: "runtime.overlay/key:quest-log",
      path: ["runtime.overlay", "key:quest-log"],
      type: "section",
      key: "quest-log",
      parentId: "runtime.overlay",
      index: 3,
      children: [
        "runtime.overlay/key:quest-log/key:quest:2",
        "runtime.overlay/key:quest-log/key:quest:3",
      ],
      box: boxes.virtualListBox,
      props: {
        virtualWindowId: "quest-log-window",
        virtualListContract: "metadata-only",
      },
    },
    {
      id: "runtime.overlay/key:quest-log/key:quest:2",
      path: ["runtime.overlay", "key:quest-log", "key:quest:2"],
      type: "button",
      key: "quest:2",
      parentId: "runtime.overlay/key:quest-log",
      index: 0,
      box: boxes.virtualItemBoxes[0],
      props: {
        label: "Restore the gate relays",
        itemIndex: 2,
        itemKey: "quest:2",
      },
      action: {
        type: "runtime.collection.intent",
        payload: {
          kind: "activate-item",
          windowId: "quest-log-window",
          itemKeyNamespace: "quest",
          repeat: false,
          itemKey: "quest:2",
        },
      },
    },
    {
      id: "runtime.overlay/key:quest-log/key:quest:3",
      path: ["runtime.overlay", "key:quest-log", "key:quest:3"],
      type: "button",
      key: "quest:3",
      parentId: "runtime.overlay/key:quest-log",
      index: 1,
      box: boxes.virtualItemBoxes[1],
      props: {
        label: "Cross the flooded archive",
        itemIndex: 3,
        itemKey: "quest:3",
      },
      action: {
        type: "runtime.collection.intent",
        payload: {
          kind: "activate-item",
          windowId: "quest-log-window",
          itemKeyNamespace: "quest",
          repeat: false,
          itemKey: "quest:3",
        },
      },
    },
  ];
}

function createPaint(boxes: {
  readonly promptBox: ResolvedRect;
  readonly subtitleBox: ResolvedRect;
  readonly dialogBox: ResolvedRect;
}): readonly RenderCommand[] {
  return [
    {
      id: "paint.prompt.primary.box",
      kind: "box",
      nodeId: "runtime.overlay/key:prompt.primary",
      box: boxes.promptBox,
      fill: "#111827",
      radius: 8,
    },
    {
      id: "paint.subtitle.primary.text",
      kind: "text",
      nodeId: "runtime.overlay/key:subtitle.primary",
      box: boxes.subtitleBox,
      text: "The gate hums softly.",
      color: "#f9fafb",
      fontSize: 18,
    },
    {
      id: "paint.pause.dialog.box",
      kind: "box",
      nodeId: "runtime.overlay/key:pause.dialog",
      box: boxes.dialogBox,
      fill: "#030712",
      stroke: "#64748b",
      radius: 8,
    },
  ];
}

function createSemantics(): readonly SemanticNode[] {
  return [
    {
      id: "semantics.runtime.overlay",
      nodeId: "runtime.overlay",
      role: "surface",
      children: [
        "semantics.prompt.primary",
        "semantics.subtitle.primary",
        "semantics.pause.dialog",
        "semantics.quest-log",
      ],
    },
    {
      id: "semantics.prompt.primary",
      nodeId: "runtime.overlay/key:prompt.primary",
      role: "button",
      parentId: "semantics.runtime.overlay",
      label: "Press E",
    },
    {
      id: "semantics.subtitle.primary",
      nodeId: "runtime.overlay/key:subtitle.primary",
      role: "text",
      parentId: "semantics.runtime.overlay",
      label: "The gate hums softly.",
    },
    {
      id: "semantics.pause.dialog",
      nodeId: "runtime.overlay/key:pause.dialog",
      role: "dialog",
      parentId: "semantics.runtime.overlay",
      label: "Paused",
    },
    {
      id: "semantics.quest-log",
      nodeId: "runtime.overlay/key:quest-log",
      role: "generic",
      parentId: "semantics.runtime.overlay",
      label: "Quest log",
      children: ["semantics.quest:2", "semantics.quest:3"],
    },
    {
      id: "semantics.quest:2",
      nodeId: "runtime.overlay/key:quest-log/key:quest:2",
      role: "button",
      parentId: "semantics.quest-log",
      label: "Restore the gate relays",
    },
    {
      id: "semantics.quest:3",
      nodeId: "runtime.overlay/key:quest-log/key:quest:3",
      role: "button",
      parentId: "semantics.quest-log",
      label: "Cross the flooded archive",
    },
  ];
}

function createActions(boxes: {
  readonly promptBox: ResolvedRect;
  readonly virtualItemBoxes: readonly [ResolvedRect, ResolvedRect];
}): readonly ResolvedActionTarget[] {
  return [
    {
      id: "action.prompt.primary",
      nodeId: "runtime.overlay/key:prompt.primary",
      path: ["runtime.overlay", "key:prompt.primary"],
      action: {
        type: "runtime.gameplay.interact",
        payload: {
          targetId: "switch_a",
        },
      },
      box: boxes.promptBox,
      label: "Press E",
    },
    {
      id: "action.quest:2.activate",
      nodeId: "runtime.overlay/key:quest-log/key:quest:2",
      path: ["runtime.overlay", "key:quest-log", "key:quest:2"],
      action: {
        type: "runtime.collection.intent",
        payload: {
          kind: "activate-item",
          windowId: "quest-log-window",
          itemKeyNamespace: "quest",
          repeat: false,
          itemKey: "quest:2",
        },
      },
      box: boxes.virtualItemBoxes[0],
      label: "Restore the gate relays",
    },
    {
      id: "action.quest:3.activate",
      nodeId: "runtime.overlay/key:quest-log/key:quest:3",
      path: ["runtime.overlay", "key:quest-log", "key:quest:3"],
      action: {
        type: "runtime.collection.intent",
        payload: {
          kind: "activate-item",
          windowId: "quest-log-window",
          itemKeyNamespace: "quest",
          repeat: false,
          itemKey: "quest:3",
        },
      },
      box: boxes.virtualItemBoxes[1],
      label: "Cross the flooded archive",
    },
  ];
}
