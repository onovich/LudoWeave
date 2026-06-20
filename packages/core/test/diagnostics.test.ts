import { describe, expect, it } from "vitest";

import {
  coreDiagnosticCodes,
  createDiagnosticSink,
  normalizeUiDiagnostic,
} from "../src/diagnostics.js";

describe("diagnostics", () => {
  it("keeps core diagnostic codes in a stable LW namespace", () => {
    expect(Object.values(coreDiagnosticCodes)).toEqual([
      "LW_CORE_INVALID_ACTION",
      "LW_CORE_INVALID_JSON",
      "LW_CORE_INVALID_UI_NODE",
      "LW_CORE_UNSUPPORTED_LAYOUT",
    ]);
  });

  it("normalizes diagnostics for deterministic snapshots", () => {
    expect(
      normalizeUiDiagnostic({
        code: coreDiagnosticCodes.invalidUiNode,
        severity: "warning",
        message: " Missing key ",
        path: ["root", "children", "0"],
        details: {
          type: "button",
          recoverable: true,
        },
      }),
    ).toEqual({
      code: "LW_CORE_INVALID_UI_NODE",
      severity: "warning",
      message: "Missing key",
      path: ["root", "children", "0"],
      details: {
        type: "button",
        recoverable: true,
      },
    });
  });

  it("collects diagnostics in insertion order", () => {
    const sink = createDiagnosticSink();

    sink.report({
      code: coreDiagnosticCodes.invalidAction,
      severity: "error",
      message: "Action payload was not JSON.",
    });
    sink.report({
      code: coreDiagnosticCodes.unsupportedLayout,
      severity: "info",
      message: "Grid layout is outside v0.1 scope.",
    });

    expect(sink.hasErrors()).toBe(true);
    expect(sink.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_ACTION",
          "message": "Action payload was not JSON.",
          "severity": "error",
        },
        {
          "code": "LW_CORE_UNSUPPORTED_LAYOUT",
          "message": "Grid layout is outside v0.1 scope.",
          "severity": "info",
        },
      ]
    `);
  });

  it("rejects unstable diagnostic codes and non-json details", () => {
    expect(() =>
      normalizeUiDiagnostic({
        code: "invalid.action",
        severity: "error",
        message: "bad",
      }),
    ).toThrow(/stable LW_\* namespace/);

    expect(() =>
      normalizeUiDiagnostic({
        code: coreDiagnosticCodes.invalidJson,
        severity: "error",
        message: "bad details",
        details: { callback: () => undefined },
      } as never),
    ).toThrow(/details\.callback must be a JsonValue/);
  });
});
