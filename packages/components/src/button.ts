import {
  normalizeActionRef,
  type ActionRef,
  type ActionRefInput,
  type UiNodeInput,
  type UiStyle,
} from "@ludoweave/core";

import { definePureComponent, type ComponentProps } from "./pure-component.js";
import { createInteractiveNode, type InteractiveNodeInput } from "./pressable.js";

/**
 * Built-in button intent used for default confirm/cancel action behavior.
 *
 * @public
 */
export type ButtonIntent = "default" | "confirm" | "cancel";

/**
 * Stable default ActionRef types used when Button action is omitted for confirm/cancel intents.
 *
 * @public
 */
export const buttonActionTypes = Object.freeze({
  confirm: "runtime.ui.confirm",
  cancel: "runtime.ui.cancel",
});

/**
 * Renderer-agnostic button props.
 *
 * @public
 */
export interface ButtonProps extends ComponentProps {
  readonly label: string;
  readonly action?: ActionRefInput;
  readonly intent?: ButtonIntent;
  readonly key?: string;
  readonly disabled?: boolean;
  readonly style?: UiStyle;
}

/**
 * Labelled ActionRef-only button primitive.
 *
 * @public
 */
export const Button = definePureComponent<ButtonProps>(
  {
    displayName: "Button",
  },
  renderButton,
);

/**
 * Renders a labelled button UiNode with stable confirm/cancel fallback actions.
 *
 * @public
 */
export function renderButton(props: Readonly<ButtonProps>): UiNodeInput {
  const intent = props.intent ?? "default";
  const action = resolveButtonAction(intent, props.action);
  const input: InteractiveNodeInput = {
    type: "button",
    label: props.label,
    action,
  };

  if (intent !== "default") {
    input.intent = intent;
  }

  if (props.key !== undefined) {
    input.key = props.key;
  }

  if (props.disabled !== undefined) {
    input.disabled = props.disabled;
  }

  if (props.style !== undefined) {
    input.style = props.style;
  }

  return createInteractiveNode(input);
}

function resolveButtonAction(intent: ButtonIntent, action: ActionRefInput | undefined): ActionRef {
  if (action !== undefined) {
    return normalizeActionRef(action);
  }

  if (intent === "confirm") {
    return normalizeActionRef(buttonActionTypes.confirm);
  }

  if (intent === "cancel") {
    return normalizeActionRef(buttonActionTypes.cancel);
  }

  throw new TypeError("Button action is required unless intent is confirm or cancel.");
}
