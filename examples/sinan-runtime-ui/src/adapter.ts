import {
  Dialog,
  Objective,
  Prompt,
  Subtitle,
  type DialogProps,
  type ObjectiveProps,
  type PromptProps,
  type SubtitleProps,
} from "@ludoweave/components";
import {
  createThemeTokenStyle,
  normalizeActionRef,
  runtimeUiThemeTokens,
  type ActionRefInput,
  type JsonValue,
  type UiNodeInput,
} from "@ludoweave/core";

import type {
  RuntimeUIEditableOverlayCandidateElement,
  RuntimeUIElement,
  RuntimeUIObjectiveElement,
  RuntimeUIPauseElement,
  RuntimeUIPromptElement,
  RuntimeUISubtitleElement,
  RuntimeUIViewModel,
} from "./view-model.js";
import { mapRuntimeUIObjectiveAction, mapRuntimeUIPromptAction } from "./action-mapping.js";

export interface RuntimeUIComponentPropsMapping {
  readonly prompts: readonly PromptProps[];
  readonly subtitles: readonly SubtitleProps[];
  readonly objectives: readonly ObjectiveProps[];
  readonly pauses: readonly DialogProps[];
  readonly editableOverlayCandidates: readonly UiNodeInput[];
}

export function mapRuntimeUIViewModelToComponentProps(
  viewModel: RuntimeUIViewModel,
): RuntimeUIComponentPropsMapping {
  const prompts: PromptProps[] = [];
  const subtitles: SubtitleProps[] = [];
  const objectives: ObjectiveProps[] = [];
  const pauses: DialogProps[] = [];
  const editableOverlayCandidates: UiNodeInput[] = [];

  for (const element of getElements(viewModel)) {
    if (element.type === "prompt") {
      prompts.push(mapPromptElementToProps(element));
      continue;
    }

    if (element.type === "subtitle") {
      subtitles.push(mapSubtitleElementToProps(element));
      continue;
    }

    if (element.type === "objective") {
      objectives.push(mapObjectiveElementToProps(element));
      continue;
    }

    if (element.type === "pause") {
      pauses.push(mapPauseElementToProps(element));
      continue;
    }

    editableOverlayCandidates.push(mapEditableOverlayCandidateElementToNode(element));
  }

  return {
    prompts,
    subtitles,
    objectives,
    pauses,
    editableOverlayCandidates,
  };
}

export function mapRuntimeUIViewModelToUiNodes(
  viewModel: RuntimeUIViewModel,
): readonly UiNodeInput[] {
  return getElements(viewModel).map((element) => mapRuntimeUIElementToUiNode(element));
}

function mapRuntimeUIElementToUiNode(element: RuntimeUIElement): UiNodeInput {
  if (element.type === "prompt") {
    return Prompt.render(mapPromptElementToProps(element));
  }

  if (element.type === "subtitle") {
    return Subtitle.render(mapSubtitleElementToProps(element));
  }

  if (element.type === "objective") {
    return Objective.render(mapObjectiveElementToProps(element));
  }

  if (element.type === "pause") {
    return Dialog.render(mapPauseElementToProps(element));
  }

  return mapEditableOverlayCandidateElementToNode(element);
}

function mapPromptElementToProps(element: RuntimeUIPromptElement): PromptProps {
  return {
    key: element.id,
    label: element.text,
    action: mapRuntimeUIPromptAction(element),
  };
}

function mapSubtitleElementToProps(element: RuntimeUISubtitleElement): SubtitleProps {
  return {
    key: element.id,
    text: element.text,
  };
}

function mapObjectiveElementToProps(element: RuntimeUIObjectiveElement): ObjectiveProps {
  return {
    key: element.id,
    title: element.title,
    ...(element.body === undefined ? {} : { body: element.body }),
    ...(element.status === undefined ? {} : { status: element.status }),
    ...(element.action === undefined ? {} : { action: mapRuntimeUIObjectiveAction(element) }),
  };
}

function mapPauseElementToProps(element: RuntimeUIPauseElement): DialogProps {
  return {
    key: element.id,
    title: element.title,
    ...(element.confirmAction === undefined ? {} : { confirmAction: element.confirmAction }),
    ...(element.cancelAction === undefined ? {} : { cancelAction: element.cancelAction }),
    focus: {
      scopeId: `${element.id}.focus`,
      initialFocusKey: "confirm",
      restoreFocusKey: "prompt.interact.switch_a",
    },
    inputShield: {
      blockedScopes: ["gameplay"],
    },
  };
}

function mapEditableOverlayCandidateElementToNode(
  element: RuntimeUIEditableOverlayCandidateElement,
): UiNodeInput {
  const props: Record<string, JsonValue> = {
    label: element.label,
    value: element.value,
    multiline: element.multiline,
    requiredCapability: element.requiredCapability,
    overlayCandidate: true,
    commitAction: serializeActionRef(element.commitAction),
    cancelAction: serializeActionRef(element.cancelAction),
  };

  if (element.placeholder !== undefined) {
    props.placeholder = element.placeholder;
  }

  if (element.inputMode !== undefined) {
    props.inputMode = element.inputMode;
  }

  if (element.fallbackAction !== undefined) {
    props.fallbackAction = serializeActionRef(element.fallbackAction);
  }

  return {
    type: "editable-text",
    key: element.id,
    props,
    style: createThemeTokenStyle(runtimeUiThemeTokens.dialog.controls),
  };
}

function serializeActionRef(action: ActionRefInput): JsonValue {
  const normalized = normalizeActionRef(action);

  if (normalized.payload === undefined) {
    return {
      type: normalized.type,
    };
  }

  return {
    type: normalized.type,
    payload: normalized.payload,
  };
}

function getElements(viewModel: RuntimeUIViewModel): readonly RuntimeUIElement[] {
  return viewModel.layers.flatMap((layer) => layer.elements);
}
