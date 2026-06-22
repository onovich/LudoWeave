import type { ActionRef, ActionRefInput } from "./action-ref.js";
import { normalizeActionRef } from "./action-ref.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import type { VirtualItemRange, VirtualSelectionSnapshot } from "./virtual-window-metadata.js";

/**
 * Host-owned collection/window intent category after datasource and input policy have been interpreted.
 *
 * @public
 */
export type HostCollectionIntentKind =
  | "select-item"
  | "activate-item"
  | "move-selection"
  | "request-window"
  | "restore-selection";

/**
 * Logical movement used by host-owned collection selection routing.
 *
 * @public
 */
export type HostCollectionMoveDirection =
  | "next"
  | "previous"
  | "page-next"
  | "page-previous"
  | "start"
  | "end";

/**
 * Serializable collection/window intent after the host has interpreted datasource, selection, and input policy.
 *
 * @public
 */
export interface HostCollectionIntent {
  readonly kind: HostCollectionIntentKind;
  readonly handoff: "host";
  readonly windowId: string;
  readonly itemKeyNamespace: string;
  readonly repeat: boolean;
  readonly itemKey?: string;
  readonly direction?: HostCollectionMoveDirection;
  readonly requestedRange?: VirtualItemRange;
  readonly restoreSelection?: VirtualSelectionSnapshot;
  readonly action: ActionRef;
}

/**
 * Authoring input for {@link normalizeHostCollectionIntent}.
 *
 * @public
 */
export interface HostCollectionIntentInput {
  readonly kind: HostCollectionIntentKind;
  readonly windowId: string;
  readonly itemKeyNamespace: string;
  readonly repeat?: boolean;
  readonly itemKey?: string;
  readonly direction?: HostCollectionMoveDirection;
  readonly requestedRange?: VirtualItemRange;
  readonly restoreSelection?: Partial<VirtualSelectionSnapshot>;
  readonly action?: ActionRefInput;
}

/**
 * Normalizes a host-owned collection/window intent without accepting datasource objects, native events, or callbacks.
 *
 * @public
 */
export function normalizeHostCollectionIntent(
  input: HostCollectionIntentInput,
): HostCollectionIntent {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host collection intent must be a plain object.");
  }

  const kind = normalizeIntentKind(input.kind);
  const intent: MutableHostCollectionIntent = {
    kind,
    handoff: "host",
    windowId: normalizeNonEmptyString(input.windowId, "Host collection intent windowId"),
    itemKeyNamespace: normalizeNonEmptyString(
      input.itemKeyNamespace,
      "Host collection intent itemKeyNamespace",
    ),
    repeat: input.repeat ?? false,
  };

  if (kind === "select-item" || kind === "activate-item") {
    intent.itemKey = normalizeNonEmptyString(input.itemKey, "Host collection intent itemKey");
  } else if (input.itemKey !== undefined) {
    throw new TypeError(
      "Host collection intent itemKey is only valid for select-item/activate-item intents.",
    );
  }

  if (kind === "move-selection") {
    intent.direction = normalizeMoveDirection(input.direction);
  } else if (input.direction !== undefined) {
    throw new TypeError(
      "Host collection intent direction is only valid for move-selection intents.",
    );
  }

  if (kind === "request-window") {
    intent.requestedRange = normalizeRange(
      input.requestedRange,
      "Host collection intent requestedRange",
    );
  } else if (input.requestedRange !== undefined) {
    throw new TypeError(
      "Host collection intent requestedRange is only valid for request-window intents.",
    );
  }

  if (kind === "restore-selection") {
    intent.restoreSelection = normalizeSelectionSnapshot(input.restoreSelection);
  } else if (input.restoreSelection !== undefined) {
    throw new TypeError(
      "Host collection intent restoreSelection is only valid for restore-selection intents.",
    );
  }

  const action =
    input.action !== undefined
      ? normalizeActionRef(input.action)
      : createHostCollectionIntentActionRef(intent);

  return {
    ...intent,
    action,
  };
}

/**
 * Creates the default ActionRef payload for a normalized host collection/window intent.
 *
 * @public
 */
export function createHostCollectionIntentActionRef(
  intent: Omit<HostCollectionIntent, "action">,
): ActionRef {
  const payload: Record<string, JsonValue> = {
    kind: intent.kind,
    windowId: intent.windowId,
    itemKeyNamespace: intent.itemKeyNamespace,
    repeat: intent.repeat,
  };

  if (intent.itemKey !== undefined) {
    payload.itemKey = intent.itemKey;
  }

  if (intent.direction !== undefined) {
    payload.direction = intent.direction;
  }

  if (intent.requestedRange !== undefined) {
    payload.requestedRange = {
      startIndex: intent.requestedRange.startIndex,
      endIndex: intent.requestedRange.endIndex,
    };
  }

  if (intent.restoreSelection !== undefined) {
    payload.restoreSelection = createSelectionPayload(intent.restoreSelection);
  }

  return {
    type: "runtime.collection.intent",
    payload,
  };
}

type MutableHostCollectionIntent = {
  kind: HostCollectionIntentKind;
  handoff: "host";
  windowId: string;
  itemKeyNamespace: string;
  repeat: boolean;
  itemKey?: string;
  direction?: HostCollectionMoveDirection;
  requestedRange?: VirtualItemRange;
  restoreSelection?: VirtualSelectionSnapshot;
};

const intentKinds = [
  "select-item",
  "activate-item",
  "move-selection",
  "request-window",
  "restore-selection",
] as const;
const moveDirections = ["next", "previous", "page-next", "page-previous", "start", "end"] as const;

function normalizeIntentKind(value: unknown): HostCollectionIntentKind {
  if (intentKinds.includes(value as HostCollectionIntentKind)) {
    return value as HostCollectionIntentKind;
  }

  throw new TypeError("Host collection intent kind must be supported.");
}

function normalizeMoveDirection(value: unknown): HostCollectionMoveDirection {
  if (moveDirections.includes(value as HostCollectionMoveDirection)) {
    return value as HostCollectionMoveDirection;
  }

  throw new TypeError("Host collection intent direction must be supported.");
}

function normalizeRange(input: VirtualItemRange | undefined, label: string): VirtualItemRange {
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

function normalizeSelectionSnapshot(
  input: Partial<VirtualSelectionSnapshot> | undefined,
): VirtualSelectionSnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host collection intent restoreSelection must be a plain object.");
  }

  const selection: MutableVirtualSelectionSnapshot = {};

  if (input.selectedKey !== undefined) {
    selection.selectedKey = normalizeNonEmptyString(
      input.selectedKey,
      "Host collection intent restoreSelection.selectedKey",
    );
  }

  if (input.focusedKey !== undefined) {
    selection.focusedKey = normalizeNonEmptyString(
      input.focusedKey,
      "Host collection intent restoreSelection.focusedKey",
    );
  }

  if (input.anchorKey !== undefined) {
    selection.anchorKey = normalizeNonEmptyString(
      input.anchorKey,
      "Host collection intent restoreSelection.anchorKey",
    );
  }

  if (input.revision !== undefined) {
    selection.revision = normalizeNonNegativeInteger(
      input.revision,
      "Host collection intent restoreSelection.revision",
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

function createSelectionPayload(selection: VirtualSelectionSnapshot): Record<string, JsonValue> {
  const payload: Record<string, JsonValue> = {};

  if (selection.selectedKey !== undefined) {
    payload.selectedKey = selection.selectedKey;
  }

  if (selection.focusedKey !== undefined) {
    payload.focusedKey = selection.focusedKey;
  }

  if (selection.anchorKey !== undefined) {
    payload.anchorKey = selection.anchorKey;
  }

  if (selection.revision !== undefined) {
    payload.revision = selection.revision;
  }

  return payload;
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

function normalizeNonNegativeInteger(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (!Number.isInteger(number) || number < 0) {
    throw new TypeError(`${label} must be a non-negative integer.`);
  }

  return number;
}
