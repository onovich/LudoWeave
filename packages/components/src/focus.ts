/**
 * Draft focus scope metadata for modal runtime UI components.
 *
 * @public
 */
export interface FocusScopeDraft {
  readonly scopeId: string;
  readonly containFocus: boolean;
  readonly restoreFocus: boolean;
  readonly initialFocusKey?: string;
}

/**
 * Authoring input for {@link createFocusScopeDraft}.
 *
 * @public
 */
export interface FocusScopeDraftInput {
  readonly scopeId: string;
  readonly containFocus?: boolean;
  readonly restoreFocus?: boolean;
  readonly initialFocusKey?: string;
}

/**
 * Normalizes modal focus scope metadata without owning DOM focus behavior.
 *
 * @public
 */
export function createFocusScopeDraft(input: FocusScopeDraftInput): FocusScopeDraft {
  const draft: MutableFocusScopeDraft = {
    scopeId: normalizeNonEmptyString(input.scopeId, "Focus scope id"),
    containFocus: input.containFocus ?? true,
    restoreFocus: input.restoreFocus ?? true,
  };

  if (input.initialFocusKey !== undefined) {
    draft.initialFocusKey = normalizeNonEmptyString(input.initialFocusKey, "Focus initial key");
  }

  return draft;
}

type MutableFocusScopeDraft = {
  scopeId: string;
  containFocus: boolean;
  restoreFocus: boolean;
  initialFocusKey?: string;
};

function normalizeNonEmptyString(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }
  return normalized;
}
