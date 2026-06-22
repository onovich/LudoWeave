import type {
  ActionRef,
  RenderCommand,
  ResolvedActionTarget,
  ResolvedRect,
  ResolvedUiFrame,
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
  ],
  unsupported: [
    "dom.semantics",
    "native.focus",
    "native.text-input",
    "action.dispatch",
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

function normalizeHitTestPoint(point: Canvas2DHitTestPoint): Canvas2DHitTestPoint {
  return {
    x: normalizeFiniteNumber(point.x, "point.x"),
    y: normalizeFiniteNumber(point.y, "point.y"),
  };
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
