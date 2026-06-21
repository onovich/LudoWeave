/**
 * Draft metadata for modal input shielding.
 *
 * @public
 */
export interface ModalInputShieldDraft {
  readonly enabled: boolean;
  readonly blockedScopes: readonly string[];
  readonly handoff: "host";
}

/**
 * Authoring input for {@link createModalInputShieldDraft}.
 *
 * @public
 */
export interface ModalInputShieldDraftInput {
  readonly enabled?: boolean;
  readonly blockedScopes?: readonly string[];
}

/**
 * Normalizes modal input shielding metadata without owning host input state.
 *
 * @public
 */
export function createModalInputShieldDraft(
  input: ModalInputShieldDraftInput = {},
): ModalInputShieldDraft {
  return {
    enabled: input.enabled ?? true,
    blockedScopes: normalizeBlockedScopes(input.blockedScopes ?? ["gameplay"]),
    handoff: "host",
  };
}

function normalizeBlockedScopes(scopes: readonly string[]): readonly string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const scope of scopes) {
    const value = normalizeNonEmptyString(scope, "Modal input shield scope");
    if (!seen.has(value)) {
      seen.add(value);
      normalized.push(value);
    }
  }

  if (normalized.length === 0) {
    throw new TypeError("Modal input shield must block at least one scope.");
  }

  return normalized;
}

function normalizeNonEmptyString(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }
  return normalized;
}
