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
 * Alignment used by absolute anchors on one axis.
 *
 * @public
 */
export type LayoutAnchorAlignment = "start" | "center" | "end";

/**
 * Absolute anchor placement within a resolved container.
 *
 * @public
 */
export interface AbsoluteAnchor {
  readonly horizontal?: LayoutAnchorAlignment;
  readonly vertical?: LayoutAnchorAlignment;
  readonly inset?: Partial<ResolvedSafeArea>;
  readonly offsetX?: number;
  readonly offsetY?: number;
}

/**
 * Options for {@link resolveAbsoluteAnchor}.
 *
 * @public
 */
export interface ResolveAbsoluteAnchorOptions {
  readonly anchor: AbsoluteAnchor;
  readonly container: ResolvedRect;
  readonly size: Pick<ResolvedRect, "width" | "height">;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * v0.1 size value: fixed pixels or percentage of available space.
 *
 * @public
 */
export type LayoutSizeValue = number | `${number}%`;

/**
 * Size constraints resolved before layout placement.
 *
 * @public
 */
export interface SizeConstraints {
  readonly width?: LayoutSizeValue;
  readonly height?: LayoutSizeValue;
  readonly minWidth?: LayoutSizeValue;
  readonly maxWidth?: LayoutSizeValue;
  readonly minHeight?: LayoutSizeValue;
  readonly maxHeight?: LayoutSizeValue;
}

/**
 * Options for {@link resolveSizeConstraints}.
 *
 * @public
 */
export interface ResolveSizeConstraintsOptions {
  readonly constraints: SizeConstraints;
  readonly available: Pick<ResolvedRect, "width" | "height">;
  readonly intrinsic?: Pick<ResolvedRect, "width" | "height">;
  readonly diagnostics?: DiagnosticSink;
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

/**
 * Resolves fixed, percentage, min, and max size constraints.
 *
 * @public
 */
export function resolveSizeConstraints(
  options: ResolveSizeConstraintsOptions,
): Pick<ResolvedRect, "width" | "height"> {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const intrinsic = options.intrinsic ?? { width: 0, height: 0 };
  const width = resolveConstrainedAxis({
    axis: "width",
    available: options.available.width,
    base: options.constraints.width,
    intrinsic: intrinsic.width,
    min: options.constraints.minWidth,
    max: options.constraints.maxWidth,
    diagnostics,
  });
  const height = resolveConstrainedAxis({
    axis: "height",
    available: options.available.height,
    base: options.constraints.height,
    intrinsic: intrinsic.height,
    min: options.constraints.minHeight,
    max: options.constraints.maxHeight,
    diagnostics,
  });

  return { width, height };
}

/**
 * Resolves an absolute anchor into a renderer-ready layout box.
 *
 * @public
 */
export function resolveAbsoluteAnchor(options: ResolveAbsoluteAnchorOptions): ResolvedRect {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const container = normalizeRect(options.container, "anchor.container", diagnostics);
  const size = {
    width: normalizeNonNegativeNumber(options.size.width, "anchor.size.width", diagnostics),
    height: normalizeNonNegativeNumber(options.size.height, "anchor.size.height", diagnostics),
  };
  const anchor = options.anchor;
  const horizontal = normalizeAnchorAlignment(
    anchor.horizontal ?? "start",
    "anchor.horizontal",
    diagnostics,
  );
  const vertical = normalizeAnchorAlignment(
    anchor.vertical ?? "start",
    "anchor.vertical",
    diagnostics,
  );
  const inset = normalizeAnchorInset(anchor.inset ?? {}, diagnostics);
  const offsetX = normalizeFiniteNumber(anchor.offsetX ?? 0, "anchor.offsetX", 0, diagnostics);
  const offsetY = normalizeFiniteNumber(anchor.offsetY ?? 0, "anchor.offsetY", 0, diagnostics);
  const inner = {
    x: container.x + inset.left,
    y: container.y + inset.top,
    width: Math.max(0, container.width - inset.left - inset.right),
    height: Math.max(0, container.height - inset.top - inset.bottom),
  };

  return {
    x: getAnchoredPosition(horizontal, inner.x, inner.width, size.width) + offsetX,
    y: getAnchoredPosition(vertical, inner.y, inner.height, size.height) + offsetY,
    width: size.width,
    height: size.height,
  };
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

function getAnchoredPosition(
  alignment: LayoutAnchorAlignment,
  origin: number,
  available: number,
  size: number,
): number {
  if (alignment === "center") {
    return origin + (available - size) / 2;
  }

  if (alignment === "end") {
    return origin + available - size;
  }

  return origin;
}

type ResolveConstrainedAxisOptions = {
  readonly axis: "width" | "height";
  readonly available: number;
  readonly base: LayoutSizeValue | undefined;
  readonly intrinsic: number;
  readonly min: LayoutSizeValue | undefined;
  readonly max: LayoutSizeValue | undefined;
  readonly diagnostics: DiagnosticSink;
};

function resolveConstrainedAxis(options: ResolveConstrainedAxisOptions): number {
  const base =
    options.base === undefined
      ? normalizeNonNegativeNumber(
          options.intrinsic,
          `size.intrinsic.${options.axis}`,
          options.diagnostics,
        )
      : resolveSizeValue(
          options.base,
          options.available,
          `size.${options.axis}`,
          options.diagnostics,
        );
  const min =
    options.min === undefined
      ? undefined
      : resolveSizeValue(
          options.min,
          options.available,
          `size.min${capitalize(options.axis)}`,
          options.diagnostics,
        );
  const max =
    options.max === undefined
      ? undefined
      : resolveSizeValue(
          options.max,
          options.available,
          `size.max${capitalize(options.axis)}`,
          options.diagnostics,
        );

  return Math.max(min ?? 0, Math.min(max ?? Number.POSITIVE_INFINITY, base));
}

function resolveSizeValue(
  value: LayoutSizeValue,
  available: number,
  path: string,
  diagnostics: DiagnosticSink,
): number {
  if (typeof value === "number") {
    return normalizeNonNegativeNumber(value, path, diagnostics);
  }

  const match = /^([0-9]+(?:\.[0-9]+)?)%$/.exec(value);
  if (match) {
    const percentage = Number(match[1]);
    return (normalizeNonNegativeNumber(percentage, path, diagnostics) / 100) * available;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: `${path} must be a non-negative number or percentage string.`,
    path: [path],
    details: {
      fallback: 0,
    },
  });
  return 0;
}

function capitalize(value: string): string {
  return `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
}

function normalizeRect(
  rect: ResolvedRect,
  path: string,
  diagnostics: DiagnosticSink,
): ResolvedRect {
  return {
    x: normalizeFiniteNumber(rect.x, `${path}.x`, 0, diagnostics),
    y: normalizeFiniteNumber(rect.y, `${path}.y`, 0, diagnostics),
    width: normalizeNonNegativeNumber(rect.width, `${path}.width`, diagnostics),
    height: normalizeNonNegativeNumber(rect.height, `${path}.height`, diagnostics),
  };
}

function normalizeAnchorInset(
  inset: Partial<ResolvedSafeArea>,
  diagnostics: DiagnosticSink,
): ResolvedSafeArea {
  return {
    top: normalizeNonNegativeNumber(inset.top ?? 0, "anchor.inset.top", diagnostics),
    right: normalizeNonNegativeNumber(inset.right ?? 0, "anchor.inset.right", diagnostics),
    bottom: normalizeNonNegativeNumber(inset.bottom ?? 0, "anchor.inset.bottom", diagnostics),
    left: normalizeNonNegativeNumber(inset.left ?? 0, "anchor.inset.left", diagnostics),
  };
}

function normalizeAnchorAlignment(
  alignment: LayoutAnchorAlignment,
  path: string,
  diagnostics: DiagnosticSink,
): LayoutAnchorAlignment {
  if (alignment === "start" || alignment === "center" || alignment === "end") {
    return alignment;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: `${path} must be start, center, or end.`,
    path: [path],
    details: {
      fallback: "start",
    },
  });
  return "start";
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

function normalizeFiniteNumber(
  value: number,
  path: string,
  fallback: number,
  diagnostics: DiagnosticSink,
): number {
  if (Number.isFinite(value)) {
    return value;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: `${path} must be a finite number.`,
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
