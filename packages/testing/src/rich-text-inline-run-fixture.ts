import {
  normalizeRichTextMetadata,
  type RichTextInlineRun,
  type RichTextMetadata,
  type RichTextSemanticSpan,
} from "@ludoweave/core";

export interface RichTextInlineRunFixture {
  readonly name: "rich-text-inline-run";
  readonly metadata: RichTextMetadata;
  readonly flattenedSpanOrder: readonly string[];
  readonly unsupportedFallbackText: string;
  readonly note: "host-reviewed-inline-runs-no-html-markdown-parser";
}

export function createRichTextInlineRunFixture(): RichTextInlineRunFixture {
  const metadata = normalizeRichTextMetadata({
    id: "dialogue.rich-text.fixture",
    nodeId: "runtime.overlay/key:dialogue",
    localeHint: "en-US",
    plainTextFallback:
      "Mira: The north gate is sealed. Choose: reroute power. Locked: relay key required.",
    spans: [
      {
        id: "speaker.mira",
        kind: "speaker",
        label: "Mira",
        rendererHints: ["speaker"],
        themeTokenRefs: ["runtime.subtitle.speaker"],
      },
      {
        id: "tone.warning",
        kind: "tone",
        label: "warning",
        parentSpanId: "speaker.mira",
        rendererHints: ["accent"],
        themeTokenRefs: ["runtime.subtitle.warning"],
      },
      {
        id: "emphasis.sealed",
        kind: "emphasis",
        label: "sealed",
        parentSpanId: "tone.warning",
        rendererHints: ["emphasis"],
        themeTokenRefs: ["runtime.subtitle.emphasis"],
      },
      {
        id: "choice.reroute",
        kind: "choice-hint",
        label: "reroute power",
        rendererHints: ["choice"],
        themeTokenRefs: ["runtime.choice.available"],
      },
      {
        id: "disabled.relay",
        kind: "disabled-reason",
        label: "relay key required",
        rendererHints: ["disabled"],
        themeTokenRefs: ["runtime.choice.disabled"],
      },
      {
        id: "locked.relay",
        kind: "locked-reason",
        label: "relay locked",
        parentSpanId: "disabled.relay",
        rendererHints: ["muted"],
        themeTokenRefs: ["runtime.choice.locked"],
      },
      {
        id: "unsupported.flash",
        kind: "unsupported",
        label: "flash",
        fallbackText: "[flash]",
        rendererHints: ["muted"],
      },
    ],
    runs: [
      {
        id: "run.001.speaker",
        text: "Mira",
        spanIds: ["speaker.mira"],
        rendererHints: ["speaker"],
        themeTokenRefs: ["runtime.subtitle.speaker"],
      },
      {
        id: "run.002.body",
        text: ": The north gate is ",
        spanIds: ["tone.warning"],
        rendererHints: ["accent"],
      },
      {
        id: "run.003.emphasis",
        text: "sealed",
        spanIds: ["speaker.mira", "tone.warning", "emphasis.sealed"],
        rendererHints: ["emphasis"],
        themeTokenRefs: ["runtime.subtitle.emphasis"],
      },
      {
        id: "run.004.choice",
        text: ". Choose: reroute power.",
        spanIds: ["choice.reroute"],
        rendererHints: ["choice"],
        themeTokenRefs: ["runtime.choice.available"],
      },
      {
        id: "run.005.locked",
        text: " Locked: relay key required.",
        spanIds: ["disabled.relay", "locked.relay"],
        rendererHints: ["disabled"],
        themeTokenRefs: ["runtime.choice.disabled"],
        metadata: { disabled: true },
      },
      {
        id: "run.006.unsupported",
        text: "",
        spanIds: ["unsupported.flash"],
        rendererHints: ["muted"],
      },
    ],
    hostPolicy: {
      localizedContent: "approved",
      markupPolicy: "approved",
      sanitization: "approved",
      accessibilityReview: "pending",
    },
    a11y: {
      label: "Mira warns the north gate is sealed and one choice is locked.",
      reviewStatus: "pending",
    },
  });

  return {
    name: "rich-text-inline-run",
    metadata,
    flattenedSpanOrder: flattenSpanOrder(metadata.spans),
    unsupportedFallbackText: collectUnsupportedFallbackText(metadata.spans),
    note: "host-reviewed-inline-runs-no-html-markdown-parser",
  };
}

export function flattenRichTextRunSpanIds(
  run: RichTextInlineRun,
  spans: readonly RichTextSemanticSpan[],
): readonly string[] {
  const byId = new Map(spans.map((span) => [span.id, span]));
  const ordered = new Set<string>();

  for (const spanId of run.spanIds) {
    addSpanWithParents(spanId, byId, ordered);
  }

  return [...ordered];
}

function flattenSpanOrder(spans: readonly RichTextSemanticSpan[]): readonly string[] {
  const byId = new Map(spans.map((span) => [span.id, span]));
  const ordered = new Set<string>();

  for (const span of spans) {
    addSpanWithParents(span.id, byId, ordered);
  }

  return [...ordered];
}

function addSpanWithParents(
  spanId: string,
  spans: ReadonlyMap<string, RichTextSemanticSpan>,
  ordered: Set<string>,
): void {
  const span = spans.get(spanId);
  if (span === undefined) {
    return;
  }

  if (span.parentSpanId !== undefined) {
    addSpanWithParents(span.parentSpanId, spans, ordered);
  }

  ordered.add(span.id);
}

function collectUnsupportedFallbackText(spans: readonly RichTextSemanticSpan[]): string {
  return spans
    .filter((span) => span.kind === "unsupported")
    .map((span) => span.fallbackText ?? "")
    .join("");
}
