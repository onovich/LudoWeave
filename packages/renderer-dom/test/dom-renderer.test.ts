import { describe, expect, it } from "vitest";
import type { ResolvedUiFrame } from "@ludoweave/core";

import { mountDomRenderer, type DomRendererRoot } from "../src/index.js";

describe("mountDomRenderer", () => {
  it("mounts, consumes ResolvedUiFrame snapshots, and disposes", () => {
    const root = new FakeRoot();
    const renderer = mountDomRenderer({
      id: "test.dom",
      root,
    });
    const frame = createFrame();

    expect(renderer.id).toBe("test.dom");
    expect(renderer.root).toBe(root);
    expect(renderer.render(frame)).toEqual({
      rendererId: "test.dom",
      frameId: 1,
      frame,
      mounted: true,
    });

    renderer.dispose();
    expect(root.clearCount).toBe(1);
    renderer.dispose();
    expect(root.clearCount).toBe(1);
    expect(() => renderer.render(frame)).toThrow(/disposed/);
  });
});

class FakeRoot implements DomRendererRoot {
  clearCount = 0;

  replaceChildren(...nodes: Node[]): void {
    expect(nodes).toHaveLength(0);
    this.clearCount += 1;
  }
}

function createFrame(): ResolvedUiFrame {
  return {
    frameId: 1,
    viewport: {
      width: 320,
      height: 180,
      devicePixelRatio: 1,
    },
    nodes: [],
    paint: [],
    semantics: [],
    actions: [],
    diagnostics: [],
  };
}
