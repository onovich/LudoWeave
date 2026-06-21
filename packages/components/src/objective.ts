import {
  normalizeActionRef,
  type ActionRefInput,
  type JsonValue,
  type UiNodeInput,
  type UiStyle,
} from "@ludoweave/core";

import { definePureComponent, type ComponentProps } from "./pure-component.js";

/**
 * Objective status values used by v0.2 runtime UI.
 *
 * @public
 */
export type ObjectiveStatus = "active" | "completed" | "failed";

/**
 * Objective component props for gameplay task or delivery hints.
 *
 * @public
 */
export interface ObjectiveProps extends ComponentProps {
  readonly title: string;
  readonly body?: string;
  readonly status?: ObjectiveStatus;
  readonly action?: ActionRefInput;
  readonly key?: string;
  readonly style?: UiStyle;
}

/**
 * Runtime objective / delivery hint component built from serializable data.
 *
 * @public
 */
export const Objective = definePureComponent<ObjectiveProps>(
  {
    displayName: "Objective",
  },
  renderObjective,
);

/**
 * Renders an objective as a pure UiNode.
 *
 * @public
 */
export function renderObjective(props: Readonly<ObjectiveProps>): UiNodeInput {
  const node: MutableUiNodeInput = {
    type: "objective",
    key: props.key ?? "objective",
    props: createObjectiveProps(props),
  };

  if (props.action !== undefined) {
    node.action = normalizeActionRef(props.action);
  }

  if (props.style !== undefined) {
    node.style = props.style;
  }

  return node;
}

function createObjectiveProps(
  props: Readonly<ObjectiveProps>,
): Readonly<Record<string, JsonValue>> {
  const nodeProps: Record<string, JsonValue> = {
    title: props.title,
    status: props.status ?? "active",
  };

  if (props.body !== undefined) {
    nodeProps.body = props.body;
  }

  return nodeProps;
}

type MutableUiNodeInput = {
  type: string;
  key?: string;
  props?: Readonly<Record<string, JsonValue>>;
  style?: UiStyle;
  action?: ActionRefInput;
};
