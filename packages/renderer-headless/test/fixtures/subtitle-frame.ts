import {
  resolveAbsoluteAnchor,
  resolveTextMeasure,
  snapRectToPixelGrid,
  type ResolvedUiFrame,
  type TextMeasure,
} from "@ludoweave/core";

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
  const measured = resolveTextMeasure({
    text,
    fontSize,
    maxWidth: 960,
    measureText,
  });
  const box = snapRectToPixelGrid({
    devicePixelRatio: viewport.devicePixelRatio,
    rect: resolveAbsoluteAnchor({
      container: { x: 0, y: 0, width: viewport.width, height: viewport.height },
      size: measured,
      anchor: {
        horizontal: "center",
        vertical: "end",
        inset: {
          bottom: 72,
        },
      },
    }),
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
