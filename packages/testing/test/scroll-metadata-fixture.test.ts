import { describe, expect, it } from "vitest";

import { createClippedScrollContentFixture } from "../src/scroll-metadata-fixture.js";

describe("clipped scroll content fixture", () => {
  it("describes visible content and host-owned offset without implementing overflow", () => {
    const fixture = createClippedScrollContentFixture();

    expect(fixture).toMatchObject({
      name: "clipped-scroll-content",
      visibleContentBox: { x: 0, y: 180, width: 360, height: 220 },
      note: "metadata-only-no-css-overflow-or-virtual-list",
      scrollMetadata: {
        activeContainerId: "quest-log-scroll",
        containers: [
          {
            id: "quest-log-scroll",
            nodeId: "runtime.overlay/key:quest-log",
            axis: "y",
            offset: { x: 0, y: 180, revision: 3 },
            extent: { width: 360, height: 640 },
            hostCapability: { status: "available" },
          },
        ],
      },
      offset: {
        normalizedOffset: { x: 0, y: 180, revision: 3 },
        maxOffset: { x: 0, y: 420 },
        clamped: false,
        diagnostics: [],
      },
    });
    expect(fixture.frame.nodes.find((node) => node.id === "runtime.overlay/key:quest-log")).toEqual(
      expect.objectContaining({
        box: { x: 80, y: 120, width: 360, height: 220 },
        props: {
          scrollContainerId: "quest-log-scroll",
          scrollContract: "metadata-only",
        },
      }),
    );
    expect(JSON.parse(JSON.stringify(fixture.scrollMetadata))).toEqual(fixture.scrollMetadata);
  });
});
