import { normalizeActionRef, type ActionRef, type ActionRefInput } from "./action-ref.js";
import { isPlainRecord } from "./json-normalize.js";
import type { ResolvedRect } from "./resolved-frame.js";
import { normalizeThemeTokenName, type UiThemeTokenName } from "./theme-token.js";

/**
 * Host input mode hint for an editable text overlay.
 *
 * @public
 */
export type TextInputOverlayInputMode =
  | "none"
  | "text"
  | "decimal"
  | "numeric"
  | "tel"
  | "search"
  | "email"
  | "url";

/**
 * Selection direction copied from host text input state.
 *
 * @public
 */
export type TextInputOverlaySelectionDirection = "none" | "forward" | "backward";

/**
 * Serializable text selection range for a host-owned text overlay.
 *
 * @public
 */
export interface TextInputOverlaySelection {
  readonly start: number;
  readonly end: number;
  readonly direction?: TextInputOverlaySelectionDirection;
}

/**
 * Reason associated with overlay lifecycle changes and fallback states.
 *
 * @public
 */
export type TextInputOverlayLifecycleReason =
  | "open"
  | "update"
  | "focus"
  | "snapshot"
  | "commit"
  | "cancel"
  | "blur"
  | "node-removed"
  | "route-change"
  | "host-dispose"
  | "capability-missing"
  | "capability-disabled"
  | "unsupported-renderer";

/**
 * Host capability state for editable text overlays.
 *
 * @public
 */
export type TextInputOverlayCapabilityStatus =
  | "available"
  | "missing"
  | "disabled"
  | "unsupported-renderer";

/**
 * Serializable capability report returned by a host bridge or fixture.
 *
 * @public
 */
export interface TextInputOverlayCapability {
  readonly status: TextInputOverlayCapabilityStatus;
  readonly reason?: TextInputOverlayLifecycleReason;
  readonly diagnosticPath?: readonly string[];
  readonly message?: string;
}

/**
 * Authoring input for a host text overlay request.
 *
 * @public
 */
export interface TextInputOverlayRequestInput {
  readonly overlayId: string;
  readonly nodeId: string;
  readonly box: ResolvedRect;
  readonly value: string;
  readonly selection?: TextInputOverlaySelection;
  readonly placeholder?: string;
  readonly inputMode?: TextInputOverlayInputMode;
  readonly multiline: boolean;
  readonly ariaLabel: string;
  readonly themeToken?: UiThemeTokenName;
  readonly commitAction?: ActionRefInput;
  readonly cancelAction?: ActionRefInput;
  readonly diagnosticPath?: readonly string[];
}

/**
 * Serializable request handed from renderer coordination to the host overlay bridge.
 *
 * @public
 */
export interface TextInputOverlayRequest {
  readonly overlayId: string;
  readonly nodeId: string;
  readonly box: ResolvedRect;
  readonly value: string;
  readonly selection?: TextInputOverlaySelection;
  readonly placeholder?: string;
  readonly inputMode?: TextInputOverlayInputMode;
  readonly multiline: boolean;
  readonly ariaLabel: string;
  readonly themeToken?: UiThemeTokenName;
  readonly commitAction?: ActionRef;
  readonly cancelAction?: ActionRef;
  readonly diagnosticPath?: readonly string[];
}

/**
 * Authoring input for a host text overlay snapshot.
 *
 * @public
 */
export interface TextInputOverlaySnapshotInput {
  readonly overlayId: string;
  readonly nodeId?: string;
  readonly value: string;
  readonly selection?: TextInputOverlaySelection;
  readonly isComposing?: boolean;
  readonly compositionText?: string;
}

/**
 * Serializable snapshot read from the host-owned text input overlay.
 *
 * @public
 */
export interface TextInputOverlaySnapshot {
  readonly overlayId: string;
  readonly nodeId?: string;
  readonly value: string;
  readonly selection?: TextInputOverlaySelection;
  readonly isComposing: boolean;
  readonly compositionText?: string;
}

const inputModes = new Set<TextInputOverlayInputMode>([
  "none",
  "text",
  "decimal",
  "numeric",
  "tel",
  "search",
  "email",
  "url",
]);

const selectionDirections = new Set<TextInputOverlaySelectionDirection>([
  "none",
  "forward",
  "backward",
]);

const lifecycleReasons = new Set<TextInputOverlayLifecycleReason>([
  "open",
  "update",
  "focus",
  "snapshot",
  "commit",
  "cancel",
  "blur",
  "node-removed",
  "route-change",
  "host-dispose",
  "capability-missing",
  "capability-disabled",
  "unsupported-renderer",
]);

const capabilityStatuses = new Set<TextInputOverlayCapabilityStatus>([
  "available",
  "missing",
  "disabled",
  "unsupported-renderer",
]);

/**
 * Normalizes a host text overlay request and rejects non-serializable bridge data.
 *
 * @public
 */
export function normalizeTextInputOverlayRequest(
  input: TextInputOverlayRequestInput,
): TextInputOverlayRequest {
  if (!isPlainRecord(input)) {
    throw new TypeError("TextInputOverlayRequest must be a plain object.");
  }

  const request: MutableTextInputOverlayRequest = {
    overlayId: normalizeNonEmptyString(input.overlayId, "overlayId"),
    nodeId: normalizeNonEmptyString(input.nodeId, "nodeId"),
    box: normalizeResolvedRect(input.box, "box"),
    value: normalizeString(input.value, "value"),
    multiline: normalizeBoolean(input.multiline, "multiline"),
    ariaLabel: normalizeNonEmptyString(input.ariaLabel, "ariaLabel"),
  };

  if (input.selection !== undefined) {
    request.selection = normalizeTextInputOverlaySelection(input.selection, "selection");
  }

  if (input.placeholder !== undefined) {
    request.placeholder = normalizeString(input.placeholder, "placeholder");
  }

  if (input.inputMode !== undefined) {
    request.inputMode = normalizeTextInputOverlayInputMode(input.inputMode, "inputMode");
  }

  if (input.themeToken !== undefined) {
    request.themeToken = normalizeThemeTokenName(input.themeToken, "themeToken");
  }

  if (input.commitAction !== undefined) {
    request.commitAction = normalizeActionRef(input.commitAction);
  }

  if (input.cancelAction !== undefined) {
    request.cancelAction = normalizeActionRef(input.cancelAction);
  }

  if (input.diagnosticPath !== undefined) {
    request.diagnosticPath = normalizeDiagnosticPath(input.diagnosticPath, "diagnosticPath");
  }

  return request;
}

/**
 * Normalizes a host text overlay snapshot and keeps IME state host-owned.
 *
 * @public
 */
export function normalizeTextInputOverlaySnapshot(
  input: TextInputOverlaySnapshotInput,
): TextInputOverlaySnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("TextInputOverlaySnapshot must be a plain object.");
  }

  const snapshot: MutableTextInputOverlaySnapshot = {
    overlayId: normalizeNonEmptyString(input.overlayId, "overlayId"),
    value: normalizeString(input.value, "value"),
    isComposing:
      input.isComposing === undefined ? false : normalizeBoolean(input.isComposing, "isComposing"),
  };

  if (input.nodeId !== undefined) {
    snapshot.nodeId = normalizeNonEmptyString(input.nodeId, "nodeId");
  }

  if (input.selection !== undefined) {
    snapshot.selection = normalizeTextInputOverlaySelection(input.selection, "selection");
  }

  if (input.compositionText !== undefined) {
    snapshot.compositionText = normalizeString(input.compositionText, "compositionText");
  }

  return snapshot;
}

/**
 * Normalizes a host text overlay capability report.
 *
 * @public
 */
export function normalizeTextInputOverlayCapability(
  input: TextInputOverlayCapability,
): TextInputOverlayCapability {
  if (!isPlainRecord(input)) {
    throw new TypeError("TextInputOverlayCapability must be a plain object.");
  }

  const capability: MutableTextInputOverlayCapability = {
    status: normalizeTextInputOverlayCapabilityStatus(input.status, "status"),
  };

  if (input.reason !== undefined) {
    capability.reason = normalizeTextInputOverlayLifecycleReason(input.reason, "reason");
  }

  if (input.diagnosticPath !== undefined) {
    capability.diagnosticPath = normalizeDiagnosticPath(input.diagnosticPath, "diagnosticPath");
  }

  if (input.message !== undefined) {
    capability.message = normalizeNonEmptyString(input.message, "message");
  }

  return capability;
}

function normalizeTextInputOverlaySelection(
  input: TextInputOverlaySelection,
  path: string,
): TextInputOverlaySelection {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${path} must be a plain object.`);
  }

  const start = normalizeSelectionOffset(input.start, `${path}.start`);
  const end = normalizeSelectionOffset(input.end, `${path}.end`);
  if (end < start) {
    throw new TypeError(`${path}.end must be greater than or equal to ${path}.start.`);
  }

  if (input.direction === undefined) {
    return { start, end };
  }

  return {
    start,
    end,
    direction: normalizeTextInputOverlaySelectionDirection(input.direction, `${path}.direction`),
  };
}

function normalizeTextInputOverlayInputMode(
  value: unknown,
  path: string,
): TextInputOverlayInputMode {
  if (typeof value === "string" && inputModes.has(value as TextInputOverlayInputMode)) {
    return value as TextInputOverlayInputMode;
  }

  throw new TypeError(`${path} must be a supported text input overlay input mode.`);
}

function normalizeTextInputOverlaySelectionDirection(
  value: unknown,
  path: string,
): TextInputOverlaySelectionDirection {
  if (
    typeof value === "string" &&
    selectionDirections.has(value as TextInputOverlaySelectionDirection)
  ) {
    return value as TextInputOverlaySelectionDirection;
  }

  throw new TypeError(`${path} must be none, forward, or backward.`);
}

function normalizeTextInputOverlayLifecycleReason(
  value: unknown,
  path: string,
): TextInputOverlayLifecycleReason {
  if (typeof value === "string" && lifecycleReasons.has(value as TextInputOverlayLifecycleReason)) {
    return value as TextInputOverlayLifecycleReason;
  }

  throw new TypeError(`${path} must be a supported text input overlay lifecycle reason.`);
}

function normalizeTextInputOverlayCapabilityStatus(
  value: unknown,
  path: string,
): TextInputOverlayCapabilityStatus {
  if (
    typeof value === "string" &&
    capabilityStatuses.has(value as TextInputOverlayCapabilityStatus)
  ) {
    return value as TextInputOverlayCapabilityStatus;
  }

  throw new TypeError(`${path} must be available, missing, disabled, or unsupported-renderer.`);
}

function normalizeResolvedRect(input: unknown, path: string): ResolvedRect {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${path} must be a plain object.`);
  }

  return {
    x: normalizeFiniteNumber(input.x, `${path}.x`),
    y: normalizeFiniteNumber(input.y, `${path}.y`),
    width: normalizeNonNegativeNumber(input.width, `${path}.width`),
    height: normalizeNonNegativeNumber(input.height, `${path}.height`),
  };
}

function normalizeSelectionOffset(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${path} must be a non-negative integer.`);
  }

  return value;
}

function normalizeFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${path} must be a finite number.`);
  }

  return value;
}

function normalizeNonNegativeNumber(value: unknown, path: string): number {
  const number = normalizeFiniteNumber(value, path);
  if (number < 0) {
    throw new TypeError(`${path} must be greater than or equal to 0.`);
  }

  return number;
}

function normalizeBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(`${path} must be a boolean.`);
  }

  return value;
}

function normalizeString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${path} must be a string.`);
  }

  return value;
}

function normalizeNonEmptyString(value: unknown, path: string): string {
  const text = normalizeString(value, path).trim();
  if (text.length === 0) {
    throw new TypeError(`${path} must not be empty.`);
  }

  return text;
}

function normalizeDiagnosticPath(value: readonly string[], path: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${path} must be an array of strings.`);
  }

  return value.map((segment, index) => normalizeNonEmptyString(segment, `${path}[${index}]`));
}

type MutableTextInputOverlayRequest = {
  -readonly [Key in keyof TextInputOverlayRequest]: TextInputOverlayRequest[Key];
};

type MutableTextInputOverlaySnapshot = {
  -readonly [Key in keyof TextInputOverlaySnapshot]: TextInputOverlaySnapshot[Key];
};

type MutableTextInputOverlayCapability = {
  -readonly [Key in keyof TextInputOverlayCapability]: TextInputOverlayCapability[Key];
};
