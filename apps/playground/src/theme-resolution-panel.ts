import {
  createRuntimeUiThemeResolutionFixture,
  resolveRuntimeUiThemeVisualHints,
  type RuntimeUiThemeFixtureState,
  type RuntimeUiThemeVisualHints,
} from "@ludoweave/testing";
import { runtimeUiThemeTokens, type UiThemeTokenName } from "@ludoweave/core";

const displayTokens = [
  runtimeUiThemeTokens.prompt.root,
  runtimeUiThemeTokens.subtitle.text,
  runtimeUiThemeTokens.dialog.controls,
  runtimeUiThemeTokens.objective.body,
] as const satisfies readonly UiThemeTokenName[];

const displayStates = [
  "default",
  "high-contrast",
] as const satisfies readonly RuntimeUiThemeFixtureState[];

export function renderThemeResolutionPanel(root: HTMLElement): void {
  const documentRef = root.ownerDocument;
  const fixture = createRuntimeUiThemeResolutionFixture();
  const heading = documentRef.createElement("h2");
  heading.textContent = "Theme resolution";

  const grid = documentRef.createElement("div");
  grid.className = "theme-resolution__grid";

  for (const state of displayStates) {
    for (const token of displayTokens) {
      const resolved = resolveRuntimeUiThemeVisualHints(fixture, { state, token });
      grid.appendChild(
        createThemeResolutionItem(documentRef, state, resolved.token, resolved.hints),
      );
    }
  }

  root.replaceChildren(heading, grid);
}

function createThemeResolutionItem(
  documentRef: Document,
  state: RuntimeUiThemeFixtureState,
  token: UiThemeTokenName,
  hints: RuntimeUiThemeVisualHints,
): HTMLElement {
  const item = documentRef.createElement("article");
  item.className = "theme-resolution__item";
  item.dataset.themeState = state;
  item.dataset.themeToken = token;

  const swatch = documentRef.createElement("span");
  swatch.className = "theme-resolution__swatch";
  swatch.textContent = "Aa";
  swatch.setAttribute("aria-label", `${state} ${token}`);
  applyVisualHints(swatch, hints);

  const meta = documentRef.createElement("span");
  meta.className = "theme-resolution__meta";

  const stateLabel = documentRef.createElement("span");
  stateLabel.className = "theme-resolution__state";
  stateLabel.textContent = state;

  const tokenLabel = documentRef.createElement("code");
  tokenLabel.textContent = token;

  const hintLabel = documentRef.createElement("span");
  hintLabel.className = "theme-resolution__hint";
  hintLabel.textContent = formatHints(hints);

  meta.replaceChildren(stateLabel, tokenLabel, hintLabel);
  item.replaceChildren(swatch, meta);
  return item;
}

function applyVisualHints(element: HTMLElement, hints: RuntimeUiThemeVisualHints): void {
  if (hints.color !== undefined) {
    element.style.color = hints.color;
  }

  if (hints.backgroundColor !== undefined) {
    element.style.backgroundColor = hints.backgroundColor;
  }

  if (hints.borderColor !== undefined) {
    element.style.borderColor = hints.borderColor;
  }

  if (hints.fontWeight !== undefined) {
    element.style.fontWeight =
      hints.fontWeight === "regular" ? "400" : hints.fontWeight === "medium" ? "600" : "800";
  }
}

function formatHints(hints: RuntimeUiThemeVisualHints): string {
  const color = hints.color ?? "default";
  const background = hints.backgroundColor ?? "transparent";
  const accent = hints.accentColor ?? hints.borderColor ?? "none";
  return `${background} / ${color} / ${accent}`;
}
