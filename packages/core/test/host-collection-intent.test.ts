import { describe, expect, it } from "vitest";

import {
  createHostCollectionIntentActionRef,
  normalizeHostCollectionIntent,
} from "../src/host-collection-intent.js";

describe("host collection intent contract", () => {
  it("normalizes select, activate, move, request window, and restore intents", () => {
    expect([
      normalizeHostCollectionIntent({
        kind: "select-item",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        itemKey: "quest:24",
      }),
      normalizeHostCollectionIntent({
        kind: "activate-item",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        itemKey: "quest:24",
      }),
      normalizeHostCollectionIntent({
        kind: "move-selection",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        direction: "next",
        repeat: true,
      }),
      normalizeHostCollectionIntent({
        kind: "request-window",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        requestedRange: { startIndex: 20, endIndex: 32 },
      }),
      normalizeHostCollectionIntent({
        kind: "restore-selection",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        restoreSelection: {
          selectedKey: "quest:24",
          focusedKey: "quest:25",
          anchorKey: "quest:20",
          revision: 3,
        },
      }),
    ]).toEqual([
      {
        kind: "select-item",
        handoff: "host",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        repeat: false,
        itemKey: "quest:24",
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "select-item",
            windowId: "quest-log",
            itemKeyNamespace: "quest",
            repeat: false,
            itemKey: "quest:24",
          },
        },
      },
      {
        kind: "activate-item",
        handoff: "host",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        repeat: false,
        itemKey: "quest:24",
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "activate-item",
            windowId: "quest-log",
            itemKeyNamespace: "quest",
            repeat: false,
            itemKey: "quest:24",
          },
        },
      },
      {
        kind: "move-selection",
        handoff: "host",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        repeat: true,
        direction: "next",
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "move-selection",
            windowId: "quest-log",
            itemKeyNamespace: "quest",
            repeat: true,
            direction: "next",
          },
        },
      },
      {
        kind: "request-window",
        handoff: "host",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        repeat: false,
        requestedRange: { startIndex: 20, endIndex: 32 },
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "request-window",
            windowId: "quest-log",
            itemKeyNamespace: "quest",
            repeat: false,
            requestedRange: { startIndex: 20, endIndex: 32 },
          },
        },
      },
      {
        kind: "restore-selection",
        handoff: "host",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        repeat: false,
        restoreSelection: {
          selectedKey: "quest:24",
          focusedKey: "quest:25",
          anchorKey: "quest:20",
          revision: 3,
        },
        action: {
          type: "runtime.collection.intent",
          payload: {
            kind: "restore-selection",
            windowId: "quest-log",
            itemKeyNamespace: "quest",
            repeat: false,
            restoreSelection: {
              selectedKey: "quest:24",
              focusedKey: "quest:25",
              anchorKey: "quest:20",
              revision: 3,
            },
          },
        },
      },
    ]);
  });

  it("keeps normalized intents and default ActionRefs JSON-serializable", () => {
    const intent = normalizeHostCollectionIntent({
      kind: "request-window",
      windowId: "inventory",
      itemKeyNamespace: "item",
      requestedRange: { startIndex: 0, endIndex: 12 },
    });

    expect(JSON.parse(JSON.stringify(intent))).toEqual(intent);
    expect(createHostCollectionIntentActionRef(intent)).toEqual(intent.action);
  });

  it("allows a custom ActionRef but rejects callback payloads", () => {
    expect(
      normalizeHostCollectionIntent({
        kind: "activate-item",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        itemKey: "quest:24",
        action: {
          type: "runtime.collection.activate",
          payload: { windowId: "quest-log", itemKey: "quest:24" },
        },
      }).action,
    ).toEqual({
      type: "runtime.collection.activate",
      payload: { windowId: "quest-log", itemKey: "quest:24" },
    });

    expect(() =>
      normalizeHostCollectionIntent({
        kind: "select-item",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        itemKey: "quest:24",
        action: {
          type: "runtime.collection.intent",
          payload: {
            datasource: {
              load: () => undefined,
            },
          },
        },
      } as never),
    ).toThrow(/payload\.datasource\.load must be a JsonValue/);
  });

  it("rejects native event-like objects, datasource-like ranges, and invalid kind-specific fields", () => {
    class NativeInputEvent {
      kind = "select-item";
      target = { dataset: { key: "quest:24" } };
    }

    expect(() => normalizeHostCollectionIntent(new NativeInputEvent() as never)).toThrow(
      /plain object/,
    );

    expect(() =>
      normalizeHostCollectionIntent({
        kind: "select-item",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
      }),
    ).toThrow(/itemKey/);

    expect(() =>
      normalizeHostCollectionIntent({
        kind: "restore-selection",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        itemKey: "quest:24",
        restoreSelection: { selectedKey: "quest:24" },
      }),
    ).toThrow(/itemKey is only valid/);

    expect(() =>
      normalizeHostCollectionIntent({
        kind: "request-window",
        windowId: "quest-log",
        itemKeyNamespace: "quest",
        requestedRange: { startIndex: 8, endIndex: 4 },
      }),
    ).toThrow(/endIndex/);
  });
});
