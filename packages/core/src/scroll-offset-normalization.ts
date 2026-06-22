import type { UiDiagnostic } from "./diagnostics.js";
import { createScrollDiagnostic } from "./scroll-diagnostics.js";
import {
  normalizeScrollContainerMetadata,
  normalizeScrollMetadataFrame,
  type ScrollContainerMetadata,
  type ScrollContainerMetadataInput,
  type ScrollMetadataFrameInput,
  type ScrollOffsetSnapshot,
} from "./scroll-metadata.js";

/**
 * Result of deterministic scroll offset normalization.
 *
 * @public
 */
export interface ScrollOffsetNormalizationResult {
  readonly containerId: string;
  readonly requestedOffset: ScrollOffsetSnapshot;
  readonly normalizedOffset: ScrollOffsetSnapshot;
  readonly maxOffset: ScrollOffsetSnapshot;
  readonly clamped: boolean;
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Result of restoring a host-owned scroll offset for a container id.
 *
 * @public
 */
export interface ScrollRestorationResult {
  readonly status: "restored" | "removed";
  readonly containerId: string;
  readonly offset?: ScrollOffsetNormalizationResult;
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Normalizes a scroll offset snapshot against serializable container metadata.
 *
 * @public
 */
export function normalizeScrollOffsetForContainer(
  containerInput: ScrollContainerMetadata | ScrollContainerMetadataInput,
  requestedOffsetInput?: Partial<ScrollOffsetSnapshot>,
): ScrollOffsetNormalizationResult {
  const container = normalizeScrollContainerMetadata(containerInput);
  const requestedOffset = normalizeRequestedOffset(requestedOffsetInput ?? container.offset);
  const maxOffset = calculateMaxOffset(container);
  const normalizedOffset = clampOffsetForAxis(container, requestedOffset, maxOffset);
  const diagnostics = collectContainerDiagnostics(container, requestedOffset, normalizedOffset);

  return {
    containerId: container.id,
    requestedOffset,
    normalizedOffset,
    maxOffset,
    clamped:
      requestedOffset.x !== normalizedOffset.x ||
      requestedOffset.y !== normalizedOffset.y ||
      requestedOffset.revision !== normalizedOffset.revision,
    diagnostics,
  };
}

/**
 * Resolves a restore request by container id without assuming the host still has that container.
 *
 * @public
 */
export function resolveScrollRestoration(
  frameInput: ScrollMetadataFrameInput,
  containerId: string,
  requestedOffsetInput?: Partial<ScrollOffsetSnapshot>,
): ScrollRestorationResult {
  const frame = normalizeScrollMetadataFrame(frameInput);
  const normalizedContainerId = normalizeNonEmptyString(
    containerId,
    "Scroll restoration containerId",
  );
  const container = frame.containers.find((candidate) => candidate.id === normalizedContainerId);

  if (container === undefined) {
    const diagnostic = createScrollDiagnostic("removedContainer", {
      containerId: normalizedContainerId,
    });

    return {
      status: "removed",
      containerId: normalizedContainerId,
      diagnostics: [diagnostic],
    };
  }

  const offset = normalizeScrollOffsetForContainer(container, requestedOffsetInput);

  return {
    status: "restored",
    containerId: normalizedContainerId,
    offset,
    diagnostics: offset.diagnostics,
  };
}

function collectContainerDiagnostics(
  container: ScrollContainerMetadata,
  requestedOffset: ScrollOffsetSnapshot,
  normalizedOffset: ScrollOffsetSnapshot,
): readonly UiDiagnostic[] {
  const diagnostics: UiDiagnostic[] = [];

  if (container.hostCapability.status === "missing") {
    diagnostics.push(
      createScrollDiagnostic("missingHostCapability", {
        containerId: container.id,
        capability: "host.scroll",
      }),
    );
  }

  if (container.disabledReason === "stale" || container.hostCapability.reason === "stale") {
    diagnostics.push(createScrollDiagnostic("staleContainer", { containerId: container.id }));
  }

  if (
    container.disabledReason !== undefined ||
    container.hostCapability.status === "disabled" ||
    container.hostCapability.status === "unsupported"
  ) {
    diagnostics.push(
      createScrollDiagnostic("disabledScroll", {
        containerId: container.id,
        reason: container.disabledReason ?? container.hostCapability.reason ?? "unsupported",
      }),
    );
  }

  if (container.extent.width === 0 || container.extent.height === 0) {
    diagnostics.push(createScrollDiagnostic("emptyContainer", { containerId: container.id }));
  }

  if (requestedOffset.x !== normalizedOffset.x || requestedOffset.y !== normalizedOffset.y) {
    diagnostics.push(
      createScrollDiagnostic("outOfRangeOffset", {
        containerId: container.id,
        requestedX: requestedOffset.x,
        requestedY: requestedOffset.y,
        normalizedX: normalizedOffset.x,
        normalizedY: normalizedOffset.y,
      }),
    );
  }

  return diagnostics;
}

function calculateMaxOffset(container: ScrollContainerMetadata): ScrollOffsetSnapshot {
  return {
    x: Math.max(0, container.extent.width - container.viewportRect.width),
    y: Math.max(0, container.extent.height - container.viewportRect.height),
  };
}

function clampOffsetForAxis(
  container: ScrollContainerMetadata,
  requestedOffset: ScrollOffsetSnapshot,
  maxOffset: ScrollOffsetSnapshot,
): ScrollOffsetSnapshot {
  const normalized: MutableScrollOffsetSnapshot = {
    x: container.axis === "y" ? 0 : clamp(requestedOffset.x, 0, maxOffset.x),
    y: container.axis === "x" ? 0 : clamp(requestedOffset.y, 0, maxOffset.y),
  };

  if (requestedOffset.revision !== undefined) {
    normalized.revision = requestedOffset.revision;
  }

  return normalized;
}

type MutableScrollOffsetSnapshot = {
  x: number;
  y: number;
  revision?: number;
};

function normalizeRequestedOffset(input: Partial<ScrollOffsetSnapshot>): ScrollOffsetSnapshot {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("Scroll requested offset must be a plain object.");
  }

  const offset: MutableScrollOffsetSnapshot = {
    x: normalizeFiniteNumber(input.x ?? 0, "Scroll requested offset.x"),
    y: normalizeFiniteNumber(input.y ?? 0, "Scroll requested offset.y"),
  };

  if (input.revision !== undefined) {
    offset.revision = normalizeRevision(input.revision);
  }

  return offset;
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

function normalizeRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError("Scroll requested offset.revision must be a non-negative integer.");
  }

  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
