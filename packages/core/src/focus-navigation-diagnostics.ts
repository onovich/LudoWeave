import type { JsonValue } from "./json-value.js";
import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";

/**
 * Stable diagnostic codes for host-owned focus navigation contracts.
 *
 * @public
 */
export const focusNavigationDiagnosticCodes = {
  disabledTarget: "LW_FOCUS_DISABLED_TARGET",
  emptyGraph: "LW_FOCUS_EMPTY_GRAPH",
  missingHostCapability: "LW_FOCUS_MISSING_HOST_CAPABILITY",
  missingTarget: "LW_FOCUS_MISSING_TARGET",
  staleFocusKey: "LW_FOCUS_STALE_KEY",
} as const;

/**
 * Stable focus navigation diagnostic reason.
 *
 * @public
 */
export type FocusNavigationDiagnosticReason = keyof typeof focusNavigationDiagnosticCodes;

/**
 * Creates a stable focus navigation diagnostic without owning host focus state.
 *
 * @public
 */
export function createFocusNavigationDiagnostic(
  reason: FocusNavigationDiagnosticReason,
  details: Readonly<Record<string, JsonValue>> = {},
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: focusNavigationDiagnosticCodes[reason],
    severity: reason === "missingHostCapability" ? "error" : "warning",
    message: messageForReason(reason),
    details,
  });
}

function messageForReason(reason: FocusNavigationDiagnosticReason): string {
  switch (reason) {
    case "disabledTarget":
      return "Focus navigation target is disabled.";
    case "emptyGraph":
      return "Focus navigation graph has no focusable nodes.";
    case "missingHostCapability":
      return "Host focus navigation capability is missing.";
    case "missingTarget":
      return "Focus navigation target is missing.";
    case "staleFocusKey":
      return "Focus navigation current focus key is stale.";
  }
}
