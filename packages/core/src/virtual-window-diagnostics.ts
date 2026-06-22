import { normalizeUiDiagnostic, type UiDiagnostic } from "./diagnostics.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord } from "./json-normalize.js";
import {
  normalizeVirtualWindowMetadata,
  type VirtualSelectionSnapshot,
  type VirtualWindowMetadata,
  type VirtualWindowMetadataInput,
} from "./virtual-window-metadata.js";

/**
 * Stable diagnostic codes for host-owned virtual window contracts.
 *
 * @public
 */
export const virtualWindowDiagnosticCodes = {
  duplicateKey: "LW_VIRTUAL_WINDOW_DUPLICATE_KEY",
  invalidRange: "LW_VIRTUAL_WINDOW_INVALID_RANGE",
  missingHostCapability: "LW_VIRTUAL_WINDOW_MISSING_HOST_CAPABILITY",
  missingItemKey: "LW_VIRTUAL_WINDOW_MISSING_ITEM_KEY",
  removedItem: "LW_VIRTUAL_WINDOW_REMOVED_ITEM",
  staleSelection: "LW_VIRTUAL_WINDOW_STALE_SELECTION",
} as const;

/**
 * Stable virtual window diagnostic reason.
 *
 * @public
 */
export type VirtualWindowDiagnosticReason = keyof typeof virtualWindowDiagnosticCodes;

/**
 * Host-provided realized item identity snapshot for diagnostics.
 *
 * @public
 */
export interface VirtualWindowItemIdentitySnapshot {
  readonly index: number;
  readonly key?: string;
}

/**
 * Input for virtual window diagnostics.
 *
 * @public
 */
export interface VirtualWindowDiagnosticsInput {
  readonly window: VirtualWindowMetadata | VirtualWindowMetadataInput;
  readonly realizedItems?: readonly VirtualWindowItemIdentitySnapshot[];
  readonly knownItemKeys?: readonly string[];
}

/**
 * Creates a stable virtual window diagnostic.
 *
 * @public
 */
export function createVirtualWindowDiagnostic(
  reason: VirtualWindowDiagnosticReason,
  details: Readonly<Record<string, JsonValue>> = {},
): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: virtualWindowDiagnosticCodes[reason],
    severity: severityForReason(reason),
    message: messageForReason(reason),
    details,
  });
}

/**
 * Collects stable virtual window diagnostics without reading datasource or renderer state.
 *
 * @public
 */
export function collectVirtualWindowDiagnostics(
  input: VirtualWindowDiagnosticsInput,
): readonly UiDiagnostic[] {
  if (!isPlainRecord(input)) {
    throw new TypeError("Virtual window diagnostics input must be a plain object.");
  }

  const diagnostics: UiDiagnostic[] = [];
  const window = tryNormalizeWindow(input.window, diagnostics);
  const realizedItems = normalizeItemSnapshots(input.realizedItems ?? []);
  const realizedKeys = collectRealizedKeyDiagnostics(window.id, realizedItems, diagnostics);
  const knownItemKeys = normalizeKnownItemKeys(input.knownItemKeys ?? []);

  if (window.hostCapability.status === "missing") {
    diagnostics.push(
      createVirtualWindowDiagnostic("missingHostCapability", {
        windowId: window.id,
        capability: "host.collection",
      }),
    );
  }

  collectSelectionDiagnostics(
    window.id,
    window.selection,
    realizedKeys,
    knownItemKeys,
    diagnostics,
  );

  return diagnostics;
}

function tryNormalizeWindow(
  input: VirtualWindowMetadata | VirtualWindowMetadataInput,
  diagnostics: UiDiagnostic[],
): VirtualWindowMetadata {
  try {
    return normalizeVirtualWindowMetadata(input);
  } catch (error) {
    diagnostics.push(
      createVirtualWindowDiagnostic("invalidRange", {
        message: error instanceof Error ? error.message : "Invalid virtual window metadata.",
      }),
    );

    return normalizeVirtualWindowMetadata({
      id: "invalid-window",
      itemKeyNamespace: "invalid",
      totalCount: 0,
      realizedRange: { startIndex: 0, endIndex: 0 },
      estimatedItemSize: { width: 1, height: 1 },
    });
  }
}

function collectRealizedKeyDiagnostics(
  windowId: string,
  realizedItems: readonly VirtualWindowItemIdentitySnapshot[],
  diagnostics: UiDiagnostic[],
): ReadonlySet<string> {
  const keys = new Set<string>();

  for (const item of realizedItems) {
    if (item.key === undefined) {
      diagnostics.push(
        createVirtualWindowDiagnostic("missingItemKey", {
          windowId,
          index: item.index,
        }),
      );
      continue;
    }

    if (keys.has(item.key)) {
      diagnostics.push(
        createVirtualWindowDiagnostic("duplicateKey", {
          windowId,
          itemKey: item.key,
        }),
      );
    }

    keys.add(item.key);
  }

  return keys;
}

function collectSelectionDiagnostics(
  windowId: string,
  selection: VirtualSelectionSnapshot,
  realizedKeys: ReadonlySet<string>,
  knownItemKeys: ReadonlySet<string>,
  diagnostics: UiDiagnostic[],
): void {
  const selectedKeys = [
    ["selectedKey", selection.selectedKey],
    ["focusedKey", selection.focusedKey],
    ["anchorKey", selection.anchorKey],
  ] as const;

  for (const [field, key] of selectedKeys) {
    if (key === undefined) {
      continue;
    }

    if (knownItemKeys.size > 0 && !knownItemKeys.has(key)) {
      diagnostics.push(
        createVirtualWindowDiagnostic("removedItem", {
          windowId,
          field,
          itemKey: key,
        }),
      );
      continue;
    }

    if (realizedKeys.size > 0 && !realizedKeys.has(key)) {
      diagnostics.push(
        createVirtualWindowDiagnostic("staleSelection", {
          windowId,
          field,
          itemKey: key,
        }),
      );
    }
  }
}

function normalizeItemSnapshots(
  input: readonly VirtualWindowItemIdentitySnapshot[],
): readonly VirtualWindowItemIdentitySnapshot[] {
  if (!Array.isArray(input)) {
    throw new TypeError("Virtual window realizedItems must be an array.");
  }

  return input.map((item, index) => {
    if (!isPlainRecord(item)) {
      throw new TypeError("Virtual window realized item snapshot must be a plain object.");
    }

    const snapshot: MutableVirtualWindowItemIdentitySnapshot = {
      index: normalizeNonNegativeInteger(item.index, "Virtual window realized item index"),
    };

    if (item.key !== undefined) {
      snapshot.key = normalizeNonEmptyString(item.key, `Virtual window realized item ${index} key`);
    }

    return snapshot;
  });
}

type MutableVirtualWindowItemIdentitySnapshot = {
  index: number;
  key?: string;
};

function normalizeKnownItemKeys(input: readonly string[]): ReadonlySet<string> {
  if (!Array.isArray(input)) {
    throw new TypeError("Virtual window knownItemKeys must be an array.");
  }

  return new Set(
    input.map((key, index) =>
      normalizeNonEmptyString(key, `Virtual window knownItemKeys ${index}`),
    ),
  );
}

function severityForReason(reason: VirtualWindowDiagnosticReason): "error" | "warning" {
  switch (reason) {
    case "invalidRange":
    case "missingHostCapability":
      return "error";
    case "duplicateKey":
    case "missingItemKey":
    case "removedItem":
    case "staleSelection":
      return "warning";
  }
}

function messageForReason(reason: VirtualWindowDiagnosticReason): string {
  switch (reason) {
    case "duplicateKey":
      return "Virtual window contains a duplicate item key.";
    case "invalidRange":
      return "Virtual window range metadata is invalid.";
    case "missingHostCapability":
      return "Host virtual list capability is missing.";
    case "missingItemKey":
      return "Virtual window realized item is missing a stable key.";
    case "removedItem":
      return "Virtual window selection references a removed item.";
    case "staleSelection":
      return "Virtual window selection is outside the realized range.";
  }
}

function normalizeNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }

  return normalized;
}

function normalizeFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }

  return value;
}

function normalizeNonNegativeInteger(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (!Number.isInteger(number) || number < 0) {
    throw new TypeError(`${label} must be a non-negative integer.`);
  }

  return number;
}
