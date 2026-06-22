import { normalizeActionRef, type ActionRef } from "@ludoweave/core";

import { mapRuntimeUIObjectiveAction, mapRuntimeUIPromptAction } from "./action-mapping.js";
import type {
  RuntimeUIEditableOverlayCandidateElement,
  RuntimeUIElement,
  RuntimeUILayer,
  RuntimeUIObjectiveElement,
  RuntimeUIPauseElement,
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
  | FallbackRuntimeUIObjectiveElement
  | FallbackRuntimeUIPauseElement
  | FallbackRuntimeUIEditableOverlayCandidateElement;

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

export interface FallbackRuntimeUIPauseElement {
  readonly type: "pause";
  readonly id: string;
  readonly title: string;
  readonly confirmAction?: ActionRef;
  readonly cancelAction?: ActionRef;
}

export interface FallbackRuntimeUIEditableOverlayCandidateElement {
  readonly type: "editable-overlay-candidate";
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly placeholder?: string;
  readonly inputMode?: string;
  readonly multiline: boolean;
  readonly requiredCapability: "overlay.text-input";
  readonly commitAction: ActionRef;
  readonly cancelAction: ActionRef;
  readonly fallbackAction?: ActionRef;
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

  if (element.type === "pause") {
    return renderPause(element);
  }

  if (element.type === "editable-overlay-candidate") {
    return renderEditableOverlayCandidate(element);
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

function renderPause(element: RuntimeUIPauseElement): FallbackRuntimeUIPauseElement {
  const pause: MutableFallbackRuntimeUIPauseElement = {
    type: "pause",
    id: element.id,
    title: element.title,
  };

  if (element.confirmAction !== undefined) {
    pause.confirmAction = normalizeActionRef(element.confirmAction);
  }

  if (element.cancelAction !== undefined) {
    pause.cancelAction = normalizeActionRef(element.cancelAction);
  }

  return pause;
}

function renderEditableOverlayCandidate(
  element: RuntimeUIEditableOverlayCandidateElement,
): FallbackRuntimeUIEditableOverlayCandidateElement {
  const editable: MutableFallbackRuntimeUIEditableOverlayCandidateElement = {
    type: "editable-overlay-candidate",
    id: element.id,
    label: element.label,
    value: element.value,
    multiline: element.multiline,
    requiredCapability: element.requiredCapability,
    commitAction: normalizeActionRef(element.commitAction),
    cancelAction: normalizeActionRef(element.cancelAction),
  };

  if (element.placeholder !== undefined) {
    editable.placeholder = element.placeholder;
  }

  if (element.inputMode !== undefined) {
    editable.inputMode = element.inputMode;
  }

  if (element.fallbackAction !== undefined) {
    editable.fallbackAction = normalizeActionRef(element.fallbackAction);
  }

  return editable;
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

type MutableFallbackRuntimeUIPauseElement = {
  type: "pause";
  id: string;
  title: string;
  confirmAction?: ActionRef;
  cancelAction?: ActionRef;
};

type MutableFallbackRuntimeUIEditableOverlayCandidateElement = {
  type: "editable-overlay-candidate";
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: string;
  multiline: boolean;
  requiredCapability: "overlay.text-input";
  commitAction: ActionRef;
  cancelAction: ActionRef;
  fallbackAction?: ActionRef;
};
