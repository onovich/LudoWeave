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
export const gateDemoScrollFallbackPolicyVersion = "ludoweave.sinan-gate-demo.scroll-fallback.v0.6";

export type GateDemoRequestedRenderer = "dom" | "canvas2d" | "fallback" | "pixi" | "webgpu";
export type GateDemoFallbackOwner = "ludoweave" | "sinan";
export type GateDemoFallbackRoute = "ludoweave-renderer" | "sinan-fallback-renderer";
export type GateDemoFallbackReason =
  | "none"
  | "missing-capability"
  | "unsupported-renderer"
  | "requested-fallback";
export type GateDemoScrollFallbackReason =
  | "none"
  | "disabled-scroll"
  | "missing-host-scroll-capability"
  | "unsupported-renderer";

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

export interface ResolveGateDemoScrollFallbackPolicyOptions {
  readonly requestedRenderer?: GateDemoRequestedRenderer;
  readonly hostScrollCapability?: "available" | "disabled" | "missing" | "unsupported";
}

export interface GateDemoScrollFallbackPolicyResult {
  readonly version: typeof gateDemoScrollFallbackPolicyVersion;
  readonly status: "PASS" | "FAIL";
  readonly owner: GateDemoFallbackOwner;
  readonly route: GateDemoFallbackRoute;
  readonly reason: GateDemoScrollFallbackReason;
  readonly requestedRenderer: GateDemoRequestedRenderer;
  readonly hostScrollCapability: "available" | "disabled" | "missing" | "unsupported";
  readonly diagnostics: readonly UiDiagnostic[];
}

export const gateDemoFallbackPolicyDiagnosticCodes = Object.freeze({
  selected: "LW_EXAMPLE_FALLBACK_POLICY_SELECTED",
  unavailable: "LW_EXAMPLE_FALLBACK_POLICY_UNAVAILABLE",
  scrollSelected: "LW_EXAMPLE_SCROLL_FALLBACK_POLICY_SELECTED",
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

export function resolveGateDemoScrollFallbackPolicy(
  options: ResolveGateDemoScrollFallbackPolicyOptions = {},
): GateDemoScrollFallbackPolicyResult {
  const requestedRenderer = options.requestedRenderer ?? "dom";
  const hostScrollCapability = options.hostScrollCapability ?? "available";
  const reason = resolveScrollFallbackReason(requestedRenderer, hostScrollCapability);

  if (reason === "none") {
    return {
      version: gateDemoScrollFallbackPolicyVersion,
      status: "PASS",
      owner: "ludoweave",
      route: "ludoweave-renderer",
      reason,
      requestedRenderer,
      hostScrollCapability,
      diagnostics: [],
    };
  }

  return {
    version: gateDemoScrollFallbackPolicyVersion,
    status: "PASS",
    owner: "sinan",
    route: "sinan-fallback-renderer",
    reason,
    requestedRenderer,
    hostScrollCapability,
    diagnostics: [
      normalizeUiDiagnostic({
        code: gateDemoFallbackPolicyDiagnosticCodes.scrollSelected,
        severity: "info",
        message: "Sinan-owned scroll fallback route selected for Gate Demo.",
        path: ["fallback-policy", "scroll", reason],
        details: {
          requestedRenderer,
          hostScrollCapability,
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

function resolveScrollFallbackReason(
  requestedRenderer: GateDemoRequestedRenderer,
  hostScrollCapability: "available" | "disabled" | "missing" | "unsupported",
): GateDemoScrollFallbackReason {
  if (requestedRenderer === "pixi" || requestedRenderer === "webgpu") {
    return "unsupported-renderer";
  }

  if (hostScrollCapability === "missing" || hostScrollCapability === "unsupported") {
    return "missing-host-scroll-capability";
  }

  if (hostScrollCapability === "disabled") {
    return "disabled-scroll";
  }

  return "none";
}
