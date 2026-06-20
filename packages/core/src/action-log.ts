import type { ActionRef, ActionRefInput } from "./action-ref.js";
import { normalizeActionRef } from "./action-ref.js";

/**
 * Source metadata attached to an action log entry.
 *
 * @public
 */
export interface UiActionLogSource {
  readonly actionTargetId?: string;
  readonly nodeId?: string;
  readonly label?: string;
}

/**
 * Serializable action log entry emitted before host dispatch.
 *
 * @public
 */
export interface UiActionLogEntry extends UiActionLogSource {
  readonly sequence: number;
  readonly action: ActionRef;
}

/**
 * Input accepted by {@link UiActionLog.record}.
 *
 * @public
 */
export interface RecordUiActionOptions {
  readonly action: ActionRefInput;
  readonly source?: UiActionLogSource;
}

/**
 * In-memory deterministic action log for tests and host dispatch bridges.
 *
 * @public
 */
export interface UiActionLog {
  record(options: RecordUiActionOptions): UiActionLogEntry;
  snapshot(): readonly UiActionLogEntry[];
  clear(): void;
}

/**
 * Options for {@link createActionLog}.
 *
 * @public
 */
export interface CreateActionLogOptions {
  readonly startSequence?: number;
}

/**
 * Creates a deterministic ActionRef-only action log helper.
 *
 * @public
 */
export function createActionLog(options: CreateActionLogOptions = {}): UiActionLog {
  let nextSequence = normalizeStartSequence(options.startSequence ?? 1);
  const entries: UiActionLogEntry[] = [];

  return {
    record(input) {
      const entry = createEntry(nextSequence, input);
      nextSequence += 1;
      entries.push(entry);
      return { ...entry };
    },
    snapshot() {
      return entries.map((entry) => ({ ...entry }));
    },
    clear() {
      entries.length = 0;
    },
  };
}

function createEntry(sequence: number, input: RecordUiActionOptions): UiActionLogEntry {
  const entry: MutableUiActionLogEntry = {
    sequence,
    action: normalizeActionRef(input.action),
  };
  const source = input.source;

  if (source?.actionTargetId !== undefined) {
    entry.actionTargetId = source.actionTargetId;
  }

  if (source?.nodeId !== undefined) {
    entry.nodeId = source.nodeId;
  }

  if (source?.label !== undefined) {
    entry.label = source.label;
  }

  return entry;
}

type MutableUiActionLogEntry = {
  sequence: number;
  action: ActionRef;
  actionTargetId?: string;
  nodeId?: string;
  label?: string;
};

function normalizeStartSequence(value: number): number {
  if (Number.isInteger(value) && value >= 0) {
    return value;
  }

  throw new TypeError("Action log startSequence must be a non-negative integer.");
}
