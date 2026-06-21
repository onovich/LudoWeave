import { describe, expect, it } from "vitest";
import type { ResolvedUiFrame } from "@ludoweave/core";
import { createRendererConformanceFixture } from "@ludoweave/testing";

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

  it("uses native button semantics and dialog roles", () => {
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
          id: "root/key:button",
          path: ["root", "key:button"],
          type: "button",
          key: "button",
          index: 0,
          box: { x: 0, y: 0, width: 120, height: 40 },
          props: {
            label: "Confirm",
            disabled: true,
          },
        },
        {
          id: "root/key:dialog",
          path: ["root", "key:dialog"],
          type: "dialog",
          key: "dialog",
          index: 1,
          box: { x: 10, y: 10, width: 300, height: 200 },
          props: {
            title: "Pause",
            modal: true,
          },
        },
      ],
      semantics: [
        {
          id: "semantics.button",
          nodeId: "root/key:button",
          role: "button",
          label: "Confirm",
          disabled: true,
        },
        {
          id: "semantics.dialog",
          nodeId: "root/key:dialog",
          role: "dialog",
          label: "Pause",
        },
      ],
    });

    expect(root.requireChild(0).attributesAsObject()).toEqual({
      type: "button",
      "aria-label": "Confirm",
      disabled: "",
    });
    expect(root.requireChild(1).attributesAsObject()).toEqual({
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Pause",
    });
  });

  it("exposes theme tokens and non-native button semantics", () => {
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
          id: "root/key:objective.delivery",
          path: ["root", "key:objective.delivery"],
          type: "objective",
          key: "objective.delivery",
          index: 0,
          box: { x: 0, y: 0, width: 320, height: 96 },
          props: {
            title: "Deliver the cell",
            body: "Bring the energy cell to the gate.",
          },
          style: {
            themeToken: "runtime-ui.objective.root",
          },
        },
      ],
      semantics: [
        {
          id: "semantics.objective.delivery",
          nodeId: "root/key:objective.delivery",
          role: "button",
          label: "Deliver the cell",
        },
      ],
    });

    const element = root.requireChild(0);
    expect(element.dataset).toEqual({
      ludoweaveNodeId: "root/key:objective.delivery",
      ludoweaveNodeType: "objective",
      ludoweaveThemeToken: "runtime-ui.objective.root",
    });
    expect(element.attributesAsObject()).toEqual({
      role: "button",
      tabindex: "0",
      "aria-label": "Deliver the cell",
    });
    expect(element.textContent).toBe("Deliver the cell\nBring the energy cell to the gate.");
  });

  it("renders text with textContent and never innerHTML", () => {
    const document = new FakeDocument();
    const root = document.createElement("div");
    const renderer = mountDomRenderer({
      root: asDomRoot(root),
      document: asDocument(document),
    });
    const text = "<img src=x onerror=alert(1)>";

    renderer.render({
      ...createFrame(),
      nodes: [
        {
          id: "root/key:subtitle",
          path: ["root", "key:subtitle"],
          type: "text",
          key: "subtitle",
          index: 0,
          box: { x: 0, y: 0, width: 240, height: 24 },
          props: {
            text,
          },
        },
      ],
    });

    const element = root.requireChild(0);
    expect(element.textContent).toBe(text);
    expect(element.innerHtmlWriteCount).toBe(0);
  });

  it("preserves the shared renderer conformance fixture boxes", () => {
    const document = new FakeDocument();
    const root = document.createElement("div");
    const renderer = mountDomRenderer({
      root: asDomRoot(root),
      document: asDocument(document),
    });
    const fixture = createRendererConformanceFixture();

    renderer.render(fixture.frame);

    for (const [index, expected] of fixture.expectedDomNodes.entries()) {
      const element = root.requireChild(index);
      expect(element.tagName).toBe(expected.tagName);
      expect(element.dataset.ludoweaveNodeId).toBe(expected.nodeId);
      expect(element.style).toMatchObject({
        position: "absolute",
        left: `${expected.box.x}px`,
        top: `${expected.box.y}px`,
        width: `${expected.box.width}px`,
        height: `${expected.box.height}px`,
      });

      if (expected.textContent !== undefined) {
        expect(element.textContent).toBe(expected.textContent);
      }

      if (expected.attributes !== undefined) {
        expect(element.attributesAsObject()).toEqual(expected.attributes);
      }
    }
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
  innerHtmlWriteCount = 0;
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

  set innerHTML(_value: string) {
    this.innerHtmlWriteCount += 1;
    throw new Error("innerHTML must not be used.");
  }

  get innerHTML(): string {
    return "";
  }

  attributesAsObject(): Record<string, string> {
    return Object.fromEntries(this.attributes.entries());
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
