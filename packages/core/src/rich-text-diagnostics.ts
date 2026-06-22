import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";
import type { HostRichTextPolicySnapshot } from "./host-rich-text-policy.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import {
  normalizeRichTextMetadata,
  type RichTextMetadata,
  type RichTextMetadataInput,
  type RichTextSemanticSpan,
} from "./rich-text-metadata.js";

/**
 * Stable diagnostic codes for host-owned rich text metadata contracts.
 *
 * @public
 */
export const richTextDiagnosticCodes = {
  emptyRun: "LW_RICH_TEXT_EMPTY_RUN",
  hostSanitizationMissing: "LW_RICH_TEXT_HOST_SANITIZATION_MISSING",
  invalidTokenReference: "LW_RICH_TEXT_INVALID_TOKEN_REFERENCE",
  missingFallbackText: "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
  nestedSpanOverflow: "LW_RICH_TEXT_NESTED_SPAN_OVERFLOW",
  nonSerializablePayload: "LW_RICH_TEXT_NON_SERIALIZABLE_PAYLOAD",
  unsupportedSpanType: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
} as const;

/**
 * Stable rich text diagnostic reason.
 *
 * @public
 */
export type RichTextDiagnosticReason = keyof typeof richTextDiagnosticCodes;

/**
 * Input for rich text diagnostics.
 *
 * @public
 */
export interface RichTextDiagnosticsInput {
  readonly metadata: RichTextMetadata | RichTextMetadataInput;
  readonly knownThemeTokenRefs?: readonly string[];
  readonly hostPolicy?: HostRichTextPolicySnapshot;
  readonly maxNestedSpanDepth?: number;
}

/**
 * Creates a stable rich text diagnostic.
 *
 * @public
 */
export function createRichTextDiagnostic(
  reason: RichTextDiagnosticReason,
  details: Readonly<Record<string, JsonValue>> = {},
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: richTextDiagnosticCodes[reason],
    severity: severityForReason(reason),
    message: messageForReason(reason),
    details,
  });
}

/**
 * Collects stable rich text diagnostics without parsing markup, measuring text, or reading renderer state.
 *
 * @public
 */
export function collectRichTextDiagnostics(
  input: RichTextDiagnosticsInput,
): readonly UiDiagnostic[] {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text diagnostics input must be a plain object.");
  }

  const diagnostics: UiDiagnostic[] = [];
  const metadata = tryNormalizeMetadata(input.metadata, diagnostics);
  const knownThemeTokenRefs = normalizeKnownThemeTokenRefs(input.knownThemeTokenRefs ?? []);
  const maxNestedSpanDepth = normalizeMaxNestedSpanDepth(input.maxNestedSpanDepth ?? 3);

  collectUnsupportedSpanDiagnostics(metadata, diagnostics);
  collectFallbackDiagnostics(metadata, diagnostics);
  collectTokenDiagnostics(metadata, knownThemeTokenRefs, diagnostics);
  collectHostPolicyDiagnostics(metadata, input.hostPolicy, diagnostics);
  collectRunDiagnostics(metadata, diagnostics);
  collectNestedSpanDiagnostics(metadata, maxNestedSpanDepth, diagnostics);

  return diagnostics;
}

function tryNormalizeMetadata(
  input: RichTextMetadata | RichTextMetadataInput,
  diagnostics: UiDiagnostic[],
): RichTextMetadata {
  try {
    return normalizeRichTextMetadata(input);
  } catch (error) {
    diagnostics.push(
      createRichTextDiagnostic("nonSerializablePayload", {
        message: error instanceof Error ? error.message : "Invalid rich text metadata.",
      }),
    );

    return normalizeRichTextMetadata({
      id: "invalid-rich-text",
      plainTextFallback: "",
      runs: [],
      hostPolicy: {
        localizedContent: "missing",
        markupPolicy: "missing",
        sanitization: "missing",
        accessibilityReview: "missing",
      },
      a11y: { label: "Invalid rich text metadata.", reviewStatus: "missing" },
    });
  }
}

function collectUnsupportedSpanDiagnostics(
  metadata: RichTextMetadata,
  diagnostics: UiDiagnostic[],
): void {
  for (const span of metadata.spans) {
    if (span.kind === "unsupported") {
      diagnostics.push(
        createRichTextDiagnostic("unsupportedSpanType", {
          blockId: metadata.id,
          spanId: span.id,
          fallbackText: span.fallbackText ?? "",
        }),
      );
    }
  }
}

function collectFallbackDiagnostics(metadata: RichTextMetadata, diagnostics: UiDiagnostic[]): void {
  if (metadata.plainTextFallback.length === 0) {
    diagnostics.push(
      createRichTextDiagnostic("missingFallbackText", {
        blockId: metadata.id,
        field: "plainTextFallback",
      }),
    );
  }

  for (const span of metadata.spans) {
    if (span.kind === "unsupported" && (span.fallbackText ?? "").length === 0) {
      diagnostics.push(
        createRichTextDiagnostic("missingFallbackText", {
          blockId: metadata.id,
          spanId: span.id,
          field: "span.fallbackText",
        }),
      );
    }
  }
}

function collectTokenDiagnostics(
  metadata: RichTextMetadata,
  knownThemeTokenRefs: ReadonlySet<string>,
  diagnostics: UiDiagnostic[],
): void {
  if (knownThemeTokenRefs.size === 0) {
    return;
  }

  for (const run of metadata.runs) {
    for (const tokenRef of run.themeTokenRefs) {
      if (!knownThemeTokenRefs.has(tokenRef)) {
        diagnostics.push(
          createRichTextDiagnostic("invalidTokenReference", {
            blockId: metadata.id,
            runId: run.id,
            tokenRef,
          }),
        );
      }
    }
  }

  for (const span of metadata.spans) {
    for (const tokenRef of span.themeTokenRefs) {
      if (!knownThemeTokenRefs.has(tokenRef)) {
        diagnostics.push(
          createRichTextDiagnostic("invalidTokenReference", {
            blockId: metadata.id,
            spanId: span.id,
            tokenRef,
          }),
        );
      }
    }
  }
}

function collectHostPolicyDiagnostics(
  metadata: RichTextMetadata,
  hostPolicy: HostRichTextPolicySnapshot | undefined,
  diagnostics: UiDiagnostic[],
): void {
  const metadataMissing = metadata.hostPolicy.sanitization !== "approved";
  const snapshotMissing =
    hostPolicy !== undefined &&
    (hostPolicy.blockId !== metadata.id || hostPolicy.sanitization.status !== "available");

  if (metadataMissing || snapshotMissing) {
    diagnostics.push(
      createRichTextDiagnostic("hostSanitizationMissing", {
        blockId: metadata.id,
        metadataStatus: metadata.hostPolicy.sanitization,
        snapshotStatus: hostPolicy?.sanitization.status ?? "not-provided",
      }),
    );
  }
}

function collectRunDiagnostics(metadata: RichTextMetadata, diagnostics: UiDiagnostic[]): void {
  for (const run of metadata.runs) {
    if (run.text.length === 0) {
      diagnostics.push(
        createRichTextDiagnostic("emptyRun", {
          blockId: metadata.id,
          runId: run.id,
        }),
      );
    }
  }
}

function collectNestedSpanDiagnostics(
  metadata: RichTextMetadata,
  maxNestedSpanDepth: number,
  diagnostics: UiDiagnostic[],
): void {
  const spans = new Map(metadata.spans.map((span) => [span.id, span]));

  for (const span of metadata.spans) {
    const depth = calculateSpanDepth(span, spans);
    if (depth > maxNestedSpanDepth) {
      diagnostics.push(
        createRichTextDiagnostic("nestedSpanOverflow", {
          blockId: metadata.id,
          spanId: span.id,
          depth,
          maxDepth: maxNestedSpanDepth,
        }),
      );
    }
  }
}

function calculateSpanDepth(
  span: RichTextSemanticSpan,
  spans: ReadonlyMap<string, RichTextSemanticSpan>,
): number {
  let depth = 1;
  let current = span;
  const seen = new Set<string>([span.id]);

  while (current.parentSpanId !== undefined) {
    const parent = spans.get(current.parentSpanId);
    if (parent === undefined || seen.has(parent.id)) {
      break;
    }

    depth += 1;
    seen.add(parent.id);
    current = parent;
  }

  return depth;
}

function normalizeKnownThemeTokenRefs(input: readonly string[]): ReadonlySet<string> {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text knownThemeTokenRefs must be an array.");
  }

  return new Set(
    input.map((tokenRef, index) =>
      normalizeNonEmptyString(tokenRef, `Rich text knownThemeTokenRefs ${index}`),
    ),
  );
}

function normalizeMaxNestedSpanDepth(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError("Rich text maxNestedSpanDepth must be a positive integer.");
  }

  return value;
}

function severityForReason(reason: RichTextDiagnosticReason): "error" | "warning" {
  switch (reason) {
    case "hostSanitizationMissing":
    case "nonSerializablePayload":
      return "error";
    case "emptyRun":
    case "invalidTokenReference":
    case "missingFallbackText":
    case "nestedSpanOverflow":
    case "unsupportedSpanType":
      return "warning";
  }
}

function messageForReason(reason: RichTextDiagnosticReason): string {
  switch (reason) {
    case "emptyRun":
      return "Rich text inline run is empty.";
    case "hostSanitizationMissing":
      return "Host rich text sanitization review is missing.";
    case "invalidTokenReference":
      return "Rich text references an unknown theme token.";
    case "missingFallbackText":
      return "Rich text fallback text is missing.";
    case "nestedSpanOverflow":
      return "Rich text nested span depth exceeds the bounded fixture limit.";
    case "nonSerializablePayload":
      return "Rich text metadata contains a non-serializable payload.";
    case "unsupportedSpanType":
      return "Rich text span type is unsupported by this bounded contract.";
  }
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
