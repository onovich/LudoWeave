import type { JsonValue } from "./json-value.js";
import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";

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
    payload: normalizeJsonObject(payload, "payload"),
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
