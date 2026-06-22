import { describe, expect, it } from "vitest";

import {
  createTextInputOverlayBridgeFixture,
  textInputOverlayFixtureDiagnosticCodes,
} from "../src/text-input-overlay-fixture.js";

describe("text input overlay bridge fixture", () => {
  it("records open, update, focus, snapshot, and close lifecycle events", () => {
    const fixture = createTextInputOverlayBridgeFixture();

    expect(fixture.name).toBe("text-input-overlay-bridge");
    expect(fixture.lifecycle.capability.status).toBe("available");
    expect(fixture.lifecycle.events.map((event) => event.kind)).toEqual([
      "open",
      "update",
      "focus",
      "snapshot",
      "close",
    ]);
    expect(fixture.lifecycle.initialRequest).toMatchObject({
      overlayId: "overlay.pause-player-name",
      nodeId: "runtime.overlay/key:pause.player-name",
      ariaLabel: "Player name",
      themeToken: "runtime-ui.dialog.controls",
      commitAction: {
        type: "runtime.input.commit",
        payload: { field: "player-name" },
      },
      cancelAction: {
        type: "runtime.input.cancel",
        payload: { field: "player-name" },
      },
    });
    expect(fixture.lifecycle.updatedRequest.box).toEqual({
      x: 436,
      y: 306,
      width: 408,
      height: 48,
    });
    expect(fixture.lifecycle.snapshot).toEqual({
      overlayId: "overlay.pause-player-name",
      nodeId: "runtime.overlay/key:pause.player-name",
      value: "Ada",
      selection: { start: 3, end: 3, direction: "none" },
      isComposing: false,
    });
  });

  it("keeps fixture data JSON serializable", () => {
    const fixture = createTextInputOverlayBridgeFixture();

    expect(JSON.parse(JSON.stringify(fixture))).toEqual(fixture);
  });

  it("covers missing capability, stale node, removed node, and disabled editable states", () => {
    const fixture = createTextInputOverlayBridgeFixture();

    expect(fixture.failures.map((failure) => failure.scenario)).toEqual([
      "missing-capability",
      "stale-node",
      "removed-node",
      "disabled-editable",
    ]);
    expect(fixture.failures.map((failure) => failure.capability.status)).toEqual([
      "missing",
      "available",
      "available",
      "disabled",
    ]);
    expect(fixture.failures.map((failure) => failure.diagnostics[0]?.code)).toEqual([
      textInputOverlayFixtureDiagnosticCodes.missingCapability,
      textInputOverlayFixtureDiagnosticCodes.staleNode,
      textInputOverlayFixtureDiagnosticCodes.removedNode,
      textInputOverlayFixtureDiagnosticCodes.disabledEditable,
    ]);
  });

  it("connects diagnostics to host capability status and lifecycle reason", () => {
    const fixture = createTextInputOverlayBridgeFixture();
    const removedNode = fixture.failures.find((failure) => failure.scenario === "removed-node");

    expect(removedNode?.events).toEqual([
      {
        kind: "close",
        overlayId: "overlay.pause-player-name",
        nodeId: "runtime.overlay/key:pause.player-name",
        reason: "node-removed",
        snapshot: fixture.lifecycle.snapshot,
      },
    ]);
    expect(removedNode?.diagnostics[0]).toMatchObject({
      code: textInputOverlayFixtureDiagnosticCodes.removedNode,
      severity: "warning",
      path: ["text-input-overlay", "removed-node"],
      details: {
        scenario: "removed-node",
        overlayId: "overlay.pause-player-name",
        nodeId: "runtime.overlay/key:pause.player-name",
        capabilityStatus: "available",
        lifecycleReason: "node-removed",
      },
    });
  });

  it("does not add a dispatch event to the renderer-facing lifecycle", () => {
    const fixture = createTextInputOverlayBridgeFixture();
    const eventKinds = [
      ...fixture.lifecycle.events.map((event) => event.kind),
      ...fixture.failures.flatMap((failure) => failure.events.map((event) => event.kind)),
    ];

    expect(eventKinds).not.toContain("dispatch");
  });
});
