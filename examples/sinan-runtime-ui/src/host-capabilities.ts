import {
  normalizeTextInputOverlayCapability,
  normalizeUiDiagnostic,
  type TextInputOverlayCapability,
  type TextInputOverlayCapabilityStatus,
  type TextInputOverlayLifecycleReason,
  type UiDiagnostic,
} from "@ludoweave/core";

import {
  runtimeUIViewModelEnvelopeCapabilities,
  type RuntimeUIViewModelEnvelopeCapability,
} from "./envelope.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";

export type RuntimeUIHostCapabilityStatus = TextInputOverlayCapabilityStatus;

export type RuntimeUIHostCapabilityId =
  | RuntimeUIViewModelEnvelopeCapability
  | "viewport"
  | "safe-area"
  | "device-pixel-ratio"
  | "text-measurement";

export interface RuntimeUIHostCapability {
  readonly id: RuntimeUIHostCapabilityId;
  readonly status: RuntimeUIHostCapabilityStatus;
  readonly reason?: TextInputOverlayLifecycleReason;
  readonly diagnosticPath?: readonly string[];
  readonly message?: string;
}

export interface RuntimeUITextInputOverlayHostCapability extends TextInputOverlayCapability {
  readonly id: "overlay.text-input";
}

export interface RuntimeUIHostViewportSnapshot {
  readonly id: "viewport";
  readonly status: Extract<RuntimeUIHostCapabilityStatus, "available">;
  readonly width: number;
  readonly height: number;
  readonly safeArea: RuntimeUIHostSafeAreaSnapshot;
  readonly devicePixelRatio: RuntimeUIHostDevicePixelRatioSnapshot;
}

export interface RuntimeUIHostSafeAreaSnapshot {
  readonly id: "safe-area";
  readonly status: Extract<RuntimeUIHostCapabilityStatus, "available">;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface RuntimeUIHostDevicePixelRatioSnapshot {
  readonly id: "device-pixel-ratio";
  readonly status: Extract<RuntimeUIHostCapabilityStatus, "available">;
  readonly value: number;
}

export interface RuntimeUITextMeasurementSnapshot {
  readonly id: "text-measurement";
  readonly status: Extract<RuntimeUIHostCapabilityStatus, "available">;
  readonly source: "fixture";
  readonly unit: "css-px";
}

export interface RuntimeUIHostCapabilitySnapshot {
  readonly snapshotId: string;
  readonly frameId: string;
  readonly contractCapabilities: readonly RuntimeUIViewModelEnvelopeCapability[];
  readonly renderers: {
    readonly dom: RuntimeUIHostCapability;
    readonly canvas2dTrace: RuntimeUIHostCapability;
    readonly fallback: RuntimeUIHostCapability;
  };
  readonly textInputOverlay: RuntimeUITextInputOverlayHostCapability;
  readonly actionRegistry: RuntimeUIHostCapability;
  readonly validationHook: RuntimeUIHostCapability;
  readonly viewport: RuntimeUIHostViewportSnapshot;
  readonly textMeasurement: RuntimeUITextMeasurementSnapshot;
}

export const hostCapabilityDiagnosticCodes = Object.freeze({
  textInputOverlayUnavailable: "LW_EXAMPLE_HOST_CAPABILITY_TEXT_INPUT_OVERLAY_UNAVAILABLE",
});

export function createGateDemoHostCapabilitySnapshot(
  options: {
    readonly textInputOverlay?: TextInputOverlayCapability;
  } = {},
): RuntimeUIHostCapabilitySnapshot {
  const textInputOverlay = createTextInputOverlayCapability(
    options.textInputOverlay ?? {
      status: "available",
      reason: "open",
      diagnosticPath: ["host", "text-input-overlay"],
      message: "Host text input overlay support is available.",
    },
  );

  return {
    snapshotId: "host-capabilities.gate-demo",
    frameId: gateDemoRuntimeUIViewModelEnvelope.frameId,
    contractCapabilities: runtimeUIViewModelEnvelopeCapabilities,
    renderers: {
      dom: createCapability({
        id: "renderer.dom",
        status: "available",
        message: "DOM renderer can render Gate Demo runtime UI states.",
      }),
      canvas2dTrace: createCapability({
        id: "renderer.canvas2d.trace",
        status: "available",
        message: "Canvas2D trace path can inspect action targets and overlay coordination.",
      }),
      fallback: createCapability({
        id: "renderer.fallback",
        status: "available",
        message: "Sinan-owned fallback renderer route is available.",
      }),
    },
    textInputOverlay,
    actionRegistry: createCapability({
      id: "action-registry",
      status: "available",
      message: "Host ActionRef registry mock is available for deterministic routing.",
    }),
    validationHook: createCapability({
      id: "validation-hook",
      status: "available",
      message: "Gate Demo validation hook can report layer-specific PASS/FAIL results.",
    }),
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
  };
}

export function createHostCapabilitySnapshotDiagnostics(
  snapshot: RuntimeUIHostCapabilitySnapshot,
): readonly UiDiagnostic[] {
  if (snapshot.textInputOverlay.status === "available") {
    return [];
  }

  return [
    normalizeUiDiagnostic({
      code: hostCapabilityDiagnosticCodes.textInputOverlayUnavailable,
      severity: "warning",
      message:
        snapshot.textInputOverlay.message ??
        "Host text input overlay capability is not available for this snapshot.",
      path: snapshot.textInputOverlay.diagnosticPath ?? ["host", "text-input-overlay"],
      details: {
        capabilityId: snapshot.textInputOverlay.id,
        capabilityStatus: snapshot.textInputOverlay.status,
        lifecycleReason: snapshot.textInputOverlay.reason ?? null,
      },
    }),
  ];
}

function createCapability(input: RuntimeUIHostCapability): RuntimeUIHostCapability {
  return input;
}

function createTextInputOverlayCapability(
  input: TextInputOverlayCapability,
): RuntimeUITextInputOverlayHostCapability {
  return {
    id: "overlay.text-input",
    ...normalizeTextInputOverlayCapability(input),
  };
}
