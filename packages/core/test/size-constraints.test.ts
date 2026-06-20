import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { resolveSizeConstraints } from "../src/layout.js";

describe("resolveSizeConstraints", () => {
  it("resolves fixed size constraints", () => {
    expect(
      resolveSizeConstraints({
        available: { width: 800, height: 600 },
        constraints: {
          width: 320,
          height: 96,
        },
      }),
    ).toEqual({
      width: 320,
      height: 96,
    });
  });

  it("resolves percent size constraints against available space", () => {
    expect(
      resolveSizeConstraints({
        available: { width: 400, height: 200 },
        constraints: {
          width: "50%",
          height: "25%",
          minWidth: 180,
          maxHeight: 60,
        },
      }),
    ).toEqual({
      width: 200,
      height: 50,
    });
  });

  it("applies min and max to intrinsic fallback size", () => {
    expect(
      resolveSizeConstraints({
        available: { width: 300, height: 300 },
        intrinsic: { width: 100, height: 100 },
        constraints: {
          minWidth: 120,
          maxWidth: 150,
          minHeight: 80,
          maxHeight: 90,
        },
      }),
    ).toEqual({
      width: 120,
      height: 90,
    });
  });

  it("reports invalid size values with deterministic fallbacks", () => {
    const diagnostics = createDiagnosticSink();

    expect(
      resolveSizeConstraints({
        diagnostics,
        available: { width: 100, height: 100 },
        constraints: {
          width: -1,
          height: "bad%" as never,
        },
      }),
    ).toEqual({
      width: 0,
      height: 0,
    });
    expect(diagnostics.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "size.width must be a non-negative finite number.",
          "path": [
            "size.width",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "size.height must be a non-negative number or percentage string.",
          "path": [
            "size.height",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
