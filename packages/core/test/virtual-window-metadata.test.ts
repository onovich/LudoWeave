import { describe, expect, it } from "vitest";

import {
  normalizeVirtualWindowMetadata,
  normalizeVirtualWindowMetadataFrame,
} from "../src/virtual-window-metadata.js";

describe("virtual window metadata", () => {
  it("normalizes serializable host-owned virtual window metadata", () => {
    const metadata = normalizeVirtualWindowMetadata({
      id: " quest-log ",
      nodeId: "node.quest-list",
      itemKeyNamespace: "quest",
      totalCount: 120,
      realizedRange: { startIndex: 20, endIndex: 30 },
      overscanRange: { startIndex: 16, endIndex: 36 },
      estimatedItemSize: { width: 360, height: 44 },
      viewportRect: { x: 24, y: 96, width: 360, height: 320 },
      scrollContainerId: "scroll.quest-log",
      selection: {
        selectedKey: "quest:24",
        focusedKey: "quest:25",
        anchorKey: "quest:20",
        revision: 3,
      },
      hostCapability: { status: "available" },
      diagnostics: [
        {
          code: "LW_TEST",
          severity: "info",
          message: "Fixture diagnostic.",
          details: { window: "quest-log" },
        },
      ],
    });

    expect(metadata).toEqual({
      id: "quest-log",
      nodeId: "node.quest-list",
      itemKeyNamespace: "quest",
      totalCount: 120,
      realizedRange: { startIndex: 20, endIndex: 30 },
      overscanRange: { startIndex: 16, endIndex: 36 },
      estimatedItemSize: { width: 360, height: 44 },
      viewportRect: { x: 24, y: 96, width: 360, height: 320 },
      scrollContainerId: "scroll.quest-log",
      hostCapability: { status: "available" },
      selection: {
        selectedKey: "quest:24",
        focusedKey: "quest:25",
        anchorKey: "quest:20",
        revision: 3,
      },
      diagnostics: [
        {
          code: "LW_TEST",
          severity: "info",
          message: "Fixture diagnostic.",
          details: { window: "quest-log" },
        },
      ],
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("normalizes a metadata frame with active and restore references", () => {
    const metadata = normalizeVirtualWindowMetadataFrame({
      activeWindowId: "inventory",
      restoreWindowId: "quest-log",
      windows: [
        {
          id: "inventory",
          itemKeyNamespace: "item",
          totalCount: 8,
          realizedRange: { startIndex: 0, endIndex: 8 },
          estimatedItemSize: { width: 280, height: 36 },
          selection: { selectedKey: "item:iron-key" },
        },
        {
          id: "quest-log",
          itemKeyNamespace: "quest",
          totalCount: 0,
          realizedRange: { startIndex: 0, endIndex: 0 },
          overscanRange: { startIndex: 0, endIndex: 0 },
          estimatedItemSize: { width: 360, height: 44 },
          hostCapability: { status: "disabled", reason: "empty-list" },
          disabledReason: "empty-list",
        },
      ],
    });

    expect(metadata).toEqual({
      windows: [
        {
          id: "inventory",
          nodeId: "inventory",
          itemKeyNamespace: "item",
          totalCount: 8,
          realizedRange: { startIndex: 0, endIndex: 8 },
          overscanRange: { startIndex: 0, endIndex: 8 },
          estimatedItemSize: { width: 280, height: 36 },
          hostCapability: { status: "available" },
          selection: { selectedKey: "item:iron-key" },
          diagnostics: [],
        },
        {
          id: "quest-log",
          nodeId: "quest-log",
          itemKeyNamespace: "quest",
          totalCount: 0,
          realizedRange: { startIndex: 0, endIndex: 0 },
          overscanRange: { startIndex: 0, endIndex: 0 },
          estimatedItemSize: { width: 360, height: 44 },
          hostCapability: { status: "disabled", reason: "empty-list" },
          selection: {},
          disabledReason: "empty-list",
          diagnostics: [],
        },
      ],
      activeWindowId: "inventory",
      restoreWindowId: "quest-log",
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("rejects platform-like geometry, invalid ranges, duplicate ids, and invalid capability", () => {
    class PlatformRect {
      x = 0;
      y = 0;
      width = 100;
      height = 24;
    }

    expect(() =>
      normalizeVirtualWindowMetadata({
        id: "inventory",
        itemKeyNamespace: "item",
        totalCount: 8,
        realizedRange: { startIndex: 0, endIndex: 4 },
        estimatedItemSize: { width: 280, height: 36 },
        viewportRect: new PlatformRect(),
      }),
    ).toThrow(/viewportRect must be a plain object/);

    expect(() =>
      normalizeVirtualWindowMetadata({
        id: "inventory",
        itemKeyNamespace: "item",
        totalCount: 8,
        realizedRange: { startIndex: 2, endIndex: 4 },
        overscanRange: { startIndex: 3, endIndex: 4 },
        estimatedItemSize: { width: 280, height: 36 },
      }),
    ).toThrow(/overscanRange must contain realizedRange/);

    expect(() =>
      normalizeVirtualWindowMetadataFrame({
        windows: [
          {
            id: "inventory",
            itemKeyNamespace: "item",
            totalCount: 8,
            realizedRange: { startIndex: 0, endIndex: 4 },
            estimatedItemSize: { width: 280, height: 36 },
          },
          {
            id: "inventory",
            itemKeyNamespace: "quest",
            totalCount: 4,
            realizedRange: { startIndex: 0, endIndex: 4 },
            estimatedItemSize: { width: 280, height: 36 },
          },
        ],
      }),
    ).toThrow(/must be unique/);

    expect(() =>
      normalizeVirtualWindowMetadata({
        id: "inventory",
        itemKeyNamespace: "item",
        totalCount: 8,
        realizedRange: { startIndex: 0, endIndex: 4 },
        estimatedItemSize: { width: 280, height: 36 },
        hostCapability: { status: "callback-required" as never },
      }),
    ).toThrow(/hostCapability.status/);
  });
});
