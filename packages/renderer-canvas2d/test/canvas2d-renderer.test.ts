import { createRendererConformanceFixture } from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import {
  canvas2DRendererConformancePolicy,
  createCanvas2DRenderer,
  type Canvas2DContextLike,
  type Canvas2DRenderTrace,
} from "../src/index.js";

describe("Canvas2D renderer spike", () => {
  it("consumes resolved frames and draws clear, box, and text commands", () => {
    const fixture = createRendererConformanceFixture();
    const context = new FakeCanvas2DContext();
    const renderer = createCanvas2DRenderer({
      id: "canvas2d.spike",
      context,
    });
    const result = renderer.render(fixture.frame);

    expect(result.rendererId).toBe("canvas2d.spike");
    expect(result.frame).toBe(fixture.frame);
    expect(result.trace).toEqual<readonly Canvas2DRenderTrace[]>([
      {
        kind: "clear",
        box: {
          x: 0,
          y: 0,
          width: 1280,
          height: 720,
        },
      },
      {
        kind: "box",
        paintId: "paint.prompt.primary.box",
        nodeId: "runtime.overlay/key:prompt.primary",
        box: {
          x: 520,
          y: 596,
          width: 240,
          height: 48,
        },
        fill: "#111827",
        radius: 8,
      },
      {
        kind: "text",
        paintId: "paint.subtitle.primary.text",
        nodeId: "runtime.overlay/key:subtitle.primary",
        box: {
          x: 430,
          y: 552,
          width: 420,
          height: 32,
        },
        text: "The gate hums softly.",
        color: "#f9fafb",
        fontSize: 18,
      },
      {
        kind: "box",
        paintId: "paint.pause.dialog.box",
        nodeId: "runtime.overlay/key:pause.dialog",
        box: {
          x: 440,
          y: 238,
          width: 400,
          height: 220,
        },
        fill: "#030712",
        stroke: "#64748b",
        radius: 8,
      },
    ]);
    expect(context.calls).toEqual([
      "save",
      "clearRect 0 0 1280 720",
      "fillStyle #111827",
      "fillRect 520 596 240 48",
      "fillStyle #f9fafb",
      "font 18px sans-serif",
      "textBaseline top",
      "fillText The gate hums softly. 430 552 420",
      "fillStyle #030712",
      "fillRect 440 238 400 220",
      "strokeStyle #64748b",
      "strokeRect 440 238 400 220",
      "restore",
    ]);
  });

  it("rejects rendering after disposal", () => {
    const renderer = createCanvas2DRenderer({
      context: new FakeCanvas2DContext(),
    });

    renderer.dispose();

    expect(() => renderer.render(createRendererConformanceFixture().frame)).toThrow(/disposed/);
  });

  it("uses rounded rect paths when the context supports them", () => {
    const context = new RoundedPathCanvas2DContext();
    const renderer = createCanvas2DRenderer({
      context,
    });

    renderer.render(createRendererConformanceFixture().frame);

    expect(context.calls).toContain("beginPath");
    expect(context.calls).toContain("roundRect 520 596 240 48 8");
    expect(context.calls).toContain("roundRect 440 238 400 220 8");
    expect(context.calls).toContain("fill");
    expect(context.calls).toContain("stroke");
    expect(context.calls).not.toContain("fillRect 520 596 240 48");
    expect(context.calls).not.toContain("strokeRect 440 238 400 220");
  });

  it("records the supported conformance subset and fallback policy", () => {
    expect(canvas2DRendererConformancePolicy.supported).toEqual([
      "frame.clear",
      "paint.box.fill",
      "paint.box.stroke",
      "paint.text.fill",
      "resolved-frame.consume",
    ]);
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("input.hit-testing");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("native.focus");
    expect(canvas2DRendererConformancePolicy.fallbackPolicy).toContain(
      "Hosts pair Canvas2D paint with a DOM or platform input overlay for focus and actions.",
    );
  });
});

class FakeCanvas2DContext implements Canvas2DContextLike {
  readonly calls: string[] = [];
  readonly canvas = {
    width: 1280,
    height: 720,
  };

  private currentFillStyle = "";
  private currentStrokeStyle = "";
  private currentFont = "";
  private currentTextBaseline: Canvas2DContextLike["textBaseline"] = "alphabetic";

  get fillStyle(): string {
    return this.currentFillStyle;
  }

  set fillStyle(value: string) {
    this.currentFillStyle = value;
    this.calls.push(`fillStyle ${value}`);
  }

  get strokeStyle(): string {
    return this.currentStrokeStyle;
  }

  set strokeStyle(value: string) {
    this.currentStrokeStyle = value;
    this.calls.push(`strokeStyle ${value}`);
  }

  get font(): string {
    return this.currentFont;
  }

  set font(value: string) {
    this.currentFont = value;
    this.calls.push(`font ${value}`);
  }

  get textBaseline(): Canvas2DContextLike["textBaseline"] {
    return this.currentTextBaseline;
  }

  set textBaseline(value: Canvas2DContextLike["textBaseline"]) {
    this.currentTextBaseline = value;
    this.calls.push(`textBaseline ${value}`);
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    this.calls.push(`clearRect ${x} ${y} ${width} ${height}`);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.calls.push(`fillRect ${x} ${y} ${width} ${height}`);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.calls.push(`strokeRect ${x} ${y} ${width} ${height}`);
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.calls.push(`fillText ${text} ${x} ${y} ${maxWidth ?? "none"}`);
  }

  save(): void {
    this.calls.push("save");
  }

  restore(): void {
    this.calls.push("restore");
  }
}

class RoundedPathCanvas2DContext extends FakeCanvas2DContext {
  beginPath(): void {
    this.calls.push("beginPath");
  }

  roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.calls.push(`roundRect ${x} ${y} ${width} ${height} ${radius}`);
  }

  fill(): void {
    this.calls.push("fill");
  }

  stroke(): void {
    this.calls.push("stroke");
  }
}
