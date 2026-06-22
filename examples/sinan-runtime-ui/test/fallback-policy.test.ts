import { describe, expect, it } from "vitest";

import {
  createGateDemoHostCapabilitySnapshot,
  createGateDemoMissingTextInputOverlayHostCapabilitySnapshot,
  gateDemoFallbackPolicyDiagnosticCodes,
  gateDemoFallbackPolicyVersion,
  gateDemoScrollFallbackPolicyVersion,
  resolveGateDemoFallbackPolicy,
  resolveGateDemoScrollFallbackPolicy,
} from "../src/index.js";

describe("Gate Demo fallback renderer policy", () => {
  it("keeps LudoWeave renderer selected when required host capabilities are available", () => {
    expect(resolveGateDemoFallbackPolicy()).toEqual({
      version: gateDemoFallbackPolicyVersion,
      status: "PASS",
      owner: "ludoweave",
      route: "ludoweave-renderer",
      reason: "none",
      requestedRenderer: "dom",
      diagnostics: [],
    });
  });

  it("selects Sinan-owned fallback when text overlay capability is missing", () => {
    const result = resolveGateDemoFallbackPolicy({
      hostCapabilities: createGateDemoMissingTextInputOverlayHostCapabilitySnapshot(),
    });

    expect(result).toMatchObject({
      version: gateDemoFallbackPolicyVersion,
      status: "PASS",
      owner: "sinan",
      route: "sinan-fallback-renderer",
      reason: "missing-capability",
      requestedRenderer: "dom",
      diagnostics: [
        {
          code: gateDemoFallbackPolicyDiagnosticCodes.selected,
          severity: "info",
        },
      ],
    });
    expect(result.snapshot?.source).toBe("sinan-fallback");
    expect(result.snapshot?.layers[0]?.elements.map((element) => element.type)).toEqual([
      "prompt",
      "subtitle",
      "objective",
      "pause",
      "editable-overlay-candidate",
    ]);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("selects Sinan-owned fallback for unsupported renderer requests", () => {
    expect(
      resolveGateDemoFallbackPolicy({
        requestedRenderer: "pixi",
      }),
    ).toMatchObject({
      status: "PASS",
      owner: "sinan",
      route: "sinan-fallback-renderer",
      reason: "unsupported-renderer",
      requestedRenderer: "pixi",
    });
  });

  it("fails when fallback is required but the fallback renderer route is unavailable", () => {
    const hostCapabilities = createGateDemoHostCapabilitySnapshot();

    expect(
      resolveGateDemoFallbackPolicy({
        requestedRenderer: "webgpu",
        hostCapabilities: {
          ...hostCapabilities,
          renderers: {
            ...hostCapabilities.renderers,
            fallback: {
              ...hostCapabilities.renderers.fallback,
              status: "missing",
              reason: "capability-missing",
              message: "Sinan fallback renderer is unavailable.",
            },
          },
        },
      }),
    ).toMatchObject({
      status: "FAIL",
      owner: "sinan",
      route: "sinan-fallback-renderer",
      reason: "unsupported-renderer",
      requestedRenderer: "webgpu",
      diagnostics: [
        {
          code: gateDemoFallbackPolicyDiagnosticCodes.unavailable,
          severity: "error",
          details: {
            fallbackStatus: "missing",
          },
        },
      ],
    });
  });

  it("keeps LudoWeave selected for scroll when renderer and host capability are available", () => {
    expect(resolveGateDemoScrollFallbackPolicy()).toEqual({
      version: gateDemoScrollFallbackPolicyVersion,
      status: "PASS",
      owner: "ludoweave",
      route: "ludoweave-renderer",
      reason: "none",
      requestedRenderer: "dom",
      hostScrollCapability: "available",
      diagnostics: [],
    });
  });

  it("selects Sinan-owned scroll fallback for unsupported renderers", () => {
    expect(resolveGateDemoScrollFallbackPolicy({ requestedRenderer: "webgpu" })).toMatchObject({
      version: gateDemoScrollFallbackPolicyVersion,
      status: "PASS",
      owner: "sinan",
      route: "sinan-fallback-renderer",
      reason: "unsupported-renderer",
      requestedRenderer: "webgpu",
      diagnostics: [
        {
          code: gateDemoFallbackPolicyDiagnosticCodes.scrollSelected,
          severity: "info",
        },
      ],
    });
  });

  it("selects Sinan-owned scroll fallback for missing and disabled host scroll", () => {
    expect(
      resolveGateDemoScrollFallbackPolicy({
        hostScrollCapability: "missing",
      }),
    ).toMatchObject({
      owner: "sinan",
      reason: "missing-host-scroll-capability",
      hostScrollCapability: "missing",
    });

    expect(
      resolveGateDemoScrollFallbackPolicy({
        hostScrollCapability: "disabled",
      }),
    ).toMatchObject({
      owner: "sinan",
      reason: "disabled-scroll",
      hostScrollCapability: "disabled",
    });
  });
});
