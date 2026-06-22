import { describe, expect, it } from "vitest";
import {
  createActionLog,
  normalizeHostInputIntent,
  normalizeUiNode,
  type UiNode,
} from "@ludoweave/core";

import {
  Button,
  Dialog,
  createFocusNavigationDraft,
  createFocusScopeDraft,
  createModalFocusNavigationDraft,
  createModalFocusNavigationSequence,
  createModalInputShieldDraft,
  resolveModalFocusIntent,
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

  it("connects modal focus scope navigation to confirm and cancel ActionRefs", () => {
    const draft = createModalFocusNavigationDraft({
      scopeId: "pause.dialog",
      initialFocusId: "resume",
      restoreFocusKey: "hud.pause-button",
      controls: [
        {
          id: "resume",
          rect: { x: 440, y: 320, width: 240, height: 44 },
          action: "runtime.pause.resume",
        },
        {
          id: "cancel",
          rect: { x: 440, y: 376, width: 240, height: 44 },
          action: {
            type: "runtime.ui.cancel",
            payload: { surface: "pause" },
          },
        },
      ],
    });

    expect(draft.scope).toEqual({
      scopeId: "pause.dialog",
      containFocus: true,
      restoreFocus: true,
      initialFocusKey: "resume",
      restoreFocusKey: "hud.pause-button",
    });
    expect(resolveModalFocusIntent(draft, normalizeHostInputIntent({ kind: "confirm" }))).toEqual({
      status: "action",
      action: {
        type: "runtime.pause.resume",
      },
      controlId: "resume",
    });
    expect(resolveModalFocusIntent(draft, normalizeHostInputIntent({ kind: "cancel" }))).toEqual({
      status: "action",
      action: {
        type: "runtime.ui.cancel",
        payload: {
          surface: "pause",
        },
      },
      controlId: "cancel",
    });
    expect(
      resolveModalFocusIntent(
        draft,
        normalizeHostInputIntent({ kind: "navigate", direction: "down" }),
      ),
    ).toEqual({
      status: "navigated",
      navigation: {
        status: "resolved",
        fromId: "resume",
        direction: "down",
        targetId: "cancel",
        method: "explicit-neighbor",
      },
    });
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

  it("records modal focus confirm and cancel outputs through the action log", () => {
    const log = createActionLog();
    const draft = createModalFocusNavigationDraft({
      scopeId: "pause.dialog",
      controls: [
        {
          id: "resume",
          rect: { x: 440, y: 320, width: 240, height: 44 },
          action: "runtime.pause.resume",
        },
        {
          id: "cancel",
          rect: { x: 440, y: 376, width: 240, height: 44 },
          action: "runtime.ui.cancel",
        },
      ],
    });

    const confirm = resolveModalFocusIntent(
      draft,
      normalizeHostInputIntent({ kind: "confirm", focusId: "resume" }),
    );
    const cancel = resolveModalFocusIntent(draft, normalizeHostInputIntent({ kind: "cancel" }));

    if (confirm.status !== "action" || cancel.status !== "action") {
      throw new TypeError("Expected modal focus action results.");
    }

    log.record({
      action: confirm.action,
      source: { nodeId: `dialog.${confirm.controlId}`, label: "Resume" },
    });
    log.record({
      action: cancel.action,
      source: { nodeId: `dialog.${cancel.controlId}`, label: "Cancel" },
    });

    expect(log.snapshot()).toEqual([
      {
        sequence: 1,
        action: {
          type: "runtime.pause.resume",
        },
        nodeId: "dialog.resume",
        label: "Resume",
      },
      {
        sequence: 2,
        action: {
          type: "runtime.ui.cancel",
        },
        nodeId: "dialog.cancel",
        label: "Cancel",
      },
    ]);
  });

  it("records navigation sequence results and ActionRef-only outputs", () => {
    const draft = createModalFocusNavigationDraft({
      scopeId: "pause.dialog",
      controls: [
        {
          id: "resume",
          rect: { x: 440, y: 320, width: 240, height: 44 },
          action: "runtime.pause.resume",
        },
        {
          id: "cancel",
          rect: { x: 440, y: 376, width: 240, height: 44 },
          action: "runtime.ui.cancel",
        },
      ],
    });

    const sequence = createModalFocusNavigationSequence(draft, [
      normalizeHostInputIntent({ kind: "navigate", direction: "down", focusId: "resume" }),
      normalizeHostInputIntent({ kind: "confirm", focusId: "cancel" }),
      normalizeHostInputIntent({ kind: "cancel" }),
    ]);

    expect(sequence.entries.map((entry) => entry.result.status)).toEqual([
      "navigated",
      "action",
      "action",
    ]);
    expect(sequence.actionLog).toEqual([
      {
        sequence: 1,
        action: {
          type: "runtime.ui.cancel",
        },
        nodeId: "modal-focus.cancel",
        label: "cancel",
      },
      {
        sequence: 2,
        action: {
          type: "runtime.ui.cancel",
        },
        nodeId: "modal-focus.cancel",
        label: "cancel",
      },
    ]);
    expect(JSON.parse(JSON.stringify(sequence))).toEqual(sequence);
    expect(JSON.stringify(sequence)).not.toContain("KeyboardEvent");
    expect(JSON.stringify(sequence)).not.toContain("Gamepad");
    expect(JSON.stringify(sequence)).not.toContain("function");
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
