import { describe, expect, it } from "vitest";

import { calculateFixedVirtualWindowRange } from "../src/virtual-window-range.js";

describe("fixed virtual window range calculation", () => {
  it("calculates a deterministic fixed-size item window with overscan", () => {
    expect(
      calculateFixedVirtualWindowRange({
        totalCount: 20,
        itemExtent: 40,
        viewportExtent: 120,
        scrollOffset: 220,
        overscan: { before: 2, after: 3 },
      }),
    ).toMatchInlineSnapshot(`
      {
        "clamped": false,
        "estimatedContentExtent": 800,
        "itemExtent": 40,
        "maxOffset": 680,
        "normalizedOffset": 220,
        "overscan": {
          "after": 3,
          "before": 2,
        },
        "overscanRange": {
          "endIndex": 12,
          "startIndex": 3,
        },
        "realizedRange": {
          "endIndex": 9,
          "startIndex": 5,
        },
        "requestedOffset": 220,
        "totalCount": 20,
        "viewportExtent": 120,
        "visibleRange": {
          "endIndex": 9,
          "startIndex": 5,
        },
      }
    `);
  });

  it("handles empty and short lists without requiring datasource reads", () => {
    expect(
      calculateFixedVirtualWindowRange({
        totalCount: 0,
        itemExtent: 44,
        viewportExtent: 240,
        scrollOffset: 80,
        overscan: 2,
      }),
    ).toEqual({
      totalCount: 0,
      itemExtent: 44,
      viewportExtent: 240,
      estimatedContentExtent: 0,
      requestedOffset: 80,
      normalizedOffset: 0,
      maxOffset: 0,
      clamped: true,
      visibleRange: { startIndex: 0, endIndex: 0 },
      realizedRange: { startIndex: 0, endIndex: 0 },
      overscanRange: { startIndex: 0, endIndex: 0 },
      overscan: { before: 2, after: 2 },
    });

    expect(
      calculateFixedVirtualWindowRange({
        totalCount: 3,
        itemExtent: 40,
        viewportExtent: 240,
        overscan: 4,
      }).overscanRange,
    ).toEqual({ startIndex: 0, endIndex: 3 });
  });

  it("clamps out-of-range offsets and keeps realized range inside total count", () => {
    expect(
      calculateFixedVirtualWindowRange({
        totalCount: 20,
        itemExtent: 40,
        viewportExtent: 120,
        scrollOffset: 1000,
        overscan: { before: 1, after: 5 },
      }),
    ).toEqual({
      totalCount: 20,
      itemExtent: 40,
      viewportExtent: 120,
      estimatedContentExtent: 800,
      requestedOffset: 1000,
      normalizedOffset: 680,
      maxOffset: 680,
      clamped: true,
      visibleRange: { startIndex: 17, endIndex: 20 },
      realizedRange: { startIndex: 17, endIndex: 20 },
      overscanRange: { startIndex: 16, endIndex: 20 },
      overscan: { before: 1, after: 5 },
    });
  });

  it("rejects platform-like objects and invalid numeric metadata", () => {
    class DatasourceWindowRequest {
      totalCount = 20;
      itemExtent = 40;
      viewportExtent = 120;
    }

    expect(() => calculateFixedVirtualWindowRange(new DatasourceWindowRequest())).toThrow(
      /plain object/,
    );

    expect(() =>
      calculateFixedVirtualWindowRange({
        totalCount: 20,
        itemExtent: 0,
        viewportExtent: 120,
      }),
    ).toThrow(/itemExtent/);

    expect(() =>
      calculateFixedVirtualWindowRange({
        totalCount: 20,
        itemExtent: 40,
        viewportExtent: 120,
        overscan: { before: -1 },
      }),
    ).toThrow(/overscan.before/);
  });
});
