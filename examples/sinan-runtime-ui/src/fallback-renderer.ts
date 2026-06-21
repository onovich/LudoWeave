import { normalizeActionRef, type ActionRef } from "@ludoweave/core";

import { mapRuntimeUIObjectiveAction, mapRuntimeUIPromptAction } from "./action-mapping.js";
import type {
  RuntimeUIElement,
  RuntimeUILayer,
  RuntimeUIObjectiveElement,
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
  | FallbackRuntimeUISubtitleElement
  | FallbackRuntimeUIObjectiveElement;

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

export interface FallbackRuntimeUIObjectiveElement {
  readonly type: "objective";
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly status: "active" | "completed" | "failed";
  readonly action?: ActionRef;
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

  if (element.type === "objective") {
    return renderObjective(element);
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

function renderObjective(element: RuntimeUIObjectiveElement): FallbackRuntimeUIObjectiveElement {
  const objective: MutableFallbackRuntimeUIObjectiveElement = {
    type: "objective",
    id: element.id,
    title: element.title,
    status: element.status ?? "active",
  };

  if (element.body !== undefined) {
    objective.body = element.body;
  }

  if (element.action !== undefined) {
    objective.action = normalizeActionRef(mapRuntimeUIObjectiveAction(element));
  }

  return objective;
}

type MutableFallbackRuntimeUISubtitleElement = {
  type: "subtitle";
  id: string;
  text: string;
  speaker?: string;
};

type MutableFallbackRuntimeUIObjectiveElement = {
  type: "objective";
  id: string;
  title: string;
  body?: string;
  status: "active" | "completed" | "failed";
  action?: ActionRef;
};
