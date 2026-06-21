import type { RenderCommand, ResolvedRect, ResolvedUiFrame } from "@ludoweave/core";

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
  ],
  unsupported: [
    "dom.semantics",
    "native.focus",
    "input.hit-testing",
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

  if (command.fill !== undefined) {
    context.fillStyle = command.fill;
    context.fillRect(command.box.x, command.box.y, command.box.width, command.box.height);
  }

  if (command.stroke !== undefined && context.strokeRect !== undefined) {
    context.strokeStyle = command.stroke;
    context.strokeRect(command.box.x, command.box.y, command.box.width, command.box.height);
  }

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
