import {
  normalizeUiDiagnostic,
  type ResolvedNode,
  type ResolvedUiFrame,
  type UiDiagnostic,
} from "@ludoweave/core";
import { createHeadlessRenderer } from "@ludoweave/renderer-headless";

import {
  createSinanUIActionRefRegistryMock,
  type CreateSinanUIActionRefRegistryMockOptions,
  type SinanUIActionRefRegistryMock,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import {
  createGateDemoHostCapabilitySnapshot,
  type RuntimeUIHostCapabilitySnapshot,
} from "./host-capabilities.js";
import {
  mapRuntimeUIViewModelEnvelopeToResolvedFrame,
  runtimeUIAdapterDiagnosticCodes,
  type RuntimeUIResolvedFrameMappingResult,
} from "./resolved-frame-adapter.js";

export const gateDemoValidationHookVersion = "ludoweave.sinan-gate-demo.validation.v0.4";

export type GateDemoValidationLayer =
  | "mapping"
  | "renderer"
  | "host-capability"
  | "action-registry"
  | "overlay-coordination";

export type GateDemoValidationStatus = "PASS" | "FAIL";

export interface GateDemoValidationLayerResult {
  readonly layer: GateDemoValidationLayer;
  readonly status: GateDemoValidationStatus;
  readonly summary: string;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface GateDemoValidationHookResult {
  readonly version: typeof gateDemoValidationHookVersion;
  readonly status: GateDemoValidationStatus;
  readonly frameId?: string;
  readonly layers: readonly GateDemoValidationLayerResult[];
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface RunGateDemoValidationHookOptions {
  readonly envelope?: unknown;
  readonly hostCapabilities?: RuntimeUIHostCapabilitySnapshot;
  readonly registry?: SinanUIActionRefRegistryMock;
  readonly registryOptions?: CreateSinanUIActionRefRegistryMockOptions;
}

export const gateDemoValidationDiagnosticCodes = Object.freeze({
  rendererUnavailable: "LW_EXAMPLE_VALIDATION_RENDERER_UNAVAILABLE",
  rendererSnapshot: "LW_EXAMPLE_VALIDATION_RENDERER_SNAPSHOT",
  hostCapabilityUnavailable: "LW_EXAMPLE_VALIDATION_HOST_CAPABILITY_UNAVAILABLE",
  actionRegistryRoute: "LW_EXAMPLE_VALIDATION_ACTION_REGISTRY_ROUTE",
  overlayCandidateMissing: "LW_EXAMPLE_VALIDATION_OVERLAY_CANDIDATE_MISSING",
  overlayFallbackMissing: "LW_EXAMPLE_VALIDATION_OVERLAY_FALLBACK_MISSING",
});

const mappingDiagnosticCodes = new Set<string>([
  runtimeUIAdapterDiagnosticCodes.version,
  runtimeUIAdapterDiagnosticCodes.schema,
  runtimeUIAdapterDiagnosticCodes.unsupportedElement,
]);

export function runGateDemoValidationHook(
  options: RunGateDemoValidationHookOptions = {},
): GateDemoValidationHookResult {
  const hostCapabilities = options.hostCapabilities ?? createGateDemoHostCapabilitySnapshot();
  const mapping = mapRuntimeUIViewModelEnvelopeToResolvedFrame(
    options.envelope ?? gateDemoRuntimeUIViewModelEnvelope,
    { hostCapabilities },
  );
  const registry =
    options.registry ?? createSinanUIActionRefRegistryMock(options.registryOptions ?? {});
  const layers = [
    createMappingLayer(mapping),
    createRendererLayer(mapping.frame),
    createHostCapabilityLayer(hostCapabilities),
    createActionRegistryLayer(mapping, registry),
    createOverlayCoordinationLayer(mapping.frame, hostCapabilities),
  ];
  const diagnostics = layers.flatMap((layer) => layer.diagnostics);

  return {
    version: gateDemoValidationHookVersion,
    status: layers.every((layer) => layer.status === "PASS") ? "PASS" : "FAIL",
    ...(mapping.envelopeFrameId === undefined ? {} : { frameId: mapping.envelopeFrameId }),
    layers,
    diagnostics,
  };
}

function createMappingLayer(
  mapping: RuntimeUIResolvedFrameMappingResult,
): GateDemoValidationLayerResult {
  const diagnostics = mapping.diagnostics.filter((diagnostic) =>
    mappingDiagnosticCodes.has(diagnostic.code),
  );

  return {
    layer: "mapping",
    status: mapping.ok ? "PASS" : "FAIL",
    summary: mapping.ok
      ? "Envelope mapped to UiNodes and ResolvedUiFrame."
      : "Envelope mapping failed before renderer validation.",
    diagnostics,
  };
}

function createRendererLayer(frame: ResolvedUiFrame | undefined): GateDemoValidationLayerResult {
  if (frame === undefined) {
    return {
      layer: "renderer",
      status: "FAIL",
      summary: "Renderer skipped because mapping did not produce a frame.",
      diagnostics: [
        normalizeUiDiagnostic({
          code: gateDemoValidationDiagnosticCodes.rendererUnavailable,
          severity: "error",
          message: "Renderer validation requires a ResolvedUiFrame.",
          path: ["validation-hook", "renderer"],
        }),
      ],
    };
  }

  const renderer = createHeadlessRenderer({ id: "gate-demo-validation-hook" });
  const snapshot = renderer.render(frame).snapshot;
  const missingText = ["Press E", "Deliver the cell", "Paused", "Gate access code"].filter(
    (text) => !snapshot.includes(text),
  );

  if (missingText.length === 0) {
    return {
      layer: "renderer",
      status: "PASS",
      summary: "Headless renderer snapshot contains Gate Demo runtime UI states.",
      diagnostics: [],
    };
  }

  return {
    layer: "renderer",
    status: "FAIL",
    summary: "Headless renderer snapshot missed required Gate Demo text.",
    diagnostics: [
      normalizeUiDiagnostic({
        code: gateDemoValidationDiagnosticCodes.rendererSnapshot,
        severity: "error",
        message: "Headless renderer snapshot missed required Gate Demo text.",
        path: ["validation-hook", "renderer", "snapshot"],
        details: {
          missingText,
        },
      }),
    ],
  };
}

function createHostCapabilityLayer(
  hostCapabilities: RuntimeUIHostCapabilitySnapshot,
): GateDemoValidationLayerResult {
  const unavailable = [
    hostCapabilities.renderers.dom,
    hostCapabilities.renderers.canvas2dTrace,
    hostCapabilities.renderers.fallback,
    hostCapabilities.textInputOverlay,
    hostCapabilities.actionRegistry,
    hostCapabilities.validationHook,
    hostCapabilities.viewport,
    hostCapabilities.viewport.safeArea,
    hostCapabilities.viewport.devicePixelRatio,
    hostCapabilities.textMeasurement,
  ].filter((capability) => capability.status !== "available");

  if (unavailable.length === 0) {
    return {
      layer: "host-capability",
      status: "PASS",
      summary: "Host capability snapshot exposes all Gate Demo validation capabilities.",
      diagnostics: [],
    };
  }

  return {
    layer: "host-capability",
    status: "FAIL",
    summary: "Host capability snapshot is missing required Gate Demo capabilities.",
    diagnostics: unavailable.map((capability) =>
      normalizeUiDiagnostic({
        code: gateDemoValidationDiagnosticCodes.hostCapabilityUnavailable,
        severity: "error",
        message: `Host capability "${capability.id}" is ${capability.status}.`,
        path: ["validation-hook", "host-capability", capability.id],
        details: {
          capabilityId: capability.id,
          capabilityStatus: capability.status,
        },
      }),
    ),
  };
}

function createActionRegistryLayer(
  mapping: RuntimeUIResolvedFrameMappingResult,
  registry: SinanUIActionRefRegistryMock,
): GateDemoValidationLayerResult {
  if (mapping.frame === undefined) {
    return {
      layer: "action-registry",
      status: "FAIL",
      summary: "Action registry skipped because mapping did not produce a frame.",
      diagnostics: [
        normalizeUiDiagnostic({
          code: gateDemoValidationDiagnosticCodes.actionRegistryRoute,
          severity: "error",
          message: "Action registry validation requires a ResolvedUiFrame.",
          path: ["validation-hook", "action-registry"],
        }),
      ],
    };
  }

  const routed = mapping.frame.actions.map((actionTarget) =>
    registry.route(
      actionTarget.action,
      createRegistrySource(mapping.envelopeFrameId, actionTarget),
    ),
  );
  const failedRoutes = routed.filter(
    (entry) => entry.routingResult !== "accepted" && entry.routingResult !== "no-op",
  );

  if (failedRoutes.length === 0) {
    return {
      layer: "action-registry",
      status: "PASS",
      summary: "Action registry mock accepted Gate Demo ActionRefs.",
      diagnostics: [],
    };
  }

  return {
    layer: "action-registry",
    status: "FAIL",
    summary: "Action registry mock rejected one or more Gate Demo ActionRefs.",
    diagnostics: failedRoutes.flatMap((entry) => entry.diagnostics),
  };
}

function createOverlayCoordinationLayer(
  frame: ResolvedUiFrame | undefined,
  hostCapabilities: RuntimeUIHostCapabilitySnapshot,
): GateDemoValidationLayerResult {
  const editable = frame?.nodes.find((node) => node.type === "editable-text");

  if (editable === undefined) {
    return {
      layer: "overlay-coordination",
      status: "FAIL",
      summary: "No editable overlay candidate was present in the frame.",
      diagnostics: [
        normalizeUiDiagnostic({
          code: gateDemoValidationDiagnosticCodes.overlayCandidateMissing,
          severity: "error",
          message: "Gate Demo frame must expose one editable overlay candidate.",
          path: ["validation-hook", "overlay-coordination"],
        }),
      ],
    };
  }

  if (
    hostCapabilities.textInputOverlay.status !== "available" &&
    !hasSerializableAction(editable, "fallbackAction")
  ) {
    return {
      layer: "overlay-coordination",
      status: "FAIL",
      summary: "Editable overlay candidate lacks a fallback route for missing host capability.",
      diagnostics: [
        normalizeUiDiagnostic({
          code: gateDemoValidationDiagnosticCodes.overlayFallbackMissing,
          severity: "error",
          message:
            "Editable overlay candidate must provide fallbackAction when overlay is missing.",
          path: ["validation-hook", "overlay-coordination", editable.id],
          details: {
            nodeId: editable.id,
            capabilityStatus: hostCapabilities.textInputOverlay.status,
          },
        }),
      ],
    };
  }

  return {
    layer: "overlay-coordination",
    status: "PASS",
    summary:
      hostCapabilities.textInputOverlay.status === "available"
        ? "Editable overlay candidate can use host text input overlay support."
        : "Editable overlay candidate provides a fallback route for missing overlay support.",
    diagnostics: [],
  };
}

function hasSerializableAction(node: ResolvedNode, propName: string): boolean {
  const candidate = node.props?.[propName];
  return isRecord(candidate) && typeof candidate.type === "string";
}

function createRegistrySource(
  frameId: string | undefined,
  actionTarget: ResolvedUiFrame["actions"][number],
) {
  return {
    ...(frameId === undefined ? {} : { frameId }),
    actionTargetId: actionTarget.id,
    nodeId: actionTarget.nodeId,
    ...(actionTarget.label === undefined ? {} : { label: actionTarget.label }),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
