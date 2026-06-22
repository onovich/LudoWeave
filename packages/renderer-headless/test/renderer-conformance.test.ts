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
    expect(fixture.scrollMetadata.containers[0]).toMatchObject({
      id: "pause-dialog-scroll",
      nodeId: "runtime.overlay/key:pause.dialog",
      offset: { x: 0, y: 84, revision: 2 },
    });
    expect(fixture.virtualWindow).toMatchObject({
      id: "quest-log-window",
      totalCount: 6,
      realizedRange: { startIndex: 2, endIndex: 4 },
      overscanRange: { startIndex: 1, endIndex: 5 },
      selection: { selectedKey: "quest:3", focusedKey: "quest:3", revision: 1 },
    });
    expect(fixture.virtualWindowRealizedNodeIds).toEqual([
      "runtime.overlay/key:quest-log/key:quest:2",
      "runtime.overlay/key:quest-log/key:quest:3",
    ]);
    expect(fixture.scrollOffset.diagnostics).toEqual([]);
    expect(result.snapshot).not.toContain("scrollTop");
    expect(result.snapshot).not.toContain("datasource");
  });
});
