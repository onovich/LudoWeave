import { normalizeUiDiagnostic, type UiDiagnostic, type UiDiagnosticInput } from "./diagnostics.js";
import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";
import type { JsonValue } from "./json-value.js";

/**
 * Stable semantic kind for an inline rich text span.
 *
 * @public
 */
export type RichTextSpanKind =
  | "choice-hint"
  | "disabled-reason"
  | "emphasis"
  | "locked-reason"
  | "speaker"
  | "tone"
  | "unsupported";

/**
 * Renderer hint that may guide presentation without owning style or measurement policy.
 *
 * @public
 */
export type RichTextRendererHint =
  | "accent"
  | "choice"
  | "disabled"
  | "emphasis"
  | "muted"
  | "speaker";

/**
 * Host-owned rich text review status.
 *
 * @public
 */
export type RichTextReviewStatus = "approved" | "missing" | "pending" | "rejected";

/**
 * Host policy flags attached to a reviewed rich text block.
 *
 * @public
 */
export interface RichTextHostPolicyFlags {
  readonly localizedContent: RichTextReviewStatus;
  readonly markupPolicy: RichTextReviewStatus;
  readonly sanitization: RichTextReviewStatus;
  readonly accessibilityReview: RichTextReviewStatus;
}

/**
 * Accessibility review metadata supplied by the host.
 *
 * @public
 */
export interface RichTextA11yMetadata {
  readonly label: string;
  readonly description?: string;
  readonly liveRegion?: "assertive" | "off" | "polite";
  readonly pronunciationHint?: string;
  readonly reviewStatus: RichTextReviewStatus;
}

/**
 * Serializable inline rich text run.
 *
 * @public
 */
export interface RichTextInlineRun {
  readonly id: string;
  readonly text: string;
  readonly spanIds: readonly string[];
  readonly themeTokenRefs: readonly string[];
  readonly rendererHints: readonly RichTextRendererHint[];
  readonly metadata: Readonly<Record<string, JsonValue>>;
}

/**
 * Serializable semantic span metadata.
 *
 * @public
 */
export interface RichTextSemanticSpan {
  readonly id: string;
  readonly kind: RichTextSpanKind;
  readonly label?: string;
  readonly parentSpanId?: string;
  readonly rendererHints: readonly RichTextRendererHint[];
  readonly themeTokenRefs: readonly string[];
  readonly fallbackText?: string;
  readonly metadata: Readonly<Record<string, JsonValue>>;
}

/**
 * Serializable rich text metadata for one host-reviewed text block.
 *
 * @public
 */
export interface RichTextMetadata {
  readonly id: string;
  readonly nodeId: string;
  readonly localeHint: string;
  readonly plainTextFallback: string;
  readonly runs: readonly RichTextInlineRun[];
  readonly spans: readonly RichTextSemanticSpan[];
  readonly hostPolicy: RichTextHostPolicyFlags;
  readonly a11y: RichTextA11yMetadata;
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Authoring input for {@link normalizeRichTextMetadata}.
 *
 * @public
 */
export interface RichTextMetadataInput {
  readonly id: string;
  readonly nodeId?: string;
  readonly localeHint?: string;
  readonly plainTextFallback: string;
  readonly runs: readonly RichTextInlineRunInput[];
  readonly spans?: readonly RichTextSemanticSpanInput[];
  readonly hostPolicy?: Partial<RichTextHostPolicyFlags>;
  readonly a11y: RichTextA11yMetadataInput;
  readonly diagnostics?: readonly UiDiagnosticInput[];
}

/**
 * Authoring input for {@link RichTextInlineRun}.
 *
 * @public
 */
export interface RichTextInlineRunInput {
  readonly id: string;
  readonly text: string;
  readonly spanIds?: readonly string[];
  readonly themeTokenRefs?: readonly string[];
  readonly rendererHints?: readonly RichTextRendererHint[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * Authoring input for {@link RichTextSemanticSpan}.
 *
 * @public
 */
export interface RichTextSemanticSpanInput {
  readonly id: string;
  readonly kind: RichTextSpanKind;
  readonly label?: string;
  readonly parentSpanId?: string;
  readonly rendererHints?: readonly RichTextRendererHint[];
  readonly themeTokenRefs?: readonly string[];
  readonly fallbackText?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Authoring input for {@link RichTextA11yMetadata}.
 *
 * @public
 */
export interface RichTextA11yMetadataInput {
  readonly label: string;
  readonly description?: string;
  readonly liveRegion?: "assertive" | "off" | "polite";
  readonly pronunciationHint?: string;
  readonly reviewStatus?: RichTextReviewStatus;
}

/**
 * Serializable rich text metadata attached to a resolved frame or fixture.
 *
 * @public
 */
export interface RichTextMetadataFrame {
  readonly blocks: readonly RichTextMetadata[];
  readonly activeBlockId?: string;
  readonly reviewBlockId?: string;
}

/**
 * Authoring input for {@link normalizeRichTextMetadataFrame}.
 *
 * @public
 */
export interface RichTextMetadataFrameInput {
  readonly blocks: readonly RichTextMetadataInput[];
  readonly activeBlockId?: string;
  readonly reviewBlockId?: string;
}

/**
 * Normalizes one rich text metadata block without parsing HTML, parsing Markdown, or measuring text.
 *
 * @public
 */
export function normalizeRichTextMetadata(input: RichTextMetadataInput): RichTextMetadata {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text metadata input must be a plain object.");
  }

  const spans = normalizeSpans(input.spans ?? []);
  const spanIds = new Set(spans.map((span) => span.id));
  assertSpanParentReferences(spans, spanIds);

  return {
    id: normalizeNonEmptyString(input.id, "Rich text id"),
    nodeId: normalizeNonEmptyString(input.nodeId ?? input.id, "Rich text nodeId"),
    localeHint: normalizeNonEmptyString(input.localeHint ?? "und", "Rich text localeHint"),
    plainTextFallback: normalizeString(input.plainTextFallback, "Rich text plainTextFallback"),
    runs: normalizeRuns(input.runs, spanIds),
    spans,
    hostPolicy: normalizeHostPolicy(input.hostPolicy ?? {}),
    a11y: normalizeA11yMetadata(input.a11y),
    diagnostics: normalizeDiagnostics(input.diagnostics ?? []),
  };
}

/**
 * Normalizes rich text metadata and validates active/review references.
 *
 * @public
 */
export function normalizeRichTextMetadataFrame(
  input: RichTextMetadataFrameInput,
): RichTextMetadataFrame {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text metadata frame input must be a plain object.");
  }

  if (!Array.isArray(input.blocks)) {
    throw new TypeError("Rich text metadata blocks must be an array.");
  }

  const blocks = input.blocks.map((block) => normalizeRichTextMetadata(block));
  const ids = new Set<string>();

  for (const block of blocks) {
    if (ids.has(block.id)) {
      throw new TypeError(`Rich text block id "${block.id}" must be unique.`);
    }
    ids.add(block.id);
  }

  const frame: MutableRichTextMetadataFrame = {
    blocks,
  };

  if (input.activeBlockId !== undefined) {
    frame.activeBlockId = normalizeBlockReference(input.activeBlockId, ids, "activeBlockId");
  }

  if (input.reviewBlockId !== undefined) {
    frame.reviewBlockId = normalizeBlockReference(input.reviewBlockId, ids, "reviewBlockId");
  }

  return frame;
}

type MutableRichTextMetadataFrame = {
  blocks: readonly RichTextMetadata[];
  activeBlockId?: string;
  reviewBlockId?: string;
};

const spanKinds = [
  "choice-hint",
  "disabled-reason",
  "emphasis",
  "locked-reason",
  "speaker",
  "tone",
  "unsupported",
] as const;

const rendererHints = ["accent", "choice", "disabled", "emphasis", "muted", "speaker"] as const;
const reviewStatuses = ["approved", "missing", "pending", "rejected"] as const;
const liveRegions = ["assertive", "off", "polite"] as const;

function normalizeRuns(
  input: readonly RichTextInlineRunInput[],
  spanIds: ReadonlySet<string>,
): readonly RichTextInlineRun[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text runs must be an array.");
  }

  const ids = new Set<string>();
  return input.map((run) => {
    if (!isPlainRecord(run)) {
      throw new TypeError("Rich text run must be a plain object.");
    }

    const runInput = run as unknown as RichTextInlineRunInput;
    const id = normalizeNonEmptyString(runInput.id, "Rich text run id");
    if (ids.has(id)) {
      throw new TypeError(`Rich text run id "${id}" must be unique.`);
    }
    ids.add(id);

    const normalizedSpanIds = normalizeStringArray(runInput.spanIds ?? [], "Rich text run spanIds");
    for (const spanId of normalizedSpanIds) {
      if (!spanIds.has(spanId)) {
        throw new TypeError(`Rich text run spanId "${spanId}" must reference an existing span.`);
      }
    }

    return {
      id,
      text: normalizeString(runInput.text, "Rich text run text"),
      spanIds: normalizedSpanIds,
      themeTokenRefs: normalizeStringArray(
        runInput.themeTokenRefs ?? [],
        "Rich text run themeTokenRefs",
      ),
      rendererHints: normalizeRendererHints(runInput.rendererHints ?? []),
      metadata: normalizeMetadata(runInput.metadata ?? {}, "Rich text run metadata"),
    };
  });
}

function normalizeSpans(
  input: readonly RichTextSemanticSpanInput[],
): readonly RichTextSemanticSpan[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text spans must be an array.");
  }

  const ids = new Set<string>();
  return input.map((span) => {
    if (!isPlainRecord(span)) {
      throw new TypeError("Rich text span must be a plain object.");
    }

    const spanInput = span as unknown as RichTextSemanticSpanInput;
    const id = normalizeNonEmptyString(spanInput.id, "Rich text span id");
    if (ids.has(id)) {
      throw new TypeError(`Rich text span id "${id}" must be unique.`);
    }
    ids.add(id);

    const normalized: MutableRichTextSemanticSpan = {
      id,
      kind: normalizeSpanKind(spanInput.kind),
      rendererHints: normalizeRendererHints(spanInput.rendererHints ?? []),
      themeTokenRefs: normalizeStringArray(
        spanInput.themeTokenRefs ?? [],
        "Rich text span themeTokenRefs",
      ),
      metadata: normalizeMetadata(spanInput.metadata ?? {}, "Rich text span metadata"),
    };

    if (spanInput.label !== undefined) {
      normalized.label = normalizeNonEmptyString(spanInput.label, "Rich text span label");
    }

    if (spanInput.parentSpanId !== undefined) {
      normalized.parentSpanId = normalizeNonEmptyString(
        spanInput.parentSpanId,
        "Rich text span parentSpanId",
      );
    }

    if (spanInput.fallbackText !== undefined) {
      normalized.fallbackText = normalizeString(
        spanInput.fallbackText,
        "Rich text span fallbackText",
      );
    }

    return normalized;
  });
}

type MutableRichTextSemanticSpan = {
  id: string;
  kind: RichTextSpanKind;
  label?: string;
  parentSpanId?: string;
  rendererHints: readonly RichTextRendererHint[];
  themeTokenRefs: readonly string[];
  fallbackText?: string;
  metadata: Readonly<Record<string, JsonValue>>;
};

function assertSpanParentReferences(
  spans: readonly RichTextSemanticSpan[],
  spanIds: ReadonlySet<string>,
): void {
  for (const span of spans) {
    if (span.parentSpanId !== undefined && !spanIds.has(span.parentSpanId)) {
      throw new TypeError(
        `Rich text span parentSpanId "${span.parentSpanId}" must reference an existing span.`,
      );
    }
  }
}

function normalizeHostPolicy(input: Partial<RichTextHostPolicyFlags>): RichTextHostPolicyFlags {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text hostPolicy must be a plain object.");
  }

  return {
    localizedContent: normalizeReviewStatus(input.localizedContent ?? "approved"),
    markupPolicy: normalizeReviewStatus(input.markupPolicy ?? "approved"),
    sanitization: normalizeReviewStatus(input.sanitization ?? "approved"),
    accessibilityReview: normalizeReviewStatus(input.accessibilityReview ?? "approved"),
  };
}

function normalizeA11yMetadata(input: RichTextA11yMetadataInput): RichTextA11yMetadata {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text a11y metadata must be a plain object.");
  }

  const metadata: MutableRichTextA11yMetadata = {
    label: normalizeNonEmptyString(input.label, "Rich text a11y label"),
    reviewStatus: normalizeReviewStatus(input.reviewStatus ?? "approved"),
  };

  if (input.description !== undefined) {
    metadata.description = normalizeNonEmptyString(input.description, "Rich text a11y description");
  }

  if (input.liveRegion !== undefined) {
    metadata.liveRegion = normalizeLiveRegion(input.liveRegion);
  }

  if (input.pronunciationHint !== undefined) {
    metadata.pronunciationHint = normalizeNonEmptyString(
      input.pronunciationHint,
      "Rich text a11y pronunciationHint",
    );
  }

  return metadata;
}

type MutableRichTextA11yMetadata = {
  label: string;
  description?: string;
  liveRegion?: "assertive" | "off" | "polite";
  pronunciationHint?: string;
  reviewStatus: RichTextReviewStatus;
};

function normalizeDiagnostics(input: readonly UiDiagnosticInput[]): readonly UiDiagnostic[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text diagnostics must be an array.");
  }

  return input.map((diagnostic) => normalizeUiDiagnostic(diagnostic));
}

function normalizeSpanKind(value: unknown): RichTextSpanKind {
  if (spanKinds.includes(value as RichTextSpanKind)) {
    return value as RichTextSpanKind;
  }

  throw new TypeError("Rich text span kind must be supported.");
}

function normalizeRendererHints(
  input: readonly RichTextRendererHint[],
): readonly RichTextRendererHint[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text rendererHints must be an array.");
  }

  return input.map((hint) => {
    if (rendererHints.includes(hint)) {
      return hint;
    }

    throw new TypeError("Rich text renderer hint must be supported.");
  });
}

function normalizeReviewStatus(value: unknown): RichTextReviewStatus {
  if (reviewStatuses.includes(value as RichTextReviewStatus)) {
    return value as RichTextReviewStatus;
  }

  throw new TypeError("Rich text review status must be supported.");
}

function normalizeLiveRegion(value: unknown): "assertive" | "off" | "polite" {
  if (liveRegions.includes(value as "assertive" | "off" | "polite")) {
    return value as "assertive" | "off" | "polite";
  }

  throw new TypeError("Rich text a11y liveRegion must be supported.");
}

function normalizeStringArray(input: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array.`);
  }

  return input.map((value, index) => normalizeNonEmptyString(value, `${label}[${index}]`));
}

function normalizeMetadata(
  input: Record<string, unknown>,
  label: string,
): Readonly<Record<string, JsonValue>> {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  return normalizeJsonObject(input, label);
}

function normalizeBlockReference(value: string, ids: ReadonlySet<string>, label: string): string {
  const id = normalizeNonEmptyString(value, `Rich text metadata ${label}`);
  if (!ids.has(id)) {
    throw new TypeError(`Rich text metadata ${label} must reference an existing block.`);
  }
  return id;
}

function normalizeString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string.`);
  }

  return value;
}

function normalizeNonEmptyString(value: unknown, label: string): string {
  const normalized = normalizeString(value, label).trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }

  return normalized;
}
