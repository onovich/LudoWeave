import { isPlainRecord } from "./json-normalize.js";
import type { ResolvedRect } from "./resolved-frame.js";

/**
 * Scroll axes described by LudoWeave metadata.
 *
 * @public
 */
export type ScrollAxis = "x" | "y" | "both";

/**
 * Stable reason why a scroll container is present but unavailable.
 *
 * @public
 */
export type ScrollDisabledReason =
  | "empty-container"
  | "host-disabled"
  | "missing-capability"
  | "stale"
  | "unsupported";

/**
 * Host capability status for a scroll container.
 *
 * @public
 */
export type ScrollHostCapabilityStatus = "available" | "disabled" | "missing" | "unsupported";

/**
 * Host-owned capability snapshot for scroll coordination.
 *
 * @public
 */
export interface ScrollHostCapability {
  readonly status: ScrollHostCapabilityStatus;
  readonly reason?: ScrollDisabledReason;
}

/**
 * Host-owned scroll offset snapshot in CSS pixel units.
 *
 * @public
 */
export interface ScrollOffsetSnapshot {
  readonly x: number;
  readonly y: number;
  readonly revision?: number;
}

/**
 * Total scrollable content extent in CSS pixel units.
 *
 * @public
 */
export interface ScrollExtent {
  readonly width: number;
  readonly height: number;
}

/**
 * Serializable scroll container metadata derived from resolved runtime UI geometry.
 *
 * @public
 */
export interface ScrollContainerMetadata {
  readonly id: string;
  readonly nodeId: string;
  readonly contentRect: ResolvedRect;
  readonly viewportRect: ResolvedRect;
  readonly axis: ScrollAxis;
  readonly offset: ScrollOffsetSnapshot;
  readonly extent: ScrollExtent;
  readonly hostCapability: ScrollHostCapability;
  readonly disabledReason?: ScrollDisabledReason;
}

/**
 * Authoring input for {@link normalizeScrollContainerMetadata}.
 *
 * @public
 */
export interface ScrollContainerMetadataInput {
  readonly id: string;
  readonly nodeId?: string;
  readonly contentRect: ResolvedRect;
  readonly viewportRect: ResolvedRect;
  readonly axis?: ScrollAxis;
  readonly offset?: Partial<ScrollOffsetSnapshot>;
  readonly extent?: Partial<ScrollExtent>;
  readonly hostCapability?: Partial<ScrollHostCapability>;
  readonly disabledReason?: ScrollDisabledReason;
}

/**
 * Serializable scroll metadata attached to a resolved frame or fixture.
 *
 * @public
 */
export interface ScrollMetadataFrame {
  readonly containers: readonly ScrollContainerMetadata[];
  readonly activeContainerId?: string;
  readonly restoreContainerId?: string;
}

/**
 * Authoring input for {@link normalizeScrollMetadataFrame}.
 *
 * @public
 */
export interface ScrollMetadataFrameInput {
  readonly containers: readonly ScrollContainerMetadataInput[];
  readonly activeContainerId?: string;
  readonly restoreContainerId?: string;
}

/**
 * Normalizes one scroll container without reading platform scroll or input state.
 *
 * @public
 */
export function normalizeScrollContainerMetadata(
  input: ScrollContainerMetadataInput,
): ScrollContainerMetadata {
  if (!isPlainRecord(input)) {
    throw new TypeError("Scroll container metadata input must be a plain object.");
  }

  const metadata: MutableScrollContainerMetadata = {
    id: normalizeNonEmptyString(input.id, "Scroll container id"),
    nodeId: normalizeNonEmptyString(input.nodeId ?? input.id, "Scroll container nodeId"),
    contentRect: normalizeResolvedRect(input.contentRect, "Scroll container contentRect"),
    viewportRect: normalizeResolvedRect(input.viewportRect, "Scroll container viewportRect"),
    axis: normalizeScrollAxis(input.axis ?? "y"),
    offset: normalizeOffsetSnapshot(input.offset ?? {}),
    extent: normalizeExtent(input.extent ?? input.contentRect, "Scroll container extent"),
    hostCapability: normalizeHostCapability(input.hostCapability ?? {}),
  };

  if (input.disabledReason !== undefined) {
    metadata.disabledReason = normalizeDisabledReason(input.disabledReason);
  }

  return metadata;
}

/**
 * Normalizes scroll metadata and validates container references while keeping the host as scroll owner.
 *
 * @public
 */
export function normalizeScrollMetadataFrame(input: ScrollMetadataFrameInput): ScrollMetadataFrame {
  if (!isPlainRecord(input)) {
    throw new TypeError("Scroll metadata frame input must be a plain object.");
  }

  if (!Array.isArray(input.containers)) {
    throw new TypeError("Scroll metadata containers must be an array.");
  }

  const containers = input.containers.map((container) =>
    normalizeScrollContainerMetadata(container),
  );
  const ids = new Set<string>();

  for (const container of containers) {
    if (ids.has(container.id)) {
      throw new TypeError(`Scroll container id "${container.id}" must be unique.`);
    }
    ids.add(container.id);
  }

  const metadata: MutableScrollMetadataFrame = {
    containers,
  };

  if (input.activeContainerId !== undefined) {
    metadata.activeContainerId = normalizeContainerReference(
      input.activeContainerId,
      ids,
      "activeContainerId",
    );
  }

  if (input.restoreContainerId !== undefined) {
    metadata.restoreContainerId = normalizeContainerReference(
      input.restoreContainerId,
      ids,
      "restoreContainerId",
    );
  }

  return metadata;
}

type MutableScrollContainerMetadata = {
  id: string;
  nodeId: string;
  contentRect: ResolvedRect;
  viewportRect: ResolvedRect;
  axis: ScrollAxis;
  offset: ScrollOffsetSnapshot;
  extent: ScrollExtent;
  hostCapability: ScrollHostCapability;
  disabledReason?: ScrollDisabledReason;
};

type MutableScrollMetadataFrame = {
  containers: readonly ScrollContainerMetadata[];
  activeContainerId?: string;
  restoreContainerId?: string;
};

const scrollAxes = ["x", "y", "both"] as const;
const disabledReasons = [
  "empty-container",
  "host-disabled",
  "missing-capability",
  "stale",
  "unsupported",
] as const;
const capabilityStatuses = ["available", "disabled", "missing", "unsupported"] as const;

function normalizeScrollAxis(value: unknown): ScrollAxis {
  if (scrollAxes.includes(value as ScrollAxis)) {
    return value as ScrollAxis;
  }

  throw new TypeError("Scroll container axis must be a supported axis.");
}

function normalizeHostCapability(input: Partial<ScrollHostCapability>): ScrollHostCapability {
  if (!isPlainRecord(input)) {
    throw new TypeError("Scroll container hostCapability must be a plain object.");
  }

  const capability: MutableScrollHostCapability = {
    status: normalizeCapabilityStatus(input.status ?? "available"),
  };

  if (input.reason !== undefined) {
    capability.reason = normalizeDisabledReason(input.reason);
  }

  return capability;
}

type MutableScrollHostCapability = {
  status: ScrollHostCapabilityStatus;
  reason?: ScrollDisabledReason;
};

function normalizeCapabilityStatus(value: unknown): ScrollHostCapabilityStatus {
  if (capabilityStatuses.includes(value as ScrollHostCapabilityStatus)) {
    return value as ScrollHostCapabilityStatus;
  }

  throw new TypeError("Scroll container hostCapability.status must be a supported status.");
}

function normalizeOffsetSnapshot(input: Partial<ScrollOffsetSnapshot>): ScrollOffsetSnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("Scroll container offset must be a plain object.");
  }

  const snapshot: MutableScrollOffsetSnapshot = {
    x: normalizeFiniteNumber(input.x ?? 0, "Scroll container offset.x"),
    y: normalizeFiniteNumber(input.y ?? 0, "Scroll container offset.y"),
  };

  if (input.revision !== undefined) {
    snapshot.revision = normalizeRevision(input.revision);
  }

  return snapshot;
}

type MutableScrollOffsetSnapshot = {
  x: number;
  y: number;
  revision?: number;
};

function normalizeExtent(input: Partial<ScrollExtent>, label: string): ScrollExtent {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  return {
    width: normalizeNonNegativeNumber(input.width ?? 0, `${label}.width`),
    height: normalizeNonNegativeNumber(input.height ?? 0, `${label}.height`),
  };
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

function normalizeDisabledReason(value: unknown): ScrollDisabledReason {
  if (disabledReasons.includes(value as ScrollDisabledReason)) {
    return value as ScrollDisabledReason;
  }

  throw new TypeError("Scroll container disabled reason must be a supported reason.");
}

function normalizeContainerReference(
  value: string,
  ids: ReadonlySet<string>,
  label: string,
): string {
  const id = normalizeNonEmptyString(value, `Scroll metadata ${label}`);
  if (!ids.has(id)) {
    throw new TypeError(`Scroll metadata ${label} must reference an existing container.`);
  }
  return id;
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

function normalizeRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError("Scroll container offset.revision must be a non-negative integer.");
  }

  return value;
}
