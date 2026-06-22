import { describe, expect, it } from "vitest";

import {
  normalizeRichTextMetadata,
  normalizeRichTextMetadataFrame,
} from "../src/rich-text-metadata.js";

describe("rich text metadata", () => {
  it("normalizes serializable host-reviewed rich text metadata", () => {
    const metadata = normalizeRichTextMetadata({
      id: " dialogue-line ",
      nodeId: "node.dialogue",
      localeHint: "en-US",
      plainTextFallback: "Mira: The north gate is sealed.",
      spans: [
        {
          id: "speaker.mira",
          kind: "speaker",
          label: "Mira",
          rendererHints: ["speaker"],
          themeTokenRefs: ["runtime.subtitle.speaker"],
          metadata: { voice: "calm" },
        },
        {
          id: "tone.warning",
          kind: "tone",
          label: "warning",
          parentSpanId: "speaker.mira",
          rendererHints: ["accent"],
          fallbackText: "warning",
        },
      ],
      runs: [
        {
          id: "run.speaker",
          text: "Mira",
          spanIds: ["speaker.mira"],
          rendererHints: ["speaker"],
          themeTokenRefs: ["runtime.subtitle.speaker"],
          metadata: { segment: 0 },
        },
        {
          id: "run.body",
          text: ": The north gate is sealed.",
          spanIds: ["tone.warning"],
          rendererHints: ["accent"],
          themeTokenRefs: ["runtime.subtitle.body"],
        },
      ],
      hostPolicy: {
        localizedContent: "approved",
        markupPolicy: "approved",
        sanitization: "approved",
        accessibilityReview: "pending",
      },
      a11y: {
        label: "Mira says the north gate is sealed.",
        description: "Dialogue line from Mira.",
        liveRegion: "polite",
        pronunciationHint: "Mee-rah",
        reviewStatus: "pending",
      },
      diagnostics: [
        {
          code: "LW_TEST",
          severity: "info",
          message: "Fixture diagnostic.",
          details: { block: "dialogue-line" },
        },
      ],
    });

    expect(metadata).toEqual({
      id: "dialogue-line",
      nodeId: "node.dialogue",
      localeHint: "en-US",
      plainTextFallback: "Mira: The north gate is sealed.",
      runs: [
        {
          id: "run.speaker",
          text: "Mira",
          spanIds: ["speaker.mira"],
          themeTokenRefs: ["runtime.subtitle.speaker"],
          rendererHints: ["speaker"],
          metadata: { segment: 0 },
        },
        {
          id: "run.body",
          text: ": The north gate is sealed.",
          spanIds: ["tone.warning"],
          themeTokenRefs: ["runtime.subtitle.body"],
          rendererHints: ["accent"],
          metadata: {},
        },
      ],
      spans: [
        {
          id: "speaker.mira",
          kind: "speaker",
          label: "Mira",
          rendererHints: ["speaker"],
          themeTokenRefs: ["runtime.subtitle.speaker"],
          metadata: { voice: "calm" },
        },
        {
          id: "tone.warning",
          kind: "tone",
          label: "warning",
          parentSpanId: "speaker.mira",
          rendererHints: ["accent"],
          themeTokenRefs: [],
          fallbackText: "warning",
          metadata: {},
        },
      ],
      hostPolicy: {
        localizedContent: "approved",
        markupPolicy: "approved",
        sanitization: "approved",
        accessibilityReview: "pending",
      },
      a11y: {
        label: "Mira says the north gate is sealed.",
        description: "Dialogue line from Mira.",
        liveRegion: "polite",
        pronunciationHint: "Mee-rah",
        reviewStatus: "pending",
      },
      diagnostics: [
        {
          code: "LW_TEST",
          severity: "info",
          message: "Fixture diagnostic.",
          details: { block: "dialogue-line" },
        },
      ],
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("normalizes a metadata frame with active and review references", () => {
    const metadata = normalizeRichTextMetadataFrame({
      activeBlockId: "subtitle",
      reviewBlockId: "choice",
      blocks: [
        {
          id: "subtitle",
          plainTextFallback: "Signal lost.",
          runs: [{ id: "run.body", text: "Signal lost." }],
          a11y: { label: "Signal lost." },
        },
        {
          id: "choice",
          localeHint: "ja-JP",
          plainTextFallback: "Open the sealed gate.",
          runs: [
            {
              id: "run.choice",
              text: "Open the sealed gate.",
              rendererHints: ["choice"],
            },
          ],
          hostPolicy: { sanitization: "pending" },
          a11y: { label: "Open the sealed gate.", reviewStatus: "pending" },
        },
      ],
    });

    expect(metadata).toEqual({
      blocks: [
        {
          id: "subtitle",
          nodeId: "subtitle",
          localeHint: "und",
          plainTextFallback: "Signal lost.",
          runs: [
            {
              id: "run.body",
              text: "Signal lost.",
              spanIds: [],
              themeTokenRefs: [],
              rendererHints: [],
              metadata: {},
            },
          ],
          spans: [],
          hostPolicy: {
            localizedContent: "approved",
            markupPolicy: "approved",
            sanitization: "approved",
            accessibilityReview: "approved",
          },
          a11y: { label: "Signal lost.", reviewStatus: "approved" },
          diagnostics: [],
        },
        {
          id: "choice",
          nodeId: "choice",
          localeHint: "ja-JP",
          plainTextFallback: "Open the sealed gate.",
          runs: [
            {
              id: "run.choice",
              text: "Open the sealed gate.",
              spanIds: [],
              themeTokenRefs: [],
              rendererHints: ["choice"],
              metadata: {},
            },
          ],
          spans: [],
          hostPolicy: {
            localizedContent: "approved",
            markupPolicy: "approved",
            sanitization: "pending",
            accessibilityReview: "approved",
          },
          a11y: { label: "Open the sealed gate.", reviewStatus: "pending" },
          diagnostics: [],
        },
      ],
      activeBlockId: "subtitle",
      reviewBlockId: "choice",
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("rejects parser-like payloads, invalid references, duplicate ids, and invalid review state", () => {
    class ParserState {
      html = "<b>unsafe</b>";
    }

    expect(() =>
      normalizeRichTextMetadata({
        id: "subtitle",
        plainTextFallback: "Unsafe",
        runs: [{ id: "run.body", text: "Unsafe", metadata: new ParserState() as never }],
        a11y: { label: "Unsafe" },
      }),
    ).toThrow(/run metadata must be a plain object/);

    expect(() =>
      normalizeRichTextMetadata({
        id: "subtitle",
        plainTextFallback: "Missing span",
        runs: [{ id: "run.body", text: "Missing span", spanIds: ["unknown"] }],
        a11y: { label: "Missing span" },
      }),
    ).toThrow(/must reference an existing span/);

    expect(() =>
      normalizeRichTextMetadata({
        id: "subtitle",
        plainTextFallback: "Duplicate",
        runs: [
          { id: "run.body", text: "A" },
          { id: "run.body", text: "B" },
        ],
        a11y: { label: "Duplicate" },
      }),
    ).toThrow(/must be unique/);

    expect(() =>
      normalizeRichTextMetadata({
        id: "subtitle",
        plainTextFallback: "Invalid review",
        runs: [{ id: "run.body", text: "Invalid review" }],
        hostPolicy: { sanitization: "owned-by-renderer" as never },
        a11y: { label: "Invalid review" },
      }),
    ).toThrow(/review status/);
  });
});
