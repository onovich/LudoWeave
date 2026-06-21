import { describe, expect, it } from "vitest";

import {
  createThemeTokenStyle,
  normalizeRuntimeUiThemeTokenContract,
  normalizeThemeTokenName,
  runtimeUiThemeTokenContract,
  runtimeUiThemeTokens,
} from "../src/index.js";

describe("runtime UI theme tokens", () => {
  it("exposes the minimal v0.2 token contract", () => {
    expect(runtimeUiThemeTokenContract).toEqual({
      version: "ludoweave.theme.v0.2",
      components: {
        prompt: {
          root: "runtime-ui.prompt.root",
          text: "runtime-ui.prompt.text",
        },
        subtitle: {
          root: "runtime-ui.subtitle.root",
          text: "runtime-ui.subtitle.text",
        },
        dialog: {
          root: "runtime-ui.dialog.root",
          title: "runtime-ui.dialog.title",
          controls: "runtime-ui.dialog.controls",
        },
        objective: {
          root: "runtime-ui.objective.root",
          title: "runtime-ui.objective.title",
          body: "runtime-ui.objective.body",
        },
      },
    });
  });

  it("normalizes custom contracts without a schema runtime", () => {
    expect(
      normalizeRuntimeUiThemeTokenContract({
        version: "ludoweave.theme.v0.2",
        components: {
          prompt: {
            root: " game.prompt.root ",
            text: "game.prompt.text",
          },
          subtitle: {
            root: "game.subtitle.root",
            text: "game.subtitle.text",
          },
          dialog: {
            root: "game.dialog.root",
            title: "game.dialog.title",
            controls: "game.dialog.controls",
          },
          objective: {
            root: "game.objective.root",
            title: "game.objective.title",
            body: "game.objective.body",
          },
        },
      }),
    ).toEqual({
      version: "ludoweave.theme.v0.2",
      components: {
        prompt: {
          root: "game.prompt.root",
          text: "game.prompt.text",
        },
        subtitle: {
          root: "game.subtitle.root",
          text: "game.subtitle.text",
        },
        dialog: {
          root: "game.dialog.root",
          title: "game.dialog.title",
          controls: "game.dialog.controls",
        },
        objective: {
          root: "game.objective.root",
          title: "game.objective.title",
          body: "game.objective.body",
        },
      },
    });
  });

  it("merges theme tokens into serializable style objects", () => {
    expect(
      createThemeTokenStyle(runtimeUiThemeTokens.prompt.root, {
        opacity: 0.85,
      }),
    ).toEqual({
      themeToken: "runtime-ui.prompt.root",
      opacity: 0.85,
    });

    expect(
      createThemeTokenStyle(runtimeUiThemeTokens.prompt.root, {
        themeToken: " game.prompt.override ",
        color: "#ffffff",
      }),
    ).toEqual({
      themeToken: "game.prompt.override",
      color: "#ffffff",
    });
  });

  it("rejects invalid token names", () => {
    expect(() => normalizeThemeTokenName("Runtime.Bad")).toThrow(/theme token name/);
    expect(() => normalizeThemeTokenName("runtime ui.prompt")).toThrow(/theme token name/);
  });
});
