import { createClippedScrollContentFixture } from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";

describe("headless clipped scroll fixture", () => {
  it("serializes the clipped content frame while scroll metadata remains a sidecar", () => {
    const fixture = createClippedScrollContentFixture();
    const renderer = createHeadlessRenderer({ id: "scroll.headless" });
    const result = renderer.render(fixture.frame);

    expect(result.frame).toBe(fixture.frame);
    expect(result.snapshot).toBe(serializeHeadlessFrame(fixture.frame));
    expect(result.snapshot).toContain('"frameId": 4600');
    expect(result.snapshot).toContain('"scrollContainerId": "quest-log-scroll"');
    expect(result.snapshot).toContain('"text": "Cross the flooded archive."');
    expect(result.snapshot).not.toContain("scrollTop");
    expect(fixture.scrollMetadata.containers[0]?.offset).toEqual({ x: 0, y: 180, revision: 3 });
  });
});
