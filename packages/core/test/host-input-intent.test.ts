import { describe, expect, it } from "vitest";

import { normalizeHostInputIntent } from "../src/host-input-intent.js";

describe("host input intent contract", () => {
  it("normalizes confirm, cancel, navigation, next, previous, pause, and menu intents", () => {
    expect(
      [
        normalizeHostInputIntent({ kind: "confirm", scopeId: "pause.dialog", focusId: "resume" }),
        normalizeHostInputIntent({ kind: "cancel", scopeId: "pause.dialog" }),
        normalizeHostInputIntent({
          kind: "navigate",
          direction: "down",
          scopeId: "hud",
          focusId: "prompt",
          repeat: true,
        }),
        normalizeHostInputIntent({ kind: "next" }),
        normalizeHostInputIntent({ kind: "previous" }),
        normalizeHostInputIntent({ kind: "pause" }),
        normalizeHostInputIntent({ kind: "menu", payload: { surface: "inventory" } }),
      ],
    ).toEqual([
      {
        kind: "confirm",
        handoff: "host",
        scopeId: "pause.dialog",
        focusId: "resume",
        repeat: false,
      },
      {
        kind: "cancel",
        handoff: "host",
        scopeId: "pause.dialog",
        repeat: false,
      },
      {
        kind: "navigate",
        handoff: "host",
        direction: "down",
        scopeId: "hud",
        focusId: "prompt",
        repeat: true,
      },
      {
        kind: "next",
        handoff: "host",
        repeat: false,
      },
      {
        kind: "previous",
        handoff: "host",
        repeat: false,
      },
      {
        kind: "pause",
        handoff: "host",
        repeat: false,
      },
      {
        kind: "menu",
        handoff: "host",
        repeat: false,
        payload: { surface: "inventory" },
      },
    ]);
  });

  it("keeps intents JSON-serializable", () => {
    const intent = normalizeHostInputIntent({
      kind: "navigate",
      direction: "right",
      scopeId: "hud",
      focusId: "objective",
      payload: {
        sequence: 4,
        source: "host-binding-map",
      },
    });

    expect(JSON.parse(JSON.stringify(intent))).toEqual(intent);
  });

  it("rejects native event-like objects and callback payloads", () => {
    class NativeInputEvent {
      kind = "confirm";
    }

    expect(() => normalizeHostInputIntent(new NativeInputEvent() as never)).toThrow(
      /plain object/,
    );

    expect(() =>
      normalizeHostInputIntent({
        kind: "confirm",
        payload: {
          event: {
            preventDefault: () => undefined,
          },
        },
      } as never),
    ).toThrow(/payload\.event\.preventDefault must be a JsonValue/);
  });

  it("validates direction, unsupported kinds, and empty references", () => {
    expect(() => normalizeHostInputIntent({ kind: "navigate" })).toThrow(/direction/);

    expect(() =>
      normalizeHostInputIntent({ kind: "confirm", direction: "up" as never }),
    ).toThrow(/direction is only valid/);

    expect(() => normalizeHostInputIntent({ kind: "submit" as never })).toThrow(/kind/);

    expect(() => normalizeHostInputIntent({ kind: "cancel", scopeId: " " })).toThrow(/scopeId/);
  });
});
