import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { snapRectToPixelGrid } from "../src/pixel-snapping.js";

describe("snapRectToPixelGrid", () => {
  it("snaps a resolved rect to device pixels", () => {
    expect(
      snapRectToPixelGrid({
        devicePixelRatio: 2,
        rect: {
          x: 10.25,
          y: 20.25,
          width: 30.25,
          height: 40.25,
        },
      }),
    ).toEqual({
      x: 10.5,
      y: 20.5,
      width: 30.5,
      height: 40.5,
    });
  });

  it("can preserve CSS pixel values when snapping is disabled", () => {
    expect(
      snapRectToPixelGrid({
        policy: "none",
        devicePixelRatio: 2,
        rect: {
          x: 10.25,
          y: 20.25,
          width: 30.25,
          height: 40.25,
        },
      }),
    ).toEqual({
      x: 10.25,
      y: 20.25,
      width: 30.25,
      height: 40.25,
    });
  });

  it("reports invalid DPR and policy with deterministic fallbacks", () => {
    const diagnostics = createDiagnosticSink();

    expect(
      snapRectToPixelGrid({
        diagnostics,
        policy: "bad" as never,
        devicePixelRatio: 0,
        rect: {
          x: 10.5,
          y: Number.NaN,
          width: 20.5,
          height: -1,
        },
      }),
    ).toEqual({
      x: 11,
      y: 0,
      width: 21,
      height: 0,
    });
    expect(diagnostics.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "pixel.rect.y must be a finite number.",
          "path": [
            "pixel.rect.y",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "pixel.rect.height must be a non-negative finite number.",
          "path": [
            "pixel.rect.height",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": "device-pixel",
          },
          "message": "pixel.policy must be none or device-pixel.",
          "path": [
            "pixel.policy",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 1,
          },
          "message": "pixel.devicePixelRatio must be a positive finite number.",
          "path": [
            "pixel.devicePixelRatio",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
