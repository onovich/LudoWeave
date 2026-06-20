import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { createLayoutEnvironment } from "../src/layout.js";

describe("createLayoutEnvironment", () => {
  it("normalizes viewport, DPR, and safe area into a content box", () => {
    const environment = createLayoutEnvironment({
      viewport: {
        width: 1280,
        height: 720,
        devicePixelRatio: 2,
        safeArea: {
          top: 10,
          right: 20,
          bottom: 30,
          left: 40,
        },
      },
    });

    expect(environment).toEqual({
      viewport: {
        width: 1280,
        height: 720,
        devicePixelRatio: 2,
        safeArea: {
          top: 10,
          right: 20,
          bottom: 30,
          left: 40,
        },
      },
      contentBox: {
        x: 40,
        y: 10,
        width: 1220,
        height: 680,
      },
    });
  });

  it("records diagnostics for invalid viewport inputs and falls back deterministically", () => {
    const diagnostics = createDiagnosticSink();
    const environment = createLayoutEnvironment({
      diagnostics,
      viewport: {
        width: 0,
        height: Number.NaN,
        devicePixelRatio: -1,
        safeArea: {
          top: -10,
        },
      },
    });

    expect(environment).toEqual({
      viewport: {
        width: 1,
        height: 1,
        devicePixelRatio: 1,
        safeArea: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      contentBox: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
    });
    expect(diagnostics.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "viewport.safeArea.top must be a non-negative finite number.",
          "path": [
            "viewport.safeArea.top",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 1,
          },
          "message": "viewport.width must be a positive finite number.",
          "path": [
            "viewport.width",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 1,
          },
          "message": "viewport.height must be a positive finite number.",
          "path": [
            "viewport.height",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 1,
          },
          "message": "viewport.devicePixelRatio must be a positive finite number.",
          "path": [
            "viewport.devicePixelRatio",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
