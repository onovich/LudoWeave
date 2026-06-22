import { describe, expect, it } from "vitest";

import {
  createHostScrollIntentActionRef,
  normalizeHostScrollIntent,
} from "../src/host-scroll-intent.js";

describe("host scroll intent contract", () => {
  it("normalizes line, page, edge, and restore intents", () => {
    expect([
      normalizeHostScrollIntent({
        kind: "line",
        containerId: "quest-log",
        direction: "down",
        repeat: true,
      }),
      normalizeHostScrollIntent({
        kind: "page",
        containerId: "quest-log",
        direction: "right",
      }),
      normalizeHostScrollIntent({
        kind: "edge",
        containerId: "quest-log",
        axis: "y",
        edge: "end",
      }),
      normalizeHostScrollIntent({
        kind: "restore",
        containerId: "quest-log",
        restoreOffset: { x: 0, y: 128, revision: 4 },
      }),
    ]).toEqual([
      {
        kind: "line",
        handoff: "host",
        containerId: "quest-log",
        axis: "y",
        repeat: true,
        direction: "down",
        action: {
          type: "runtime.scroll.intent",
          payload: {
            kind: "line",
            containerId: "quest-log",
            axis: "y",
            repeat: true,
            direction: "down",
          },
        },
      },
      {
        kind: "page",
        handoff: "host",
        containerId: "quest-log",
        axis: "x",
        repeat: false,
        direction: "right",
        action: {
          type: "runtime.scroll.intent",
          payload: {
            kind: "page",
            containerId: "quest-log",
            axis: "x",
            repeat: false,
            direction: "right",
          },
        },
      },
      {
        kind: "edge",
        handoff: "host",
        containerId: "quest-log",
        axis: "y",
        repeat: false,
        edge: "end",
        action: {
          type: "runtime.scroll.intent",
          payload: {
            kind: "edge",
            containerId: "quest-log",
            axis: "y",
            repeat: false,
            edge: "end",
          },
        },
      },
      {
        kind: "restore",
        handoff: "host",
        containerId: "quest-log",
        axis: "y",
        repeat: false,
        restoreOffset: { x: 0, y: 128, revision: 4 },
        action: {
          type: "runtime.scroll.intent",
          payload: {
            kind: "restore",
            containerId: "quest-log",
            axis: "y",
            repeat: false,
            restoreOffset: { x: 0, y: 128, revision: 4 },
          },
        },
      },
    ]);
  });

  it("keeps normalized intents and default ActionRefs JSON-serializable", () => {
    const intent = normalizeHostScrollIntent({
      kind: "page",
      containerId: "dialog-copy",
      axis: "both",
      direction: "down",
    });

    expect(JSON.parse(JSON.stringify(intent))).toEqual(intent);
    expect(createHostScrollIntentActionRef(intent)).toEqual(intent.action);
  });

  it("allows a custom ActionRef but rejects callback payloads", () => {
    expect(
      normalizeHostScrollIntent({
        kind: "edge",
        containerId: "quest-log",
        edge: "start",
        action: {
          type: "runtime.scroll.edge",
          payload: { containerId: "quest-log", edge: "start" },
        },
      }).action,
    ).toEqual({
      type: "runtime.scroll.edge",
      payload: { containerId: "quest-log", edge: "start" },
    });

    expect(() =>
      normalizeHostScrollIntent({
        kind: "line",
        containerId: "quest-log",
        direction: "down",
        action: {
          type: "runtime.scroll.intent",
          payload: {
            onScroll: () => undefined,
          },
        },
      } as never),
    ).toThrow(/payload\.onScroll must be a JsonValue/);
  });

  it("rejects native event-like objects and invalid kind-specific fields", () => {
    class NativeWheelEvent {
      kind = "line";
      deltaY = 120;
    }

    expect(() => normalizeHostScrollIntent(new NativeWheelEvent() as never)).toThrow(
      /plain object/,
    );

    expect(() => normalizeHostScrollIntent({ kind: "line", containerId: "quest-log" })).toThrow(
      /direction/,
    );

    expect(() =>
      normalizeHostScrollIntent({
        kind: "restore",
        containerId: "quest-log",
        direction: "down",
        restoreOffset: { y: 20 },
      }),
    ).toThrow(/direction is only valid/);

    expect(() =>
      normalizeHostScrollIntent({
        kind: "page",
        containerId: "quest-log",
        direction: "down",
        restoreOffset: { y: 20 },
      }),
    ).toThrow(/restoreOffset is only valid/);
  });
});
