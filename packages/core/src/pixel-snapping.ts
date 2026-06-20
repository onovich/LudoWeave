import { coreDiagnosticCodes, createDiagnosticSink, type DiagnosticSink } from "./diagnostics.js";
import type { ResolvedRect } from "./resolved-frame.js";

/**
 * Pixel snapping policy applied after layout resolution.
 *
 * @public
 */
export type PixelSnapPolicy = "none" | "device-pixel";

/**
 * Options for {@link snapRectToPixelGrid}.
 *
 * @public
 */
export interface SnapRectToPixelGridOptions {
  readonly rect: ResolvedRect;
  readonly devicePixelRatio: number;
  readonly policy?: PixelSnapPolicy;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * Snaps a resolved rect to the configured pixel grid.
 *
 * @public
 */
export function snapRectToPixelGrid(options: SnapRectToPixelGridOptions): ResolvedRect {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const rect = normalizeRect(options.rect, "pixel.rect", diagnostics);
  const policy = normalizePixelSnapPolicy(options.policy ?? "device-pixel", diagnostics);

  if (policy === "none") {
    return rect;
  }

  const devicePixelRatio = normalizePositiveNumber(
    options.devicePixelRatio,
    "pixel.devicePixelRatio",
    1,
    diagnostics,
  );

  return {
    x: snapNumber(rect.x, devicePixelRatio),
    y: snapNumber(rect.y, devicePixelRatio),
    width: snapNumber(rect.width, devicePixelRatio),
    height: snapNumber(rect.height, devicePixelRatio),
  };
}

function snapNumber(value: number, devicePixelRatio: number): number {
  return Math.round(value * devicePixelRatio) / devicePixelRatio;
}

function normalizePixelSnapPolicy(
  policy: PixelSnapPolicy,
  diagnostics: DiagnosticSink,
): PixelSnapPolicy {
  if (policy === "none" || policy === "device-pixel") {
    return policy;
  }

  diagnostics.report({
    code: coreDiagnosticCodes.invalidLayout,
    severity: "error",
    message: "pixel.policy must be none or device-pixel.",
    path: ["pixel.policy"],
    details: {
      fallback: "device-pixel",
    },
  });
  return "device-pixel";
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
