import {
  normalizeUiNode,
  resolveAbsoluteAnchor,
  resolveTextMeasure,
  snapRectToPixelGrid,
  type ResolvedUiFrame,
  type TextMeasure,
  type UiNode,
} from "@ludoweave/core";
import { Subtitle } from "@ludoweave/components";

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
  const subtitleNode = normalizeUiNode(Subtitle.render({ text }));
  const key = requireKey(subtitleNode);
  const props = requireProps(subtitleNode);
  const subtitleText = getStringProp(subtitleNode, "text");
  const measureText = options.measureText ?? createDeterministicTextMeasure();
  const fontSize = 18;
  const viewport = {
    width: 1280,
    height: 720,
    devicePixelRatio: 1,
  };
  const measured = resolveTextMeasure({
    text: subtitleText,
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
        type: subtitleNode.type,
        key,
        index: 0,
        box,
        props,
      },
    ],
    paint: [
      {
        id: "paint.subtitle.text",
        kind: "text",
        nodeId: "root/key:subtitle",
        box,
        text: subtitleText,
        color: "#f8fafc",
        fontSize,
      },
    ],
    semantics: [
      {
        id: "semantics.subtitle",
        nodeId: "root/key:subtitle",
        role: "text",
        label: subtitleText,
      },
    ],
    actions: [],
    diagnostics: [],
  };
}

function getStringProp(node: UiNode, propName: string): string {
  const value = node.props?.[propName];
  if (typeof value !== "string") {
    throw new TypeError(`Subtitle fixture expected string prop ${propName}.`);
  }
  return value;
}

function requireKey(node: UiNode): string {
  if (node.key === undefined) {
    throw new TypeError("Subtitle fixture expected a key.");
  }
  return node.key;
}

function requireProps(node: UiNode): NonNullable<UiNode["props"]> {
  if (node.props === undefined) {
    throw new TypeError("Subtitle fixture expected props.");
  }
  return node.props;
}
