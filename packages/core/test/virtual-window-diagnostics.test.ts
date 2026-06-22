import { describe, expect, it } from "vitest";

import {
  collectVirtualWindowDiagnostics,
  createVirtualWindowDiagnostic,
  virtualWindowDiagnosticCodes,
} from "../src/virtual-window-diagnostics.js";

describe("virtual window diagnostics", () => {
  it("creates stable diagnostic codes", () => {
    expect(virtualWindowDiagnosticCodes).toEqual({
      duplicateKey: "LW_VIRTUAL_WINDOW_DUPLICATE_KEY",
      invalidRange: "LW_VIRTUAL_WINDOW_INVALID_RANGE",
      missingHostCapability: "LW_VIRTUAL_WINDOW_MISSING_HOST_CAPABILITY",
      missingItemKey: "LW_VIRTUAL_WINDOW_MISSING_ITEM_KEY",
      removedItem: "LW_VIRTUAL_WINDOW_REMOVED_ITEM",
      staleSelection: "LW_VIRTUAL_WINDOW_STALE_SELECTION",
    });

    expect(createVirtualWindowDiagnostic("missingHostCapability", { windowId: "quest-log" }))
      .toMatchInlineSnapshot(`
        {
          "code": "LW_VIRTUAL_WINDOW_MISSING_HOST_CAPABILITY",
          "details": {
            "windowId": "quest-log",
          },
          "message": "Host virtual list capability is missing.",
          "severity": "error",
        }
      `);
  });

  it("collects duplicate key, missing key, stale selection, removed item, and capability diagnostics", () => {
    expect(
      collectVirtualWindowDiagnostics({
        window: {
          id: "quest-log",
          itemKeyNamespace: "quest",
          totalCount: 10,
          realizedRange: { startIndex: 2, endIndex: 6 },
          estimatedItemSize: { width: 320, height: 44 },
          hostCapability: { status: "missing", reason: "missing-capability" },
          selection: {
            selectedKey: "quest:removed",
            focusedKey: "quest:9",
            anchorKey: "quest:2",
          },
        },
        realizedItems: [
          { index: 2, key: "quest:2" },
          { index: 3 },
          { index: 4, key: "quest:4" },
          { index: 5, key: "quest:4" },
        ],
        knownItemKeys: ["quest:2", "quest:3", "quest:4", "quest:9"],
      }).map((diagnostic) => diagnostic.code),
    ).toEqual([
      "LW_VIRTUAL_WINDOW_MISSING_ITEM_KEY",
      "LW_VIRTUAL_WINDOW_DUPLICATE_KEY",
      "LW_VIRTUAL_WINDOW_MISSING_HOST_CAPABILITY",
      "LW_VIRTUAL_WINDOW_REMOVED_ITEM",
      "LW_VIRTUAL_WINDOW_STALE_SELECTION",
    ]);
  });

  it("reports invalid range metadata without throwing", () => {
    expect(
      collectVirtualWindowDiagnostics({
        window: {
          id: "quest-log",
          itemKeyNamespace: "quest",
          totalCount: 4,
          realizedRange: { startIndex: 2, endIndex: 7 },
          estimatedItemSize: { width: 320, height: 44 },
        },
      }),
    ).toEqual([
      {
        code: "LW_VIRTUAL_WINDOW_INVALID_RANGE",
        severity: "error",
        message: "Virtual window range metadata is invalid.",
        details: {
          message: "Virtual window realizedRange.endIndex must be within totalCount.",
        },
      },
    ]);
  });

  it("rejects native event-like item snapshots and non-serializable details", () => {
    class NativeElementLikeItem {
      index = 0;
      key = "quest:0";
    }

    expect(() =>
      collectVirtualWindowDiagnostics({
        window: {
          id: "quest-log",
          itemKeyNamespace: "quest",
          totalCount: 1,
          realizedRange: { startIndex: 0, endIndex: 1 },
          estimatedItemSize: { width: 320, height: 44 },
        },
        realizedItems: [new NativeElementLikeItem()],
      }),
    ).toThrow(/plain object/);

    expect(() =>
      createVirtualWindowDiagnostic("duplicateKey", {
        callback: () => undefined,
      } as never),
    ).toThrow(/details\.callback must be a JsonValue/);
  });
});
