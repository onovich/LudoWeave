import type {
  ActionRefInput,
  JsonValue,
  UiNodeChildrenInput,
  UiNodeInput,
  UiStyle,
} from "@ludoweave/core";

import { Button } from "./button.js";
import {
  createFocusNavigationDraft,
  type FocusNavigationBinding,
  type FocusNavigationDraft,
  type FocusNavigationDraftInput,
} from "./focus-navigation.js";
import { createFocusScopeDraft, type FocusScopeDraftInput } from "./focus.js";
import {
  createModalInputShieldDraft,
  type ModalInputShieldDraft,
  type ModalInputShieldDraftInput,
} from "./modal-behavior.js";
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
  readonly focusNavigation?: Partial<Omit<FocusNavigationDraftInput, "scopeId">> & {
    readonly scopeId?: string;
  };
  readonly inputShield?: ModalInputShieldDraftInput;
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

  if (props.focus?.restoreFocusKey !== undefined) {
    focusInput.restoreFocusKey = props.focus.restoreFocusKey;
  }

  const focus = createFocusScopeDraft(focusInput);
  const focusNavigation = createFocusNavigationDraft({
    scopeId: props.focusNavigation?.scopeId ?? focus.scopeId,
    ...(props.focusNavigation?.bindings === undefined
      ? {}
      : { bindings: props.focusNavigation.bindings }),
  });
  const inputShield = createModalInputShieldDraft(props.inputShield);
  const node: MutableUiNodeInput = {
    type: "dialog",
    key,
    props: createDialogProps(props.title, focus, focusNavigation, inputShield),
    children: createDialogChildren(props),
  };

  if (props.style !== undefined) {
    node.style = props.style;
  }

  return node;
}

function createDialogProps(
  title: string,
  focus: ReturnType<typeof createFocusScopeDraft>,
  focusNavigation: FocusNavigationDraft,
  inputShield: ModalInputShieldDraft,
) {
  const props: Record<string, JsonValue> = {
    title,
    modal: true,
    focusScopeId: focus.scopeId,
    containFocus: focus.containFocus,
    restoreFocus: focus.restoreFocus,
    focusNavigationScopeId: focusNavigation.scopeId,
    focusNavigationHandoff: focusNavigation.handoff,
    focusNavigationBindings: serializeFocusNavigationBindings(focusNavigation.bindings),
    inputShieldEnabled: inputShield.enabled,
    inputShieldBlockedScopes: inputShield.blockedScopes,
    inputShieldHandoff: inputShield.handoff,
  };

  if (focus.initialFocusKey !== undefined) {
    props.initialFocusKey = focus.initialFocusKey;
  }

  if (focus.restoreFocusKey !== undefined) {
    props.restoreFocusKey = focus.restoreFocusKey;
  }

  return props;
}

function serializeFocusNavigationBindings(
  bindings: readonly FocusNavigationBinding[],
): readonly JsonValue[] {
  return bindings.map((binding) => {
    const action: Record<string, JsonValue> = {
      type: binding.action.type,
    };

    if (binding.action.payload !== undefined) {
      action.payload = binding.action.payload;
    }

    return {
      device: binding.device,
      input: binding.input,
      intent: binding.intent,
      action,
    };
  });
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
  restoreFocusKey?: string;
};
