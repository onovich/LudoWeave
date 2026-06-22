import type { ActionRef, ActionRefInput } from "./action-ref.js";
import { normalizeActionRef } from "./action-ref.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import type { UiDiagnosticCode } from "./diagnostics.js";

/**
 * Host-owned policy lane for rich text metadata.
 *
 * @public
 */
export type HostRichTextPolicyLane =
  | "accessibility-review"
  | "font-selection"
  | "localized-content"
  | "markup-policy"
  | "narrative-state"
  | "platform-policy"
  | "sanitization"
  | "text-measurement";

/**
 * Host-owned policy status for a rich text lane.
 *
 * @public
 */
export type HostRichTextPolicyStatus = "available" | "missing" | "pending" | "rejected";

/**
 * Host-provided policy state for one lane.
 *
 * @public
 */
export interface HostRichTextPolicyState {
  readonly lane: HostRichTextPolicyLane;
  readonly status: HostRichTextPolicyStatus;
  readonly owner: "host";
  readonly sourceId?: string;
  readonly revision?: number;
}

/**
 * Serializable host-owned rich text policy snapshot.
 *
 * @public
 */
export interface HostRichTextPolicySnapshot {
  readonly blockId: string;
  readonly localeHint: string;
  readonly contentRevision?: number;
  readonly localizedContent: HostRichTextPolicyState;
  readonly markupPolicy: HostRichTextPolicyState;
  readonly sanitization: HostRichTextPolicyState;
  readonly narrativeState: HostRichTextPolicyState;
  readonly accessibilityReview: HostRichTextPolicyState;
  readonly textMeasurement: HostRichTextPolicyState;
  readonly fontSelection: HostRichTextPolicyState;
  readonly platformPolicy: HostRichTextPolicyState;
}

/**
 * Authoring input for {@link normalizeHostRichTextPolicySnapshot}.
 *
 * @public
 */
export interface HostRichTextPolicySnapshotInput {
  readonly blockId: string;
  readonly localeHint?: string;
  readonly contentRevision?: number;
  readonly localizedContent?: Partial<HostRichTextPolicyState>;
  readonly markupPolicy?: Partial<HostRichTextPolicyState>;
  readonly sanitization?: Partial<HostRichTextPolicyState>;
  readonly narrativeState?: Partial<HostRichTextPolicyState>;
  readonly accessibilityReview?: Partial<HostRichTextPolicyState>;
  readonly textMeasurement?: Partial<HostRichTextPolicyState>;
  readonly fontSelection?: Partial<HostRichTextPolicyState>;
  readonly platformPolicy?: Partial<HostRichTextPolicyState>;
}

/**
 * Host-owned rich text intent after content, sanitization, accessibility, and policy are interpreted.
 *
 * @public
 */
export type HostRichTextIntentKind =
  | "activate-span"
  | "dismiss-diagnostic"
  | "request-review"
  | "use-fallback";

/**
 * Serializable rich text intent whose side effects are dispatched by the host.
 *
 * @public
 */
export interface HostRichTextIntent {
  readonly kind: HostRichTextIntentKind;
  readonly handoff: "host";
  readonly blockId: string;
  readonly policyLane: HostRichTextPolicyLane;
  readonly spanId?: string;
  readonly diagnosticCode?: UiDiagnosticCode;
  readonly fallbackReason?: string;
  readonly action: ActionRef;
}

/**
 * Authoring input for {@link normalizeHostRichTextIntent}.
 *
 * @public
 */
export interface HostRichTextIntentInput {
  readonly kind: HostRichTextIntentKind;
  readonly blockId: string;
  readonly policyLane: HostRichTextPolicyLane;
  readonly spanId?: string;
  readonly diagnosticCode?: UiDiagnosticCode;
  readonly fallbackReason?: string;
  readonly action?: ActionRefInput;
}

/**
 * Normalizes a host-owned rich text policy snapshot without accepting parser, renderer, or platform objects.
 *
 * @public
 */
export function normalizeHostRichTextPolicySnapshot(
  input: HostRichTextPolicySnapshotInput,
): HostRichTextPolicySnapshot {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host rich text policy snapshot must be a plain object.");
  }

  const snapshot: MutableHostRichTextPolicySnapshot = {
    blockId: normalizeNonEmptyString(input.blockId, "Host rich text policy blockId"),
    localeHint: normalizeNonEmptyString(
      input.localeHint ?? "und",
      "Host rich text policy localeHint",
    ),
    localizedContent: normalizePolicyState(
      input.localizedContent,
      "localized-content",
      "Host rich text policy localizedContent",
    ),
    markupPolicy: normalizePolicyState(
      input.markupPolicy,
      "markup-policy",
      "Host rich text policy markupPolicy",
    ),
    sanitization: normalizePolicyState(
      input.sanitization,
      "sanitization",
      "Host rich text policy sanitization",
    ),
    narrativeState: normalizePolicyState(
      input.narrativeState,
      "narrative-state",
      "Host rich text policy narrativeState",
    ),
    accessibilityReview: normalizePolicyState(
      input.accessibilityReview,
      "accessibility-review",
      "Host rich text policy accessibilityReview",
    ),
    textMeasurement: normalizePolicyState(
      input.textMeasurement,
      "text-measurement",
      "Host rich text policy textMeasurement",
    ),
    fontSelection: normalizePolicyState(
      input.fontSelection,
      "font-selection",
      "Host rich text policy fontSelection",
    ),
    platformPolicy: normalizePolicyState(
      input.platformPolicy,
      "platform-policy",
      "Host rich text policy platformPolicy",
    ),
  };

  if (input.contentRevision !== undefined) {
    snapshot.contentRevision = normalizeNonNegativeInteger(
      input.contentRevision,
      "Host rich text policy contentRevision",
    );
  }

  return snapshot;
}

/**
 * Normalizes a host-owned rich text intent without accepting callbacks, DOM events, parser state, or renderer state.
 *
 * @public
 */
export function normalizeHostRichTextIntent(input: HostRichTextIntentInput): HostRichTextIntent {
  if (!isPlainRecord(input)) {
    throw new TypeError("Host rich text intent must be a plain object.");
  }

  const kind = normalizeIntentKind(input.kind);
  const intent: MutableHostRichTextIntent = {
    kind,
    handoff: "host",
    blockId: normalizeNonEmptyString(input.blockId, "Host rich text intent blockId"),
    policyLane: normalizePolicyLane(input.policyLane),
  };

  if (kind === "activate-span") {
    intent.spanId = normalizeNonEmptyString(input.spanId, "Host rich text intent spanId");
  } else if (input.spanId !== undefined) {
    throw new TypeError("Host rich text intent spanId is only valid for activate-span intents.");
  }

  if (kind === "dismiss-diagnostic") {
    intent.diagnosticCode = normalizeNonEmptyString(
      input.diagnosticCode,
      "Host rich text intent diagnosticCode",
    );
  } else if (input.diagnosticCode !== undefined) {
    throw new TypeError(
      "Host rich text intent diagnosticCode is only valid for dismiss-diagnostic intents.",
    );
  }

  if (kind === "use-fallback") {
    intent.fallbackReason = normalizeNonEmptyString(
      input.fallbackReason,
      "Host rich text intent fallbackReason",
    );
  } else if (input.fallbackReason !== undefined) {
    throw new TypeError(
      "Host rich text intent fallbackReason is only valid for use-fallback intents.",
    );
  }

  const action =
    input.action !== undefined
      ? normalizeActionRef(input.action)
      : createHostRichTextIntentActionRef(intent);

  return {
    ...intent,
    action,
  };
}

/**
 * Creates the default ActionRef payload for a normalized host rich text intent.
 *
 * @public
 */
export function createHostRichTextIntentActionRef(
  intent: Omit<HostRichTextIntent, "action">,
): ActionRef {
  const payload: Record<string, JsonValue> = {
    kind: intent.kind,
    blockId: intent.blockId,
    policyLane: intent.policyLane,
  };

  if (intent.spanId !== undefined) {
    payload.spanId = intent.spanId;
  }

  if (intent.diagnosticCode !== undefined) {
    payload.diagnosticCode = intent.diagnosticCode;
  }

  if (intent.fallbackReason !== undefined) {
    payload.fallbackReason = intent.fallbackReason;
  }

  return {
    type: "runtime.richText.intent",
    payload,
  };
}

type MutableHostRichTextPolicySnapshot = {
  blockId: string;
  localeHint: string;
  contentRevision?: number;
  localizedContent: HostRichTextPolicyState;
  markupPolicy: HostRichTextPolicyState;
  sanitization: HostRichTextPolicyState;
  narrativeState: HostRichTextPolicyState;
  accessibilityReview: HostRichTextPolicyState;
  textMeasurement: HostRichTextPolicyState;
  fontSelection: HostRichTextPolicyState;
  platformPolicy: HostRichTextPolicyState;
};

type MutableHostRichTextIntent = {
  kind: HostRichTextIntentKind;
  handoff: "host";
  blockId: string;
  policyLane: HostRichTextPolicyLane;
  spanId?: string;
  diagnosticCode?: UiDiagnosticCode;
  fallbackReason?: string;
};

const policyLanes = [
  "accessibility-review",
  "font-selection",
  "localized-content",
  "markup-policy",
  "narrative-state",
  "platform-policy",
  "sanitization",
  "text-measurement",
] as const;
const policyStatuses = ["available", "missing", "pending", "rejected"] as const;
const intentKinds = [
  "activate-span",
  "dismiss-diagnostic",
  "request-review",
  "use-fallback",
] as const;

function normalizePolicyState(
  input: Partial<HostRichTextPolicyState> | undefined,
  lane: HostRichTextPolicyLane,
  label: string,
): HostRichTextPolicyState {
  if (input !== undefined && !isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  const state: MutableHostRichTextPolicyState = {
    lane,
    status: normalizePolicyStatus(input?.status ?? "available"),
    owner: "host",
  };

  if (input?.lane !== undefined && input.lane !== lane) {
    throw new TypeError(`${label}.lane must match ${lane}.`);
  }

  if (input?.owner !== undefined && input.owner !== "host") {
    throw new TypeError(`${label}.owner must be host.`);
  }

  if (input?.sourceId !== undefined) {
    state.sourceId = normalizeNonEmptyString(input.sourceId, `${label}.sourceId`);
  }

  if (input?.revision !== undefined) {
    state.revision = normalizeNonNegativeInteger(input.revision, `${label}.revision`);
  }

  return state;
}

type MutableHostRichTextPolicyState = {
  lane: HostRichTextPolicyLane;
  status: HostRichTextPolicyStatus;
  owner: "host";
  sourceId?: string;
  revision?: number;
};

function normalizeIntentKind(value: unknown): HostRichTextIntentKind {
  if (intentKinds.includes(value as HostRichTextIntentKind)) {
    return value as HostRichTextIntentKind;
  }

  throw new TypeError("Host rich text intent kind must be supported.");
}

function normalizePolicyLane(value: unknown): HostRichTextPolicyLane {
  if (policyLanes.includes(value as HostRichTextPolicyLane)) {
    return value as HostRichTextPolicyLane;
  }

  throw new TypeError("Host rich text policy lane must be supported.");
}

function normalizePolicyStatus(value: unknown): HostRichTextPolicyStatus {
  if (policyStatuses.includes(value as HostRichTextPolicyStatus)) {
    return value as HostRichTextPolicyStatus;
  }

  throw new TypeError("Host rich text policy status must be supported.");
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
