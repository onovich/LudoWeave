import { describe, expect, it } from "vitest";

import { createRealizedVirtualListFixture } from "../src/virtual-list-fixture.js";

describe("realized virtual list fixture", () => {
  it("models host-selected realized items as ordinary resolved nodes", () => {
    const fixture = createRealizedVirtualListFixture();

    expect(fixture.virtualWindow).toMatchObject({
      id: "quest-log-window",
      itemKeyNamespace: "quest",
      totalCount: 12,
      realizedRange: { startIndex: 4, endIndex: 7 },
      overscanRange: { startIndex: 3, endIndex: 9 },
      selection: {
        selectedKey: "quest:5",
        focusedKey: "quest:5",
        revision: 2,
      },
    });
    expect(fixture.realizedItems.map((item) => item.key)).toEqual([
      "quest:4",
      "quest:5",
      "quest:6",
    ]);
    expect(fixture.frame.nodes.map((node) => node.id)).toContain(
      "runtime.overlay/key:quest-log/key:quest:5",
    );
    expect(JSON.stringify(fixture.frame)).not.toContain("collectionData");
    expect(JSON.stringify(fixture.frame)).not.toContain("datasource");
    expect(JSON.stringify(fixture.frame)).not.toContain("recyclingPool");
  });

  it("keeps virtual window metadata as a JSON-only sidecar", () => {
    const fixture = createRealizedVirtualListFixture();

    expect(JSON.parse(JSON.stringify(fixture.virtualWindow))).toEqual(fixture.virtualWindow);
    expect(fixture.note).toBe("host-selected-realized-items-no-datasource-or-dom-recycling");
  });
});
