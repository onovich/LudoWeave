import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { resolveTextMeasure, type TextMeasure } from "../src/text-measure.js";

describe("resolveTextMeasure", () => {
  it("resolves deterministic text measurement through the host interface", () => {
    const measureText: TextMeasure = ({ text, maxWidth }) => ({
      width: Math.min(text.length * 10, maxWidth),
      height: 20,
    });

    expect(
      resolveTextMeasure({
        text: "ABCD",
        fontSize: 18,
        maxWidth: 100,
        measureText,
      }),
    ).toEqual({
      width: 40,
      height: 20,
    });
  });

  it("normalizes invalid text measure inputs and outputs", () => {
    const diagnostics = createDiagnosticSink();

    expect(
      resolveTextMeasure({
        diagnostics,
        text: "ABCD",
        fontSize: -1,
        maxWidth: 30,
        measureText: () => ({
          width: Number.POSITIVE_INFINITY,
          height: Number.NaN,
        }),
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
            "fallback": 16,
          },
          "message": "text.fontSize must be a positive finite number.",
          "path": [
            "text.fontSize",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "text.measure.width must be a non-negative finite number.",
          "path": [
            "text.measure.width",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "text.measure.height must be a non-negative finite number.",
          "path": [
            "text.measure.height",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
