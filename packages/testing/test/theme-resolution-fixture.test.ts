import { runtimeUiThemeTokens } from "@ludoweave/core";
import { describe, expect, it } from "vitest";

import {
  createRuntimeUiThemeResolutionFixture,
  resolveRuntimeUiThemeVisualHints,
} from "../src/theme-resolution-fixture.js";

describe("runtime UI theme resolution fixture", () => {
  it("resolves Prompt, Subtitle, Dialog, and Objective tokens to stable visual hints", () => {
    const fixture = createRuntimeUiThemeResolutionFixture();

    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: runtimeUiThemeTokens.prompt.root,
      }),
    ).toEqual({
      state: "default",
      token: "runtime-ui.prompt.root",
      hints: {
        color: "#fef3c7",
        backgroundColor: "#1f2937",
        borderColor: "#f59e0b",
        accentColor: "#fbbf24",
        opacity: 0.96,
        fontWeight: "medium",
      },
      fallback: false,
    });
    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: runtimeUiThemeTokens.subtitle.text,
      }).hints,
    ).toEqual({
      color: "#f9fafb",
      fontWeight: "regular",
    });
    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: runtimeUiThemeTokens.dialog.controls,
      }).hints,
    ).toMatchObject({
      backgroundColor: "#1d4ed8",
      accentColor: "#bfdbfe",
    });
    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: runtimeUiThemeTokens.objective.body,
      }).hints,
    ).toEqual({
      color: "#ecfeff",
      fontWeight: "regular",
    });
  });

  it("supports a high contrast state without changing token names", () => {
    const fixture = createRuntimeUiThemeResolutionFixture();

    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        state: "high-contrast",
        token: runtimeUiThemeTokens.dialog.controls,
      }),
    ).toEqual({
      state: "high-contrast",
      token: "runtime-ui.dialog.controls",
      hints: {
        color: "#000000",
        backgroundColor: "#ffffff",
        borderColor: "#000000",
        accentColor: "#dc2626",
        opacity: 1,
        fontWeight: "bold",
      },
      fallback: false,
    });
  });

  it("returns a deterministic fallback for unknown tokens", () => {
    const fixture = createRuntimeUiThemeResolutionFixture();

    expect(
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: "game.custom.warning",
      }),
    ).toEqual({
      state: "default",
      token: "game.custom.warning",
      hints: {
        color: "#f9fafb",
        backgroundColor: "#111827",
        borderColor: "#4b5563",
        opacity: 1,
        fontWeight: "regular",
      },
      fallback: true,
    });
  });

  it("keeps fixture data JSON serializable", () => {
    const fixture = createRuntimeUiThemeResolutionFixture();

    expect(JSON.parse(JSON.stringify(fixture))).toEqual(fixture);
  });

  it("rejects invalid token names before resolution", () => {
    const fixture = createRuntimeUiThemeResolutionFixture();

    expect(() =>
      resolveRuntimeUiThemeVisualHints(fixture, {
        token: "Runtime.Bad",
      }),
    ).toThrow(/theme token name/);
  });
});
