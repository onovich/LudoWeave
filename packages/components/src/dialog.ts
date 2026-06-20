import type {
  ActionRefInput,
  JsonValue,
  UiNodeChildrenInput,
  UiNodeInput,
  UiStyle,
} from "@ludoweave/core";

import { Button } from "./button.js";
import { createFocusScopeDraft, type FocusScopeDraftInput } from "./focus.js";
import { definePureComponent, type ComponentProps } from "./pure-component.js";

/**
 * Dialog component props for modal runtime UI.
 *
 * @public
 */
export interface DialogProps extends ComponentProps {
  readonly title: string;
  readonly key?: string;
  readonly children?: UiNodeChildrenInput;
  readonly confirmAction?: ActionRefInput;
  readonly cancelAction?: ActionRefInput;
  readonly focus?: Partial<Omit<FocusScopeDraftInput, "scopeId">> & { readonly scopeId?: string };
  readonly style?: UiStyle;
}

/**
 * Modal dialog component with draft focus metadata and confirm/cancel actions.
 *
 * @public
 */
export const Dialog = definePureComponent<DialogProps>(
  {
    displayName: "Dialog",
  },
  renderDialog,
);

/**
 * Renders a dialog as pure UiNode data.
 *
 * @public
 */
export function renderDialog(props: Readonly<DialogProps>): UiNodeInput {
  const key = props.key ?? "dialog";
  const focusInput: MutableFocusScopeDraftInput = {
    scopeId: props.focus?.scopeId ?? `${key}.focus`,
    initialFocusKey: props.focus?.initialFocusKey ?? "confirm",
  };

  if (props.focus?.containFocus !== undefined) {
    focusInput.containFocus = props.focus.containFocus;
  }

  if (props.focus?.restoreFocus !== undefined) {
    focusInput.restoreFocus = props.focus.restoreFocus;
  }

  const focus = createFocusScopeDraft(focusInput);
  const node: MutableUiNodeInput = {
    type: "dialog",
    key,
    props: createDialogProps(props.title, focus),
    children: createDialogChildren(props),
  };

  if (props.style !== undefined) {
    node.style = props.style;
  }

  return node;
}

function createDialogProps(title: string, focus: ReturnType<typeof createFocusScopeDraft>) {
  const props: Record<string, JsonValue> = {
    title,
    modal: true,
    focusScopeId: focus.scopeId,
    containFocus: focus.containFocus,
    restoreFocus: focus.restoreFocus,
  };

  if (focus.initialFocusKey !== undefined) {
    props.initialFocusKey = focus.initialFocusKey;
  }

  return props;
}

function createDialogChildren(props: Readonly<DialogProps>): readonly UiNodeInput[] {
  const children: UiNodeInput[] = [];
  appendChildren(children, props.children);
  children.push(
    Button.render({
      key: "confirm",
      label: "Confirm",
      intent: "confirm",
      ...(props.confirmAction === undefined ? {} : { action: props.confirmAction }),
    }),
    Button.render({
      key: "cancel",
      label: "Cancel",
      intent: "cancel",
      ...(props.cancelAction === undefined ? {} : { action: props.cancelAction }),
    }),
  );
  return children;
}

function appendChildren(children: UiNodeInput[], input: UiNodeChildrenInput): void {
  if (input === undefined || input === null || input === false) {
    return;
  }

  if (Array.isArray(input)) {
    for (const child of input) {
      if (child !== undefined && child !== null && child !== false) {
        children.push(child);
      }
    }
    return;
  }

  children.push(input as UiNodeInput);
}

type MutableUiNodeInput = {
  type: string;
  key?: string;
  props?: Readonly<Record<string, JsonValue>>;
  style?: UiStyle;
  children?: UiNodeChildrenInput;
};

type MutableFocusScopeDraftInput = {
  scopeId: string;
  containFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusKey?: string;
};
