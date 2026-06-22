import {
  createActionLog,
  normalizeActionRef,
  normalizeFocusGraph,
  resolveDirectionalFocus,
  type ActionRef,
  type ActionRefInput,
  type DirectionalFocusResult,
  type FocusGraph,
  type HostInputIntent,
  type ResolvedRect,
  type UiActionLogEntry,
} from "@ludoweave/core";

import { createFocusScopeDraft, type FocusScopeDraft } from "./focus.js";

/**
 * Modal focus control metadata used by host-owned focus navigation.
 *
 * @public
 */
export interface ModalFocusControlInput {
  readonly id: string;
  readonly nodeId?: string;
  readonly rect: ResolvedRect;
  readonly action: ActionRefInput;
}

/**
 * Modal focus navigation state derived from serializable Dialog/Pause metadata.
 *
 * @public
 */
export interface ModalFocusNavigationDraft {
  readonly scope: FocusScopeDraft;
  readonly focusGraph: FocusGraph;
  readonly controls: readonly ModalFocusControl[];
}

/**
 * Normalized modal focus control metadata.
 *
 * @public
 */
export interface ModalFocusControl {
  readonly id: string;
  readonly nodeId: string;
  readonly rect: ResolvedRect;
  readonly action: ActionRef;
}

/**
 * Authoring input for {@link createModalFocusNavigationDraft}.
 *
 * @public
 */
export interface ModalFocusNavigationDraftInput {
  readonly scopeId: string;
  readonly containFocus?: boolean;
  readonly restoreFocus?: boolean;
  readonly initialFocusId?: string;
  readonly restoreFocusKey?: string;
  readonly controls: readonly ModalFocusControlInput[];
}

/**
 * Result of applying a host-owned input intent to modal focus metadata.
 *
 * @public
 */
export type ModalFocusIntentResult =
  | {
      readonly status: "navigated";
      readonly navigation: DirectionalFocusResult;
    }
  | {
      readonly status: "action";
      readonly action: ActionRef;
      readonly controlId: string;
    }
  | {
      readonly status: "ignored";
      readonly reason: "unsupported-intent" | "missing-focus";
    };

/**
 * One JSON-only modal focus navigation sequence entry.
 *
 * @public
 */
export interface ModalFocusNavigationSequenceEntry {
  readonly sequence: number;
  readonly intent: HostInputIntent;
  readonly result: ModalFocusIntentResult;
  readonly actionLogEntry?: UiActionLogEntry;
}

/**
 * JSON-only navigation sequence payload for tests and inspector handoff.
 *
 * @public
 */
export interface ModalFocusNavigationSequence {
  readonly entries: readonly ModalFocusNavigationSequenceEntry[];
  readonly actionLog: readonly UiActionLogEntry[];
}

/**
 * Creates modal focus graph metadata without owning platform focus state.
 *
 * @public
 */
export function createModalFocusNavigationDraft(
  input: ModalFocusNavigationDraftInput,
): ModalFocusNavigationDraft {
  if (input.controls.length === 0) {
    throw new TypeError("Modal focus navigation requires at least one control.");
  }

  const scopeInput: MutableFocusScopeDraftInput = {
    scopeId: input.scopeId,
    containFocus: input.containFocus ?? true,
    restoreFocus: input.restoreFocus ?? true,
  };

  const initialFocusKey = input.initialFocusId ?? input.controls[0]?.id;
  if (initialFocusKey !== undefined) {
    scopeInput.initialFocusKey = initialFocusKey;
  }

  if (input.restoreFocusKey !== undefined) {
    scopeInput.restoreFocusKey = input.restoreFocusKey;
  }

  const scope = createFocusScopeDraft(scopeInput);
  const controls = input.controls.map((control) => normalizeControl(control));
  const graphInput: MutableFocusGraphInput = {
    scopeId: scope.scopeId,
    nodes: controls.map((control, index) => ({
      id: control.id,
      nodeId: control.nodeId,
      rect: control.rect,
      priority: index,
      directionalNeighbors: createLinearModalNeighbors(controls, index),
    })),
  };

  if (scope.initialFocusKey !== undefined) {
    graphInput.currentFocusId = scope.initialFocusKey;
  }

  return {
    scope,
    controls,
    focusGraph: normalizeFocusGraph(graphInput),
  };
}

/**
 * Resolves host-owned modal input intent into focus navigation or ActionRef data.
 *
 * @public
 */
export function resolveModalFocusIntent(
  draft: ModalFocusNavigationDraft,
  intent: HostInputIntent,
): ModalFocusIntentResult {
  const focusId = intent.focusId ?? draft.focusGraph.currentFocusId;
  if (focusId === undefined) {
    return { status: "ignored", reason: "missing-focus" };
  }

  if (intent.kind === "navigate") {
    return {
      status: "navigated",
      navigation: resolveDirectionalFocus(draft.focusGraph, focusId, requireDirection(intent)),
    };
  }

  if (intent.kind === "confirm") {
    const control = draft.controls.find((entry) => entry.id === focusId);
    if (control === undefined) {
      return { status: "ignored", reason: "missing-focus" };
    }
    return { status: "action", action: control.action, controlId: control.id };
  }

  if (intent.kind === "cancel") {
    const control = draft.controls.find((entry) => entry.id === "cancel");
    if (control === undefined) {
      return { status: "ignored", reason: "missing-focus" };
    }
    return { status: "action", action: control.action, controlId: control.id };
  }

  return { status: "ignored", reason: "unsupported-intent" };
}

/**
 * Records a host-owned modal navigation sequence while keeping ActionRefs callback-free.
 *
 * @public
 */
export function createModalFocusNavigationSequence(
  draft: ModalFocusNavigationDraft,
  intents: readonly HostInputIntent[],
): ModalFocusNavigationSequence {
  const actionLog = createActionLog();
  const entries: ModalFocusNavigationSequenceEntry[] = [];

  intents.forEach((intent, index) => {
    const result = resolveModalFocusIntent(draft, intent);
    const actionLogEntry =
      result.status === "action"
        ? actionLog.record({
            action: result.action,
            source: {
              nodeId: `modal-focus.${result.controlId}`,
              label: result.controlId,
            },
          })
        : undefined;

    const entry: MutableModalFocusNavigationSequenceEntry = {
      sequence: index + 1,
      intent,
      result,
    };

    if (actionLogEntry !== undefined) {
      entry.actionLogEntry = actionLogEntry;
    }

    entries.push(entry);
  });

  return {
    entries,
    actionLog: actionLog.snapshot(),
  };
}

function normalizeControl(input: ModalFocusControlInput): ModalFocusControl {
  const id = normalizeNonEmptyString(input.id, "Modal focus control id");
  return {
    id,
    nodeId: normalizeNonEmptyString(input.nodeId ?? id, "Modal focus control nodeId"),
    rect: input.rect,
    action: normalizeActionRef(input.action),
  };
}

function createLinearModalNeighbors(
  controls: readonly ModalFocusControl[],
  index: number,
): { readonly up?: string; readonly down?: string } {
  const neighbors: MutableLinearNeighbors = {};
  const previous = controls[index - 1];
  const next = controls[index + 1];

  if (previous !== undefined) {
    neighbors.up = previous.id;
  }

  if (next !== undefined) {
    neighbors.down = next.id;
  }

  return neighbors;
}

function requireDirection(intent: HostInputIntent): NonNullable<HostInputIntent["direction"]> {
  if (intent.direction === undefined) {
    throw new TypeError("Modal focus navigation intent requires a direction.");
  }
  return intent.direction;
}

function normalizeNonEmptyString(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }
  return normalized;
}

type MutableFocusScopeDraftInput = {
  scopeId: string;
  containFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusKey?: string;
  restoreFocusKey?: string;
};

type MutableLinearNeighbors = {
  up?: string;
  down?: string;
};

type MutableFocusGraphInput = {
  scopeId: string;
  nodes: Parameters<typeof normalizeFocusGraph>[0]["nodes"];
  currentFocusId?: string;
};

type MutableModalFocusNavigationSequenceEntry = {
  sequence: number;
  intent: HostInputIntent;
  result: ModalFocusIntentResult;
  actionLogEntry?: UiActionLogEntry;
};
