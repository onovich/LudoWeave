import { describe, expect, it } from "vitest";

import {
  normalizeTextInputOverlayCapability,
  normalizeTextInputOverlayRequest,
  normalizeTextInputOverlaySnapshot,
} from "../src/text-input-overlay.js";

describe("text input overlay host bridge draft", () => {
  it("normalizes a serializable editable text overlay request", () => {
    const request = normalizeTextInputOverlayRequest({
      overlayId: " overlay.pause-code ",
      nodeId: " node.pause-code ",
      box: { x: 24, y: 48, width: 320, height: 44 },
      value: "A-17",
      selection: { start: 1, end: 4, direction: "forward" },
      placeholder: "Access code",
      inputMode: "search",
      multiline: false,
      ariaLabel: "Access code",
      themeToken: "runtime-ui.dialog.controls",
      commitAction: { type: "runtime.input.commit", payload: { field: "access-code" } },
      cancelAction: "runtime.input.cancel",
      diagnosticPath: ["frame", "nodes", "pause-code"],
    });

    expect(request).toEqual({
      overlayId: "overlay.pause-code",
      nodeId: "node.pause-code",
      box: { x: 24, y: 48, width: 320, height: 44 },
      value: "A-17",
      selection: { start: 1, end: 4, direction: "forward" },
      placeholder: "Access code",
      inputMode: "search",
      multiline: false,
      ariaLabel: "Access code",
      themeToken: "runtime-ui.dialog.controls",
      commitAction: { type: "runtime.input.commit", payload: { field: "access-code" } },
      cancelAction: { type: "runtime.input.cancel" },
      diagnosticPath: ["frame", "nodes", "pause-code"],
    });
    expect(JSON.parse(JSON.stringify(request))).toEqual(request);
  });

  it("normalizes snapshots without owning IME composition", () => {
    expect(
      normalizeTextInputOverlaySnapshot({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        value: "ni",
        selection: { start: 2, end: 2 },
        isComposing: true,
        compositionText: "ni",
      }),
    ).toEqual({
      overlayId: "overlay.chat",
      nodeId: "node.chat",
      value: "ni",
      selection: { start: 2, end: 2 },
      isComposing: true,
      compositionText: "ni",
    });
  });

  it("defaults snapshot composition state to false", () => {
    expect(
      normalizeTextInputOverlaySnapshot({
        overlayId: "overlay.chat",
        value: "",
      }),
    ).toEqual({
      overlayId: "overlay.chat",
      value: "",
      isComposing: false,
    });
  });

  it("normalizes host capability status for missing overlay support", () => {
    expect(
      normalizeTextInputOverlayCapability({
        status: "missing",
        reason: "capability-missing",
        diagnosticPath: ["renderer-canvas2d", "input-overlay"],
        message: "Host did not provide editable text overlay support.",
      }),
    ).toEqual({
      status: "missing",
      reason: "capability-missing",
      diagnosticPath: ["renderer-canvas2d", "input-overlay"],
      message: "Host did not provide editable text overlay support.",
    });
  });

  it("rejects DOM-like or platform objects at the request boundary", () => {
    class PlatformRect {
      x = 0;
      y = 0;
      width = 100;
      height = 20;
    }

    expect(() =>
      normalizeTextInputOverlayRequest({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        box: new PlatformRect(),
        value: "",
        multiline: false,
        ariaLabel: "Chat",
      }),
    ).toThrow(/box must be a plain object/);
  });

  it("rejects callback payloads on commit and cancel ActionRefs", () => {
    expect(() =>
      normalizeTextInputOverlayRequest({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        box: { x: 0, y: 0, width: 240, height: 32 },
        value: "",
        multiline: false,
        ariaLabel: "Chat",
        commitAction: {
          type: "runtime.input.commit",
          payload: { onCommit: () => undefined },
        },
      } as never),
    ).toThrow(/payload\.onCommit must be a JsonValue/);
  });

  it("rejects invalid selection, mode, capability status, and labels", () => {
    expect(() =>
      normalizeTextInputOverlayRequest({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        box: { x: 0, y: 0, width: 240, height: 32 },
        value: "",
        selection: { start: 4, end: 2 },
        multiline: false,
        ariaLabel: "Chat",
      }),
    ).toThrow(/selection\.end must be greater than or equal to selection\.start/);

    expect(() =>
      normalizeTextInputOverlayRequest({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        box: { x: 0, y: 0, width: 240, height: 32 },
        value: "",
        inputMode: "password" as never,
        multiline: false,
        ariaLabel: "Chat",
      }),
    ).toThrow(/inputMode must be a supported text input overlay input mode/);

    expect(() =>
      normalizeTextInputOverlayCapability({
        status: "ready" as never,
      }),
    ).toThrow(/status must be available, missing, disabled, or unsupported-renderer/);

    expect(() =>
      normalizeTextInputOverlayRequest({
        overlayId: "overlay.chat",
        nodeId: "node.chat",
        box: { x: 0, y: 0, width: 240, height: 32 },
        value: "",
        multiline: false,
        ariaLabel: "   ",
      }),
    ).toThrow(/ariaLabel must not be empty/);
  });
});
