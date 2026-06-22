import {
  collectRichTextDiagnostics,
  normalizeHostRichTextIntent,
  normalizeHostRichTextPolicySnapshot,
  normalizeRichTextMetadataFrame,
  runtimeUiThemeTokens,
  type HostRichTextIntent,
  type HostRichTextPolicySnapshot,
  type RichTextMetadataFrame,
  type ResolvedUiFrame,
  type UiDiagnostic,
} from "@ludoweave/core";
import {
  traceCanvas2DRichTextMetadata,
  type Canvas2DRichTextTrace,
} from "@ludoweave/renderer-canvas2d";

import {
  createSinanUIActionRefRegistryMock,
  type CreateSinanUIActionRefRegistryMockOptions,
  type SinanUIActionRegistryAuditEntry,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const gateDemoRichTextSequenceVersion = "ludoweave.sinan-gate-demo.rich-text.v0.8";

export interface GateDemoRichTextLocalizedTextRecord {
  readonly sequence: number;
  readonly localeHint: string;
  readonly blockId: string;
  readonly source: "host-runtime-ui";
  readonly text: string;
}

export interface GateDemoRichTextFallbackPolicy {
  readonly policy: "plain-text-fallback";
  readonly owner: "host";
  readonly reason: "unsupported-span" | "missing-review";
  readonly fallbackText: string;
}

export interface GateDemoRichTextSequenceResult {
  readonly version: typeof gateDemoRichTextSequenceVersion;
  readonly frameId?: string;
  readonly frame: ResolvedUiFrame;
  readonly localizedText: readonly GateDemoRichTextLocalizedTextRecord[];
  readonly richTextMetadata: RichTextMetadataFrame;
  readonly hostPolicy: HostRichTextPolicySnapshot;
  readonly fallbackPolicy: GateDemoRichTextFallbackPolicy;
  readonly intents: readonly HostRichTextIntent[];
  readonly registryResults: readonly SinanUIActionRegistryAuditEntry[];
  readonly rendererTrace: Canvas2DRichTextTrace;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface CreateGateDemoRichTextSequenceOptions {
  readonly frame?: ResolvedUiFrame;
  readonly frameId?: string;
  readonly registryOptions?: CreateSinanUIActionRefRegistryMockOptions;
  readonly richTextMetadata?: RichTextMetadataFrame;
}

export function createGateDemoRichTextSequence(
  options: CreateGateDemoRichTextSequenceOptions = {},
): GateDemoRichTextSequenceResult {
  const mapping =
    options.frame === undefined
      ? mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope)
      : undefined;
  const frame = requireFrame(options.frame ?? mapping?.frame);
  const frameId = options.frameId ?? mapping?.envelopeFrameId;
  const richTextMetadata = options.richTextMetadata ?? createGateDemoRichTextMetadata();
  const block = richTextMetadata.blocks[0];

  if (block === undefined) {
    throw new Error("Gate Demo rich text sequence requires one metadata block.");
  }

  const hostPolicy = normalizeHostRichTextPolicySnapshot({
    blockId: block.id,
    localeHint: block.localeHint,
    contentRevision: 1,
    localizedContent: { sourceId: "host.localization.dialogue.gate", revision: 1 },
    markupPolicy: { sourceId: "host.markup-policy.runtime-ui", revision: 1 },
    sanitization: { sourceId: "host.sanitizer.dialogue", revision: 1 },
    narrativeState: { sourceId: "host.narrative.gate", revision: 1 },
    accessibilityReview: { status: "pending", sourceId: "host.a11y.review", revision: 1 },
    textMeasurement: { sourceId: "host.measurement.policy", revision: 1 },
    fontSelection: { sourceId: "host.font-policy.runtime-ui", revision: 1 },
    platformPolicy: { sourceId: "host.platform.policy", revision: 1 },
  });
  const fallbackPolicy: GateDemoRichTextFallbackPolicy = {
    policy: "plain-text-fallback",
    owner: "host",
    reason: "unsupported-span",
    fallbackText: block.plainTextFallback,
  };
  const rendererTrace = traceCanvas2DRichTextMetadata(frame, richTextMetadata, {
    knownThemeTokenRefs: [runtimeUiThemeTokens.subtitle.text, runtimeUiThemeTokens.objective.title],
    maxNestedSpanDepth: 2,
  });
  const intents = createHostRichTextIntents(block.id);
  const registry = createSinanUIActionRefRegistryMock(options.registryOptions ?? {});

  for (const intent of intents) {
    registry.route(intent.action, {
      ...(frameId === undefined ? {} : { frameId }),
      nodeId: block.nodeId,
      label: "Gate Demo rich text intent",
    });
  }

  return {
    version: gateDemoRichTextSequenceVersion,
    ...(frameId === undefined ? {} : { frameId }),
    frame,
    localizedText: [
      {
        sequence: 1,
        localeHint: block.localeHint,
        blockId: block.id,
        source: "host-runtime-ui",
        text: block.plainTextFallback,
      },
    ],
    richTextMetadata,
    hostPolicy,
    fallbackPolicy,
    intents,
    registryResults: registry.auditLogSnapshot(),
    rendererTrace,
    diagnostics: [
      ...collectRichTextDiagnostics({
        metadata: block,
        knownThemeTokenRefs: [
          runtimeUiThemeTokens.subtitle.text,
          runtimeUiThemeTokens.objective.title,
        ],
        hostPolicy,
        maxNestedSpanDepth: 2,
      }),
      ...(rendererTrace.result === "blocks"
        ? rendererTrace.blocks.flatMap((entry) => entry.diagnostics)
        : []),
    ],
  };
}

function createGateDemoRichTextMetadata(): RichTextMetadataFrame {
  return normalizeRichTextMetadataFrame({
    activeBlockId: "gate-demo.subtitle.rich-text",
    reviewBlockId: "gate-demo.subtitle.rich-text",
    blocks: [
      {
        id: "gate-demo.subtitle.rich-text",
        nodeId: "runtime.main/key:subtitle.gate.hum",
        localeHint: "en-US",
        plainTextFallback: "Gate: The north lock is humming. [sigil]",
        spans: [
          {
            id: "span.speaker",
            kind: "speaker",
            label: "Gate",
            rendererHints: ["speaker"],
            themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
          },
          {
            id: "span.warning",
            kind: "tone",
            label: "Warning",
            parentSpanId: "span.speaker",
            rendererHints: ["accent"],
            themeTokenRefs: [runtimeUiThemeTokens.objective.title],
          },
          {
            id: "span.sigil",
            kind: "unsupported",
            fallbackText: "[sigil]",
            rendererHints: ["muted"],
          },
        ],
        runs: [
          {
            id: "run.speaker",
            text: "Gate",
            spanIds: ["span.speaker"],
            themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
            rendererHints: ["speaker"],
          },
          {
            id: "run.body",
            text: ": The north lock is humming. ",
            spanIds: ["span.warning"],
            themeTokenRefs: [runtimeUiThemeTokens.objective.title],
            rendererHints: ["accent"],
          },
          {
            id: "run.sigil",
            text: "[sigil]",
            spanIds: ["span.sigil"],
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
          label: "Gate says the north lock is humming.",
          description: "Host-reviewed subtitle fallback for Gate Demo.",
          liveRegion: "polite",
          pronunciationHint: "Gate",
          reviewStatus: "pending",
        },
      },
    ],
  });
}

function createHostRichTextIntents(blockId: string): readonly HostRichTextIntent[] {
  return [
    normalizeHostRichTextIntent({
      kind: "request-review",
      blockId,
      policyLane: "accessibility-review",
    }),
    normalizeHostRichTextIntent({
      kind: "activate-span",
      blockId,
      policyLane: "narrative-state",
      spanId: "span.speaker",
    }),
    normalizeHostRichTextIntent({
      kind: "use-fallback",
      blockId,
      policyLane: "markup-policy",
      fallbackReason: "unsupported-span",
    }),
    normalizeHostRichTextIntent({
      kind: "dismiss-diagnostic",
      blockId,
      policyLane: "sanitization",
      diagnosticCode: "LW_RICH_TEXT_UNSUPPORTED_SPAN",
    }),
  ];
}

function requireFrame(frame: ResolvedUiFrame | undefined): ResolvedUiFrame {
  if (frame === undefined) {
    throw new Error("Gate Demo rich text sequence requires a resolved frame.");
  }

  return frame;
}
