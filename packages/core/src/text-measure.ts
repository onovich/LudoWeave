import { coreDiagnosticCodes, createDiagnosticSink, type DiagnosticSink } from "./diagnostics.js";

/**
 * Host-supplied text measurement request.
 *
 * @public
 */
export interface TextMeasureInput {
  readonly text: string;
  readonly fontSize: number;
  readonly maxWidth: number;
  readonly fontFamily?: string;
}

/**
 * Resolved text measurement in CSS pixel units.
 *
 * @public
 */
export interface TextMeasureResult {
  readonly width: number;
  readonly height: number;
}

/**
 * Host or test text measurement function.
 *
 * @public
 */
export type TextMeasure = (input: TextMeasureInput) => TextMeasureResult;

/**
 * Options for {@link resolveTextMeasure}.
 *
 * @public
 */
export interface ResolveTextMeasureOptions {
  readonly text: string;
  readonly maxWidth: number;
  readonly measureText: TextMeasure;
  readonly fontSize?: number;
  readonly fontFamily?: string;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * Resolves text measurement through a host-supplied measurer and normalizes the result.
 *
 * @public
 */
export function resolveTextMeasure(options: ResolveTextMeasureOptions): TextMeasureResult {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const fontSize = normalizePositiveNumber(
    options.fontSize ?? 16,
    "text.fontSize",
    16,
    diagnostics,
  );
  const maxWidth = normalizeNonNegativeNumber(options.maxWidth, "text.maxWidth", diagnostics);
  const input =
    options.fontFamily === undefined
      ? {
          text: options.text,
          fontSize,
          maxWidth,
        }
      : {
          text: options.text,
          fontSize,
          maxWidth,
          fontFamily: options.fontFamily,
        };
  const measured = options.measureText(input);

  return {
    width: Math.min(
      maxWidth,
      normalizeNonNegativeNumber(measured.width, "text.measure.width", diagnostics),
    ),
    height: normalizeNonNegativeNumber(measured.height, "text.measure.height", diagnostics),
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
