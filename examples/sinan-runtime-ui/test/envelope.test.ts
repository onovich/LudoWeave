import { describe, expect, it } from "vitest";

import {
  gateDemoRuntimeUIViewModel,
  gateDemoRuntimeUIViewModelEnvelope,
  runtimeUIViewModelEnvelopeVersion,
  validateRuntimeUIViewModelEnvelope,
} from "../src/index.js";

describe("Sinan-like RuntimeUIViewModel envelope", () => {
  it("wraps the Gate Demo view model in a versioned envelope fixture", () => {
    expect(gateDemoRuntimeUIViewModelEnvelope).toEqual({
      version: runtimeUIViewModelEnvelopeVersion,
      frameId: "gate-demo:1024",
      surface: "gate-demo",
      capabilities: [
        "renderer.dom",
        "renderer.canvas2d.trace",
        "renderer.fallback",
        "overlay.text-input",
        "action-registry",
        "validation-hook",
      ],
      fallbackPolicy: {
        renderer: "sinan-owned-fallback",
        missingCapability: "emit-diagnostic",
        unsupportedSurface: "use-host-runtime-ui",
      },
      viewModel: gateDemoRuntimeUIViewModel,
    });
  });

  it("accepts the supported envelope version without diagnostics", () => {
    expect(validateRuntimeUIViewModelEnvelope(gateDemoRuntimeUIViewModelEnvelope)).toEqual({
      valid: true,
      diagnostics: [],
      envelope: gateDemoRuntimeUIViewModelEnvelope,
    });
  });

  it("reports unsupported envelope versions as errors", () => {
    expect(
      validateRuntimeUIViewModelEnvelope({
        ...gateDemoRuntimeUIViewModelEnvelope,
        version: "ludoweave.sinan-gate-demo.v99",
      }),
    ).toEqual({
      valid: false,
      diagnostics: [
        {
          code: "sinan-envelope.unsupported-version",
          severity: "error",
          path: "$.version",
          message:
            'Unsupported RuntimeUIViewModel envelope version "ludoweave.sinan-gate-demo.v99".',
        },
      ],
    });
  });

  it("reports unknown envelope fields as warnings without rejecting the fixture", () => {
    const envelopeWithUnknownField = {
      ...gateDemoRuntimeUIViewModelEnvelope,
      debugOnly: true,
    };

    expect(validateRuntimeUIViewModelEnvelope(envelopeWithUnknownField)).toEqual({
      valid: true,
      diagnostics: [
        {
          code: "sinan-envelope.unknown-field",
          severity: "warning",
          path: "$.debugOnly",
          message: 'Unknown envelope field "debugOnly" will be ignored.',
        },
      ],
      envelope: envelopeWithUnknownField,
    });
  });

  it("reports missing required envelope fields as errors", () => {
    const envelopeWithoutFrameId = { ...gateDemoRuntimeUIViewModelEnvelope } as Record<
      string,
      unknown
    >;
    delete envelopeWithoutFrameId.frameId;

    expect(validateRuntimeUIViewModelEnvelope(envelopeWithoutFrameId)).toEqual({
      valid: false,
      diagnostics: [
        {
          code: "sinan-envelope.missing-required-field",
          severity: "error",
          path: "$.frameId",
          message: 'Missing required envelope field "frameId".',
        },
      ],
    });
  });
});
