import { describe, expect, it } from "vitest";

import {
  createRichTextInlineRunFixture,
  flattenRichTextRunSpanIds,
} from "../src/rich-text-inline-run-fixture.js";

describe("rich text inline run fixture", () => {
  it("models serializable host-reviewed inline runs without parsing markup", () => {
    const fixture = createRichTextInlineRunFixture();

    expect(fixture.metadata.runs.map((run) => run.id)).toEqual([
      "run.001.speaker",
      "run.002.body",
      "run.003.emphasis",
      "run.004.choice",
      "run.005.locked",
      "run.006.unsupported",
    ]);
    expect(fixture.metadata.spans.map((span) => span.kind)).toEqual([
      "speaker",
      "tone",
      "emphasis",
      "choice-hint",
      "disabled-reason",
      "locked-reason",
      "unsupported",
    ]);
    expect(JSON.stringify(fixture.metadata)).not.toContain("<");
    expect(JSON.stringify(fixture.metadata)).not.toContain("innerHTML");
    expect(JSON.stringify(fixture.metadata)).not.toContain("markdown");
    expect(JSON.parse(JSON.stringify(fixture.metadata))).toEqual(fixture.metadata);
    expect(fixture.note).toBe("host-reviewed-inline-runs-no-html-markdown-parser");
  });

  it("flattens nested spans in deterministic parent-before-child order", () => {
    const fixture = createRichTextInlineRunFixture();
    const emphasisRun = fixture.metadata.runs.find((run) => run.id === "run.003.emphasis");

    expect(emphasisRun).toBeDefined();
    expect(flattenRichTextRunSpanIds(emphasisRun!, fixture.metadata.spans)).toEqual([
      "speaker.mira",
      "tone.warning",
      "emphasis.sealed",
    ]);
    expect(fixture.flattenedSpanOrder).toEqual([
      "speaker.mira",
      "tone.warning",
      "emphasis.sealed",
      "choice.reroute",
      "disabled.relay",
      "locked.relay",
      "unsupported.flash",
    ]);
  });

  it("keeps unsupported span fallback text reviewable", () => {
    const fixture = createRichTextInlineRunFixture();

    expect(fixture.unsupportedFallbackText).toBe("[flash]");
    expect(fixture.metadata.spans.find((span) => span.kind === "unsupported")).toMatchObject({
      id: "unsupported.flash",
      fallbackText: "[flash]",
      rendererHints: ["muted"],
    });
  });
});
