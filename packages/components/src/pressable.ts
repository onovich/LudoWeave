import {
  normalizeActionRef,
  type ActionRef,
  type ActionRefInput,
  type JsonValue,
  type UiNodeChildrenInput,
  type UiNodeInput,
  type UiStyle,
} from "@ludoweave/core";

import { definePureComponent, type ComponentProps } from "./pure-component.js";

/**
 * Renderer-agnostic pressable props.
 *
 * @public
 */
export interface PressableProps extends ComponentProps {
  readonly action: ActionRefInput;
  readonly key?: string;
  readonly label?: string;
  readonly disabled?: boolean;
  readonly style?: UiStyle;
  readonly children?: UiNodeChildrenInput;
}

/**
 * Base ActionRef-only interactive primitive.
 *
 * @public
 */
export const Pressable = definePureComponent<PressableProps>(
  {
    displayName: "Pressable",
  },
  renderPressable,
);

/**
 * Renders a pressable UiNode without owning host behavior.
 *
 * @public
 */
export function renderPressable(props: Readonly<PressableProps>): UiNodeInput {
  const action = normalizeActionRef(props.action);
  const input: InteractiveNodeInput = {
    type: "pressable",
    action,
  };

  if (props.key !== undefined) {
    input.key = props.key;
  }

  if (props.label !== undefined) {
    input.label = props.label;
  }

  if (props.disabled !== undefined) {
    input.disabled = props.disabled;
  }

  if (props.style !== undefined) {
    input.style = props.style;
  }

  if (props.children !== undefined) {
    input.children = props.children;
  }

  return createInteractiveNode(input);
}

export function createInteractiveNode(input: InteractiveNodeInput): UiNodeInput {
  const node: MutableUiNodeInput = {
    type: input.type,
  };
  const props: Record<string, JsonValue> = {};

  if (input.key !== undefined) {
    node.key = input.key;
  }

  if (input.label !== undefined) {
    props.label = input.label;
  }

  if (input.intent !== undefined) {
    props.intent = input.intent;
  }

  if (input.disabled !== undefined) {
    props.disabled = input.disabled;
  }

  if (Object.keys(props).length > 0) {
    node.props = props;
  }

  if (input.style !== undefined) {
    node.style = input.style;
  }

  if (input.children !== undefined) {
    node.children = input.children;
  }

  if (input.disabled !== true) {
    node.action = input.action;
  }

  return node;
}

type MutableUiNodeInput = {
  type: string;
  key?: string;
  props?: Readonly<Record<string, JsonValue>>;
  style?: UiStyle;
  action?: ActionRefInput;
  children?: UiNodeChildrenInput;
};

export type InteractiveNodeInput = {
  type: "pressable" | "button";
  key?: string;
  label?: string;
  intent?: string;
  disabled?: boolean;
  style?: UiStyle;
  children?: UiNodeChildrenInput;
  action: ActionRef;
};
