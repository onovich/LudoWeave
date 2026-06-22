import {
  normalizeTextInputOverlayCapability,
  normalizeTextInputOverlayRequest,
  normalizeTextInputOverlaySnapshot,
  normalizeUiDiagnostic,
  type ActionRef,
  type TextInputOverlayCapability,
  type TextInputOverlayLifecycleReason,
  type TextInputOverlayRequest,
  type TextInputOverlaySnapshot,
  type UiDiagnostic,
} from "@ludoweave/core";

/**
 * Overlay bridge event recorded by the shared fixture.
 *
 * @public
 */
export type TextInputOverlayBridgeEvent =
  | {
      readonly kind: "open";
      readonly request: TextInputOverlayRequest;
    }
  | {
      readonly kind: "update";
      readonly request: TextInputOverlayRequest;
    }
  | {
      readonly kind: "focus";
      readonly overlayId: string;
      readonly nodeId: string;
      readonly reason: Extract<TextInputOverlayLifecycleReason, "focus">;
    }
  | {
      readonly kind: "snapshot";
      readonly snapshot: TextInputOverlaySnapshot;
      readonly reason: Extract<TextInputOverlayLifecycleReason, "snapshot">;
    }
  | {
      readonly kind: "close";
      readonly overlayId: string;
      readonly nodeId: string;
      readonly reason: Extract<
        TextInputOverlayLifecycleReason,
        "commit" | "cancel" | "blur" | "node-removed" | "route-change" | "host-dispose"
      >;
      readonly snapshot?: TextInputOverlaySnapshot;
      readonly action?: ActionRef;
    };

/**
 * Deterministic happy-path lifecycle fixture for text input overlays.
 *
 * @public
 */
export interface TextInputOverlayLifecycleFixture {
  readonly name: "text-input-overlay-lifecycle";
  readonly capability: TextInputOverlayCapability;
  readonly initialRequest: TextInputOverlayRequest;
  readonly updatedRequest: TextInputOverlayRequest;
  readonly snapshot: TextInputOverlaySnapshot;
  readonly events: readonly TextInputOverlayBridgeEvent[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Failure scenarios used to validate host bridge fallback boundaries.
 *
 * @public
 */
export type TextInputOverlayFailureScenario =
  | "missing-capability"
  | "stale-node"
  | "removed-node"
  | "disabled-editable";

/**
 * Deterministic failure fixture for one overlay bridge scenario.
 *
 * @public
 */
export interface TextInputOverlayFailureFixture {
  readonly scenario: TextInputOverlayFailureScenario;
  readonly capability: TextInputOverlayCapability;
  readonly request?: TextInputOverlayRequest;
  readonly events: readonly TextInputOverlayBridgeEvent[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Full fixture set shared by renderer and host bridge tests.
 *
 * @public
 */
export interface TextInputOverlayBridgeFixture {
  readonly name: "text-input-overlay-bridge";
  readonly lifecycle: TextInputOverlayLifecycleFixture;
  readonly failures: readonly TextInputOverlayFailureFixture[];
}

/**
 * Stable diagnostic codes emitted by the text input overlay bridge fixture.
 *
 * @public
 */
export const textInputOverlayFixtureDiagnosticCodes = Object.freeze({
  missingCapability: "LW_TESTING_TEXT_INPUT_OVERLAY_CAPABILITY_MISSING",
  staleNode: "LW_TESTING_TEXT_INPUT_OVERLAY_STALE_NODE",
  removedNode: "LW_TESTING_TEXT_INPUT_OVERLAY_REMOVED_NODE",
  disabledEditable: "LW_TESTING_TEXT_INPUT_OVERLAY_DISABLED_EDITABLE",
});

/**
 * Creates host bridge fixtures without touching DOM, Canvas, native input, or Sinan objects.
 *
 * @public
 */
export function createTextInputOverlayBridgeFixture(): TextInputOverlayBridgeFixture {
  const capability = normalizeTextInputOverlayCapability({
    status: "available",
    reason: "open",
    diagnosticPath: ["host", "text-input-overlay"],
    message: "Host text input overlay support is available.",
  });
  const initialRequest = createInitialRequest();
  const updatedRequest = createUpdatedRequest();
  const snapshot = normalizeTextInputOverlaySnapshot({
    overlayId: initialRequest.overlayId,
    nodeId: initialRequest.nodeId,
    value: "Ada",
    selection: { start: 3, end: 3, direction: "none" },
  });

  return {
    name: "text-input-overlay-bridge",
    lifecycle: {
      name: "text-input-overlay-lifecycle",
      capability,
      initialRequest,
      updatedRequest,
      snapshot,
      events: [
        { kind: "open", request: initialRequest },
        { kind: "update", request: updatedRequest },
        {
          kind: "focus",
          overlayId: initialRequest.overlayId,
          nodeId: initialRequest.nodeId,
          reason: "focus",
        },
        { kind: "snapshot", snapshot, reason: "snapshot" },
        {
          kind: "close",
          overlayId: initialRequest.overlayId,
          nodeId: initialRequest.nodeId,
          reason: "commit",
          snapshot,
          action: requireAction(initialRequest.commitAction, "initialRequest.commitAction"),
        },
      ],
      diagnostics: [],
    },
    failures: createFailureFixtures(initialRequest, updatedRequest, snapshot),
  };
}

function requireAction(action: ActionRef | undefined, path: string): ActionRef {
  if (action === undefined) {
    throw new TypeError(`${path} must be present in the text input overlay fixture.`);
  }

  return action;
}

function createInitialRequest(): TextInputOverlayRequest {
  return normalizeTextInputOverlayRequest({
    overlayId: "overlay.pause-player-name",
    nodeId: "runtime.overlay/key:pause.player-name",
    box: { x: 440, y: 314, width: 400, height: 48 },
    value: "",
    selection: { start: 0, end: 0, direction: "none" },
    placeholder: "Player name",
    inputMode: "text",
    multiline: false,
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
    diagnosticPath: ["frame", "nodes", "runtime.overlay/key:pause.player-name"],
  });
}

function createUpdatedRequest(): TextInputOverlayRequest {
  return normalizeTextInputOverlayRequest({
    overlayId: "overlay.pause-player-name",
    nodeId: "runtime.overlay/key:pause.player-name",
    box: { x: 436, y: 306, width: 408, height: 48 },
    value: "Ada",
    selection: { start: 3, end: 3, direction: "none" },
    placeholder: "Player name",
    inputMode: "text",
    multiline: false,
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
    diagnosticPath: ["frame", "nodes", "runtime.overlay/key:pause.player-name"],
  });
}

function createFailureFixtures(
  initialRequest: TextInputOverlayRequest,
  updatedRequest: TextInputOverlayRequest,
  snapshot: TextInputOverlaySnapshot,
): readonly TextInputOverlayFailureFixture[] {
  const missingCapability = normalizeTextInputOverlayCapability({
    status: "missing",
    reason: "capability-missing",
    diagnosticPath: ["host", "text-input-overlay"],
    message: "Host did not provide editable text overlay support.",
  });
  const staleNode = normalizeTextInputOverlayCapability({
    status: "available",
    reason: "update",
    diagnosticPath: ["frame", "nodes", initialRequest.nodeId],
    message: "Overlay request node was not present in the latest frame.",
  });
  const removedNode = normalizeTextInputOverlayCapability({
    status: "available",
    reason: "node-removed",
    diagnosticPath: ["frame", "nodes", initialRequest.nodeId],
    message: "Overlay owner node was removed; host should close the overlay.",
  });
  const disabledEditable = normalizeTextInputOverlayCapability({
    status: "disabled",
    reason: "capability-disabled",
    diagnosticPath: ["frame", "nodes", initialRequest.nodeId],
    message: "Editable node is disabled in the resolved frame.",
  });

  return [
    {
      scenario: "missing-capability",
      capability: missingCapability,
      request: initialRequest,
      events: [],
      diagnostics: [
        createFailureDiagnostic({
          code: textInputOverlayFixtureDiagnosticCodes.missingCapability,
          scenario: "missing-capability",
          capability: missingCapability,
          request: initialRequest,
          message: "Host bridge cannot open an editable text overlay without capability support.",
        }),
      ],
    },
    {
      scenario: "stale-node",
      capability: staleNode,
      request: updatedRequest,
      events: [{ kind: "update", request: updatedRequest }],
      diagnostics: [
        createFailureDiagnostic({
          code: textInputOverlayFixtureDiagnosticCodes.staleNode,
          scenario: "stale-node",
          capability: staleNode,
          request: updatedRequest,
          message: "Host bridge ignored an overlay update for a stale node id.",
        }),
      ],
    },
    {
      scenario: "removed-node",
      capability: removedNode,
      request: updatedRequest,
      events: [
        {
          kind: "close",
          overlayId: updatedRequest.overlayId,
          nodeId: updatedRequest.nodeId,
          reason: "node-removed",
          snapshot,
        },
      ],
      diagnostics: [
        createFailureDiagnostic({
          code: textInputOverlayFixtureDiagnosticCodes.removedNode,
          scenario: "removed-node",
          capability: removedNode,
          request: updatedRequest,
          message: "Host bridge closed the overlay because the owner node was removed.",
        }),
      ],
    },
    {
      scenario: "disabled-editable",
      capability: disabledEditable,
      events: [],
      diagnostics: [
        createFailureDiagnostic({
          code: textInputOverlayFixtureDiagnosticCodes.disabledEditable,
          scenario: "disabled-editable",
          capability: disabledEditable,
          request: initialRequest,
          message: "Host bridge did not open an overlay for a disabled editable target.",
        }),
      ],
    },
  ];
}

function createFailureDiagnostic(options: {
  readonly code: string;
  readonly scenario: TextInputOverlayFailureScenario;
  readonly capability: TextInputOverlayCapability;
  readonly request: TextInputOverlayRequest;
  readonly message: string;
}): UiDiagnostic {
  return normalizeUiDiagnostic({
    code: options.code,
    severity: "warning",
    message: options.message,
    path: ["text-input-overlay", options.scenario],
    details: {
      scenario: options.scenario,
      overlayId: options.request.overlayId,
      nodeId: options.request.nodeId,
      capabilityStatus: options.capability.status,
      lifecycleReason: options.capability.reason ?? null,
    },
  });
}
