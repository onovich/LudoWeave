import { Prompt, Subtitle, type PromptProps, type SubtitleProps } from "@ludoweave/components";
import type { ActionRefInput, UiNodeInput } from "@ludoweave/core";

import type {
  RuntimeUIElement,
  RuntimeUIPromptElement,
  RuntimeUISubtitleElement,
  RuntimeUIViewModel,
} from "./view-model.js";

export interface RuntimeUIComponentPropsMapping {
  readonly prompts: readonly PromptProps[];
  readonly subtitles: readonly SubtitleProps[];
}

export function mapRuntimeUIViewModelToComponentProps(
  viewModel: RuntimeUIViewModel,
): RuntimeUIComponentPropsMapping {
  const prompts: PromptProps[] = [];
  const subtitles: SubtitleProps[] = [];

  for (const element of getElements(viewModel)) {
    if (element.type === "prompt") {
      prompts.push(mapPromptElementToProps(element));
      continue;
    }

    subtitles.push(mapSubtitleElementToProps(element));
  }

  return {
    prompts,
    subtitles,
  };
}

export function mapRuntimeUIViewModelToUiNodes(
  viewModel: RuntimeUIViewModel,
): readonly UiNodeInput[] {
  const props = mapRuntimeUIViewModelToComponentProps(viewModel);
  return [
    ...props.prompts.map((prompt) => Prompt.render(prompt)),
    ...props.subtitles.map((subtitle) => Subtitle.render(subtitle)),
  ];
}

function mapPromptElementToProps(element: RuntimeUIPromptElement): PromptProps {
  return {
    key: element.id,
    label: element.text,
    action: mapPromptAction(element),
  };
}

function mapSubtitleElementToProps(element: RuntimeUISubtitleElement): SubtitleProps {
  return {
    key: element.id,
    text: element.text,
  };
}

function mapPromptAction(element: RuntimeUIPromptElement): ActionRefInput {
  if (element.payload === undefined) {
    return element.action;
  }

  if (typeof element.action === "string") {
    return {
      type: element.action,
      payload: element.payload,
    };
  }

  return {
    ...element.action,
    payload: element.payload,
  };
}

function getElements(viewModel: RuntimeUIViewModel): readonly RuntimeUIElement[] {
  return viewModel.layers.flatMap((layer) => layer.elements);
}
