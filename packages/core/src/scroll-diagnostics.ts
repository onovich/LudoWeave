import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";
import type { JsonValue } from "./json-value.js";

/**
 * Stable diagnostic codes for host-owned scroll metadata contracts.
 *
 * @public
 */
export const scrollDiagnosticCodes = {
  disabledScroll: "LW_SCROLL_DISABLED",
  emptyContainer: "LW_SCROLL_EMPTY_CONTAINER",
  missingHostCapability: "LW_SCROLL_MISSING_HOST_CAPABILITY",
  outOfRangeOffset: "LW_SCROLL_OUT_OF_RANGE_OFFSET",
  removedContainer: "LW_SCROLL_REMOVED_CONTAINER",
  staleContainer: "LW_SCROLL_STALE_CONTAINER",
} as const;

/**
 * Stable scroll diagnostic reason.
 *
 * @public
 */
export type ScrollDiagnosticReason = keyof typeof scrollDiagnosticCodes;

/**
 * Creates a stable scroll diagnostic without owning host scroll state.
 *
 * @public
 */
export function createScrollDiagnostic(
  reason: ScrollDiagnosticReason,
  details: Readonly<Record<string, JsonValue>> = {},
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: scrollDiagnosticCodes[reason],
    severity: reason === "missingHostCapability" ? "error" : "warning",
    message: messageForReason(reason),
    details,
  });
}

function messageForReason(reason: ScrollDiagnosticReason): string {
  switch (reason) {
    case "disabledScroll":
      return "Scroll container is disabled.";
    case "emptyContainer":
      return "Scroll container has no scrollable content.";
    case "missingHostCapability":
      return "Host scroll capability is missing.";
    case "outOfRangeOffset":
      return "Scroll offset is outside the container extent.";
    case "removedContainer":
      return "Scroll restoration target container is no longer present.";
    case "staleContainer":
      return "Scroll container metadata is stale.";
  }
}
