import { describe, expect, it } from "vitest";
import { normalizeUiNode, runtimeUiThemeTokens } from "@ludoweave/core";

import { Dialog, Objective, Prompt, Subtitle } from "../src/index.js";

describe("component theme tokens", () => {
  it("emits stable v0.2 theme tokens for runtime UI components", () => {
    const prompt = normalizeUiNode(Prompt.render({}));
    const subtitle = normalizeUiNode(Subtitle.render({ text: "The gate hums." }));
    const dialog = normalizeUiNode(Dialog.render({ title: "Pause" }));
    const objective = normalizeUiNode(Objective.render({ title: "Deliver the cell" }));

    expect(prompt.style?.themeToken).toBe(runtimeUiThemeTokens.prompt.root);
    expect(subtitle.style?.themeToken).toBe(runtimeUiThemeTokens.subtitle.root);
    expect(dialog.style?.themeToken).toBe(runtimeUiThemeTokens.dialog.root);
    expect(objective.style?.themeToken).toBe(runtimeUiThemeTokens.objective.root);
    expect(dialog.children?.map((child) => child.style?.themeToken)).toEqual([
      runtimeUiThemeTokens.dialog.controls,
      runtimeUiThemeTokens.dialog.controls,
    ]);
  });

  it("lets callers override the default component token", () => {
    expect(
      normalizeUiNode(
        Prompt.render({
          themeToken: "game.prompt.root",
          style: {
            opacity: 0.9,
          },
        }),
      ).style,
    ).toEqual({
      themeToken: "game.prompt.root",
      opacity: 0.9,
    });

    expect(
      normalizeUiNode(
        Objective.render({
          title: "Open the gate",
          style: {
            themeToken: "game.objective.root",
          },
        }),
      ).style,
    ).toEqual({
      themeToken: "game.objective.root",
    });
  });
});
