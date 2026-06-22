import type { ActionRef, ActionRefInput } from "./action-ref.js";
import { normalizeActionRef } from "./action-ref.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import type { ScrollAxis, ScrollOffsetSnapshot } from "./scroll-metadata.js";

/**
 * Host-owned scroll intent category after physical input has already been interpreted.
 *
 * @public
 */
export type HostScrollIntentKind = "line" | "page" | "edge" | "restore";

/**
 * Directional host scroll movement names.
 *
 * @public
 */
export type HostScrollIntentDirection = "up" | "down" | "left" | "right";

/**
 * Logical edge used by host-owned scroll routing.
 *
 * @public
 */
export type HostScrollIntentEdge = "start" | "end";

/**
 * Serializable scroll intent after the host has interpreted devices, bindings, and policy.
 *
 * @public
 */
export interface HostScrollIntent {
  readonly kind: HostScrollIntentKind;
  readonly handoff: "host";
  readonly containerId: string;
  readonly axis: ScrollAxis;
  readonly repeat: boolean;
  readonly direction?: HostScrollIntentDirection;
  readonly edge?: HostScrollIntentEdge;
  readonly restoreOffset?: ScrollOffsetSnapshot;
  readonly action: ActionRef;
}

/**
 * Authoring input for {@link normalizeHostScrollIntent}.
 *
 * @public
 */
export interface HostScrollIntentInput {
  readonly kind: HostScrollIntentKind;
  readonly containerId: string;
  readonly axis?: ScrollAxis;
  readonly repeat?: boolean;
  readonly direction?: HostScrollIntentDirection;
  readonly edge?: HostScrollIntentEdge;
  readonly restoreOffset?: Partial<ScrollOffsetSnapshot>;
  readonly action?: ActionRefInput;
}

/**
 * Normalizes a host-owned scroll intent without accepting native events or callbacks.
 *
 * @public
 */
export function normalizeHostScrollIntent(input: HostScrollIntentInput): HostScrollIntent {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host scroll intent must be a plain object.");
  }

  const kind = normalizeIntentKind(input.kind);
  const axis = normalizeAxis(input.axis ?? inferAxis(input.direction));
  const intent: MutableHostScrollIntent = {
    kind,
    handoff: "host",
    containerId: normalizeNonEmptyString(input.containerId, "Host scroll intent containerId"),
    axis,
    repeat: input.repeat ?? false,
  };

  if (kind === "line" || kind === "page") {
    intent.direction = normalizeDirection(input.direction);
  } else if (input.direction !== undefined) {
    throw new TypeError("Host scroll intent direction is only valid for line/page intents.");
  }

  if (kind === "edge") {
    intent.edge = normalizeEdge(input.edge);
  } else if (input.edge !== undefined) {
    throw new TypeError("Host scroll intent edge is only valid for edge intents.");
  }

  if (kind === "restore") {
    intent.restoreOffset = normalizeRestoreOffset(input.restoreOffset);
  } else if (input.restoreOffset !== undefined) {
    throw new TypeError("Host scroll intent restoreOffset is only valid for restore intents.");
  }

  const action =
    input.action !== undefined
      ? normalizeActionRef(input.action)
      : createHostScrollIntentActionRef(intent);

  return {
    ...intent,
    action,
  };
}

/**
 * Creates the default ActionRef payload for a normalized host scroll intent.
 *
 * @public
 */
export function createHostScrollIntentActionRef(
  intent: Omit<HostScrollIntent, "action">,
): ActionRef {
  const payload: Record<string, JsonValue> = {
    kind: intent.kind,
    containerId: intent.containerId,
    axis: intent.axis,
    repeat: intent.repeat,
  };

  if (intent.direction !== undefined) {
    payload.direction = intent.direction;
  }

  if (intent.edge !== undefined) {
    payload.edge = intent.edge;
  }

  if (intent.restoreOffset !== undefined) {
    payload.restoreOffset = {
      x: intent.restoreOffset.x,
      y: intent.restoreOffset.y,
      ...(intent.restoreOffset.revision !== undefined
        ? { revision: intent.restoreOffset.revision }
        : {}),
    };
  }

  return {
    type: "runtime.scroll.intent",
    payload,
  };
}

type MutableHostScrollIntent = {
  kind: HostScrollIntentKind;
  handoff: "host";
  containerId: string;
  axis: ScrollAxis;
  repeat: boolean;
  direction?: HostScrollIntentDirection;
  edge?: HostScrollIntentEdge;
  restoreOffset?: ScrollOffsetSnapshot;
};

const intentKinds = ["line", "page", "edge", "restore"] as const;
const directions = ["up", "down", "left", "right"] as const;
const axes = ["x", "y", "both"] as const;
const edges = ["start", "end"] as const;

function normalizeIntentKind(value: unknown): HostScrollIntentKind {
  if (intentKinds.includes(value as HostScrollIntentKind)) {
    return value as HostScrollIntentKind;
  }

  throw new TypeError("Host scroll intent kind must be supported.");
}

function normalizeDirection(value: unknown): HostScrollIntentDirection {
  if (directions.includes(value as HostScrollIntentDirection)) {
    return value as HostScrollIntentDirection;
  }

  throw new TypeError("Host scroll intent direction must be supported.");
}

function normalizeEdge(value: unknown): HostScrollIntentEdge {
  if (edges.includes(value as HostScrollIntentEdge)) {
    return value as HostScrollIntentEdge;
  }

  throw new TypeError("Host scroll intent edge must be supported.");
}

function normalizeAxis(value: unknown): ScrollAxis {
  if (axes.includes(value as ScrollAxis)) {
    return value as ScrollAxis;
  }

  throw new TypeError("Host scroll intent axis must be supported.");
}

function inferAxis(direction: HostScrollIntentDirection | undefined): ScrollAxis {
  if (direction === "left" || direction === "right") {
    return "x";
  }

  return "y";
}

function normalizeRestoreOffset(
  input: Partial<ScrollOffsetSnapshot> | undefined,
): ScrollOffsetSnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host scroll intent restoreOffset must be a plain object.");
  }

  const offset: MutableRestoreOffset = {
    x: normalizeFiniteNumber(input.x ?? 0, "Host scroll intent restoreOffset.x"),
    y: normalizeFiniteNumber(input.y ?? 0, "Host scroll intent restoreOffset.y"),
  };

  if (input.revision !== undefined) {
    offset.revision = normalizeRevision(input.revision);
  }

  return offset;
}

type MutableRestoreOffset = {
  x: number;
  y: number;
  revision?: number;
};

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
    throw new TypeError(
      "Host scroll intent restoreOffset.revision must be a non-negative integer.",
    );
  }

  return value;
}
