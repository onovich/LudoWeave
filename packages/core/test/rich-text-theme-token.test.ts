import { describe, expect, it } from "vitest";

import { resolveRichTextThemeTokenRefs } from "../src/rich-text-theme-token.js";
import { runtimeUiThemeTokens } from "../src/theme-token.js";

describe("rich text theme token integration", () => {
  it("resolves run and span token references without renderer-specific style objects", () => {
    const resolution = resolveRichTextThemeTokenRefs({
      metadata: {
        id: "dialogue.rich",
        plainTextFallback: "Mira: Sealed.",
        spans: [
          {
            id: "speaker.mira",
            kind: "speaker",
            themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
          },
        ],
        runs: [
          {
            id: "run.speaker",
            text: "Mira",
            spanIds: ["speaker.mira"],
            themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
          },
        ],
        a11y: { label: "Mira says sealed." },
      },
      knownThemeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
      context: { selected: true, focused: true },
    });

    expect(resolution).toEqual({
      usages: [
        {
          blockId: "dialogue.rich",
          ownerKind: "run",
          ownerId: "run.speaker",
          tokenRef: "runtime-ui.subtitle.text",
          status: "available",
          context: { disabled: false, selected: true, focused: true },
        },
        {
          blockId: "dialogue.rich",
          ownerKind: "span",
          ownerId: "speaker.mira",
          tokenRef: "runtime-ui.subtitle.text",
          status: "available",
          context: { disabled: false, selected: true, focused: true },
        },
      ],
      diagnostics: [],
    });
    expect(JSON.stringify(resolution)).not.toContain("color");
    expect(JSON.stringify(resolution)).not.toContain("fontWeight");
    expect(JSON.stringify(resolution)).not.toContain("canvas");
  });

  it("reports missing tokens and unsupported scopes with disabled context", () => {
    const resolution = resolveRichTextThemeTokenRefs({
      metadata: {
        id: "choice.rich",
        plainTextFallback: "Open the sealed gate.",
        spans: [
          {
            id: "choice.accept",
            kind: "choice-hint",
            themeTokenRefs: ["runtime-ui.dialog.controls"],
          },
        ],
        runs: [
          {
            id: "run.choice",
            text: "Open the sealed gate.",
            themeTokenRefs: ["runtime-ui.choice.disabled"],
          },
        ],
        a11y: { label: "Open the sealed gate." },
      },
      knownThemeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
      unsupportedTokenScopes: ["runtime-ui.dialog"],
      context: { disabled: true },
    });

    expect(resolution.usages).toEqual([
      {
        blockId: "choice.rich",
        ownerKind: "run",
        ownerId: "run.choice",
        tokenRef: "runtime-ui.choice.disabled",
        status: "missing",
        context: { disabled: true, selected: false, focused: false },
      },
      {
        blockId: "choice.rich",
        ownerKind: "span",
        ownerId: "choice.accept",
        tokenRef: "runtime-ui.dialog.controls",
        status: "unsupported-scope",
        context: { disabled: true, selected: false, focused: false },
      },
    ]);
    expect(resolution.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_RICH_TEXT_INVALID_TOKEN_REFERENCE",
      "LW_RICH_TEXT_UNSUPPORTED_TOKEN_SCOPE",
    ]);
  });

  it("rejects invalid token names before renderer involvement", () => {
    expect(() =>
      resolveRichTextThemeTokenRefs({
        metadata: {
          id: "choice.rich",
          plainTextFallback: "Open",
          runs: [{ id: "run.choice", text: "Open", themeTokenRefs: ["Runtime.Bad"] }],
          a11y: { label: "Open" },
        },
        knownThemeTokenRefs: [],
      }),
    ).toThrow(/theme token name/);
  });
});
