import { describe, expect, it } from "vitest";

import {
  createGateDemoMissingTextInputOverlayHostCapabilitySnapshot,
  gateDemoRuntimeUIViewModelEnvelope,
  gateDemoValidationDiagnosticCodes,
  gateDemoValidationHookVersion,
  runGateDemoValidationHook,
} from "../src/index.js";

describe("Gate Demo validation hook", () => {
  it("reports PASS for the complete Gate Demo contract path", () => {
    const result = runGateDemoValidationHook();

    expect(result.version).toBe(gateDemoValidationHookVersion);
    expect(result.status).toBe("PASS");
    expect(result.frameId).toBe("gate-demo:1024");
    expect(result.layers.map((layer) => [layer.layer, layer.status])).toEqual([
      ["mapping", "PASS"],
      ["renderer", "PASS"],
      ["host-capability", "PASS"],
      ["action-registry", "PASS"],
      ["overlay-coordination", "PASS"],
      ["navigation", "PASS"],
      ["scroll", "PASS"],
      ["virtual-list", "PASS"],
      ["rich-text", "PASS"],
    ]);
    expect(result.diagnostics).toEqual([]);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("localizes unsupported envelope versions to the mapping layer", () => {
    const result = runGateDemoValidationHook({
      envelope: {
        ...gateDemoRuntimeUIViewModelEnvelope,
        version: "ludoweave.sinan-gate-demo.v99",
      },
    });

    expect(result.status).toBe("FAIL");
    expect(result.layers[0]).toMatchObject({
      layer: "mapping",
      status: "FAIL",
      diagnostics: [
        {
          code: "LW_EXAMPLE_SINAN_ADAPTER_VERSION",
          severity: "error",
        },
      ],
    });
  });

  it("localizes missing overlay capability to host capability while preserving fallback coordination", () => {
    const result = runGateDemoValidationHook({
      hostCapabilities: createGateDemoMissingTextInputOverlayHostCapabilitySnapshot(),
    });

    expect(result.status).toBe("FAIL");
    expect(result.layers.map((layer) => [layer.layer, layer.status])).toEqual([
      ["mapping", "PASS"],
      ["renderer", "PASS"],
      ["host-capability", "FAIL"],
      ["action-registry", "PASS"],
      ["overlay-coordination", "PASS"],
      ["navigation", "PASS"],
      ["scroll", "PASS"],
      ["virtual-list", "PASS"],
      ["rich-text", "PASS"],
    ]);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: gateDemoValidationDiagnosticCodes.hostCapabilityUnavailable,
        path: ["validation-hook", "host-capability", "overlay.text-input"],
      }),
    );
  });

  it("localizes rejected routes to the action registry layer", () => {
    const result = runGateDemoValidationHook({
      registryOptions: {
        acceptedNamespaces: [],
      },
    });

    expect(result.status).toBe("FAIL");
    expect(result.layers.find((layer) => layer.layer === "action-registry")).toMatchObject({
      layer: "action-registry",
      status: "FAIL",
    });
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "LW_EXAMPLE_ACTION_REGISTRY_UNKNOWN",
      ),
    ).toBe(true);
  });

  it("localizes rejected navigation routes to the navigation layer", () => {
    const result = runGateDemoValidationHook({
      registryOptions: {
        disabledActionTypes: ["runtime.pause.close"],
      },
    });

    expect(result.layers.find((layer) => layer.layer === "navigation")).toMatchObject({
      layer: "navigation",
      status: "FAIL",
    });
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      ),
    ).toBe(true);
  });

  it("localizes rejected scroll routes to the scroll layer", () => {
    const result = runGateDemoValidationHook({
      registryOptions: {
        disabledActionTypes: ["runtime.scroll.intent"],
      },
    });

    expect(result.layers.find((layer) => layer.layer === "scroll")).toMatchObject({
      layer: "scroll",
      status: "FAIL",
    });
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      ),
    ).toBe(true);
  });

  it("localizes rejected virtual list routes to the virtual list layer", () => {
    const result = runGateDemoValidationHook({
      registryOptions: {
        disabledActionTypes: ["runtime.collection.intent"],
      },
    });

    expect(result.layers.find((layer) => layer.layer === "virtual-list")).toMatchObject({
      layer: "virtual-list",
      status: "FAIL",
    });
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      ),
    ).toBe(true);
  });

  it("localizes rejected rich text routes to the rich text layer", () => {
    const result = runGateDemoValidationHook({
      registryOptions: {
        disabledActionTypes: ["runtime.richText.intent"],
      },
    });

    expect(result.layers.find((layer) => layer.layer === "rich-text")).toMatchObject({
      layer: "rich-text",
      status: "FAIL",
    });
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
      ),
    ).toBe(true);
  });

  it("localizes missing editable fallback actions to overlay coordination", () => {
    const result = runGateDemoValidationHook({
      envelope: createEnvelopeWithoutEditableFallback(),
      hostCapabilities: createGateDemoMissingTextInputOverlayHostCapabilitySnapshot(),
    });

    expect(result.status).toBe("FAIL");
    expect(result.layers.find((layer) => layer.layer === "overlay-coordination")).toMatchObject({
      layer: "overlay-coordination",
      status: "FAIL",
      diagnostics: [
        {
          code: gateDemoValidationDiagnosticCodes.overlayFallbackMissing,
          severity: "error",
        },
      ],
    });
  });
});

function createEnvelopeWithoutEditableFallback(): typeof gateDemoRuntimeUIViewModelEnvelope {
  const [layer] = gateDemoRuntimeUIViewModelEnvelope.viewModel.layers;

  if (layer === undefined) {
    throw new Error("Expected Gate Demo fixture layer.");
  }

  return {
    ...gateDemoRuntimeUIViewModelEnvelope,
    viewModel: {
      ...gateDemoRuntimeUIViewModelEnvelope.viewModel,
      layers: [
        {
          ...layer,
          elements: layer.elements.map((element) => {
            if (element.type !== "editable-overlay-candidate") {
              return element;
            }

            const editable = { ...element } as Record<string, unknown>;
            delete editable.fallbackAction;
            return editable as typeof element;
          }),
        },
      ],
    },
  };
}
