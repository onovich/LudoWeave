import { describe, expect, it } from "vitest";

import {
  createGateDemoMissingTextInputOverlayHostCapabilitySnapshot,
  gateDemoRuntimeUIViewModelEnvelope,
  mapRuntimeUIViewModelEnvelopeToResolvedFrame,
  runtimeUIAdapterDiagnosticCodes,
} from "../src/index.js";

describe("Sinan-like envelope to ResolvedUiFrame adapter", () => {
  it("maps the versioned Gate Demo envelope to UiNodes and a ResolvedUiFrame", () => {
    const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope);

    expect(result.ok).toBe(true);
    expect(result.envelopeFrameId).toBe("gate-demo:1024");
    expect(result.diagnostics).toEqual([]);
    expect(result.uiNodes.map((node) => [node.type, node.key])).toEqual([
      ["button", "prompt.interact.switch_a"],
      ["text", "subtitle.gate.hum"],
      ["objective", "objective.delivery.cell"],
      ["dialog", "pause.menu"],
      ["editable-text", "editable.gate-code"],
    ]);
    expect(result.frame?.actions.map((action) => action.id)).toEqual([
      "action.prompt.interact.switch_a",
      "action.objective.delivery.cell",
      "action.confirm",
      "action.cancel",
    ]);
  });

  it("reports unsupported envelope versions as version diagnostics", () => {
    const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame({
      ...gateDemoRuntimeUIViewModelEnvelope,
      version: "ludoweave.sinan-gate-demo.v99",
    });

    expect(result).toMatchObject({
      ok: false,
      uiNodes: [],
      diagnostics: [
        {
          code: runtimeUIAdapterDiagnosticCodes.version,
          severity: "error",
          path: ["adapter", "version", "envelope", "version"],
          details: {
            layer: "version",
            sourceCode: "sinan-envelope.unsupported-version",
            sourcePath: "$.version",
          },
        },
      ],
    });
  });

  it("reports missing envelope fields as schema diagnostics", () => {
    const missingFrameIdEnvelope = { ...gateDemoRuntimeUIViewModelEnvelope } as Record<
      string,
      unknown
    >;
    delete missingFrameIdEnvelope.frameId;

    const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(missingFrameIdEnvelope);

    expect(result).toMatchObject({
      ok: false,
      uiNodes: [],
      diagnostics: [
        {
          code: runtimeUIAdapterDiagnosticCodes.schema,
          severity: "error",
          path: ["adapter", "schema", "envelope", "frameId"],
          details: {
            layer: "schema",
            sourceCode: "sinan-envelope.missing-required-field",
            sourcePath: "$.frameId",
          },
        },
      ],
    });
  });

  it("reports missing overlay support as capability diagnostics without blocking fallback mapping", () => {
    const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(
      gateDemoRuntimeUIViewModelEnvelope,
      {
        hostCapabilities: createGateDemoMissingTextInputOverlayHostCapabilitySnapshot(),
      },
    );

    expect(result.ok).toBe(true);
    expect(result.frame?.diagnostics).toEqual([
      {
        code: runtimeUIAdapterDiagnosticCodes.capability,
        severity: "warning",
        message: "Host did not provide editable text overlay support.",
        path: ["adapter", "capability", "host", "text-input-overlay"],
        details: {
          layer: "capability",
          sourceCode: "LW_EXAMPLE_HOST_CAPABILITY_TEXT_INPUT_OVERLAY_UNAVAILABLE",
          capabilityStatus: "missing",
          lifecycleReason: "capability-missing",
        },
      },
    ]);
  });

  it("reports unsupported Runtime UI elements before mapping", () => {
    const [layer] = gateDemoRuntimeUIViewModelEnvelope.viewModel.layers;

    if (layer === undefined) {
      throw new Error("Expected the Gate Demo fixture to contain a layer.");
    }

    const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame({
      ...gateDemoRuntimeUIViewModelEnvelope,
      viewModel: {
        ...gateDemoRuntimeUIViewModelEnvelope.viewModel,
        layers: [
          {
            ...layer,
            elements: [
              ...layer.elements,
              {
                type: "video",
                id: "video.cutscene",
              },
            ],
          },
        ],
      },
    });

    expect(result).toMatchObject({
      ok: false,
      envelopeFrameId: "gate-demo:1024",
      uiNodes: [],
      diagnostics: [
        {
          code: runtimeUIAdapterDiagnosticCodes.unsupportedElement,
          severity: "error",
          path: ["adapter", "unsupported-element", "runtime.main", "video.cutscene"],
          details: {
            layer: "unsupported-element",
            elementType: "video",
            elementId: "video.cutscene",
          },
        },
      ],
    });
  });
});
