import {
  Objective,
  Prompt,
  Subtitle,
  type ObjectiveProps,
  type PromptProps,
  type SubtitleProps,
} from "@ludoweave/components";
import type { UiNodeInput } from "@ludoweave/core";

import type {
  RuntimeUIElement,
  RuntimeUIObjectiveElement,
  RuntimeUIPromptElement,
  RuntimeUISubtitleElement,
  RuntimeUIViewModel,
} from "./view-model.js";
import { mapRuntimeUIObjectiveAction, mapRuntimeUIPromptAction } from "./action-mapping.js";

export interface RuntimeUIComponentPropsMapping {
  readonly prompts: readonly PromptProps[];
  readonly subtitles: readonly SubtitleProps[];
  readonly objectives: readonly ObjectiveProps[];
}

export function mapRuntimeUIViewModelToComponentProps(
  viewModel: RuntimeUIViewModel,
): RuntimeUIComponentPropsMapping {
  const prompts: PromptProps[] = [];
  const subtitles: SubtitleProps[] = [];
  const objectives: ObjectiveProps[] = [];

  for (const element of getElements(viewModel)) {
    if (element.type === "prompt") {
      prompts.push(mapPromptElementToProps(element));
      continue;
    }

    if (element.type === "subtitle") {
      subtitles.push(mapSubtitleElementToProps(element));
      continue;
    }

    objectives.push(mapObjectiveElementToProps(element));
  }

  return {
    prompts,
    subtitles,
    objectives,
  };
}

export function mapRuntimeUIViewModelToUiNodes(
  viewModel: RuntimeUIViewModel,
): readonly UiNodeInput[] {
  const props = mapRuntimeUIViewModelToComponentProps(viewModel);
  return [
    ...props.prompts.map((prompt) => Prompt.render(prompt)),
    ...props.subtitles.map((subtitle) => Subtitle.render(subtitle)),
    ...props.objectives.map((objective) => Objective.render(objective)),
  ];
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

function getElements(viewModel: RuntimeUIViewModel): readonly RuntimeUIElement[] {
  return viewModel.layers.flatMap((layer) => layer.elements);
}
