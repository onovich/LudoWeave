import { describe, expect, it } from "vitest";

import {
  normalizeScrollOffsetForContainer,
  resolveScrollRestoration,
} from "../src/scroll-offset-normalization.js";

describe("scroll offset normalization", () => {
  it("normalizes offsets deterministically by axis and max extent", () => {
    expect(
      normalizeScrollOffsetForContainer(
        {
          id: "quest-log",
          contentRect: { x: 24, y: 96, width: 480, height: 960 },
          viewportRect: { x: 24, y: 96, width: 480, height: 320 },
          axis: "y",
          offset: { x: 12, y: 128, revision: 5 },
          extent: { width: 480, height: 960 },
        },
        { x: 64, y: 720, revision: 6 },
      ),
    ).toEqual({
      containerId: "quest-log",
      requestedOffset: { x: 64, y: 720, revision: 6 },
      normalizedOffset: { x: 0, y: 640, revision: 6 },
      maxOffset: { x: 0, y: 640 },
      clamped: true,
      diagnostics: [
        {
          code: "LW_SCROLL_OUT_OF_RANGE_OFFSET",
          severity: "warning",
          message: "Scroll offset is outside the container extent.",
          details: {
            containerId: "quest-log",
            requestedX: 64,
            requestedY: 720,
            normalizedX: 0,
            normalizedY: 640,
          },
        },
      ],
    });
  });

  it("reports missing capability, stale containers, disabled scroll, and empty containers", () => {
    const result = normalizeScrollOffsetForContainer({
      id: "dialog-copy",
      contentRect: { x: 0, y: 0, width: 0, height: 0 },
      viewportRect: { x: 0, y: 0, width: 320, height: 160 },
      offset: { y: 12 },
      extent: { width: 0, height: 0 },
      hostCapability: { status: "missing", reason: "stale" },
      disabledReason: "stale",
    });

    expect(result.normalizedOffset).toEqual({ x: 0, y: 0 });
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_SCROLL_MISSING_HOST_CAPABILITY",
      "LW_SCROLL_STALE_CONTAINER",
      "LW_SCROLL_DISABLED",
      "LW_SCROLL_EMPTY_CONTAINER",
      "LW_SCROLL_OUT_OF_RANGE_OFFSET",
    ]);
  });

  it("resolves restoration for present containers and reports removed containers", () => {
    const present = resolveScrollRestoration(
      {
        containers: [
          {
            id: "quest-log",
            contentRect: { x: 0, y: 0, width: 240, height: 900 },
            viewportRect: { x: 0, y: 0, width: 240, height: 300 },
            extent: { width: 240, height: 900 },
          },
        ],
      },
      "quest-log",
      { y: 300 },
    );

    expect(present).toEqual({
      status: "restored",
      containerId: "quest-log",
      offset: {
        containerId: "quest-log",
        requestedOffset: { x: 0, y: 300 },
        normalizedOffset: { x: 0, y: 300 },
        maxOffset: { x: 0, y: 600 },
        clamped: false,
        diagnostics: [],
      },
      diagnostics: [],
    });

    expect(
      resolveScrollRestoration(
        {
          containers: [
            {
              id: "quest-log",
              contentRect: { x: 0, y: 0, width: 240, height: 900 },
              viewportRect: { x: 0, y: 0, width: 240, height: 300 },
              extent: { width: 240, height: 900 },
            },
          ],
        },
        "removed-panel",
        { y: 120 },
      ),
    ).toEqual({
      status: "removed",
      containerId: "removed-panel",
      diagnostics: [
        {
          code: "LW_SCROLL_REMOVED_CONTAINER",
          severity: "warning",
          message: "Scroll restoration target container is no longer present.",
          details: {
            containerId: "removed-panel",
          },
        },
      ],
    });
  });
});
