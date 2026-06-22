import { isPlainRecord } from "./json-normalize.js";
import type { VirtualItemRange } from "./virtual-window-metadata.js";

/**
 * Host-provided overscan count around a fixed-size virtual window.
 *
 * @public
 */
export interface VirtualWindowOverscan {
  readonly before: number;
  readonly after: number;
}

/**
 * Input for deterministic fixed-size virtual window range calculation.
 *
 * @public
 */
export interface FixedVirtualWindowRangeInput {
  readonly totalCount: number;
  readonly itemExtent: number;
  readonly viewportExtent: number;
  readonly scrollOffset?: number;
  readonly overscan?: number | Partial<VirtualWindowOverscan>;
}

/**
 * Result of deterministic fixed-size virtual window range calculation.
 *
 * @public
 */
export interface FixedVirtualWindowRangeResult {
  readonly totalCount: number;
  readonly itemExtent: number;
  readonly viewportExtent: number;
  readonly estimatedContentExtent: number;
  readonly requestedOffset: number;
  readonly normalizedOffset: number;
  readonly maxOffset: number;
  readonly clamped: boolean;
  readonly visibleRange: VirtualItemRange;
  readonly realizedRange: VirtualItemRange;
  readonly overscanRange: VirtualItemRange;
  readonly overscan: VirtualWindowOverscan;
}

/**
 * Calculates a deterministic fixed-size virtual window from host-provided metadata only.
 *
 * @public
 */
export function calculateFixedVirtualWindowRange(
  input: FixedVirtualWindowRangeInput,
): FixedVirtualWindowRangeResult {
  if (!isPlainRecord(input)) {
    throw new TypeError("Fixed virtual window range input must be a plain object.");
  }

  const totalCount = normalizeNonNegativeInteger(input.totalCount, "Virtual window totalCount");
  const itemExtent = normalizePositiveNumber(input.itemExtent, "Virtual window itemExtent");
  const viewportExtent = normalizeNonNegativeNumber(
    input.viewportExtent,
    "Virtual window viewportExtent",
  );
  const requestedOffset = normalizeNonNegativeNumber(
    input.scrollOffset ?? 0,
    "Virtual window scrollOffset",
  );
  const overscan = normalizeOverscan(input.overscan ?? 0);
  const estimatedContentExtent = totalCount * itemExtent;
  const maxOffset = Math.max(0, estimatedContentExtent - viewportExtent);
  const normalizedOffset = clamp(requestedOffset, 0, maxOffset);

  const visibleRange =
    totalCount === 0 || viewportExtent === 0
      ? createEmptyRange(clampedStartIndex(normalizedOffset, itemExtent, totalCount))
      : createVisibleRange(totalCount, itemExtent, viewportExtent, normalizedOffset);
  const overscanRange = {
    startIndex: Math.max(0, visibleRange.startIndex - overscan.before),
    endIndex: Math.min(totalCount, visibleRange.endIndex + overscan.after),
  };

  return {
    totalCount,
    itemExtent,
    viewportExtent,
    estimatedContentExtent,
    requestedOffset,
    normalizedOffset,
    maxOffset,
    clamped: requestedOffset !== normalizedOffset,
    visibleRange,
    realizedRange: visibleRange,
    overscanRange,
    overscan,
  };
}

function createVisibleRange(
  totalCount: number,
  itemExtent: number,
  viewportExtent: number,
  offset: number,
): VirtualItemRange {
  const startIndex = clampedStartIndex(offset, itemExtent, totalCount);
  const endIndex = Math.min(totalCount, Math.ceil((offset + viewportExtent) / itemExtent));

  return {
    startIndex,
    endIndex: Math.max(startIndex, endIndex),
  };
}

function createEmptyRange(startIndex: number): VirtualItemRange {
  return {
    startIndex,
    endIndex: startIndex,
  };
}

function clampedStartIndex(offset: number, itemExtent: number, totalCount: number): number {
  if (totalCount === 0) {
    return 0;
  }

  return Math.min(totalCount, Math.floor(offset / itemExtent));
}

function normalizeOverscan(value: number | Partial<VirtualWindowOverscan>): VirtualWindowOverscan {
  if (typeof value === "number") {
    const count = normalizeNonNegativeInteger(value, "Virtual window overscan");
    return {
      before: count,
      after: count,
    };
  }

  if (!isPlainRecord(value)) {
    throw new TypeError("Virtual window overscan must be a number or plain object.");
  }

  return {
    before: normalizeNonNegativeInteger(value.before ?? 0, "Virtual window overscan.before"),
    after: normalizeNonNegativeInteger(value.after ?? 0, "Virtual window overscan.after"),
  };
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
