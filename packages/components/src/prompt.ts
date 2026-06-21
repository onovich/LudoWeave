import {
  createThemeTokenStyle,
  runtimeUiThemeTokens,
  type ActionRefInput,
  type UiNodeInput,
  type UiStyle,
  type UiThemeTokenName,
} from "@ludoweave/core";

import { Button } from "./button.js";
import { definePureComponent, type ComponentProps } from "./pure-component.js";

/**
 * Prompt component props for a small runtime interaction affordance.
 *
 * @public
 */
export interface PromptProps extends ComponentProps {
  readonly label?: string;
  readonly action?: ActionRefInput;
  readonly key?: string;
  readonly disabled?: boolean;
  readonly themeToken?: UiThemeTokenName;
  readonly style?: UiStyle;
}

/**
 * Runtime prompt component built from ActionRef-only primitives.
 *
 * @public
 */
export const Prompt = definePureComponent<PromptProps>(
  {
    displayName: "Prompt",
  },
  renderPrompt,
);

/**
 * Renders a prompt as a labelled button UiNode.
 *
 * @public
 */
export function renderPrompt(props: Readonly<PromptProps>): UiNodeInput {
  return Button.render({
    key: props.key ?? "prompt",
    label: props.label ?? "Press E",
    action: props.action ?? "runtime.gameplay.interact",
    ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
    style: createThemeTokenStyle(props.themeToken ?? runtimeUiThemeTokens.prompt.root, props.style),
  });
}
