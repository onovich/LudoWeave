import { normalizeActionRef, type ActionRef, type ActionRefInput } from "@ludoweave/core";

/**
 * Host input source category used by focus navigation metadata.
 *
 * @public
 */
export type FocusNavigationDevice = "keyboard" | "gamepad";

/**
 * Runtime focus action intent emitted from host-owned input events.
 *
 * @public
 */
export type FocusNavigationIntent = "confirm" | "cancel";

/**
 * Normalized focus navigation binding.
 *
 * @public
 */
export interface FocusNavigationBinding {
  readonly device: FocusNavigationDevice;
  readonly input: string;
  readonly intent: FocusNavigationIntent;
  readonly action: ActionRef;
}

/**
 * Authoring input for one focus navigation binding.
 *
 * @public
 */
export interface FocusNavigationBindingInput {
  readonly device: FocusNavigationDevice;
  readonly input: string;
  readonly intent: FocusNavigationIntent;
  readonly action?: ActionRefInput;
}

/**
 * Draft focus navigation metadata for host-owned keyboard/gamepad routing.
 *
 * @public
 */
export interface FocusNavigationDraft {
  readonly scopeId: string;
  readonly handoff: "host";
  readonly bindings: readonly FocusNavigationBinding[];
}

/**
 * Authoring input for {@link createFocusNavigationDraft}.
 *
 * @public
 */
export interface FocusNavigationDraftInput {
  readonly scopeId: string;
  readonly bindings?: readonly FocusNavigationBindingInput[];
}

/**
 * Normalizes focus navigation metadata without reading device state directly.
 *
 * @public
 */
export function createFocusNavigationDraft(input: FocusNavigationDraftInput): FocusNavigationDraft {
  const bindings = (input.bindings ?? createDefaultBindings()).map((binding) =>
    normalizeBinding(binding),
  );

  if (bindings.length === 0) {
    throw new TypeError("Focus navigation must include at least one binding.");
  }

  return {
    scopeId: normalizeNonEmptyString(input.scopeId, "Focus navigation scope id"),
    handoff: "host",
    bindings,
  };
}

function createDefaultBindings(): readonly FocusNavigationBindingInput[] {
  return [
    {
      device: "keyboard",
      input: "Enter",
      intent: "confirm",
    },
    {
      device: "keyboard",
      input: "Escape",
      intent: "cancel",
    },
    {
      device: "gamepad",
      input: "South",
      intent: "confirm",
    },
    {
      device: "gamepad",
      input: "East",
      intent: "cancel",
    },
  ];
}

function normalizeBinding(input: FocusNavigationBindingInput): FocusNavigationBinding {
  return {
    device: input.device,
    input: normalizeNonEmptyString(input.input, "Focus navigation input"),
    intent: input.intent,
    action: normalizeActionRef(input.action ?? defaultActionForIntent(input.intent)),
  };
}

function defaultActionForIntent(intent: FocusNavigationIntent): ActionRefInput {
  if (intent === "confirm") {
    return "runtime.ui.confirm";
  }

  return "runtime.ui.cancel";
}

function normalizeNonEmptyString(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }
  return normalized;
}
