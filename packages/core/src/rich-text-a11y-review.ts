import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";
import { isPlainRecord } from "./json-normalize.js";
import {
  normalizeRichTextMetadata,
  type RichTextA11yMetadata,
  type RichTextMetadata,
  type RichTextMetadataInput,
} from "./rich-text-metadata.js";

/**
 * Stable diagnostic codes for host-reviewable rich text accessibility metadata.
 *
 * @public
 */
export const richTextA11yReviewDiagnosticCodes = {
  fallbackLabel: "LW_RICH_TEXT_A11Y_FALLBACK_LABEL",
  missingHostReview: "LW_RICH_TEXT_A11Y_MISSING_HOST_REVIEW",
  unsupportedLivePolicy: "LW_RICH_TEXT_A11Y_UNSUPPORTED_LIVE_POLICY",
} as const;

/**
 * Stable rich text accessibility review diagnostic reason.
 *
 * @public
 */
export type RichTextA11yReviewDiagnosticReason = keyof typeof richTextA11yReviewDiagnosticCodes;

/**
 * Input for {@link reviewRichTextA11yMetadata}.
 *
 * @public
 */
export interface ReviewRichTextA11yMetadataInput {
  readonly metadata: RichTextMetadata | RichTextMetadataInput;
  readonly fallbackLabel?: string;
}

/**
 * Host-reviewable accessibility metadata payload for rich text.
 *
 * @public
 */
export interface RichTextA11yReviewResult {
  readonly blockId: string;
  readonly label: string;
  readonly description?: string;
  readonly liveRegion?: "assertive" | "off" | "polite";
  readonly pronunciationHint?: string;
  readonly reviewStatus: RichTextA11yMetadata["reviewStatus"];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Normalizes host-reviewable rich text a11y metadata without reading platform a11y state.
 *
 * @public
 */
export function reviewRichTextA11yMetadata(
  input: ReviewRichTextA11yMetadataInput,
): RichTextA11yReviewResult {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text a11y review input must be a plain object.");
  }

  const diagnostics: UiDiagnostic[] = [];
  const fallbackLabel = normalizeFallbackLabel(input.fallbackLabel ?? "Rich text fallback label.");

  try {
    const metadata = normalizeRichTextMetadata(input.metadata);
    const review = createReviewResult(metadata.id, metadata.a11y, diagnostics);
    if (metadata.a11y.reviewStatus !== "approved") {
      diagnostics.push(createA11yReviewDiagnostic("missingHostReview", { blockId: metadata.id }));
    }
    return review;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid rich text a11y metadata.";
    const blockId = readBlockId(input.metadata);

    if (message.includes("liveRegion")) {
      diagnostics.push(createA11yReviewDiagnostic("unsupportedLivePolicy", { blockId, message }));
    } else {
      diagnostics.push(createA11yReviewDiagnostic("fallbackLabel", { blockId, message }));
    }

    diagnostics.push(createA11yReviewDiagnostic("missingHostReview", { blockId }));

    return {
      blockId,
      label: fallbackLabel,
      reviewStatus: "missing",
      diagnostics,
    };
  }
}

/**
 * Creates a stable rich text accessibility review diagnostic.
 *
 * @public
 */
export function createRichTextA11yReviewDiagnostic(
  reason: RichTextA11yReviewDiagnosticReason,
  details: Readonly<Record<string, import("./json-value.js").JsonValue>> = {},
): UiDiagnostic {
  return createA11yReviewDiagnostic(reason, details);
}

function createReviewResult(
  blockId: string,
  a11y: RichTextA11yMetadata,
  diagnostics: readonly UiDiagnostic[],
): RichTextA11yReviewResult {
  return {
    blockId,
    label: a11y.label,
    ...(a11y.description !== undefined ? { description: a11y.description } : {}),
    ...(a11y.liveRegion !== undefined ? { liveRegion: a11y.liveRegion } : {}),
    ...(a11y.pronunciationHint !== undefined ? { pronunciationHint: a11y.pronunciationHint } : {}),
    reviewStatus: a11y.reviewStatus,
    diagnostics,
  };
}

function createA11yReviewDiagnostic(
  reason: RichTextA11yReviewDiagnosticReason,
  details: Readonly<Record<string, import("./json-value.js").JsonValue>>,
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: richTextA11yReviewDiagnosticCodes[reason],
    severity: reason === "missingHostReview" ? "error" : "warning",
    message: messageForReason(reason),
    details,
  });
}

function messageForReason(reason: RichTextA11yReviewDiagnosticReason): string {
  switch (reason) {
    case "fallbackLabel":
      return "Rich text a11y label fell back to host-provided plain text.";
    case "missingHostReview":
      return "Host rich text accessibility review is missing.";
    case "unsupportedLivePolicy":
      return "Rich text live region policy is unsupported.";
  }
}

function readBlockId(metadata: RichTextMetadata | RichTextMetadataInput): string {
  if (isPlainRecord(metadata) && typeof metadata.id === "string" && metadata.id.trim() !== "") {
    return metadata.id.trim();
  }

  return "unknown-rich-text-block";
}

function normalizeFallbackLabel(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("Rich text fallbackLabel must be a string.");
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError("Rich text fallbackLabel must not be empty.");
  }

  return normalized;
}
