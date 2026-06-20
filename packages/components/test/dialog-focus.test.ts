import { describe, expect, it } from "vitest";
import { createActionLog, normalizeUiNode, type UiNode } from "@ludoweave/core";

import { Button, Dialog, createFocusScopeDraft } from "../src/index.js";

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
            "type": "button",
          },
        ],
        "key": "dialog",
        "props": {
          "containFocus": true,
          "focusScopeId": "pause.dialog",
          "initialFocusKey": "cancel",
          "modal": true,
          "restoreFocus": true,
          "title": "Pause",
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
      }),
    ).toEqual({
      scopeId: "pause",
      containFocus: false,
      restoreFocus: false,
      initialFocusKey: "cancel",
    });
    expect(() =>
      createFocusScopeDraft({
        scopeId: " ",
      }),
    ).toThrow(/Focus scope id/);
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
