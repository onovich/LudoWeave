import { describe, expect, it } from "vitest";

import { createGateDemoRichTextSequence, gateDemoRichTextSequenceVersion } from "../src/index.js";

describe("Gate Demo rich text sequence", () => {
  it("creates host-owned localized text, fallback policy, renderer trace, and registry results", () => {
    const sequence = createGateDemoRichTextSequence();

    expect(sequence.version).toBe(gateDemoRichTextSequenceVersion);
    expect(sequence.frameId).toBe("gate-demo:1024");
    expect(sequence.localizedText).toEqual([
      {
        sequence: 1,
        localeHint: "en-US",
        blockId: "gate-demo.subtitle.rich-text",
        source: "host-runtime-ui",
        text: "Gate: The north lock is humming. [sigil]",
      },
    ]);
    expect(sequence.richTextMetadata.blocks[0]).toMatchObject({
      id: "gate-demo.subtitle.rich-text",
      nodeId: "runtime.main/key:subtitle.gate.hum",
      plainTextFallback: "Gate: The north lock is humming. [sigil]",
      hostPolicy: {
        localizedContent: "approved",
        markupPolicy: "approved",
        sanitization: "approved",
        accessibilityReview: "pending",
      },
    });
    expect(sequence.hostPolicy).toMatchObject({
      blockId: "gate-demo.subtitle.rich-text",
      localizedContent: { owner: "host", status: "available" },
      sanitization: { owner: "host", status: "available" },
      accessibilityReview: { owner: "host", status: "pending" },
      textMeasurement: { owner: "host", status: "available" },
      fontSelection: { owner: "host", status: "available" },
    });
    expect(sequence.fallbackPolicy).toEqual({
      policy: "plain-text-fallback",
      owner: "host",
      reason: "unsupported-span",
      fallbackText: "Gate: The north lock is humming. [sigil]",
    });
    expect(sequence.rendererTrace).toMatchObject({
      kind: "rich-text-trace",
      result: "blocks",
      blocks: [
        {
          blockId: "gate-demo.subtitle.rich-text",
          nodeId: "runtime.main/key:subtitle.gate.hum",
          runs: [
            { runId: "run.speaker", text: "Gate" },
            { runId: "run.body", text: ": The north lock is humming. " },
            { runId: "run.sigil", text: "[sigil]" },
          ],
          spans: [
            { spanId: "span.speaker", kind: "speaker" },
            { spanId: "span.warning", kind: "tone" },
            { spanId: "span.sigil", kind: "unsupported", fallbackText: "[sigil]" },
          ],
        },
      ],
    });
    expect(sequence.intents.map((intent) => intent.kind)).toEqual([
      "request-review",
      "activate-span",
      "use-fallback",
      "dismiss-diagnostic",
    ]);
    expect(sequence.registryResults.every((entry) => entry.routingResult === "accepted")).toBe(
      true,
    );
    expect(sequence.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      "LW_RICH_TEXT_UNSUPPORTED_SPAN",
    );
    expect(JSON.stringify(sequence)).not.toContain("innerHTML");
    expect(JSON.stringify(sequence)).not.toContain("contenteditable");
    expect(JSON.stringify(sequence)).not.toContain("SinanProject");
    expect(JSON.parse(JSON.stringify(sequence))).toEqual(sequence);
  });

  it("localizes rejected rich text routes to registry diagnostics", () => {
    const sequence = createGateDemoRichTextSequence({
      registryOptions: {
        disabledActionTypes: ["runtime.richText.intent"],
      },
    });

    expect(sequence.registryResults.map((entry) => entry.routingResult)).toEqual([
      "disabled",
      "disabled",
      "disabled",
      "disabled",
    ]);
    expect(
      sequence.registryResults
        .flatMap((entry) => entry.diagnostics)
        .map((diagnostic) => diagnostic.code),
    ).toEqual([
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
    ]);
  });
});
