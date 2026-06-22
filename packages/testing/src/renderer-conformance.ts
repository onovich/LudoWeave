import {
  createLayoutEnvironment,
  resolveAbsoluteAnchor,
  type RenderCommand,
  type ResolvedActionTarget,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type ScrollMetadataFrame,
  type ScrollOffsetNormalizationResult,
  type SemanticNode,
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
} from "@ludoweave/core";

export interface RendererConformanceFixture {
  readonly name: "runtime-overlay-conformance";
  readonly frame: ResolvedUiFrame;
  readonly scrollMetadata: ScrollMetadataFrame;
  readonly scrollVisibleContentBox: ResolvedRect;
  readonly scrollOffset: ScrollOffsetNormalizationResult;
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
  const nodes = createNodes({ contentBox, promptBox, subtitleBox, dialogBox });
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
      actions: createActions(promptBox),
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
    ],
  };
}

function createNodes(boxes: {
  readonly contentBox: ResolvedRect;
  readonly promptBox: ResolvedRect;
  readonly subtitleBox: ResolvedRect;
  readonly dialogBox: ResolvedRect;
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
  ];
}

function createActions(promptBox: ResolvedRect): readonly ResolvedActionTarget[] {
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
      box: promptBox,
      label: "Press E",
    },
  ];
}
