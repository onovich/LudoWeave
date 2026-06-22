import {
  normalizeRichTextMetadata,
  type RenderCommand,
  type ResolvedNode,
  type ResolvedRect,
  type ResolvedUiFrame,
  type RichTextMetadata,
  type SemanticNode,
  type UiDiagnostic,
} from "@ludoweave/core";

export type RichTextFallbackCaseKind =
  | "empty-text"
  | "fallback-run-mismatch"
  | "locale-hint"
  | "missing-fallback";

export interface RichTextFallbackCase {
  readonly kind: RichTextFallbackCaseKind;
  readonly blockId: string;
  readonly stableText: string;
  readonly reviewNote: string;
}

export interface RichTextPlainFallbackFixture {
  readonly name: "rich-text-plain-fallback";
  readonly frame: ResolvedUiFrame;
  readonly metadata: RichTextMetadata;
  readonly fallbackCases: readonly RichTextFallbackCase[];
  readonly note: "plain-text-fallback-no-rich-markup-parser";
}

export function createRichTextPlainFallbackFixture(): RichTextPlainFallbackFixture {
  const dialogueBox: ResolvedRect = { x: 96, y: 420, width: 720, height: 88 };
  const stableText = "Mira: The north gate is sealed.";
  const diagnostics: readonly UiDiagnostic[] = [
    {
      code: "LW_RICH_TEXT_FALLBACK_RUN_MISMATCH",
      severity: "warning",
      message: "Plain text fallback differs from concatenated inline runs.",
      details: {
        blockId: "dialogue.fallback",
        expected: stableText,
        actual: "Mira: The north gate is sealed!",
      },
    },
    {
      code: "LW_RICH_TEXT_MISSING_FALLBACK_TEXT",
      severity: "warning",
      message: "A related empty text block must provide a host-reviewed fallback.",
      details: { blockId: "dialogue.empty" },
    },
  ];
  const metadata = normalizeRichTextMetadata({
    id: "dialogue.fallback",
    nodeId: "runtime.overlay/key:dialogue-fallback",
    localeHint: "en-US",
    plainTextFallback: stableText,
    runs: [
      { id: "run.speaker", text: "Mira", spanIds: ["speaker.mira"] },
      { id: "run.body", text: ": The north gate is sealed!" },
    ],
    spans: [{ id: "speaker.mira", kind: "speaker", label: "Mira" }],
    hostPolicy: {
      localizedContent: "approved",
      markupPolicy: "approved",
      sanitization: "approved",
      accessibilityReview: "pending",
    },
    a11y: {
      label: stableText,
      description: "Host-reviewed plain text fallback for a dialogue line.",
      reviewStatus: "pending",
    },
    diagnostics,
  });

  return {
    name: "rich-text-plain-fallback",
    frame: createFallbackFrame({ dialogueBox, stableText }),
    metadata,
    fallbackCases: [
      {
        kind: "locale-hint",
        blockId: "dialogue.fallback",
        stableText,
        reviewNote: "Host supplies locale hint and reviewed fallback text.",
      },
      {
        kind: "fallback-run-mismatch",
        blockId: "dialogue.fallback",
        stableText,
        reviewNote: "Renderer may use fallback text without reconciling rich runs.",
      },
      {
        kind: "empty-text",
        blockId: "dialogue.empty",
        stableText: "",
        reviewNote: "Empty host text remains explicit and reviewable.",
      },
      {
        kind: "missing-fallback",
        blockId: "dialogue.missing-fallback",
        stableText: "[missing fallback]",
        reviewNote: "Missing fallback is surfaced as metadata, not repaired by renderer parsing.",
      },
    ],
    note: "plain-text-fallback-no-rich-markup-parser",
  };
}

function createFallbackFrame(input: {
  readonly dialogueBox: ResolvedRect;
  readonly stableText: string;
}): ResolvedUiFrame {
  return {
    frameId: 4800,
    viewport: {
      width: 1280,
      height: 720,
      devicePixelRatio: 1,
    },
    nodes: createNodes(input),
    paint: createPaint(input),
    semantics: createSemantics(input.stableText),
    actions: [],
    diagnostics: [],
  };
}

function createNodes(input: {
  readonly dialogueBox: ResolvedRect;
  readonly stableText: string;
}): readonly ResolvedNode[] {
  return [
    {
      id: "runtime.overlay",
      path: ["runtime.overlay"],
      type: "surface",
      key: "runtime.overlay",
      index: 0,
      children: ["runtime.overlay/key:dialogue-fallback"],
      box: { x: 0, y: 0, width: 1280, height: 720 },
    },
    {
      id: "runtime.overlay/key:dialogue-fallback",
      path: ["runtime.overlay", "key:dialogue-fallback"],
      type: "text",
      key: "dialogue-fallback",
      parentId: "runtime.overlay",
      index: 0,
      children: [],
      box: input.dialogueBox,
      props: {
        richTextBlockId: "dialogue.fallback",
        plainTextFallback: input.stableText,
        richTextContract: "metadata-only",
      },
    },
  ];
}

function createPaint(input: {
  readonly dialogueBox: ResolvedRect;
  readonly stableText: string;
}): readonly RenderCommand[] {
  return [
    {
      id: "paint.dialogue.fallback",
      kind: "text",
      nodeId: "runtime.overlay/key:dialogue-fallback",
      box: input.dialogueBox,
      text: input.stableText,
      color: "#e5e7eb",
      fontSize: 18,
    },
  ];
}

function createSemantics(stableText: string): readonly SemanticNode[] {
  return [
    {
      id: "semantics.runtime.overlay",
      nodeId: "runtime.overlay",
      role: "surface",
      children: ["semantics.dialogue.fallback"],
    },
    {
      id: "semantics.dialogue.fallback",
      nodeId: "runtime.overlay/key:dialogue-fallback",
      role: "text",
      parentId: "semantics.runtime.overlay",
      label: stableText,
    },
  ];
}
