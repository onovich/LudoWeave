import { describe, expect, it } from "vitest";

import { Prompt, Subtitle } from "../src/index.js";

describe("Prompt", () => {
  it("renders a default ActionRef-only prompt button", () => {
    expect(Prompt.render({})).toEqual({
      type: "button",
      key: "prompt",
      props: {
        label: "Press E",
      },
      style: {
        themeToken: "runtime-ui.prompt.root",
      },
      action: {
        type: "runtime.gameplay.interact",
      },
    });
  });

  it("accepts host-owned action overrides", () => {
    expect(
      Prompt.render({
        label: "Talk",
        action: {
          type: "runtime.dialog.talk",
          payload: {
            actorId: "gatekeeper",
          },
        },
      }).action,
    ).toEqual({
      type: "runtime.dialog.talk",
      payload: {
        actorId: "gatekeeper",
      },
    });
  });
});

describe("Subtitle", () => {
  it("renders a pure text node", () => {
    expect(
      Subtitle.render({
        text: "The gate hums softly.",
      }),
    ).toEqual({
      type: "text",
      key: "subtitle",
      props: {
        text: "The gate hums softly.",
      },
      style: {
        themeToken: "runtime-ui.subtitle.root",
      },
    });
  });
});
