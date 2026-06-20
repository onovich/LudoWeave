import type { JsonValue } from "./json-value.js";

/**
 * Serializable action emitted by LudoWeave UI and interpreted by the host.
 *
 * @public
 */
export interface ActionRef {
  /**
   * Stable host-owned action namespace, such as `runtime.gameplay.interact`.
   */
  readonly type: string;
  /**
   * Optional serializable data passed back to the host action registry.
   */
  readonly payload?: Readonly<Record<string, JsonValue>>;
}

/**
 * Authoring-time action shorthand accepted before frame/action-log normalization.
 *
 * @public
 */
export type ActionRefInput = string | ActionRef;

/**
 * Converts action shorthand into a serializable {@link ActionRef}.
 *
 * @public
 */
export function normalizeActionRef(input: ActionRefInput): ActionRef {
  if (typeof input === "string") {
    return { type: normalizeActionType(input) };
  }

  if (!isPlainRecord(input)) {
    throw new TypeError("ActionRef must be a string or plain object.");
  }

  const type = normalizeActionType(input.type);
  if (!Object.hasOwn(input, "payload")) {
    return { type };
  }

  const payload = input.payload;
  if (!isPlainRecord(payload)) {
    throw new TypeError("ActionRef payload must be a plain JSON object.");
  }

  return {
    type,
    payload: normalizeJsonObject(payload, "payload", new WeakSet<object>()),
  };
}

function normalizeActionType(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("ActionRef type must be a string.");
  }

  const type = value.trim();
  if (type.length === 0) {
    throw new TypeError("ActionRef type must not be empty.");
  }

  return type;
}

function normalizeJsonValue(value: unknown, path: string, seen: WeakSet<object>): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} must be a finite JSON number.`);
    }
    return value;
  }

  if (Array.isArray(value)) {
    guardCircular(value, path, seen);
    return value.map((entry, index) => normalizeJsonValue(entry, `${path}[${index}]`, seen));
  }

  if (isPlainRecord(value)) {
    return normalizeJsonObject(value, path, seen);
  }

  throw new TypeError(`${path} must be a JsonValue.`);
}

function normalizeJsonObject(
  value: Record<string, unknown>,
  path: string,
  seen: WeakSet<object>,
): Readonly<Record<string, JsonValue>> {
  guardCircular(value, path, seen);

  const normalized: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    normalized[key] = normalizeJsonValue(child, `${path}.${key}`, seen);
  }

  return normalized;
}

function guardCircular(value: object, path: string, seen: WeakSet<object>): void {
  if (seen.has(value)) {
    throw new TypeError(`${path} must not contain circular references.`);
  }
  seen.add(value);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
