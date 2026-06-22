import { createRealizedVirtualListFixture } from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";

describe("headless realized virtual list fixture", () => {
  it("serializes realized virtual items as ordinary frame nodes", () => {
    const fixture = createRealizedVirtualListFixture();
    const renderer = createHeadlessRenderer({ id: "virtual-list.headless" });
    const result = renderer.render(fixture.frame);

    expect(result.frame).toBe(fixture.frame);
    expect(result.snapshot).toBe(serializeHeadlessFrame(fixture.frame));
    expect(result.snapshot).toContain('"frameId": 4700');
    expect(result.snapshot).toContain('"virtualWindowId": "quest-log-window"');
    expect(result.snapshot).toContain('"itemKey": "quest:5"');
    expect(result.snapshot).not.toContain("collectionData");
    expect(result.snapshot).not.toContain("datasource");
    expect(fixture.virtualWindow.realizedRange).toEqual({ startIndex: 4, endIndex: 7 });
  });
});
