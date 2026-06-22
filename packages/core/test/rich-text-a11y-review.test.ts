import { describe, expect, it } from "vitest";

import {
  reviewRichTextA11yMetadata,
  richTextA11yReviewDiagnosticCodes,
} from "../src/rich-text-a11y-review.js";

describe("rich text accessibility review metadata", () => {
  it("normalizes host-reviewable a11y label, description, live policy, and pronunciation", () => {
    expect(
      reviewRichTextA11yMetadata({
        metadata: {
          id: "dialogue.a11y",
          plainTextFallback: "Mira says the north gate is sealed.",
          runs: [{ id: "run.body", text: "Mira says the north gate is sealed." }],
          a11y: {
            label: "Mira says the north gate is sealed.",
            description: "Dialogue line from Mira.",
            liveRegion: "polite",
            pronunciationHint: "Mee-rah",
            reviewStatus: "approved",
          },
        },
      }),
    ).toEqual({
      blockId: "dialogue.a11y",
      label: "Mira says the north gate is sealed.",
      description: "Dialogue line from Mira.",
      liveRegion: "polite",
      pronunciationHint: "Mee-rah",
      reviewStatus: "approved",
      diagnostics: [],
    });
  });

  it("reports missing host review without producing platform side effects", () => {
    const review = reviewRichTextA11yMetadata({
      metadata: {
        id: "dialogue.pending",
        plainTextFallback: "Pending review.",
        runs: [{ id: "run.body", text: "Pending review." }],
        a11y: {
          label: "Pending review.",
          liveRegion: "off",
          reviewStatus: "pending",
        },
      },
    });

    expect(review.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_RICH_TEXT_A11Y_MISSING_HOST_REVIEW",
    ]);
    expect(JSON.stringify(review)).not.toContain("aria-");
    expect(JSON.stringify(review)).not.toContain("AccessibilityNode");
  });

  it("reports unsupported live policy and uses fallback label metadata", () => {
    const review = reviewRichTextA11yMetadata({
      metadata: {
        id: "dialogue.live",
        plainTextFallback: "Fallback live text.",
        runs: [{ id: "run.body", text: "Fallback live text." }],
        a11y: {
          label: "Fallback live text.",
          liveRegion: "toast" as never,
        },
      },
      fallbackLabel: "Fallback live text.",
    });

    expect(review).toEqual({
      blockId: "dialogue.live",
      label: "Fallback live text.",
      reviewStatus: "missing",
      diagnostics: [
        {
          code: "LW_RICH_TEXT_A11Y_UNSUPPORTED_LIVE_POLICY",
          severity: "warning",
          message: "Rich text live region policy is unsupported.",
          details: {
            blockId: "dialogue.live",
            message: "Rich text a11y liveRegion must be supported.",
          },
        },
        {
          code: "LW_RICH_TEXT_A11Y_MISSING_HOST_REVIEW",
          severity: "error",
          message: "Host rich text accessibility review is missing.",
          details: {
            blockId: "dialogue.live",
          },
        },
      ],
    });
  });

  it("exposes stable diagnostic codes", () => {
    expect(richTextA11yReviewDiagnosticCodes).toEqual({
      fallbackLabel: "LW_RICH_TEXT_A11Y_FALLBACK_LABEL",
      missingHostReview: "LW_RICH_TEXT_A11Y_MISSING_HOST_REVIEW",
      unsupportedLivePolicy: "LW_RICH_TEXT_A11Y_UNSUPPORTED_LIVE_POLICY",
    });
  });
});
