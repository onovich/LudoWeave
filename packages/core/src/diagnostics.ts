import type { JsonValue } from "./json-value.js";
import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";

/**
 * Stable diagnostic code namespace for v0.1 core/runtime checks.
 *
 * @public
 */
export const coreDiagnosticCodes = {
  invalidAction: "LW_CORE_INVALID_ACTION",
  invalidJson: "LW_CORE_INVALID_JSON",
  invalidLayout: "LW_CORE_INVALID_LAYOUT",
  invalidUiNode: "LW_CORE_INVALID_UI_NODE",
  unsupportedLayout: "LW_CORE_UNSUPPORTED_LAYOUT",
} as const;

/**
 * Stable diagnostic code emitted by LudoWeave.
 *
 * @public
 */
export type UiDiagnosticCode = string;

/**
 * Severity used for diagnostics emitted during normalization, layout, and rendering.
 *
 * @public
 */
export type UiDiagnosticSeverity = "info" | "warning" | "error";

/**
 * Serializable diagnostic emitted by LudoWeave runtime stages.
 *
 * @public
 */
export interface UiDiagnostic {
  /**
   * Stable `LW_*` diagnostic code.
   */
  readonly code: UiDiagnosticCode;
  /**
   * Diagnostic severity.
   */
  readonly severity: UiDiagnosticSeverity;
  /**
   * Human-readable message suitable for logs and snapshot review.
   */
  readonly message: string;
  /**
   * Optional stable tree path, package path, or fixture path.
   */
  readonly path?: readonly string[];
  /**
   * Optional JSON details for deterministic snapshots.
   */
  readonly details?: Readonly<Record<string, JsonValue>>;
}

/**
 * Authoring input accepted by {@link normalizeUiDiagnostic}.
 *
 * @public
 */
export interface UiDiagnosticInput {
  readonly code: UiDiagnosticCode;
  readonly severity: UiDiagnosticSeverity;
  readonly message: string;
  readonly path?: readonly string[];
  readonly details?: Readonly<Record<string, JsonValue>>;
}

/**
 * Collects diagnostics without owning runtime source-of-truth.
 *
 * @public
 */
export interface DiagnosticSink {
  /**
   * Records and returns a normalized diagnostic.
   */
  report(diagnostic: UiDiagnosticInput): UiDiagnostic;
  /**
   * Returns diagnostics in insertion order for deterministic snapshots.
   */
  snapshot(): readonly UiDiagnostic[];
  /**
   * Returns whether any recorded diagnostic is an error.
   */
  hasErrors(): boolean;
  /**
   * Clears recorded diagnostics.
   */
  clear(): void;
}

/**
 * Normalizes diagnostic authoring input into a serializable diagnostic.
 *
 * @public
 */
export function normalizeUiDiagnostic(input: UiDiagnosticInput): UiDiagnostic {
  if (!isPlainRecord(input)) {
    throw new TypeError("UiDiagnostic input must be a plain object.");
  }

  const normalized: MutableUiDiagnostic = {
    code: normalizeDiagnosticCode(input.code),
    severity: normalizeDiagnosticSeverity(input.severity),
    message: normalizeDiagnosticMessage(input.message),
  };

  if (input.path !== undefined) {
    normalized.path = normalizeDiagnosticPath(input.path);
  }

  if (input.details !== undefined) {
    if (!isPlainRecord(input.details)) {
      throw new TypeError("UiDiagnostic details must be a plain JSON object.");
    }
    normalized.details = normalizeJsonObject(input.details, "details");
  }

  return normalized;
}

/**
 * Creates an insertion-ordered diagnostic sink for one normalization/layout/render pass.
 *
 * @public
 */
export function createDiagnosticSink(
  initialDiagnostics: readonly UiDiagnosticInput[] = [],
): DiagnosticSink {
  const diagnostics = initialDiagnostics.map((diagnostic) => normalizeUiDiagnostic(diagnostic));

  return {
    report(diagnostic) {
      const normalized = normalizeUiDiagnostic(diagnostic);
      diagnostics.push(normalized);
      return normalized;
    },
    snapshot() {
      return diagnostics.map((diagnostic) => ({ ...diagnostic }));
    },
    hasErrors() {
      return diagnostics.some((diagnostic) => diagnostic.severity === "error");
    },
    clear() {
      diagnostics.length = 0;
    },
  };
}

type MutableUiDiagnostic = {
  code: UiDiagnosticCode;
  severity: UiDiagnosticSeverity;
  message: string;
  path?: readonly string[];
  details?: Readonly<Record<string, JsonValue>>;
};

function normalizeDiagnosticCode(value: unknown): UiDiagnosticCode {
  if (typeof value !== "string") {
    throw new TypeError("UiDiagnostic code must be a string.");
  }

  const code = value.trim();
  if (!/^LW_[A-Z0-9_]+$/.test(code)) {
    throw new TypeError("UiDiagnostic code must use the stable LW_* namespace.");
  }

  return code;
}

function normalizeDiagnosticSeverity(value: unknown): UiDiagnosticSeverity {
  if (value === "info" || value === "warning" || value === "error") {
    return value;
  }

  throw new TypeError("UiDiagnostic severity must be info, warning, or error.");
}

function normalizeDiagnosticMessage(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("UiDiagnostic message must be a string.");
  }

  const message = value.trim();
  if (message.length === 0) {
    throw new TypeError("UiDiagnostic message must not be empty.");
  }

  return message;
}

function normalizeDiagnosticPath(value: readonly string[]): readonly string[] {
  if (!Array.isArray(value)) {
    throw new TypeError("UiDiagnostic path must be an array of strings.");
  }

  return value.map((segment, index) => {
    if (typeof segment !== "string" || segment.length === 0) {
      throw new TypeError(`UiDiagnostic path[${index}] must be a non-empty string.`);
    }
    return segment;
  });
}
