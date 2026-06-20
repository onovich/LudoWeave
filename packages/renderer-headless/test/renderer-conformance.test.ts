import { createRendererConformanceFixture } from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";

describe("headless renderer conformance", () => {
  it("serializes the shared renderer conformance frame without mutating it", () => {
    const fixture = createRendererConformanceFixture();
    const renderer = createHeadlessRenderer({ id: "conformance.headless" });
    const result = renderer.render(fixture.frame);

    expect(result.rendererId).toBe("conformance.headless");
    expect(result.frame).toBe(fixture.frame);
    expect(result.snapshot).toBe(serializeHeadlessFrame(fixture.frame));
    expect(result.snapshot).toContain('"frameId": 3600');
    expect(result.snapshot).toContain('"nodeId": "runtime.overlay/key:prompt.primary"');
    expect(result.snapshot).toContain('"role": "dialog"');
  });
});
