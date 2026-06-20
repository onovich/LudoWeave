import { describe, expect, it } from "vitest";
import type { ResolvedUiFrame } from "@ludoweave/core";

import { mountDomRenderer, type DomRendererRoot } from "../src/index.js";

describe("mountDomRenderer", () => {
  it("mounts, consumes ResolvedUiFrame snapshots, and disposes", () => {
    const document = new FakeDocument();
    const root = document.createElement("div");
    const renderer = mountDomRenderer({
      id: "test.dom",
      root: asDomRoot(root),
      document: asDocument(document),
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
    expect(root.replaceCount).toBe(1);

    renderer.dispose();
    expect(root.children).toHaveLength(0);
    expect(root.replaceCount).toBe(2);
    renderer.dispose();
    expect(root.replaceCount).toBe(2);
    expect(() => renderer.render(frame)).toThrow(/disposed/);
  });

  it("applies core layout boxes as absolute DOM styles", () => {
    const document = new FakeDocument();
    const root = document.createElement("div");
    const renderer = mountDomRenderer({
      root: asDomRoot(root),
      document: asDocument(document),
    });

    renderer.render({
      ...createFrame(),
      nodes: [
        {
          id: "root/key:prompt",
          path: ["root", "key:prompt"],
          type: "button",
          key: "prompt",
          index: 0,
          box: {
            x: 10,
            y: 20,
            width: 240,
            height: 48,
          },
          props: {
            label: "Press E",
          },
        },
      ],
    });

    const element = root.requireChild(0);
    expect(element.tagName).toBe("button");
    expect(element.dataset).toEqual({
      ludoweaveNodeId: "root/key:prompt",
      ludoweaveNodeType: "button",
    });
    expect(element.style).toMatchObject({
      position: "absolute",
      left: "10px",
      top: "20px",
      width: "240px",
      height: "48px",
    });
    expect(element.textContent).toBe("Press E");
  });
});

class FakeDocument {
  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName, this);
  }
}

class FakeElement {
  readonly style: Partial<CSSStyleDeclaration> = {};
  readonly dataset: Record<string, string> = {};
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  textContent: string | null = null;
  replaceCount = 0;

  constructor(
    readonly tagName: string,
    readonly ownerDocument: FakeDocument,
  ) {}

  replaceChildren(...nodes: FakeElement[]): void {
    this.children.splice(0, this.children.length, ...nodes);
    this.replaceCount += 1;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  requireChild(index: number): FakeElement {
    const child = this.children[index];
    if (child === undefined) {
      throw new TypeError(`Missing child ${index}.`);
    }
    return child;
  }
}

type FakeDomRoot = FakeElement & DomRendererRoot;

function asDomRoot(element: FakeElement): FakeDomRoot {
  return element as unknown as FakeDomRoot;
}

function asDocument(document: FakeDocument): Document {
  return document as unknown as Document;
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
