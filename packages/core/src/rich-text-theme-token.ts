import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import {
  normalizeRichTextMetadata,
  type RichTextMetadata,
  type RichTextMetadataInput,
} from "./rich-text-metadata.js";
import { normalizeThemeTokenName, type UiThemeTokenName } from "./theme-token.js";

/**
 * Host-provided context for rich text theme token review.
 *
 * @public
 */
export interface RichTextThemeTokenContext {
  readonly disabled?: boolean;
  readonly selected?: boolean;
  readonly focused?: boolean;
}

/**
 * Rich text token usage owner.
 *
 * @public
 */
export type RichTextThemeTokenOwnerKind = "run" | "span";

/**
 * Rich text token usage status.
 *
 * @public
 */
export type RichTextThemeTokenStatus = "available" | "missing" | "unsupported-scope";

/**
 * One rich text theme token reference usage.
 *
 * @public
 */
export interface RichTextThemeTokenUsage {
  readonly blockId: string;
  readonly ownerKind: RichTextThemeTokenOwnerKind;
  readonly ownerId: string;
  readonly tokenRef: UiThemeTokenName;
  readonly status: RichTextThemeTokenStatus;
  readonly context: RichTextThemeTokenContext;
}

/**
 * Result of resolving rich text theme token references against a host-known token set.
 *
 * @public
 */
export interface RichTextThemeTokenResolution {
  readonly usages: readonly RichTextThemeTokenUsage[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Input for {@link resolveRichTextThemeTokenRefs}.
 *
 * @public
 */
export interface ResolveRichTextThemeTokenRefsInput {
  readonly metadata: RichTextMetadata | RichTextMetadataInput;
  readonly knownThemeTokenRefs: readonly UiThemeTokenName[];
  readonly unsupportedTokenScopes?: readonly string[];
  readonly context?: RichTextThemeTokenContext;
}

/**
 * Resolves rich text token references without producing renderer-specific style objects.
 *
 * @public
 */
export function resolveRichTextThemeTokenRefs(
  input: ResolveRichTextThemeTokenRefsInput,
): RichTextThemeTokenResolution {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text theme token input must be a plain object.");
  }

  const metadata = normalizeRichTextMetadata(input.metadata);
  const knownThemeTokenRefs = normalizeKnownThemeTokenRefs(input.knownThemeTokenRefs);
  const unsupportedTokenScopes = normalizeUnsupportedTokenScopes(
    input.unsupportedTokenScopes ?? [],
  );
  const context = normalizeContext(input.context ?? {});
  const diagnostics: UiDiagnostic[] = [];
  const usages: RichTextThemeTokenUsage[] = [];

  for (const run of metadata.runs) {
    for (const tokenRef of run.themeTokenRefs) {
      usages.push(
        createUsage({
          blockId: metadata.id,
          ownerKind: "run",
          ownerId: run.id,
          tokenRef,
          knownThemeTokenRefs,
          unsupportedTokenScopes,
          context,
          diagnostics,
        }),
      );
    }
  }

  for (const span of metadata.spans) {
    for (const tokenRef of span.themeTokenRefs) {
      usages.push(
        createUsage({
          blockId: metadata.id,
          ownerKind: "span",
          ownerId: span.id,
          tokenRef,
          knownThemeTokenRefs,
          unsupportedTokenScopes,
          context,
          diagnostics,
        }),
      );
    }
  }

  return {
    usages,
    diagnostics,
  };
}

function createUsage(input: {
  readonly blockId: string;
  readonly ownerKind: RichTextThemeTokenOwnerKind;
  readonly ownerId: string;
  readonly tokenRef: string;
  readonly knownThemeTokenRefs: ReadonlySet<string>;
  readonly unsupportedTokenScopes: readonly string[];
  readonly context: RichTextThemeTokenContext;
  readonly diagnostics: UiDiagnostic[];
}): RichTextThemeTokenUsage {
  const tokenRef = normalizeThemeTokenName(input.tokenRef, "richText.themeTokenRef");
  const unsupportedScope = input.unsupportedTokenScopes.find((scope) => tokenRef.startsWith(scope));
  const status: RichTextThemeTokenStatus =
    unsupportedScope !== undefined
      ? "unsupported-scope"
      : input.knownThemeTokenRefs.has(tokenRef)
        ? "available"
        : "missing";

  if (status !== "available") {
    input.diagnostics.push(
      createTokenDiagnostic(status, {
        blockId: input.blockId,
        ownerKind: input.ownerKind,
        ownerId: input.ownerId,
        tokenRef,
        ...(unsupportedScope !== undefined ? { unsupportedScope } : {}),
      }),
    );
  }

  return {
    blockId: input.blockId,
    ownerKind: input.ownerKind,
    ownerId: input.ownerId,
    tokenRef,
    status,
    context: input.context,
  };
}

function createTokenDiagnostic(
  status: Exclude<RichTextThemeTokenStatus, "available">,
  details: Readonly<Record<string, JsonValue>>,
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code:
      status === "missing"
        ? "LW_RICH_TEXT_INVALID_TOKEN_REFERENCE"
        : "LW_RICH_TEXT_UNSUPPORTED_TOKEN_SCOPE",
    severity: "warning",
    message:
      status === "missing"
        ? "Rich text references an unknown theme token."
        : "Rich text references an unsupported theme token scope.",
    details,
  });
}

function normalizeKnownThemeTokenRefs(input: readonly UiThemeTokenName[]): ReadonlySet<string> {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text knownThemeTokenRefs must be an array.");
  }

  return new Set(
    input.map((tokenRef, index) =>
      normalizeThemeTokenName(tokenRef, `knownThemeTokenRefs[${index}]`),
    ),
  );
}

function normalizeUnsupportedTokenScopes(input: readonly string[]): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Rich text unsupportedTokenScopes must be an array.");
  }

  return input.map((scope, index) =>
    normalizeThemeTokenName(scope, `unsupportedTokenScopes[${index}]`),
  );
}

function normalizeContext(input: RichTextThemeTokenContext): RichTextThemeTokenContext {
  if (!isPlainRecord(input)) {
    throw new TypeError("Rich text theme token context must be a plain object.");
  }

  const context = input as unknown as RichTextThemeTokenContext;
  return {
    disabled: context.disabled ?? false,
    selected: context.selected ?? false,
    focused: context.focused ?? false,
  };
}
