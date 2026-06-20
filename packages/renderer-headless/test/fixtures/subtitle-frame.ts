import type { ResolvedRect, ResolvedUiFrame } from "@ludoweave/core";

export interface TextMeasureInput {
  readonly text: string;
  readonly fontSize: number;
  readonly maxWidth: number;
}

export interface TextMeasureResult {
  readonly width: number;
  readonly height: number;
}

export type TextMeasure = (input: TextMeasureInput) => TextMeasureResult;

export interface DeterministicTextMeasureOptions {
  readonly characterWidth?: number;
  readonly lineHeight?: number;
}

export interface SubtitleFrameFixtureOptions {
  readonly text?: string;
  readonly measureText?: TextMeasure;
}

export function createDeterministicTextMeasure(
  options: DeterministicTextMeasureOptions = {},
): TextMeasure {
  const characterWidth = options.characterWidth ?? 8;
  const lineHeight = options.lineHeight ?? 24;

  return ({ text, maxWidth }) => ({
    width: Math.min(text.length * characterWidth, maxWidth),
    height: lineHeight,
  });
}

export function createSubtitleFrameFixture(
  options: SubtitleFrameFixtureOptions = {},
): ResolvedUiFrame {
  const text = options.text ?? "The gate hums softly.";
  const measureText = options.measureText ?? createDeterministicTextMeasure();
  const fontSize = 18;
  const viewport = {
    width: 1280,
    height: 720,
    devicePixelRatio: 1,
  };
  const measured = measureText({
    text,
    fontSize,
    maxWidth: 960,
  });
  const box = centerBottom({
    width: measured.width,
    height: measured.height,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    bottomOffset: 72,
  });

  return {
    frameId: 2,
    viewport,
    nodes: [
      {
        id: "root/key:subtitle",
        path: ["root", "key:subtitle"],
        type: "text",
        key: "subtitle",
        index: 0,
        box,
        props: { text },
      },
    ],
    paint: [
      {
        id: "paint.subtitle.text",
        kind: "text",
        nodeId: "root/key:subtitle",
        box,
        text,
        color: "#f8fafc",
        fontSize,
      },
    ],
    semantics: [
      {
        id: "semantics.subtitle",
        nodeId: "root/key:subtitle",
        role: "text",
        label: text,
      },
    ],
    actions: [],
    diagnostics: [],
  };
}

function centerBottom(input: {
  readonly width: number;
  readonly height: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly bottomOffset: number;
}): ResolvedRect {
  return {
    x: Math.round((input.viewportWidth - input.width) / 2),
    y: input.viewportHeight - input.bottomOffset - input.height,
    width: input.width,
    height: input.height,
  };
}
