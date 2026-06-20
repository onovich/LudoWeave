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
  const origin = options.origin ?? { x: 0, y: 0 };
  let cursorX = origin.x;
  let cursorY = origin.y;

  return options.children.map((child, index) => {
    const width = normalizeNonNegativeNumber(
      child.width,
      `stack.children.${index}.width`,
      diagnostics,
    );
    const height = normalizeNonNegativeNumber(
      child.height,
      `stack.children.${index}.height`,
      diagnostics,
    );
    const box = {
      x: cursorX,
      y: cursorY,
      width,
      height,
    };

    if (options.direction === "row") {
      cursorX += width + gap;
    } else {
      cursorY += height + gap;
    }

    return {
      id: child.id,
      box,
    };
  });
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
