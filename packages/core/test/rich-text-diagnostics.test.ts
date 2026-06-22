import { describe, expect, it } from "vitest";

import { normalizeHostRichTextPolicySnapshot } from "../src/host-rich-text-policy.js";
import {
  collectRichTextDiagnostics,
  createRichTextDiagnostic,
  richTextDiagnosticCodes,
} from "../src/rich-text-diagnostics.js";

describe("rich text diagnostics", () => {
  it("creates stable diagnostic codes", () => {
    expect(richTextDiagnosticCodes).toEqual({
      emptyRun: "LW_RICH_TEXT_EMPTY_RUN",
      hostSanitizationMissing: "LW_RICH_TEXT_HOST_SANITIZATION_MISSING",
      invalidTokenReference: "LW_RICH_TEXT_INVALID_TOKEN_REFERENCE",
      missingFallbackText: "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
      nestedSpanOverflow: "LW_RICH_TEXT_NESTED_SPAN_OVERFLOW",
      nonSerializablePayload: "LW_RICH_TEXT_NON_SERIALIZABLE_PAYLOAD",
      unsupportedSpanType: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
    });

    expect(createRichTextDiagnostic("unsupportedSpanType", { spanId: "flash" }))
      .toMatchInlineSnapshot(`
        {
          "code": "LW_RICH_TEXT_UNSUPPORTED_SPAN",
          "details": {
            "spanId": "flash",
          },
          "message": "Rich text span type is unsupported by this bounded contract.",
          "severity": "warning",
        }
      `);
  });

  it("collects unsupported span, fallback, token, sanitization, empty run, and nested diagnostics", () => {
    const diagnostics = collectRichTextDiagnostics({
      metadata: {
        id: "dialogue.rich",
        plainTextFallback: "",
        spans: [
          { id: "speaker", kind: "speaker" },
          { id: "tone", kind: "tone", parentSpanId: "speaker" },
          { id: "emphasis", kind: "emphasis", parentSpanId: "tone" },
          { id: "unsupported.flash", kind: "unsupported", parentSpanId: "emphasis" },
        ],
        runs: [
          {
            id: "run.empty",
            text: "",
            spanIds: ["unsupported.flash"],
            themeTokenRefs: ["runtime.subtitle.unknown"],
          },
        ],
        hostPolicy: {
          sanitization: "missing",
        },
        a11y: { label: "Dialogue" },
      },
      knownThemeTokenRefs: ["runtime.subtitle.body"],
      hostPolicy: normalizeHostRichTextPolicySnapshot({
        blockId: "dialogue.rich",
        sanitization: { status: "missing" },
      }),
      maxNestedSpanDepth: 3,
    });

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_RICH_TEXT_UNSUPPORTED_SPAN",
      "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
      "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
      "LW_RICH_TEXT_INVALID_TOKEN_REFERENCE",
      "LW_RICH_TEXT_HOST_SANITIZATION_MISSING",
      "LW_RICH_TEXT_EMPTY_RUN",
      "LW_RICH_TEXT_NESTED_SPAN_OVERFLOW",
    ]);
  });

  it("reports non-serializable payloads without throwing", () => {
    expect(
      collectRichTextDiagnostics({
        metadata: {
          id: "dialogue.rich",
          plainTextFallback: "Fallback",
          runs: [
            {
              id: "run.bad",
              text: "Fallback",
              metadata: { parserState: () => undefined },
            },
          ],
          a11y: { label: "Fallback" },
        } as never,
      }),
    ).toEqual([
      {
        code: "LW_RICH_TEXT_NON_SERIALIZABLE_PAYLOAD",
        severity: "error",
        message: "Rich text metadata contains a non-serializable payload.",
        details: {
          message: "Rich text run metadata.parserState must be a JsonValue.",
        },
      },
      {
        code: "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
        severity: "warning",
        message: "Rich text fallback text is missing.",
        details: {
          blockId: "invalid-rich-text",
          field: "plainTextFallback",
        },
      },
      {
        code: "LW_RICH_TEXT_HOST_SANITIZATION_MISSING",
        severity: "error",
        message: "Host rich text sanitization review is missing.",
        details: {
          blockId: "invalid-rich-text",
          metadataStatus: "missing",
          snapshotStatus: "not-provided",
        },
      },
    ]);
  });

  it("rejects non-serializable diagnostic details", () => {
    expect(() =>
      createRichTextDiagnostic("invalidTokenReference", {
        callback: () => undefined,
      } as never),
    ).toThrow(/details\.callback must be a JsonValue/);
  });
});
