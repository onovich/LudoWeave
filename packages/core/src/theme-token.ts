import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";
import type { UiStyle } from "./ui-node.js";

/**
 * Theme token style key understood by renderer-owned theme resolvers.
 *
 * @public
 */
export const uiThemeTokenStyleKey = "themeToken";

/**
 * Serializable theme token name.
 *
 * @public
 */
export type UiThemeTokenName = string;

/**
 * Prompt theme tokens required by the v0.2 runtime UI contract.
 *
 * @public
 */
export interface RuntimeUiPromptThemeTokens {
  readonly root: UiThemeTokenName;
  readonly text: UiThemeTokenName;
}

/**
 * Subtitle theme tokens required by the v0.2 runtime UI contract.
 *
 * @public
 */
export interface RuntimeUiSubtitleThemeTokens {
  readonly root: UiThemeTokenName;
  readonly text: UiThemeTokenName;
}

/**
 * Dialog theme tokens required by the v0.2 runtime UI contract.
 *
 * @public
 */
export interface RuntimeUiDialogThemeTokens {
  readonly root: UiThemeTokenName;
  readonly title: UiThemeTokenName;
  readonly controls: UiThemeTokenName;
}

/**
 * Objective theme tokens required by the v0.2 runtime UI contract.
 *
 * @public
 */
export interface RuntimeUiObjectiveThemeTokens {
  readonly root: UiThemeTokenName;
  readonly title: UiThemeTokenName;
  readonly body: UiThemeTokenName;
}

/**
 * Built-in component token map for the first v0.2 runtime UI surface.
 *
 * @public
 */
export interface RuntimeUiThemeComponentTokens {
  readonly prompt: RuntimeUiPromptThemeTokens;
  readonly subtitle: RuntimeUiSubtitleThemeTokens;
  readonly dialog: RuntimeUiDialogThemeTokens;
  readonly objective: RuntimeUiObjectiveThemeTokens;
}

/**
 * Minimal serializable theme token contract shared by core, components, and hosts.
 *
 * @public
 */
export interface RuntimeUiThemeTokenContract {
  readonly version: "ludoweave.theme.v0.2";
  readonly components: RuntimeUiThemeComponentTokens;
}

const promptThemeTokens = Object.freeze({
  root: "runtime-ui.prompt.root",
  text: "runtime-ui.prompt.text",
}) satisfies RuntimeUiPromptThemeTokens;

const subtitleThemeTokens = Object.freeze({
  root: "runtime-ui.subtitle.root",
  text: "runtime-ui.subtitle.text",
}) satisfies RuntimeUiSubtitleThemeTokens;

const dialogThemeTokens = Object.freeze({
  root: "runtime-ui.dialog.root",
  title: "runtime-ui.dialog.title",
  controls: "runtime-ui.dialog.controls",
}) satisfies RuntimeUiDialogThemeTokens;

const objectiveThemeTokens = Object.freeze({
  root: "runtime-ui.objective.root",
  title: "runtime-ui.objective.title",
  body: "runtime-ui.objective.body",
}) satisfies RuntimeUiObjectiveThemeTokens;

/**
 * Stable token names emitted by built-in v0.2 runtime UI components.
 *
 * @public
 */
export const runtimeUiThemeTokens = Object.freeze({
  prompt: promptThemeTokens,
  subtitle: subtitleThemeTokens,
  dialog: dialogThemeTokens,
  objective: objectiveThemeTokens,
}) satisfies RuntimeUiThemeComponentTokens;

/**
 * Built-in v0.2 runtime UI theme token contract.
 *
 * @public
 */
export const runtimeUiThemeTokenContract = Object.freeze({
  version: "ludoweave.theme.v0.2",
  components: runtimeUiThemeTokens,
}) satisfies RuntimeUiThemeTokenContract;

/**
 * Normalizes a theme token name without using a runtime schema dependency.
 *
 * @public
 */
export function normalizeThemeTokenName(value: unknown, path = "themeToken"): UiThemeTokenName {
  if (typeof value !== "string") {
    throw new TypeError(`${path} must be a string.`);
  }

  const token = value.trim();
  if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/.test(token)) {
    throw new TypeError(`${path} must be a dot-separated theme token name.`);
  }

  return token;
}

/**
 * Merges a default theme token into a serializable style object.
 *
 * @public
 */
export function createThemeTokenStyle(
  defaultThemeToken: UiThemeTokenName,
  style?: UiStyle,
): UiStyle {
  const normalizedDefaultToken = normalizeThemeTokenName(defaultThemeToken);

  if (style === undefined) {
    return {
      [uiThemeTokenStyleKey]: normalizedDefaultToken,
    };
  }

  if (!isPlainRecord(style)) {
    throw new TypeError("style must be a plain JSON object.");
  }

  const normalizedStyle = normalizeJsonObject(style, "style");
  const overrideToken = normalizedStyle[uiThemeTokenStyleKey];
  if (overrideToken !== undefined) {
    return {
      ...normalizedStyle,
      [uiThemeTokenStyleKey]: normalizeThemeTokenName(overrideToken, "style.themeToken"),
    };
  }

  return {
    [uiThemeTokenStyleKey]: normalizedDefaultToken,
    ...normalizedStyle,
  };
}

/**
 * Normalizes the v0.2 runtime UI token contract shape.
 *
 * @public
 */
export function normalizeRuntimeUiThemeTokenContract(input: unknown): RuntimeUiThemeTokenContract {
  if (!isPlainRecord(input)) {
    throw new TypeError("Theme token contract must be a plain object.");
  }

  if (input.version !== runtimeUiThemeTokenContract.version) {
    throw new TypeError("Theme token contract version must be ludoweave.theme.v0.2.");
  }

  const components = input.components;
  if (!isPlainRecord(components)) {
    throw new TypeError("Theme token contract components must be a plain object.");
  }

  return {
    version: runtimeUiThemeTokenContract.version,
    components: {
      prompt: normalizeComponentTokens(components.prompt, "components.prompt", ["root", "text"]),
      subtitle: normalizeComponentTokens(components.subtitle, "components.subtitle", [
        "root",
        "text",
      ]),
      dialog: normalizeComponentTokens(components.dialog, "components.dialog", [
        "root",
        "title",
        "controls",
      ]),
      objective: normalizeComponentTokens(components.objective, "components.objective", [
        "root",
        "title",
        "body",
      ]),
    },
  };
}

function normalizeComponentTokens<const TSlot extends string>(
  input: unknown,
  path: string,
  slots: readonly TSlot[],
): Readonly<Record<TSlot, UiThemeTokenName>> {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${path} must be a plain object.`);
  }

  const normalized: Record<TSlot, UiThemeTokenName> = {} as Record<TSlot, UiThemeTokenName>;
  for (const slot of slots) {
    normalized[slot] = normalizeThemeTokenName(input[slot], `${path}.${slot}`);
  }

  return normalized;
}
