import type { FocusDirection } from "./focus-graph.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";

/**
 * Host-owned runtime UI input intent category.
 *
 * @public
 */
export type HostInputIntentKind =
  | "confirm"
  | "cancel"
  | "navigate"
  | "next"
  | "previous"
  | "pause"
  | "menu";

/**
 * Serializable input intent after the host has interpreted physical devices and bindings.
 *
 * @public
 */
export interface HostInputIntent {
  readonly kind: HostInputIntentKind;
  readonly handoff: "host";
  readonly direction?: FocusDirection;
  readonly scopeId?: string;
  readonly focusId?: string;
  readonly repeat: boolean;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}

/**
 * Authoring input for {@link normalizeHostInputIntent}.
 *
 * @public
 */
export interface HostInputIntentInput {
  readonly kind: HostInputIntentKind;
  readonly direction?: FocusDirection;
  readonly scopeId?: string;
  readonly focusId?: string;
  readonly repeat?: boolean;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}

/**
 * Normalizes a host-owned input intent without accepting native events or callbacks.
 *
 * @public
 */
export function normalizeHostInputIntent(input: HostInputIntentInput): HostInputIntent {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host input intent must be a plain object.");
  }

  const kind = normalizeIntentKind(input.kind);
  const intent: MutableHostInputIntent = {
    kind,
    handoff: "host",
    repeat: input.repeat ?? false,
  };

  if (kind === "navigate") {
    intent.direction = normalizeDirection(input.direction);
  } else if (input.direction !== undefined) {
    throw new TypeError("Host input intent direction is only valid for navigate intents.");
  }

  if (input.scopeId !== undefined) {
    intent.scopeId = normalizeNonEmptyString(input.scopeId, "Host input intent scopeId");
  }

  if (input.focusId !== undefined) {
    intent.focusId = normalizeNonEmptyString(input.focusId, "Host input intent focusId");
  }

  if (input.payload !== undefined) {
    if (!isPlainRecord(input.payload)) {
      throw new TypeError("Host input intent payload must be a plain JSON object.");
    }
    intent.payload = normalizeJsonObject(input.payload, "payload");
  }

  return intent;
}

type MutableHostInputIntent = {
  kind: HostInputIntentKind;
  handoff: "host";
  direction?: FocusDirection;
  scopeId?: string;
  focusId?: string;
  repeat: boolean;
  payload?: Readonly<Record<string, JsonValue>>;
};

const intentKinds = ["confirm", "cancel", "navigate", "next", "previous", "pause", "menu"] as const;
const directions = ["up", "down", "left", "right"] as const;

function normalizeIntentKind(value: unknown): HostInputIntentKind {
  if (intentKinds.includes(value as HostInputIntentKind)) {
    return value as HostInputIntentKind;
  }

  throw new TypeError("Host input intent kind must be supported.");
}

function normalizeDirection(value: unknown): FocusDirection {
  if (directions.includes(value as FocusDirection)) {
    return value as FocusDirection;
  }

  throw new TypeError("Host input intent navigate direction must be supported.");
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
