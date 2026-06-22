import { normalizeUiDiagnostic, type UiDiagnostic } from "@ludoweave/core";

import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import {
  renderRuntimeUIViewModelFallback,
  type FallbackRuntimeUISnapshot,
} from "./fallback-renderer.js";
import {
  createGateDemoHostCapabilitySnapshot,
  type RuntimeUIHostCapabilitySnapshot,
} from "./host-capabilities.js";

export const gateDemoFallbackPolicyVersion = "ludoweave.sinan-gate-demo.fallback.v0.4";

export type GateDemoRequestedRenderer = "dom" | "canvas2d" | "fallback" | "pixi" | "webgpu";
export type GateDemoFallbackOwner = "ludoweave" | "sinan";
export type GateDemoFallbackRoute = "ludoweave-renderer" | "sinan-fallback-renderer";
export type GateDemoFallbackReason =
  | "none"
  | "missing-capability"
  | "unsupported-renderer"
  | "requested-fallback";

export interface ResolveGateDemoFallbackPolicyOptions {
  readonly requestedRenderer?: GateDemoRequestedRenderer;
  readonly hostCapabilities?: RuntimeUIHostCapabilitySnapshot;
}

export interface GateDemoFallbackPolicyResult {
  readonly version: typeof gateDemoFallbackPolicyVersion;
  readonly status: "PASS" | "FAIL";
  readonly owner: GateDemoFallbackOwner;
  readonly route: GateDemoFallbackRoute;
  readonly reason: GateDemoFallbackReason;
  readonly requestedRenderer: GateDemoRequestedRenderer;
  readonly snapshot?: FallbackRuntimeUISnapshot;
  readonly diagnostics: readonly UiDiagnostic[];
}

export const gateDemoFallbackPolicyDiagnosticCodes = Object.freeze({
  selected: "LW_EXAMPLE_FALLBACK_POLICY_SELECTED",
  unavailable: "LW_EXAMPLE_FALLBACK_POLICY_UNAVAILABLE",
});

export function resolveGateDemoFallbackPolicy(
  options: ResolveGateDemoFallbackPolicyOptions = {},
): GateDemoFallbackPolicyResult {
  const requestedRenderer = options.requestedRenderer ?? "dom";
  const hostCapabilities = options.hostCapabilities ?? createGateDemoHostCapabilitySnapshot();
  const reason = resolveFallbackReason(requestedRenderer, hostCapabilities);

  if (reason === "none") {
    return {
      version: gateDemoFallbackPolicyVersion,
      status: "PASS",
      owner: "ludoweave",
      route: "ludoweave-renderer",
      reason,
      requestedRenderer,
      diagnostics: [],
    };
  }

  if (hostCapabilities.renderers.fallback.status !== "available") {
    return {
      version: gateDemoFallbackPolicyVersion,
      status: "FAIL",
      owner: "sinan",
      route: "sinan-fallback-renderer",
      reason,
      requestedRenderer,
      diagnostics: [
        normalizeUiDiagnostic({
          code: gateDemoFallbackPolicyDiagnosticCodes.unavailable,
          severity: "error",
          message: "Sinan-owned fallback renderer route is unavailable.",
          path: ["fallback-policy", reason],
          details: {
            requestedRenderer,
            reason,
            fallbackStatus: hostCapabilities.renderers.fallback.status,
          },
        }),
      ],
    };
  }

  return {
    version: gateDemoFallbackPolicyVersion,
    status: "PASS",
    owner: "sinan",
    route: "sinan-fallback-renderer",
    reason,
    requestedRenderer,
    snapshot: renderRuntimeUIViewModelFallback(gateDemoRuntimeUIViewModelEnvelope.viewModel),
    diagnostics: [
      normalizeUiDiagnostic({
        code: gateDemoFallbackPolicyDiagnosticCodes.selected,
        severity: "info",
        message: "Sinan-owned fallback renderer route selected for Gate Demo.",
        path: ["fallback-policy", reason],
        details: {
          requestedRenderer,
          reason,
        },
      }),
    ],
  };
}

function resolveFallbackReason(
  requestedRenderer: GateDemoRequestedRenderer,
  hostCapabilities: RuntimeUIHostCapabilitySnapshot,
): GateDemoFallbackReason {
  if (requestedRenderer === "fallback") {
    return "requested-fallback";
  }

  if (requestedRenderer === "pixi" || requestedRenderer === "webgpu") {
    return "unsupported-renderer";
  }

  if (hostCapabilities.textInputOverlay.status !== "available") {
    return "missing-capability";
  }

  return "none";
}
