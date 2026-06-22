import { normalizeUiDiagnostic, type UiDiagnostic, type UiDiagnosticInput } from "./diagnostics.js";
import { isPlainRecord } from "./json-normalize.js";
import type { ResolvedRect } from "./resolved-frame.js";

/**
 * Stable reason why a virtual window is present but unavailable.
 *
 * @public
 */
export type VirtualWindowDisabledReason =
  | "empty-list"
  | "host-disabled"
  | "missing-capability"
  | "stale"
  | "unsupported";

/**
 * Host capability status for virtual list coordination.
 *
 * @public
 */
export type VirtualWindowHostCapabilityStatus =
  | "available"
  | "disabled"
  | "missing"
  | "unsupported";

/**
 * Host-owned capability snapshot for virtual list coordination.
 *
 * @public
 */
export interface VirtualWindowHostCapability {
  readonly status: VirtualWindowHostCapabilityStatus;
  readonly reason?: VirtualWindowDisabledReason;
}

/**
 * Half-open item range. startIndex is inclusive; endIndex is exclusive.
 *
 * @public
 */
export interface VirtualItemRange {
  readonly startIndex: number;
  readonly endIndex: number;
}

/**
 * Host-provided estimated item size in CSS pixel units.
 *
 * @public
 */
export interface VirtualItemSizeEstimate {
  readonly width: number;
  readonly height: number;
}

/**
 * Host-owned selection snapshot for a virtual window.
 *
 * @public
 */
export interface VirtualSelectionSnapshot {
  readonly selectedKey?: string;
  readonly focusedKey?: string;
  readonly anchorKey?: string;
  readonly revision?: number;
}

/**
 * Serializable virtual window metadata derived from a host-selected list window.
 *
 * @public
 */
export interface VirtualWindowMetadata {
  readonly id: string;
  readonly nodeId: string;
  readonly itemKeyNamespace: string;
  readonly totalCount: number;
  readonly realizedRange: VirtualItemRange;
  readonly overscanRange: VirtualItemRange;
  readonly estimatedItemSize: VirtualItemSizeEstimate;
  readonly hostCapability: VirtualWindowHostCapability;
  readonly selection: VirtualSelectionSnapshot;
  readonly viewportRect?: ResolvedRect;
  readonly scrollContainerId?: string;
  readonly disabledReason?: VirtualWindowDisabledReason;
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Authoring input for {@link normalizeVirtualWindowMetadata}.
 *
 * @public
 */
export interface VirtualWindowMetadataInput {
  readonly id: string;
  readonly nodeId?: string;
  readonly itemKeyNamespace: string;
  readonly totalCount: number;
  readonly realizedRange: VirtualItemRange;
  readonly overscanRange?: VirtualItemRange;
  readonly estimatedItemSize: Partial<VirtualItemSizeEstimate>;
  readonly hostCapability?: Partial<VirtualWindowHostCapability>;
  readonly selection?: Partial<VirtualSelectionSnapshot>;
  readonly viewportRect?: ResolvedRect;
  readonly scrollContainerId?: string;
  readonly disabledReason?: VirtualWindowDisabledReason;
  readonly diagnostics?: readonly UiDiagnosticInput[];
}

/**
 * Serializable virtual window metadata attached to a resolved frame or fixture.
 *
 * @public
 */
export interface VirtualWindowMetadataFrame {
  readonly windows: readonly VirtualWindowMetadata[];
  readonly activeWindowId?: string;
  readonly restoreWindowId?: string;
}

/**
 * Authoring input for {@link normalizeVirtualWindowMetadataFrame}.
 *
 * @public
 */
export interface VirtualWindowMetadataFrameInput {
  readonly windows: readonly VirtualWindowMetadataInput[];
  readonly activeWindowId?: string;
  readonly restoreWindowId?: string;
}

/**
 * Normalizes one virtual window without reading collection data, DOM measurement, or platform state.
 *
 * @public
 */
export function normalizeVirtualWindowMetadata(
  input: VirtualWindowMetadataInput,
): VirtualWindowMetadata {
  if (!isPlainRecord(input)) {
    throw new TypeError("Virtual window metadata input must be a plain object.");
  }

  const metadata: MutableVirtualWindowMetadata = {
    id: normalizeNonEmptyString(input.id, "Virtual window id"),
    nodeId: normalizeNonEmptyString(input.nodeId ?? input.id, "Virtual window nodeId"),
    itemKeyNamespace: normalizeNonEmptyString(
      input.itemKeyNamespace,
      "Virtual window itemKeyNamespace",
    ),
    totalCount: normalizeNonNegativeInteger(input.totalCount, "Virtual window totalCount"),
    realizedRange: normalizeRange(input.realizedRange, "Virtual window realizedRange"),
    overscanRange: normalizeRange(
      input.overscanRange ?? input.realizedRange,
      "Virtual window overscanRange",
    ),
    estimatedItemSize: normalizeItemSize(
      input.estimatedItemSize,
      "Virtual window estimatedItemSize",
    ),
    hostCapability: normalizeHostCapability(input.hostCapability ?? {}),
    selection: normalizeSelectionSnapshot(input.selection ?? {}),
    diagnostics: normalizeDiagnostics(input.diagnostics ?? []),
  };

  if (input.viewportRect !== undefined) {
    metadata.viewportRect = normalizeResolvedRect(
      input.viewportRect,
      "Virtual window viewportRect",
    );
  }

  if (input.scrollContainerId !== undefined) {
    metadata.scrollContainerId = normalizeNonEmptyString(
      input.scrollContainerId,
      "Virtual window scrollContainerId",
    );
  }

  if (input.disabledReason !== undefined) {
    metadata.disabledReason = normalizeDisabledReason(input.disabledReason);
  }

  assertRangeWithinTotalCount(metadata.realizedRange, metadata.totalCount, "realizedRange");
  assertRangeWithinTotalCount(metadata.overscanRange, metadata.totalCount, "overscanRange");
  if (
    metadata.overscanRange.startIndex > metadata.realizedRange.startIndex ||
    metadata.overscanRange.endIndex < metadata.realizedRange.endIndex
  ) {
    throw new TypeError("Virtual window overscanRange must contain realizedRange.");
  }

  return metadata;
}

/**
 * Normalizes virtual window metadata and validates active/restore references.
 *
 * @public
 */
export function normalizeVirtualWindowMetadataFrame(
  input: VirtualWindowMetadataFrameInput,
): VirtualWindowMetadataFrame {
  if (!isPlainRecord(input)) {
    throw new TypeError("Virtual window metadata frame input must be a plain object.");
  }

  if (!Array.isArray(input.windows)) {
    throw new TypeError("Virtual window metadata windows must be an array.");
  }

  const windows = input.windows.map((window) => normalizeVirtualWindowMetadata(window));
  const ids = new Set<string>();

  for (const window of windows) {
    if (ids.has(window.id)) {
      throw new TypeError(`Virtual window id "${window.id}" must be unique.`);
    }
    ids.add(window.id);
  }

  const metadata: MutableVirtualWindowMetadataFrame = {
    windows,
  };

  if (input.activeWindowId !== undefined) {
    metadata.activeWindowId = normalizeWindowReference(input.activeWindowId, ids, "activeWindowId");
  }

  if (input.restoreWindowId !== undefined) {
    metadata.restoreWindowId = normalizeWindowReference(
      input.restoreWindowId,
      ids,
      "restoreWindowId",
    );
  }

  return metadata;
}

type MutableVirtualWindowMetadata = {
  id: string;
  nodeId: string;
  itemKeyNamespace: string;
  totalCount: number;
  realizedRange: VirtualItemRange;
  overscanRange: VirtualItemRange;
  estimatedItemSize: VirtualItemSizeEstimate;
  hostCapability: VirtualWindowHostCapability;
  selection: VirtualSelectionSnapshot;
  viewportRect?: ResolvedRect;
  scrollContainerId?: string;
  disabledReason?: VirtualWindowDisabledReason;
  diagnostics: readonly UiDiagnostic[];
};

type MutableVirtualWindowMetadataFrame = {
  windows: readonly VirtualWindowMetadata[];
  activeWindowId?: string;
  restoreWindowId?: string;
};

const disabledReasons = [
  "empty-list",
  "host-disabled",
  "missing-capability",
  "stale",
  "unsupported",
] as const;
const capabilityStatuses = ["available", "disabled", "missing", "unsupported"] as const;

function normalizeHostCapability(
  input: Partial<VirtualWindowHostCapability>,
): VirtualWindowHostCapability {
  if (!isPlainRecord(input)) {
    throw new TypeError("Virtual window hostCapability must be a plain object.");
  }

  const capability: MutableVirtualWindowHostCapability = {
    status: normalizeCapabilityStatus(input.status ?? "available"),
  };

  if (input.reason !== undefined) {
    capability.reason = normalizeDisabledReason(input.reason);
  }

  return capability;
}

type MutableVirtualWindowHostCapability = {
  status: VirtualWindowHostCapabilityStatus;
  reason?: VirtualWindowDisabledReason;
};

function normalizeCapabilityStatus(value: unknown): VirtualWindowHostCapabilityStatus {
  if (capabilityStatuses.includes(value as VirtualWindowHostCapabilityStatus)) {
    return value as VirtualWindowHostCapabilityStatus;
  }

  throw new TypeError("Virtual window hostCapability.status must be a supported status.");
}

function normalizeRange(input: VirtualItemRange, label: string): VirtualItemRange {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  const range = {
    startIndex: normalizeNonNegativeInteger(input.startIndex, `${label}.startIndex`),
    endIndex: normalizeNonNegativeInteger(input.endIndex, `${label}.endIndex`),
  };

  if (range.endIndex < range.startIndex) {
    throw new TypeError(`${label}.endIndex must be greater than or equal to startIndex.`);
  }

  return range;
}

function normalizeItemSize(
  input: Partial<VirtualItemSizeEstimate>,
  label: string,
): VirtualItemSizeEstimate {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  return {
    width: normalizePositiveNumber(input.width, `${label}.width`),
    height: normalizePositiveNumber(input.height, `${label}.height`),
  };
}

function normalizeSelectionSnapshot(
  input: Partial<VirtualSelectionSnapshot>,
): VirtualSelectionSnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("Virtual window selection must be a plain object.");
  }

  const selection: MutableVirtualSelectionSnapshot = {};

  if (input.selectedKey !== undefined) {
    selection.selectedKey = normalizeNonEmptyString(
      input.selectedKey,
      "Virtual window selectedKey",
    );
  }

  if (input.focusedKey !== undefined) {
    selection.focusedKey = normalizeNonEmptyString(input.focusedKey, "Virtual window focusedKey");
  }

  if (input.anchorKey !== undefined) {
    selection.anchorKey = normalizeNonEmptyString(input.anchorKey, "Virtual window anchorKey");
  }

  if (input.revision !== undefined) {
    selection.revision = normalizeNonNegativeInteger(
      input.revision,
      "Virtual window selection.revision",
    );
  }

  return selection;
}

type MutableVirtualSelectionSnapshot = {
  selectedKey?: string;
  focusedKey?: string;
  anchorKey?: string;
  revision?: number;
};

function normalizeDiagnostics(input: readonly UiDiagnosticInput[]): readonly UiDiagnostic[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Virtual window diagnostics must be an array.");
  }

  return input.map((diagnostic) => normalizeUiDiagnostic(diagnostic));
}

function normalizeResolvedRect(input: ResolvedRect, label: string): ResolvedRect {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  return {
    x: normalizeFiniteNumber(input.x, `${label}.x`),
    y: normalizeFiniteNumber(input.y, `${label}.y`),
    width: normalizeNonNegativeNumber(input.width, `${label}.width`),
    height: normalizeNonNegativeNumber(input.height, `${label}.height`),
  };
}

function normalizeDisabledReason(value: unknown): VirtualWindowDisabledReason {
  if (disabledReasons.includes(value as VirtualWindowDisabledReason)) {
    return value as VirtualWindowDisabledReason;
  }

  throw new TypeError("Virtual window disabled reason must be a supported reason.");
}

function normalizeWindowReference(value: string, ids: ReadonlySet<string>, label: string): string {
  const id = normalizeNonEmptyString(value, `Virtual window metadata ${label}`);
  if (!ids.has(id)) {
    throw new TypeError(`Virtual window metadata ${label} must reference an existing window.`);
  }
  return id;
}

function assertRangeWithinTotalCount(
  range: VirtualItemRange,
  totalCount: number,
  label: string,
): void {
  if (range.endIndex > totalCount) {
    throw new TypeError(`Virtual window ${label}.endIndex must be within totalCount.`);
  }
}

function normalizeNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }

  return normalized;
}

function normalizeFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }

  return value;
}

function normalizeNonNegativeNumber(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (number < 0) {
    throw new TypeError(`${label} must be greater than or equal to 0.`);
  }

  return number;
}

function normalizePositiveNumber(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (number <= 0) {
    throw new TypeError(`${label} must be greater than 0.`);
  }

  return number;
}

function normalizeNonNegativeInteger(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (!Number.isInteger(number) || number < 0) {
    throw new TypeError(`${label} must be a non-negative integer.`);
  }

  return number;
}
