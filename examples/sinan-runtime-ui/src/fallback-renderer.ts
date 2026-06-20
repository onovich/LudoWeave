import { normalizeActionRef, type ActionRef } from "@ludoweave/core";

import { mapRuntimeUIPromptAction } from "./action-mapping.js";
import type {
  RuntimeUIElement,
  RuntimeUILayer,
  RuntimeUIPromptElement,
  RuntimeUISubtitleElement,
  RuntimeUIViewModel,
} from "./view-model.js";

export interface FallbackRuntimeUISnapshot {
  readonly frame: number;
  readonly source: "sinan-fallback";
  readonly layers: readonly FallbackRuntimeUILayer[];
}

export interface FallbackRuntimeUILayer {
  readonly id: string;
  readonly zIndex: number;
  readonly elements: readonly FallbackRuntimeUIElement[];
}

export type FallbackRuntimeUIElement =
  | FallbackRuntimeUIPromptElement
  | FallbackRuntimeUISubtitleElement;

export interface FallbackRuntimeUIPromptElement {
  readonly type: "prompt";
  readonly id: string;
  readonly text: string;
  readonly action: ActionRef;
}

export interface FallbackRuntimeUISubtitleElement {
  readonly type: "subtitle";
  readonly id: string;
  readonly text: string;
  readonly speaker?: string;
}

export function renderRuntimeUIViewModelFallback(
  viewModel: RuntimeUIViewModel,
): FallbackRuntimeUISnapshot {
  return {
    frame: viewModel.frame,
    source: "sinan-fallback",
    layers: viewModel.layers.map((layer) => renderLayer(layer)),
  };
}

function renderLayer(layer: RuntimeUILayer): FallbackRuntimeUILayer {
  return {
    id: layer.id,
    zIndex: layer.zIndex,
    elements: layer.elements.map((element) => renderElement(element)),
  };
}

function renderElement(element: RuntimeUIElement): FallbackRuntimeUIElement {
  if (element.type === "prompt") {
    return renderPrompt(element);
  }

  return renderSubtitle(element);
}

function renderPrompt(element: RuntimeUIPromptElement): FallbackRuntimeUIPromptElement {
  return {
    type: "prompt",
    id: element.id,
    text: element.text,
    action: normalizeActionRef(mapRuntimeUIPromptAction(element)),
  };
}

function renderSubtitle(element: RuntimeUISubtitleElement): FallbackRuntimeUISubtitleElement {
  const subtitle: MutableFallbackRuntimeUISubtitleElement = {
    type: "subtitle",
    id: element.id,
    text: element.text,
  };

  if (element.speaker !== undefined) {
    subtitle.speaker = element.speaker;
  }

  return subtitle;
}

type MutableFallbackRuntimeUISubtitleElement = {
  type: "subtitle";
  id: string;
  text: string;
  speaker?: string;
};
