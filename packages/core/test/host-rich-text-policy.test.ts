import { describe, expect, it } from "vitest";

import {
  createHostRichTextIntentActionRef,
  normalizeHostRichTextIntent,
  normalizeHostRichTextPolicySnapshot,
} from "../src/host-rich-text-policy.js";

describe("host rich text policy contract", () => {
  it("normalizes host-owned rich text policy lanes", () => {
    const snapshot = normalizeHostRichTextPolicySnapshot({
      blockId: "dialogue-line",
      localeHint: "en-US",
      contentRevision: 7,
      localizedContent: {
        status: "available",
        sourceId: "loc.dialogue.001",
        revision: 7,
      },
      markupPolicy: { status: "available", sourceId: "policy.runtime-rich-text" },
      sanitization: { status: "available", sourceId: "sanitize.host" },
      narrativeState: { status: "pending", sourceId: "timeline.branch.north-gate" },
      accessibilityReview: { status: "pending", sourceId: "a11y.review.42" },
      textMeasurement: { status: "available", sourceId: "fixture.text-measure.host" },
      fontSelection: { status: "available", sourceId: "font.policy.subtitle" },
      platformPolicy: { status: "available", sourceId: "platform.policy.pc" },
    });

    expect(snapshot).toEqual({
      blockId: "dialogue-line",
      localeHint: "en-US",
      contentRevision: 7,
      localizedContent: {
        lane: "localized-content",
        status: "available",
        owner: "host",
        sourceId: "loc.dialogue.001",
        revision: 7,
      },
      markupPolicy: {
        lane: "markup-policy",
        status: "available",
        owner: "host",
        sourceId: "policy.runtime-rich-text",
      },
      sanitization: {
        lane: "sanitization",
        status: "available",
        owner: "host",
        sourceId: "sanitize.host",
      },
      narrativeState: {
        lane: "narrative-state",
        status: "pending",
        owner: "host",
        sourceId: "timeline.branch.north-gate",
      },
      accessibilityReview: {
        lane: "accessibility-review",
        status: "pending",
        owner: "host",
        sourceId: "a11y.review.42",
      },
      textMeasurement: {
        lane: "text-measurement",
        status: "available",
        owner: "host",
        sourceId: "fixture.text-measure.host",
      },
      fontSelection: {
        lane: "font-selection",
        status: "available",
        owner: "host",
        sourceId: "font.policy.subtitle",
      },
      platformPolicy: {
        lane: "platform-policy",
        status: "available",
        owner: "host",
        sourceId: "platform.policy.pc",
      },
    });
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it("normalizes rich text intents with ActionRef-only host handoff", () => {
    expect([
      normalizeHostRichTextIntent({
        kind: "request-review",
        blockId: "dialogue-line",
        policyLane: "accessibility-review",
      }),
      normalizeHostRichTextIntent({
        kind: "activate-span",
        blockId: "choice-line",
        policyLane: "localized-content",
        spanId: "choice.accept",
      }),
      normalizeHostRichTextIntent({
        kind: "use-fallback",
        blockId: "subtitle",
        policyLane: "sanitization",
        fallbackReason: "unsupported-span",
      }),
      normalizeHostRichTextIntent({
        kind: "dismiss-diagnostic",
        blockId: "subtitle",
        policyLane: "markup-policy",
        diagnosticCode: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
      }),
    ]).toEqual([
      {
        kind: "request-review",
        handoff: "host",
        blockId: "dialogue-line",
        policyLane: "accessibility-review",
        action: {
          type: "runtime.richText.intent",
          payload: {
            kind: "request-review",
            blockId: "dialogue-line",
            policyLane: "accessibility-review",
          },
        },
      },
      {
        kind: "activate-span",
        handoff: "host",
        blockId: "choice-line",
        policyLane: "localized-content",
        spanId: "choice.accept",
        action: {
          type: "runtime.richText.intent",
          payload: {
            kind: "activate-span",
            blockId: "choice-line",
            policyLane: "localized-content",
            spanId: "choice.accept",
          },
        },
      },
      {
        kind: "use-fallback",
        handoff: "host",
        blockId: "subtitle",
        policyLane: "sanitization",
        fallbackReason: "unsupported-span",
        action: {
          type: "runtime.richText.intent",
          payload: {
            kind: "use-fallback",
            blockId: "subtitle",
            policyLane: "sanitization",
            fallbackReason: "unsupported-span",
          },
        },
      },
      {
        kind: "dismiss-diagnostic",
        handoff: "host",
        blockId: "subtitle",
        policyLane: "markup-policy",
        diagnosticCode: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
        action: {
          type: "runtime.richText.intent",
          payload: {
            kind: "dismiss-diagnostic",
            blockId: "subtitle",
            policyLane: "markup-policy",
            diagnosticCode: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
          },
        },
      },
    ]);
  });

  it("keeps intents JSON-serializable and rejects callback payloads", () => {
    const intent = normalizeHostRichTextIntent({
      kind: "activate-span",
      blockId: "choice-line",
      policyLane: "localized-content",
      spanId: "choice.accept",
    });

    expect(JSON.parse(JSON.stringify(intent))).toEqual(intent);
    expect(createHostRichTextIntentActionRef(intent)).toEqual(intent.action);

    expect(() =>
      normalizeHostRichTextIntent({
        kind: "request-review",
        blockId: "dialogue-line",
        policyLane: "accessibility-review",
        action: {
          type: "runtime.richText.review",
          payload: {
            sanitize: () => undefined,
          },
        },
      } as never),
    ).toThrow(/payload\.sanitize must be a JsonValue/);
  });

  it("rejects renderer-owned policy, native-like objects, and invalid kind-specific fields", () => {
    class NativeTextEvent {
      blockId = "dialogue-line";
      target = { dataset: { spanId: "choice.accept" } };
    }

    expect(() => normalizeHostRichTextPolicySnapshot(new NativeTextEvent() as never)).toThrow(
      /plain object/,
    );

    expect(() =>
      normalizeHostRichTextPolicySnapshot({
        blockId: "dialogue-line",
        sanitization: { owner: "renderer" as never },
      }),
    ).toThrow(/owner must be host/);

    expect(() =>
      normalizeHostRichTextPolicySnapshot({
        blockId: "dialogue-line",
        textMeasurement: { status: "browser-owned" as never },
      }),
    ).toThrow(/policy status/);

    expect(() =>
      normalizeHostRichTextIntent({
        kind: "request-review",
        blockId: "dialogue-line",
        policyLane: "accessibility-review",
        spanId: "choice.accept",
      }),
    ).toThrow(/spanId is only valid/);
  });
});
