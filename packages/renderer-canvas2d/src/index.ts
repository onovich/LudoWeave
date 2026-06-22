import {
  collectVirtualWindowDiagnostics,
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
  normalizeTextInputOverlayRequest,
  normalizeUiDiagnostic,
  normalizeVirtualWindowMetadataFrame,
} from "@ludoweave/core";
import type {
  ActionRef,
  ActionRefInput,
  FocusGraph,
  JsonValue,
  RenderCommand,
  ResolvedActionTarget,
  ResolvedRect,
  ResolvedUiFrame,
  ScrollMetadataFrame,
  ScrollOffsetSnapshot,
  TextInputOverlayInputMode,
  TextInputOverlayRequest,
  TextInputOverlaySelection,
  UiDiagnostic,
  VirtualItemRange,
  VirtualSelectionSnapshot,
  VirtualWindowMetadataFrame,
} from "@ludoweave/core";

/**
 * Minimal Canvas2D-like context used by the experimental renderer spike.
 *
 * @public
 */
export interface Canvas2DContextLike {
  readonly canvas?: {
    readonly width: number;
    readonly height: number;
  };
  fillStyle: string;
  strokeStyle: string;
  font: string;
  textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect?(x: number, y: number, width: number, height: number): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  beginPath?(): void;
  roundRect?(x: number, y: number, width: number, height: number, radius: number): void;
  fill?(): void;
  stroke?(): void;
  save?(): void;
  restore?(): void;
}

/**
 * Options for {@link createCanvas2DRenderer}.
 *
 * @public
 */
export interface Canvas2DRendererOptions {
  readonly id?: string;
  readonly context: Canvas2DContextLike;
}

/**
 * Deterministic trace emitted by the Canvas2D spike for tests.
 *
 * @public
 */
export type Canvas2DRenderTrace =
  | {
      readonly kind: "clear";
      readonly box: ResolvedRect;
    }
  | {
      readonly kind: "box";
      readonly paintId: string;
      readonly nodeId: string;
      readonly box: ResolvedRect;
      readonly fill?: string;
      readonly stroke?: string;
      readonly radius?: number;
    }
  | {
      readonly kind: "text";
      readonly paintId: string;
      readonly nodeId: string;
      readonly box: ResolvedRect;
      readonly text: string;
      readonly color?: string;
      readonly fontSize?: number;
    };

/**
 * CSS pixel point used for Canvas2D action target hit-test tracing.
 *
 * @public
 */
export interface Canvas2DHitTestPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Serializable action target data recorded by Canvas2D hit-test traces.
 *
 * @public
 */
export interface Canvas2DHitTestTargetTrace {
  readonly actionTargetId: string;
  readonly nodeId: string;
  readonly box: ResolvedRect;
  readonly action: ActionRef;
  readonly disabled?: boolean;
  readonly label?: string;
}

/**
 * Deterministic hit-test trace for renderer tests and host coordination.
 *
 * @public
 */
export type Canvas2DActionHitTestTrace =
  | {
      readonly kind: "action-hit-test";
      readonly frameId: number;
      readonly point: Canvas2DHitTestPoint;
      readonly result: "target";
      readonly target: Canvas2DHitTestTargetTrace;
    }
  | {
      readonly kind: "action-hit-test";
      readonly frameId: number;
      readonly point: Canvas2DHitTestPoint;
      readonly result: "disabled-target";
      readonly target: Canvas2DHitTestTargetTrace;
    }
  | {
      readonly kind: "action-hit-test";
      readonly frameId: number;
      readonly point: Canvas2DHitTestPoint;
      readonly result: "outside-viewport" | "no-target";
    };

/**
 * Serializable focus target data recorded by Canvas2D focus graph traces.
 *
 * @public
 */
export interface Canvas2DFocusTargetTrace {
  readonly focusId: string;
  readonly nodeId: string;
  readonly scopeId: string;
  readonly box: ResolvedRect;
  readonly actionTargetId?: string;
  readonly disabledReason?: string;
}

/**
 * Deterministic focus graph trace for renderer tests and host coordination.
 *
 * @public
 */
export type Canvas2DFocusGraphTrace =
  | {
      readonly kind: "focus-graph-trace";
      readonly frameId: number;
      readonly scopeId: string;
      readonly result: "targets";
      readonly targets: readonly Canvas2DFocusTargetTrace[];
    }
  | {
      readonly kind: "focus-graph-trace";
      readonly frameId: number;
      readonly scopeId: string;
      readonly result: "no-target";
      readonly targets: readonly [];
    };

/**
 * Serializable scroll container data recorded by Canvas2D scroll metadata traces.
 *
 * @public
 */
export interface Canvas2DScrollContainerTrace {
  readonly containerId: string;
  readonly nodeId: string;
  readonly contentRect: ResolvedRect;
  readonly viewportRect: ResolvedRect;
  readonly visibleContentBox: ResolvedRect;
  readonly offset: ScrollOffsetSnapshot;
  readonly maxOffset: ScrollOffsetSnapshot;
  readonly actionTargetIds: readonly string[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Deterministic scroll metadata trace for renderer tests and host coordination.
 *
 * @public
 */
export type Canvas2DScrollMetadataTrace =
  | {
      readonly kind: "scroll-metadata-trace";
      readonly frameId: number;
      readonly result: "containers";
      readonly containers: readonly Canvas2DScrollContainerTrace[];
    }
  | {
      readonly kind: "scroll-metadata-trace";
      readonly frameId: number;
      readonly result: "no-container";
      readonly containers: readonly [];
    };

/**
 * Serializable realized item data recorded by Canvas2D virtual window traces.
 *
 * @public
 */
export interface Canvas2DVirtualWindowItemTrace {
  readonly nodeId: string;
  readonly itemKey: string;
  readonly itemIndex: number;
  readonly box: ResolvedRect;
  readonly actionTargetId?: string;
  readonly selected: boolean;
  readonly focused: boolean;
}

/**
 * Serializable virtual window data recorded by Canvas2D traces.
 *
 * @public
 */
export interface Canvas2DVirtualWindowTraceEntry {
  readonly windowId: string;
  readonly nodeId: string;
  readonly totalCount: number;
  readonly realizedRange: VirtualItemRange;
  readonly overscanRange: VirtualItemRange;
  readonly selection: VirtualSelectionSnapshot;
  readonly realizedItems: readonly Canvas2DVirtualWindowItemTrace[];
  readonly actionTargetIds: readonly string[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Deterministic virtual window trace for renderer tests and host coordination.
 *
 * @public
 */
export type Canvas2DVirtualWindowTrace =
  | {
      readonly kind: "virtual-window-trace";
      readonly frameId: number;
      readonly result: "windows";
      readonly windows: readonly Canvas2DVirtualWindowTraceEntry[];
    }
  | {
      readonly kind: "virtual-window-trace";
      readonly frameId: number;
      readonly result: "no-window";
      readonly windows: readonly [];
    };

/**
 * Options for deriving a host text overlay request from a Canvas2D consumed frame.
 *
 * @public
 */
export interface Canvas2DTextInputOverlayCoordinationOptions {
  readonly overlayId: string;
  readonly nodeId: string;
  readonly value: string;
  readonly selection?: TextInputOverlaySelection;
  readonly placeholder?: string;
  readonly inputMode?: TextInputOverlayInputMode;
  readonly multiline?: boolean;
}

/**
 * Deterministic coordination trace for handing editable text to a host overlay bridge.
 *
 * @public
 */
export type Canvas2DTextInputOverlayCoordinationTrace =
  | {
      readonly kind: "text-input-overlay-coordination";
      readonly frameId: number;
      readonly nodeId: string;
      readonly result: "request";
      readonly request: TextInputOverlayRequest;
      readonly diagnostics: readonly UiDiagnostic[];
    }
  | {
      readonly kind: "text-input-overlay-coordination";
      readonly frameId: number;
      readonly nodeId: string;
      readonly result:
        | "missing-node"
        | "disabled-target"
        | "missing-semantic-label"
        | "missing-actions"
        | "invalid-request";
      readonly diagnostics: readonly UiDiagnostic[];
    };

/**
 * Result returned after rendering one frame into a Canvas2D-like context.
 *
 * @public
 */
export interface Canvas2DRenderResult {
  readonly rendererId: string;
  readonly frameId: number;
  readonly frame: ResolvedUiFrame;
  readonly trace: readonly Canvas2DRenderTrace[];
}

/**
 * Experimental Canvas2D renderer interface.
 *
 * @public
 */
export interface Canvas2DRenderer {
  readonly id: string;
  render(frame: ResolvedUiFrame): Canvas2DRenderResult;
  dispose(): void;
}

/**
 * Explicit conformance subset and fallback policy for the v0.2 Canvas2D spike.
 *
 * @public
 */
export const canvas2DRendererConformancePolicy = Object.freeze({
  supported: [
    "frame.clear",
    "paint.box.fill",
    "paint.box.stroke",
    "paint.text.fill",
    "resolved-frame.consume",
    "action.hit-test.trace",
    "focus-graph.trace",
    "scroll-metadata.trace",
    "virtual-window.trace",
    "text-input-overlay.coordination-trace",
  ],
  unsupported: [
    "dom.semantics",
    "native.focus",
    "native.scroll-state",
    "native.text-input",
    "action.dispatch",
    "scroll.dispatch",
    "collection.dispatch",
    "selection.mutation",
    "rounded-rect.path-fidelity",
    "text.measurement",
  ],
  fallbackPolicy: [
    "Hosts pair Canvas2D paint with a DOM or platform input overlay for focus and actions.",
    "Core-owned layout and text measurement remain upstream of Canvas2D rendering.",
    "Box radius is preserved in the trace and may render as rectangular fill or stroke in the spike.",
  ],
});

/**
 * Traces which resolved ActionRef target is under a CSS pixel point.
 *
 * This helper is intentionally trace-only: it does not dispatch ActionRefs and does not
 * own focus, accessibility, or native input state.
 *
 * @public
 */
export function traceCanvas2DActionHitTest(
  frame: ResolvedUiFrame,
  point: Canvas2DHitTestPoint,
): Canvas2DActionHitTestTrace {
  const normalizedPoint = normalizeHitTestPoint(point);
  if (!pointInViewport(normalizedPoint, frame)) {
    return {
      kind: "action-hit-test",
      frameId: frame.frameId,
      point: normalizedPoint,
      result: "outside-viewport",
    };
  }

  const target = findTopmostActionTarget(frame.actions, normalizedPoint);
  if (target === undefined) {
    return {
      kind: "action-hit-test",
      frameId: frame.frameId,
      point: normalizedPoint,
      result: "no-target",
    };
  }

  return {
    kind: "action-hit-test",
    frameId: frame.frameId,
    point: normalizedPoint,
    result: target.disabled === true ? "disabled-target" : "target",
    target: toHitTestTargetTrace(target),
  };
}

/**
 * Traces focusable geometry and action target ids consumed by Canvas2D.
 *
 * This helper is intentionally trace-only: it does not read input, move focus,
 * dispatch ActionRefs, or own accessibility.
 *
 * @public
 */
export function traceCanvas2DFocusGraph(
  frame: ResolvedUiFrame,
  focusGraph: FocusGraph,
): Canvas2DFocusGraphTrace {
  const targets = focusGraph.nodes.map((focusNode) => {
    const actionTarget = frame.actions.find((candidate) => candidate.nodeId === focusNode.nodeId);
    return {
      focusId: focusNode.id,
      nodeId: focusNode.nodeId,
      scopeId: focusNode.scopeId,
      box: focusNode.rect,
      ...(actionTarget === undefined ? {} : { actionTargetId: actionTarget.id }),
      ...(focusNode.disabledReason === undefined
        ? {}
        : { disabledReason: focusNode.disabledReason }),
    };
  });

  if (targets.length === 0) {
    return {
      kind: "focus-graph-trace",
      frameId: frame.frameId,
      scopeId: focusGraph.scopeId,
      result: "no-target",
      targets: [],
    };
  }

  return {
    kind: "focus-graph-trace",
    frameId: frame.frameId,
    scopeId: focusGraph.scopeId,
    result: "targets",
    targets,
  };
}

/**
 * Traces scroll metadata consumed by Canvas2D without reading native scroll or dispatching actions.
 *
 * @public
 */
export function traceCanvas2DScrollMetadata(
  frame: ResolvedUiFrame,
  scrollMetadata: ScrollMetadataFrame,
): Canvas2DScrollMetadataTrace {
  const metadata = normalizeScrollMetadataFrame(scrollMetadata);
  if (metadata.containers.length === 0) {
    return {
      kind: "scroll-metadata-trace",
      frameId: frame.frameId,
      result: "no-container",
      containers: [],
    };
  }

  return {
    kind: "scroll-metadata-trace",
    frameId: frame.frameId,
    result: "containers",
    containers: metadata.containers.map((container) => {
      const offset = normalizeScrollOffsetForContainer(container);
      return {
        containerId: container.id,
        nodeId: container.nodeId,
        contentRect: container.contentRect,
        viewportRect: container.viewportRect,
        visibleContentBox: {
          x: offset.normalizedOffset.x,
          y: offset.normalizedOffset.y,
          width: container.viewportRect.width,
          height: container.viewportRect.height,
        },
        offset: offset.normalizedOffset,
        maxOffset: offset.maxOffset,
        actionTargetIds: findScrollActionTargetIds(frame.actions, container.nodeId),
        diagnostics: offset.diagnostics,
      };
    }),
  };
}

/**
 * Traces virtual window metadata consumed by Canvas2D without reading input or mutating selection/scroll state.
 *
 * @public
 */
export function traceCanvas2DVirtualWindow(
  frame: ResolvedUiFrame,
  virtualWindowMetadata: VirtualWindowMetadataFrame,
): Canvas2DVirtualWindowTrace {
  const metadata = normalizeVirtualWindowMetadataFrame(virtualWindowMetadata);
  if (metadata.windows.length === 0) {
    return {
      kind: "virtual-window-trace",
      frameId: frame.frameId,
      result: "no-window",
      windows: [],
    };
  }

  return {
    kind: "virtual-window-trace",
    frameId: frame.frameId,
    result: "windows",
    windows: metadata.windows.map((window) => {
      const realizedItems = findVirtualWindowItems(frame, window.nodeId, window.selection);
      const diagnostics = [
        ...window.diagnostics,
        ...collectVirtualWindowDiagnostics({
          window,
          realizedItems: realizedItems.map((item) => ({
            index: item.itemIndex,
            key: item.itemKey,
          })),
        }),
      ];

      return {
        windowId: window.id,
        nodeId: window.nodeId,
        totalCount: window.totalCount,
        realizedRange: window.realizedRange,
        overscanRange: window.overscanRange,
        selection: window.selection,
        realizedItems,
        actionTargetIds: realizedItems
          .map((item) => item.actionTargetId)
          .filter((id): id is string => id !== undefined),
        diagnostics,
      };
    }),
  };
}

/**
 * Derives a serializable host text overlay request from frame data consumed by Canvas2D.
 *
 * This helper coordinates data only. The host remains responsible for opening,
 * focusing, snapshotting, closing, and dispatching text input actions.
 *
 * @public
 */
export function traceCanvas2DTextInputOverlayCoordination(
  frame: ResolvedUiFrame,
  options: Canvas2DTextInputOverlayCoordinationOptions,
): Canvas2DTextInputOverlayCoordinationTrace {
  const node = frame.nodes.find((candidate) => candidate.id === options.nodeId);
  if (node === undefined) {
    return createTextInputOverlayDiagnosticTrace({
      frame,
      nodeId: options.nodeId,
      result: "missing-node",
      code: canvas2DTextInputOverlayDiagnosticCodes.missingNode,
      message: "Canvas2D could not find the editable overlay node in the resolved frame.",
    });
  }

  if (node.props?.disabled === true) {
    return createTextInputOverlayDiagnosticTrace({
      frame,
      nodeId: options.nodeId,
      result: "disabled-target",
      code: canvas2DTextInputOverlayDiagnosticCodes.disabledTarget,
      message: "Canvas2D did not create an overlay request for a disabled editable target.",
    });
  }

  const semanticLabel = frame.semantics.find(
    (semantic) => semantic.nodeId === options.nodeId,
  )?.label;
  if (semanticLabel === undefined || semanticLabel.trim().length === 0) {
    return createTextInputOverlayDiagnosticTrace({
      frame,
      nodeId: options.nodeId,
      result: "missing-semantic-label",
      code: canvas2DTextInputOverlayDiagnosticCodes.missingSemanticLabel,
      message: "Canvas2D overlay coordination requires a semantic label for host accessibility.",
    });
  }

  const commitAction = readActionInput(node.props?.commitAction);
  const cancelAction = readActionInput(node.props?.cancelAction);
  if (commitAction === undefined || cancelAction === undefined) {
    return createTextInputOverlayDiagnosticTrace({
      frame,
      nodeId: options.nodeId,
      result: "missing-actions",
      code: canvas2DTextInputOverlayDiagnosticCodes.missingActions,
      message: "Canvas2D overlay coordination requires commit and cancel ActionRefs.",
    });
  }

  try {
    const placeholder = options.placeholder ?? readOptionalString(node.props?.placeholder);
    const inputMode = options.inputMode ?? readOptionalInputMode(node.props?.inputMode);
    const themeToken = readOptionalThemeToken(node.style?.themeToken);
    const request = normalizeTextInputOverlayRequest({
      overlayId: options.overlayId,
      nodeId: options.nodeId,
      box: node.box,
      value: options.value,
      multiline: options.multiline ?? readOptionalBoolean(node.props?.multiline) ?? false,
      ariaLabel: semanticLabel,
      commitAction,
      cancelAction,
      diagnosticPath: ["frame", "nodes", options.nodeId],
      ...(options.selection === undefined ? {} : { selection: options.selection }),
      ...(placeholder === undefined ? {} : { placeholder }),
      ...(inputMode === undefined ? {} : { inputMode }),
      ...(themeToken === undefined ? {} : { themeToken }),
    });

    return {
      kind: "text-input-overlay-coordination",
      frameId: frame.frameId,
      nodeId: options.nodeId,
      result: "request",
      request,
      diagnostics: [],
    };
  } catch (error) {
    return createTextInputOverlayDiagnosticTrace({
      frame,
      nodeId: options.nodeId,
      result: "invalid-request",
      code: canvas2DTextInputOverlayDiagnosticCodes.invalidRequest,
      message: error instanceof Error ? error.message : "Invalid text input overlay request.",
    });
  }
}

/**
 * Creates a minimal Canvas2D renderer spike that consumes resolved frames.
 *
 * @public
 */
export function createCanvas2DRenderer(options: Canvas2DRendererOptions): Canvas2DRenderer {
  const id = options.id ?? "ludoweave.canvas2d";
  const context = options.context;
  let disposed = false;

  return {
    id,
    render(frame) {
      if (disposed) {
        throw new Error("Canvas2DRenderer has been disposed.");
      }

      const trace: Canvas2DRenderTrace[] = [];
      context.save?.();
      try {
        trace.push(clearFrame(context, frame));
        for (const command of frame.paint) {
          trace.push(renderCommand(context, command));
        }
      } finally {
        context.restore?.();
      }

      return {
        rendererId: id,
        frameId: frame.frameId,
        frame,
        trace,
      };
    },
    dispose() {
      disposed = true;
    },
  };
}

const canvas2DTextInputOverlayDiagnosticCodes = {
  missingNode: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_MISSING_NODE",
  disabledTarget: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_DISABLED_TARGET",
  missingSemanticLabel: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_MISSING_SEMANTIC_LABEL",
  missingActions: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_MISSING_ACTIONS",
  invalidRequest: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_INVALID_REQUEST",
} as const;

function createTextInputOverlayDiagnosticTrace(options: {
  readonly frame: ResolvedUiFrame;
  readonly nodeId: string;
  readonly result: Exclude<Canvas2DTextInputOverlayCoordinationTrace["result"], "request">;
  readonly code: string;
  readonly message: string;
}): Canvas2DTextInputOverlayCoordinationTrace {
  return {
    kind: "text-input-overlay-coordination",
    frameId: options.frame.frameId,
    nodeId: options.nodeId,
    result: options.result,
    diagnostics: [
      normalizeUiDiagnostic({
        code: options.code,
        severity: "warning",
        message: options.message,
        path: ["renderer-canvas2d", "text-input-overlay", options.nodeId],
        details: {
          frameId: options.frame.frameId,
          nodeId: options.nodeId,
          result: options.result,
        },
      }),
    ],
  };
}

function normalizeHitTestPoint(point: Canvas2DHitTestPoint): Canvas2DHitTestPoint {
  return {
    x: normalizeFiniteNumber(point.x, "point.x"),
    y: normalizeFiniteNumber(point.y, "point.y"),
  };
}

function readActionInput(value: JsonValue | undefined): ActionRefInput | undefined {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  if (isJsonObject(value) && typeof value.type === "string") {
    return value as unknown as ActionRefInput;
  }

  return undefined;
}

function readOptionalString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readOptionalNumber(value: JsonValue | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function readOptionalBoolean(value: JsonValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readOptionalInputMode(
  value: JsonValue | undefined,
): TextInputOverlayInputMode | undefined {
  return typeof value === "string" ? (value as TextInputOverlayInputMode) : undefined;
}

function readOptionalThemeToken(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isJsonObject(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTopmostActionTarget(
  actions: readonly ResolvedActionTarget[],
  point: Canvas2DHitTestPoint,
): ResolvedActionTarget | undefined {
  for (let index = actions.length - 1; index >= 0; index -= 1) {
    const target = actions[index];
    if (target !== undefined && pointInRect(point, target.box)) {
      return target;
    }
  }

  return undefined;
}

function findScrollActionTargetIds(
  actions: readonly ResolvedActionTarget[],
  containerNodeId: string,
): readonly string[] {
  return actions
    .filter(
      (target) =>
        target.nodeId === containerNodeId || target.nodeId.startsWith(`${containerNodeId}/`),
    )
    .map((target) => target.id);
}

function findVirtualWindowItems(
  frame: ResolvedUiFrame,
  windowNodeId: string,
  selection: VirtualSelectionSnapshot,
): readonly Canvas2DVirtualWindowItemTrace[] {
  return frame.nodes
    .filter((node) => node.parentId === windowNodeId)
    .flatMap((node) => {
      const itemKey = readOptionalString(node.props?.itemKey);
      const itemIndex = readOptionalNumber(node.props?.itemIndex);
      if (itemKey === undefined || itemIndex === undefined) {
        return [];
      }

      const actionTarget = frame.actions.find((candidate) => candidate.nodeId === node.id);

      return [
        {
          nodeId: node.id,
          itemKey,
          itemIndex,
          box: node.box,
          ...(actionTarget === undefined ? {} : { actionTargetId: actionTarget.id }),
          selected: selection.selectedKey === itemKey,
          focused: selection.focusedKey === itemKey,
        },
      ];
    });
}

function toHitTestTargetTrace(target: ResolvedActionTarget): Canvas2DHitTestTargetTrace {
  return {
    actionTargetId: target.id,
    nodeId: target.nodeId,
    box: target.box,
    action: target.action,
    ...(target.disabled === undefined ? {} : { disabled: target.disabled }),
    ...(target.label === undefined ? {} : { label: target.label }),
  };
}

function pointInViewport(point: Canvas2DHitTestPoint, frame: ResolvedUiFrame): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < frame.viewport.width &&
    point.y < frame.viewport.height
  );
}

function pointInRect(point: Canvas2DHitTestPoint, rect: ResolvedRect): boolean {
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x < rect.x + rect.width &&
    point.y < rect.y + rect.height
  );
}

function normalizeFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${path} must be a finite number.`);
  }

  return value;
}

function clearFrame(context: Canvas2DContextLike, frame: ResolvedUiFrame): Canvas2DRenderTrace {
  const box = {
    x: 0,
    y: 0,
    width: frame.viewport.width,
    height: frame.viewport.height,
  };
  context.clearRect(box.x, box.y, box.width, box.height);
  return {
    kind: "clear",
    box,
  };
}

function renderCommand(context: Canvas2DContextLike, command: RenderCommand): Canvas2DRenderTrace {
  if (command.kind === "text") {
    context.fillStyle = command.color ?? "#000000";
    context.font = `${command.fontSize ?? 16}px ${command.fontFamily ?? "sans-serif"}`;
    context.textBaseline = "top";
    context.fillText(command.text, command.box.x, command.box.y, command.box.width);
    return {
      kind: "text",
      paintId: command.id,
      nodeId: command.nodeId,
      box: command.box,
      text: command.text,
      ...(command.color === undefined ? {} : { color: command.color }),
      ...(command.fontSize === undefined ? {} : { fontSize: command.fontSize }),
    };
  }

  renderBoxCommand(context, command);

  return {
    kind: "box",
    paintId: command.id,
    nodeId: command.nodeId,
    box: command.box,
    ...(command.fill === undefined ? {} : { fill: command.fill }),
    ...(command.stroke === undefined ? {} : { stroke: command.stroke }),
    ...(command.radius === undefined ? {} : { radius: command.radius }),
  };
}

function renderBoxCommand(
  context: Canvas2DContextLike,
  command: Extract<RenderCommand, { readonly kind: "box" }>,
): void {
  if (canRenderRoundedBoxPath(context, command)) {
    const radius = command.radius ?? 0;
    context.beginPath();
    context.roundRect(command.box.x, command.box.y, command.box.width, command.box.height, radius);

    if (command.fill !== undefined) {
      context.fillStyle = command.fill;
      context.fill?.();
    }

    if (command.stroke !== undefined) {
      context.strokeStyle = command.stroke;
      context.stroke?.();
    }
    return;
  }

  if (command.fill !== undefined) {
    context.fillStyle = command.fill;
    context.fillRect(command.box.x, command.box.y, command.box.width, command.box.height);
  }

  if (command.stroke !== undefined && context.strokeRect !== undefined) {
    context.strokeStyle = command.stroke;
    context.strokeRect(command.box.x, command.box.y, command.box.width, command.box.height);
  }
}

function canRenderRoundedBoxPath(
  context: Canvas2DContextLike,
  command: Extract<RenderCommand, { readonly kind: "box" }>,
): context is Canvas2DContextLike & Required<Pick<Canvas2DContextLike, "beginPath" | "roundRect">> {
  if (command.radius === undefined || command.radius <= 0) {
    return false;
  }

  if (context.beginPath === undefined || context.roundRect === undefined) {
    return false;
  }

  if (command.fill !== undefined && context.fill === undefined) {
    return false;
  }

  return command.stroke === undefined || context.stroke !== undefined;
}
