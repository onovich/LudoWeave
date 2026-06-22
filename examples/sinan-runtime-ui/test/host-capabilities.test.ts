import { describe, expect, it } from "vitest";

import {
  createGateDemoHostCapabilitySnapshot,
  createHostCapabilitySnapshotDiagnostics,
  gateDemoRuntimeUIViewModelEnvelope,
  hostCapabilityDiagnosticCodes,
} from "../src/index.js";

describe("Sinan-like host capability snapshot", () => {
  it("covers the Gate Demo renderer, overlay, registry, hook, viewport, DPR, and measurement capabilities", () => {
    const snapshot = createGateDemoHostCapabilitySnapshot();

    expect(snapshot).toMatchObject({
      snapshotId: "host-capabilities.gate-demo",
      frameId: gateDemoRuntimeUIViewModelEnvelope.frameId,
      contractCapabilities: [
        "renderer.dom",
        "renderer.canvas2d.trace",
        "renderer.fallback",
        "overlay.text-input",
        "action-registry",
        "validation-hook",
      ],
      renderers: {
        dom: {
          id: "renderer.dom",
          status: "available",
        },
        canvas2dTrace: {
          id: "renderer.canvas2d.trace",
          status: "available",
        },
        fallback: {
          id: "renderer.fallback",
          status: "available",
        },
      },
      textInputOverlay: {
        id: "overlay.text-input",
        status: "available",
        reason: "open",
        diagnosticPath: ["host", "text-input-overlay"],
      },
      actionRegistry: {
        id: "action-registry",
        status: "available",
      },
      validationHook: {
        id: "validation-hook",
        status: "available",
      },
      viewport: {
        id: "viewport",
        status: "available",
        width: 1280,
        height: 720,
        safeArea: {
          id: "safe-area",
          status: "available",
          top: 0,
          right: 0,
          bottom: 24,
          left: 0,
        },
        devicePixelRatio: {
          id: "device-pixel-ratio",
          status: "available",
          value: 1,
        },
      },
      textMeasurement: {
        id: "text-measurement",
        status: "available",
        source: "fixture",
        unit: "css-px",
      },
    });
  });

  it("keeps the default capability snapshot JSON serializable", () => {
    const snapshot = createGateDemoHostCapabilitySnapshot();

    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it("does not emit diagnostics when text input overlays are available", () => {
    expect(createHostCapabilitySnapshotDiagnostics(createGateDemoHostCapabilitySnapshot())).toEqual(
      [],
    );
  });

  it("aligns missing text input overlay status with host bridge diagnostics", () => {
    const snapshot = createGateDemoHostCapabilitySnapshot({
      textInputOverlay: {
        status: "missing",
        reason: "capability-missing",
        diagnosticPath: ["host", "text-input-overlay"],
        message: "Host did not provide editable text overlay support.",
      },
    });

    expect(createHostCapabilitySnapshotDiagnostics(snapshot)).toEqual([
      {
        code: hostCapabilityDiagnosticCodes.textInputOverlayUnavailable,
        severity: "warning",
        message: "Host did not provide editable text overlay support.",
        path: ["host", "text-input-overlay"],
        details: {
          capabilityId: "overlay.text-input",
          capabilityStatus: "missing",
          lifecycleReason: "capability-missing",
        },
      },
    ]);
  });
});
