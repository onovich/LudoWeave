import { describe, expect, it } from "vitest";

import { Button, Pressable, buttonActionTypes } from "../src/index.js";

describe("Pressable", () => {
  it("renders an ActionRef-only pressable node", () => {
    expect(
      Pressable.render({
        key: "interact",
        label: "Use",
        action: "runtime.gameplay.interact",
      }),
    ).toEqual({
      type: "pressable",
      key: "interact",
      props: {
        label: "Use",
      },
      action: {
        type: "runtime.gameplay.interact",
      },
    });
  });

  it("rejects arbitrary callback actions", () => {
    expect(() =>
      Pressable.render({
        action: (() => undefined) as never,
      }),
    ).toThrow(/ActionRef/);
  });
});

describe("Button", () => {
  it("uses stable default ActionRefs for confirm and cancel intents", () => {
    expect(
      Button.render({
        label: "Confirm",
        intent: "confirm",
      }).action,
    ).toEqual({
      type: buttonActionTypes.confirm,
    });
    expect(
      Button.render({
        label: "Cancel",
        intent: "cancel",
      }).action,
    ).toEqual({
      type: buttonActionTypes.cancel,
    });
  });

  it("lets explicit ActionRef override intent fallback", () => {
    expect(
      Button.render({
        label: "Confirm",
        intent: "confirm",
        action: {
          type: "runtime.dialog.confirm",
          payload: {
            dialogId: "pause",
          },
        },
      }),
    ).toEqual({
      type: "button",
      props: {
        label: "Confirm",
        intent: "confirm",
      },
      action: {
        type: "runtime.dialog.confirm",
        payload: {
          dialogId: "pause",
        },
      },
    });
  });

  it("requires an ActionRef for default intent and rejects callback payloads", () => {
    expect(() =>
      Button.render({
        label: "Default",
      }),
    ).toThrow(/action is required/);
    expect(() =>
      Button.render({
        label: "Bad",
        action: {
          type: "runtime.bad",
          payload: {
            callback: (() => undefined) as never,
          },
        },
      }),
    ).toThrow(/payload.callback/);
  });
});
