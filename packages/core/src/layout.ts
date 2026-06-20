import { coreDiagnosticCodes, createDiagnosticSink, type DiagnosticSink } from "./diagnostics.js";
import type { ResolvedRect, ResolvedSafeArea, ResolvedViewport } from "./resolved-frame.js";

/**
 * Viewport input supplied by the host before layout.
 *
 * @public
 */
export interface LayoutViewportInput {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio?: number;
  readonly safeArea?: Partial<ResolvedSafeArea>;
}

/**
 * Stable layout environment used by v0.1 layout resolution.
 *
 * @public
 */
export interface LayoutEnvironment {
  readonly viewport: ResolvedViewport;
  readonly contentBox: ResolvedRect;
}

/**
 * Options for {@link createLayoutEnvironment}.
 *
 * @public
 */
export interface CreateLayoutEnvironmentOptions {
  readonly viewport: LayoutViewportInput;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * v0.1 stack direction.
 *
 * @public
 */
export type StackDirection = "row" | "column";

/**
 * Cross-axis alignment for stack children.
 *
 * @public
 */
export type StackAlign = "start" | "center" | "end";

/**
 * Main-axis distribution for stack children.
 *
 * @public
 */
export type StackJustify = "start" | "center" | "end";

/**
 * Fixed child size consumed by stack layout.
 *
 * @public
 */
export interface StackLayoutChildInput {
  readonly id: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Options for {@link resolveStackLayout}.
 *
 * @public
 */
export interface StackLayoutOptions {
  readonly direction: StackDirection;
  readonly children: readonly StackLayoutChildInput[];
  readonly gap?: number;
  readonly align?: StackAlign;
  readonly justify?: StackJustify;
  readonly container?: ResolvedRect;
  readonly origin?: Pick<ResolvedRect, "x" | "y">;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * Resolved child box emitted by stack layout.
 *
 * @public
 */
export interface StackLayoutBox {
  readonly id: string;
  readonly box: ResolvedRect;
}

/**
 * Normalizes host viewport, DPR, and safe-area inputs into a deterministic layout environment.
 *
 * @public
 */
export function createLayoutEnvironment(
  options: CreateLayoutEnvironmentOptions,
): LayoutEnvironment {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const viewportInput = options.viewport;
  const safeArea = normalizeSafeArea(viewportInput.safeArea ?? {}, diagnostics);
  const width = normalizePositiveNumber(viewportInput.width, "viewport.width", 1, diagnostics);
  const height = normalizePositiveNumber(viewportInput.height, "viewport.height", 1, diagnostics);
  const devicePixelRatio = normalizePositiveNumber(
    viewportInput.devicePixelRatio ?? 1,
    "viewport.devicePixelRatio",
    1,
    diagnostics,
  );

  return {
    viewport: {
      width,
      height,
      devicePixelRatio,
      safeArea,
    },
    contentBox: {
      x: safeArea.left,
      y: safeArea.top,
      width: Math.max(0, width - safeArea.left - safeArea.right),
      height: Math.max(0, height - safeArea.top - safeArea.bottom),
    },
  };
}

/**
 * Resolves a row or column stack from fixed child sizes and gap.
 *
 * @public
 */
export function resolveStackLayout(options: StackLayoutOptions): readonly StackLayoutBox[] {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const gap = normalizeNonNegativeNumber(options.gap ?? 0, "stack.gap", diagnostics);
  const align = options.align ?? "start";
  const justify = options.justify ?? "start";
  const children = options.children.map((child, index) => ({
    id: child.id,
    width: normalizeNonNegativeNumber(child.width, `stack.children.${index}.width`, diagnostics),
    height: normalizeNonNegativeNumber(child.height, `stack.children.${index}.height`, diagnostics),
  }));
  const origin = options.container ?? {
    x: options.origin?.x ?? 0,
    y: options.origin?.y ?? 0,
    width: getStackMainSize(options.direction, children, gap),
    height: getStackCrossSize(options.direction, children),
  };
  const mainSize = getStackMainSize(options.direction, children, gap);
  const mainAvailable = options.direction === "row" ? origin.width : origin.height;
  const crossAvailable = options.direction === "row" ? origin.height : origin.width;
  let cursor =
    getMainStart(options.direction, origin) + getJustifyOffset(justify, mainAvailable, mainSize);

  return children.map((child) => {
    const box =
      options.direction === "row"
        ? {
            x: cursor,
            y: origin.y + getAlignOffset(align, crossAvailable, child.height),
            width: child.width,
            height: child.height,
          }
        : {
            x: origin.x + getAlignOffset(align, crossAvailable, child.width),
            y: cursor,
            width: child.width,
            height: child.height,
          };

    cursor += getMainChildSize(options.direction, child) + gap;

    return {
      id: child.id,
      box,
    };
  });
}

type NormalizedStackChild = {
  readonly id: string;
  readonly width: number;
  readonly height: number;
};

function getStackMainSize(
  direction: StackDirection,
  children: readonly NormalizedStackChild[],
  gap: number,
): number {
  const childSize = children.reduce((sum, child) => sum + getMainChildSize(direction, child), 0);
  const gapSize = Math.max(0, children.length - 1) * gap;
  return childSize + gapSize;
}

function getStackCrossSize(
  direction: StackDirection,
  children: readonly NormalizedStackChild[],
): number {
  return children.reduce((max, child) => Math.max(max, getCrossChildSize(direction, child)), 0);
}

function getMainChildSize(direction: StackDirection, child: NormalizedStackChild): number {
  return direction === "row" ? child.width : child.height;
}

function getCrossChildSize(direction: StackDirection, child: NormalizedStackChild): number {
  return direction === "row" ? child.height : child.width;
}

function getMainStart(direction: StackDirection, container: ResolvedRect): number {
  return direction === "row" ? container.x : container.y;
}

function getJustifyOffset(justify: StackJustify, available: number, content: number): number {
  if (justify === "center") {
    return (available - content) / 2;
  }

  if (justify === "end") {
    return available - content;
  }

  return 0;
}

function getAlignOffset(align: StackAlign, available: number, child: number): number {
  if (align === "center") {
    return (available - child) / 2;
  }

  if (align === "end") {
    return available - child;
  }

  return 0;
}

function normalizeSafeArea(
  safeArea: Partial<ResolvedSafeArea>,
  diagnostics: DiagnosticSink,
): ResolvedSafeArea {
  return {
    top: normalizeNonNegativeNumber(safeArea.top ?? 0, "viewport.safeArea.top", diagnostics),
    right: normalizeNonNegativeNumber(safeArea.right ?? 0, "viewport.safeArea.right", diagnostics),
    bottom: normalizeNonNegativeNumber(
      safeArea.bottom ?? 0,
      "viewport.safeArea.bottom",
      diagnostics,
    ),
    left: normalizeNonNegativeNumber(safeArea.left ?? 0, "viewport.safeArea.left", diagnostics),
  };
}

function normalizePositiveNumber(
  value: number,
  path: string,
  fallback: number,
  diagnostics: DiagnosticSink,
): number {
  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: `${path} must be a positive finite number.`,
    path: [path],
    details: {
      fallback,
    },
  });
  return fallback;
}

function normalizeNonNegativeNumber(
  value: number,
  path: string,
  diagnostics: DiagnosticSink,
): number {
  if (Number.isFinite(value) && value >= 0) {
    return value;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: `${path} must be a non-negative finite number.`,
    path: [path],
    details: {
      fallback: 0,
    },
  });
  return 0;
}
