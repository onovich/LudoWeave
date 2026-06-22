import {
  normalizeThemeTokenName,
  runtimeUiThemeTokenContract,
  runtimeUiThemeTokens,
  type UiThemeTokenName,
} from "@ludoweave/core";

/**
 * Named fixture theme state used by renderer and playground tests.
 *
 * @public
 */
export type RuntimeUiThemeFixtureState = "default" | "high-contrast";

/**
 * Stable visual hints resolved from a runtime UI theme token.
 *
 * @public
 */
export interface RuntimeUiThemeVisualHints {
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly borderColor?: string;
  readonly accentColor?: string;
  readonly opacity?: number;
  readonly fontWeight?: "regular" | "medium" | "bold";
}

/**
 * One deterministic fixture entry for a token and theme state.
 *
 * @public
 */
export interface RuntimeUiThemeResolutionEntry {
  readonly state: RuntimeUiThemeFixtureState;
  readonly token: UiThemeTokenName;
  readonly hints: RuntimeUiThemeVisualHints;
}

/**
 * Serializable runtime UI theme resolution fixture.
 *
 * @public
 */
export interface RuntimeUiThemeResolutionFixture {
  readonly name: "runtime-ui-theme-resolution";
  readonly contractVersion: typeof runtimeUiThemeTokenContract.version;
  readonly defaultState: RuntimeUiThemeFixtureState;
  readonly states: readonly RuntimeUiThemeFixtureState[];
  readonly entries: readonly RuntimeUiThemeResolutionEntry[];
}

/**
 * Options for resolving one token through the fixture.
 *
 * @public
 */
export interface ResolveRuntimeUiThemeVisualHintsOptions {
  readonly token: UiThemeTokenName;
  readonly state?: RuntimeUiThemeFixtureState;
}

/**
 * Result returned by the fixture resolver.
 *
 * @public
 */
export interface ResolvedRuntimeUiThemeVisualHints {
  readonly state: RuntimeUiThemeFixtureState;
  readonly token: UiThemeTokenName;
  readonly hints: RuntimeUiThemeVisualHints;
  readonly fallback: boolean;
}

const fallbackHints = Object.freeze({
  color: "#f9fafb",
  backgroundColor: "#111827",
  borderColor: "#4b5563",
  opacity: 1,
  fontWeight: "regular",
}) satisfies RuntimeUiThemeVisualHints;

/**
 * Creates a concrete theme resolution fixture for v0.3 renderer/playground tests.
 *
 * @public
 */
export function createRuntimeUiThemeResolutionFixture(): RuntimeUiThemeResolutionFixture {
  return {
    name: "runtime-ui-theme-resolution",
    contractVersion: runtimeUiThemeTokenContract.version,
    defaultState: "default",
    states: ["default", "high-contrast"],
    entries: [
      entry("default", runtimeUiThemeTokens.prompt.root, {
        color: "#fef3c7",
        backgroundColor: "#1f2937",
        borderColor: "#f59e0b",
        accentColor: "#fbbf24",
        opacity: 0.96,
        fontWeight: "medium",
      }),
      entry("default", runtimeUiThemeTokens.prompt.text, {
        color: "#fef3c7",
        fontWeight: "medium",
      }),
      entry("default", runtimeUiThemeTokens.subtitle.root, {
        color: "#e5e7eb",
        backgroundColor: "#111827",
        opacity: 0.9,
      }),
      entry("default", runtimeUiThemeTokens.subtitle.text, {
        color: "#f9fafb",
        fontWeight: "regular",
      }),
      entry("default", runtimeUiThemeTokens.dialog.root, {
        color: "#f8fafc",
        backgroundColor: "#020617",
        borderColor: "#475569",
        opacity: 0.98,
      }),
      entry("default", runtimeUiThemeTokens.dialog.title, {
        color: "#f8fafc",
        fontWeight: "bold",
      }),
      entry("default", runtimeUiThemeTokens.dialog.controls, {
        color: "#dbeafe",
        backgroundColor: "#1d4ed8",
        borderColor: "#93c5fd",
        accentColor: "#bfdbfe",
        fontWeight: "medium",
      }),
      entry("default", runtimeUiThemeTokens.objective.root, {
        color: "#ecfeff",
        backgroundColor: "#164e63",
        borderColor: "#67e8f9",
        opacity: 0.94,
      }),
      entry("default", runtimeUiThemeTokens.objective.title, {
        color: "#cffafe",
        fontWeight: "bold",
      }),
      entry("default", runtimeUiThemeTokens.objective.body, {
        color: "#ecfeff",
        fontWeight: "regular",
      }),
      entry("high-contrast", runtimeUiThemeTokens.prompt.root, {
        color: "#000000",
        backgroundColor: "#ffd166",
        borderColor: "#000000",
        accentColor: "#7c2d12",
        opacity: 1,
        fontWeight: "bold",
      }),
      entry("high-contrast", runtimeUiThemeTokens.subtitle.text, {
        color: "#ffffff",
        backgroundColor: "#000000",
        fontWeight: "bold",
      }),
      entry("high-contrast", runtimeUiThemeTokens.dialog.controls, {
        color: "#000000",
        backgroundColor: "#ffffff",
        borderColor: "#000000",
        accentColor: "#dc2626",
        opacity: 1,
        fontWeight: "bold",
      }),
      entry("high-contrast", runtimeUiThemeTokens.objective.body, {
        color: "#ffffff",
        backgroundColor: "#0f172a",
        borderColor: "#ffffff",
        fontWeight: "medium",
      }),
    ],
  };
}

/**
 * Resolves one token to stable visual hints without adding a runtime schema dependency.
 *
 * @public
 */
export function resolveRuntimeUiThemeVisualHints(
  fixture: RuntimeUiThemeResolutionFixture,
  options: ResolveRuntimeUiThemeVisualHintsOptions,
): ResolvedRuntimeUiThemeVisualHints {
  const state = options.state ?? fixture.defaultState;
  const token = normalizeThemeTokenName(options.token);
  const entryMatch = fixture.entries.find(
    (candidate) => candidate.state === state && candidate.token === token,
  );

  if (entryMatch !== undefined) {
    return {
      state,
      token,
      hints: entryMatch.hints,
      fallback: false,
    };
  }

  return {
    state,
    token,
    hints: fallbackHints,
    fallback: true,
  };
}

function entry(
  state: RuntimeUiThemeFixtureState,
  token: UiThemeTokenName,
  hints: RuntimeUiThemeVisualHints,
): RuntimeUiThemeResolutionEntry {
  return {
    state,
    token: normalizeThemeTokenName(token),
    hints,
  };
}
