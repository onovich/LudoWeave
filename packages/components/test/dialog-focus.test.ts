import { describe, expect, it } from "vitest";
import { createActionLog, normalizeUiNode, type UiNode } from "@ludoweave/core";

import {
  Button,
  Dialog,
  createFocusNavigationDraft,
  createFocusScopeDraft,
  createModalInputShieldDraft,
} from "../src/index.js";

describe("Dialog focus draft", () => {
  it("renders modal focus metadata and confirm/cancel children", () => {
    const dialog = normalizeUiNode(
      Dialog.render({
        title: "Pause",
        focus: {
          scopeId: "pause.dialog",
          initialFocusKey: "cancel",
        },
      }),
    );

    expect(dialog).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "action": {
              "type": "runtime.ui.confirm",
            },
            "key": "confirm",
            "props": {
              "intent": "confirm",
              "label": "Confirm",
            },
            "style": {
              "themeToken": "runtime-ui.dialog.controls",
            },
            "type": "button",
          },
          {
            "action": {
              "type": "runtime.ui.cancel",
            },
            "key": "cancel",
            "props": {
              "intent": "cancel",
              "label": "Cancel",
            },
            "style": {
              "themeToken": "runtime-ui.dialog.controls",
            },
            "type": "button",
          },
        ],
        "key": "dialog",
        "props": {
          "containFocus": true,
          "focusNavigationBindings": [
            {
              "action": {
                "type": "runtime.ui.confirm",
              },
              "device": "keyboard",
              "input": "Enter",
              "intent": "confirm",
            },
            {
              "action": {
                "type": "runtime.ui.cancel",
              },
              "device": "keyboard",
              "input": "Escape",
              "intent": "cancel",
            },
            {
              "action": {
                "type": "runtime.ui.confirm",
              },
              "device": "gamepad",
              "input": "South",
              "intent": "confirm",
            },
            {
              "action": {
                "type": "runtime.ui.cancel",
              },
              "device": "gamepad",
              "input": "East",
              "intent": "cancel",
            },
          ],
          "focusNavigationHandoff": "host",
          "focusNavigationScopeId": "pause.dialog",
          "focusScopeId": "pause.dialog",
          "initialFocusKey": "cancel",
          "inputShieldBlockedScopes": [
            "gameplay",
          ],
          "inputShieldEnabled": true,
          "inputShieldHandoff": "host",
          "modal": true,
          "restoreFocus": true,
          "title": "Pause",
        },
        "style": {
          "themeToken": "runtime-ui.dialog.root",
        },
        "type": "dialog",
      }
    `);
  });

  it("normalizes focus scope drafts", () => {
    expect(
      createFocusScopeDraft({
        scopeId: " pause ",
        containFocus: false,
        restoreFocus: false,
        initialFocusKey: " cancel ",
        restoreFocusKey: " hud.pause ",
      }),
    ).toEqual({
      scopeId: "pause",
      containFocus: false,
      restoreFocus: false,
      initialFocusKey: "cancel",
      restoreFocusKey: "hud.pause",
    });
    expect(() =>
      createFocusScopeDraft({
        scopeId: " ",
      }),
    ).toThrow(/Focus scope id/);
  });

  it("renders restore focus and host input shielding metadata", () => {
    const dialog = normalizeUiNode(
      Dialog.render({
        title: "Pause",
        focus: {
          scopeId: "pause.dialog",
          restoreFocusKey: "hud.pause-button",
        },
        inputShield: {
          blockedScopes: [" gameplay ", "camera", "gameplay"],
        },
        focusNavigation: {
          bindings: [
            {
              device: "keyboard",
              input: " Space ",
              intent: "confirm",
              action: {
                type: "runtime.pause.resume",
              },
            },
          ],
        },
      }),
    );

    expect(dialog.props).toMatchObject({
      focusScopeId: "pause.dialog",
      restoreFocusKey: "hud.pause-button",
      focusNavigationScopeId: "pause.dialog",
      focusNavigationHandoff: "host",
      focusNavigationBindings: [
        {
          device: "keyboard",
          input: "Space",
          intent: "confirm",
          action: {
            type: "runtime.pause.resume",
          },
        },
      ],
      inputShieldEnabled: true,
      inputShieldBlockedScopes: ["gameplay", "camera"],
      inputShieldHandoff: "host",
    });
  });

  it("normalizes keyboard and gamepad focus navigation into ActionRefs", () => {
    expect(
      createFocusNavigationDraft({
        scopeId: " pause.dialog ",
      }),
    ).toEqual({
      scopeId: "pause.dialog",
      handoff: "host",
      bindings: [
        {
          device: "keyboard",
          input: "Enter",
          intent: "confirm",
          action: {
            type: "runtime.ui.confirm",
          },
        },
        {
          device: "keyboard",
          input: "Escape",
          intent: "cancel",
          action: {
            type: "runtime.ui.cancel",
          },
        },
        {
          device: "gamepad",
          input: "South",
          intent: "confirm",
          action: {
            type: "runtime.ui.confirm",
          },
        },
        {
          device: "gamepad",
          input: "East",
          intent: "cancel",
          action: {
            type: "runtime.ui.cancel",
          },
        },
      ],
    });
    expect(
      createFocusNavigationDraft({
        scopeId: "pause.dialog",
        bindings: [
          {
            device: "gamepad",
            input: " Start ",
            intent: "confirm",
            action: {
              type: "runtime.pause.resume",
              payload: {
                source: "gamepad",
              },
            },
          },
        ],
      }).bindings,
    ).toEqual([
      {
        device: "gamepad",
        input: "Start",
        intent: "confirm",
        action: {
          type: "runtime.pause.resume",
          payload: {
            source: "gamepad",
          },
        },
      },
    ]);
    expect(() =>
      createFocusNavigationDraft({
        scopeId: "pause.dialog",
        bindings: [],
      }),
    ).toThrow(/at least one binding/);
  });

  it("normalizes modal input shielding without owning host input state", () => {
    expect(createModalInputShieldDraft()).toEqual({
      enabled: true,
      blockedScopes: ["gameplay"],
      handoff: "host",
    });
    expect(
      createModalInputShieldDraft({
        enabled: false,
        blockedScopes: [" gameplay ", "ui-underlay", "gameplay"],
      }),
    ).toEqual({
      enabled: false,
      blockedScopes: ["gameplay", "ui-underlay"],
      handoff: "host",
    });
    expect(() =>
      createModalInputShieldDraft({
        blockedScopes: [" "],
      }),
    ).toThrow(/Modal input shield scope/);
  });
});

describe("Button and Dialog action logs", () => {
  it("records Button and Dialog actions through the core action log helper", () => {
    const log = createActionLog();
    const button = normalizeUiNode(
      Button.render({
        label: "Confirm",
        intent: "confirm",
      }),
    );
    const dialog = normalizeUiNode(
      Dialog.render({
        title: "Pause",
      }),
    );
    const confirm = requireChild(dialog, "confirm");

    log.record({
      action: requireAction(button),
      source: {
        nodeId: "button.confirm",
        label: getLabel(button),
      },
    });
    log.record({
      action: requireAction(confirm),
      source: {
        nodeId: "dialog.confirm",
        label: getLabel(confirm),
      },
    });

    expect(log.snapshot()).toEqual([
      {
        sequence: 1,
        action: {
          type: "runtime.ui.confirm",
        },
        nodeId: "button.confirm",
        label: "Confirm",
      },
      {
        sequence: 2,
        action: {
          type: "runtime.ui.confirm",
        },
        nodeId: "dialog.confirm",
        label: "Confirm",
      },
    ]);
  });
});

function requireChild(node: UiNode, key: string): UiNode {
  const child = node.children?.find((entry) => entry.key === key);
  if (child === undefined) {
    throw new TypeError(`Expected dialog child ${key}.`);
  }
  return child;
}

function requireAction(node: UiNode): NonNullable<UiNode["action"]> {
  if (node.action === undefined) {
    throw new TypeError("Expected action.");
  }
  return node.action;
}

function getLabel(node: UiNode): string {
  const label = node.props?.label;
  if (typeof label !== "string") {
    throw new TypeError("Expected label.");
  }
  return label;
}
