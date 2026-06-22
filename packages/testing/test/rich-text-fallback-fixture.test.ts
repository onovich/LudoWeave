import { describe, expect, it } from "vitest";

import { createRichTextPlainFallbackFixture } from "../src/rich-text-fallback-fixture.js";

describe("rich text plain fallback fixture", () => {
  it("keeps fallback text stable and JSON-only", () => {
    const fixture = createRichTextPlainFallbackFixture();

    expect(fixture.metadata.plainTextFallback).toBe("Mira: The north gate is sealed.");
    expect(fixture.metadata.localeHint).toBe("en-US");
    expect(fixture.fallbackCases.map((entry) => entry.kind)).toEqual([
      "locale-hint",
      "fallback-run-mismatch",
      "empty-text",
      "missing-fallback",
    ]);
    expect(JSON.parse(JSON.stringify(fixture.metadata))).toEqual(fixture.metadata);
    expect(JSON.stringify(fixture)).not.toContain("innerHTML");
    expect(JSON.stringify(fixture)).not.toContain("markdown");
    expect(fixture.note).toBe("plain-text-fallback-no-rich-markup-parser");
  });

  it("surfaces fallback mismatch and missing fallback as diagnostics", () => {
    const fixture = createRichTextPlainFallbackFixture();

    expect(fixture.metadata.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_RICH_TEXT_FALLBACK_RUN_MISMATCH",
      "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
    ]);
    expect(fixture.fallbackCases.find((entry) => entry.kind === "missing-fallback")).toMatchObject({
      blockId: "dialogue.missing-fallback",
      stableText: "[missing fallback]",
    });
  });
});
