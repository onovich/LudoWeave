import {
  createThemeTokenStyle,
  runtimeUiThemeTokens,
  type JsonValue,
  type UiNodeInput,
  type UiStyle,
  type UiThemeTokenName,
} from "@ludoweave/core";

import { definePureComponent, type ComponentProps } from "./pure-component.js";

/**
 * Subtitle component props for deterministic runtime text.
 *
 * @public
 */
export interface SubtitleProps extends ComponentProps {
  readonly text: string;
  readonly key?: string;
  readonly themeToken?: UiThemeTokenName;
  readonly style?: UiStyle;
}

/**
 * Runtime subtitle component built as a pure text UiNode.
 *
 * @public
 */
export const Subtitle = definePureComponent<SubtitleProps>(
  {
    displayName: "Subtitle",
  },
  renderSubtitle,
);

/**
 * Renders subtitle text without owning timeline state.
 *
 * @public
 */
export function renderSubtitle(props: Readonly<SubtitleProps>): UiNodeInput {
  const node: MutableUiNodeInput = {
    type: "text",
    key: props.key ?? "subtitle",
    props: {
      text: props.text,
    },
  };

  node.style = createThemeTokenStyle(
    props.themeToken ?? runtimeUiThemeTokens.subtitle.root,
    props.style,
  );

  return node;
}

type MutableUiNodeInput = {
  type: string;
  key?: string;
  props?: Readonly<Record<string, JsonValue>>;
  style?: UiStyle;
};
