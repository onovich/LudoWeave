import { describe, expect, it } from "vitest";

import { createDiagnosticSink } from "../src/diagnostics.js";
import { createLayoutEnvironment, resolveAbsoluteAnchor } from "../src/layout.js";

describe("resolveAbsoluteAnchor", () => {
  it("anchors a fixed box to the bottom center of a container", () => {
    expect(
      resolveAbsoluteAnchor({
        container: { x: 0, y: 0, width: 1280, height: 720 },
        size: { width: 240, height: 48 },
        anchor: {
          horizontal: "center",
          vertical: "end",
          inset: {
            bottom: 52,
          },
        },
      }),
    ).toEqual({
      x: 520,
      y: 620,
      width: 240,
      height: 48,
    });
  });

  it("anchors inside the safe-area content box", () => {
    const environment = createLayoutEnvironment({
      viewport: {
        width: 1280,
        height: 720,
        safeArea: {
          top: 40,
          right: 20,
          bottom: 24,
          left: 80,
        },
      },
    });

    expect(
      resolveAbsoluteAnchor({
        container: environment.contentBox,
        size: { width: 240, height: 48 },
        anchor: {
          horizontal: "center",
          vertical: "end",
          inset: {
            bottom: 52,
          },
        },
      }),
    ).toEqual({
      x: 550,
      y: 596,
      width: 240,
      height: 48,
    });
  });

  it("reports invalid anchor values with deterministic fallbacks", () => {
    const diagnostics = createDiagnosticSink();

    expect(
      resolveAbsoluteAnchor({
        diagnostics,
        container: { x: Number.NaN, y: 0, width: -1, height: 100 },
        size: { width: 20, height: Number.NaN },
        anchor: {
          horizontal: "bad" as never,
          vertical: "end",
          inset: {
            bottom: -4,
          },
        },
      }),
    ).toEqual({
      x: 0,
      y: 100,
      width: 20,
      height: 0,
    });
    expect(diagnostics.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "anchor.container.x must be a finite number.",
          "path": [
            "anchor.container.x",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "anchor.container.width must be a non-negative finite number.",
          "path": [
            "anchor.container.width",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "anchor.size.height must be a non-negative finite number.",
          "path": [
            "anchor.size.height",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": "start",
          },
          "message": "anchor.horizontal must be start, center, or end.",
          "path": [
            "anchor.horizontal",
          ],
          "severity": "error",
        },
        {
          "code": "LW_CORE_INVALID_LAYOUT",
          "details": {
            "fallback": 0,
          },
          "message": "anchor.inset.bottom must be a non-negative finite number.",
          "path": [
            "anchor.inset.bottom",
          ],
          "severity": "error",
        },
      ]
    `);
  });
});
