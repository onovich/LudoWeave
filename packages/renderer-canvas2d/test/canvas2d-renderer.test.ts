import {
  createClippedScrollContentFixture,
  createRealizedVirtualListFixture,
  createRendererConformanceFixture,
} from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import {
  canvas2DRendererConformancePolicy,
  createCanvas2DRenderer,
  traceCanvas2DActionHitTest,
  traceCanvas2DFocusGraph,
  traceCanvas2DScrollMetadata,
  traceCanvas2DTextInputOverlayCoordination,
  traceCanvas2DVirtualWindow,
  type Canvas2DContextLike,
  type Canvas2DRenderTrace,
} from "../src/index.js";
import {
  createVirtualWindowDiagnostic,
  normalizeFocusGraph,
  normalizeScrollMetadataFrame,
  normalizeVirtualWindowMetadataFrame,
} from "@ludoweave/core";

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
      "action.hit-test.trace",
      "focus-graph.trace",
      "scroll-metadata.trace",
      "virtual-window.trace",
      "text-input-overlay.coordination-trace",
    ]);
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("native.text-input");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("native.focus");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("native.scroll-state");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("action.dispatch");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("scroll.dispatch");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("collection.dispatch");
    expect(canvas2DRendererConformancePolicy.unsupported).toContain("selection.mutation");
    expect(canvas2DRendererConformancePolicy.fallbackPolicy).toContain(
      "Hosts pair Canvas2D paint with a DOM or platform input overlay for focus and actions.",
    );
  });

  it("consumes the shared frame while scroll metadata remains a conformance sidecar", () => {
    const fixture = createRendererConformanceFixture();
    const renderer = createCanvas2DRenderer({
      context: new FakeCanvas2DContext(),
    });
    const result = renderer.render(fixture.frame);

    expect(result.frame).toBe(fixture.frame);
    expect(fixture.scrollMetadata.containers[0]).toMatchObject({
      id: "pause-dialog-scroll",
      nodeId: "runtime.overlay/key:pause.dialog",
      offset: { x: 0, y: 84, revision: 2 },
    });
    expect(fixture.scrollVisibleContentBox).toEqual({ x: 0, y: 84, width: 400, height: 220 });
    expect(fixture.virtualWindow).toMatchObject({
      id: "quest-log-window",
      realizedRange: { startIndex: 2, endIndex: 4 },
      overscanRange: { startIndex: 1, endIndex: 5 },
    });
    expect(fixture.virtualWindowRealizedNodeIds).toEqual([
      "runtime.overlay/key:quest-log/key:quest:2",
      "runtime.overlay/key:quest-log/key:quest:3",
    ]);
    expect(JSON.stringify(result.trace)).not.toContain("scrollTop");
    expect(JSON.stringify(result.trace)).not.toContain("datasource");
    expect(JSON.stringify(result.trace)).not.toContain("dispatch");
  });

  it("traces an action target under a point without dispatching it", () => {
    const frame = createRendererConformanceFixture().frame;

    expect(traceCanvas2DActionHitTest(frame, { x: 530, y: 604 })).toEqual({
      kind: "action-hit-test",
      frameId: 3600,
      point: { x: 530, y: 604 },
      result: "target",
      target: {
        actionTargetId: "action.prompt.primary",
        nodeId: "runtime.overlay/key:prompt.primary",
        box: {
          x: 520,
          y: 596,
          width: 240,
          height: 48,
        },
        action: {
          type: "runtime.gameplay.interact",
          payload: {
            targetId: "switch_a",
          },
        },
        label: "Press E",
      },
    });
  });

  it("reports disabled targets without dispatching", () => {
    const fixture = createRendererConformanceFixture();
    const frame = {
      ...fixture.frame,
      actions: fixture.frame.actions.map((target) => ({
        ...target,
        disabled: true,
      })),
    };

    expect(traceCanvas2DActionHitTest(frame, { x: 530, y: 604 })).toMatchObject({
      kind: "action-hit-test",
      frameId: 3600,
      point: { x: 530, y: 604 },
      result: "disabled-target",
      target: {
        actionTargetId: "action.prompt.primary",
        disabled: true,
      },
    });
  });

  it("uses the last matching action as the topmost overlap target", () => {
    const fixture = createRendererConformanceFixture();
    const baseTarget = fixture.frame.actions[0];
    const frame = {
      ...fixture.frame,
      actions: [
        baseTarget,
        {
          ...baseTarget,
          id: "action.prompt.overlap",
          nodeId: "runtime.overlay/key:prompt.overlap",
          label: "Overlapping prompt",
          action: {
            type: "runtime.gameplay.inspect",
            payload: {
              targetId: "switch_b",
            },
          },
          box: {
            x: 528,
            y: 600,
            width: 120,
            height: 32,
          },
        },
      ],
    };

    expect(traceCanvas2DActionHitTest(frame, { x: 540, y: 610 })).toMatchObject({
      result: "target",
      target: {
        actionTargetId: "action.prompt.overlap",
        nodeId: "runtime.overlay/key:prompt.overlap",
        action: {
          type: "runtime.gameplay.inspect",
          payload: {
            targetId: "switch_b",
          },
        },
      },
    });
  });

  it("reports no-target and outside-viewport states", () => {
    const frame = createRendererConformanceFixture().frame;

    expect(traceCanvas2DActionHitTest(frame, { x: 16, y: 16 })).toEqual({
      kind: "action-hit-test",
      frameId: 3600,
      point: { x: 16, y: 16 },
      result: "no-target",
    });
    expect(traceCanvas2DActionHitTest(frame, { x: -1, y: 16 })).toEqual({
      kind: "action-hit-test",
      frameId: 3600,
      point: { x: -1, y: 16 },
      result: "outside-viewport",
    });
  });

  it("traces focusable geometry and action target ids without reading input", () => {
    const frame = createRendererConformanceFixture().frame;
    const graph = normalizeFocusGraph({
      scopeId: "pause.dialog",
      nodes: [
        {
          id: "prompt",
          nodeId: "runtime.overlay/key:prompt.primary",
          rect: { x: 520, y: 596, width: 240, height: 48 },
        },
        {
          id: "cancel",
          nodeId: "runtime.overlay/key:pause.dialog",
          rect: { x: 440, y: 238, width: 400, height: 220 },
          disabledReason: "modal-excluded",
        },
      ],
    });

    expect(traceCanvas2DFocusGraph(frame, graph)).toEqual({
      kind: "focus-graph-trace",
      frameId: 3600,
      scopeId: "pause.dialog",
      result: "targets",
      targets: [
        {
          focusId: "prompt",
          nodeId: "runtime.overlay/key:prompt.primary",
          scopeId: "pause.dialog",
          box: { x: 520, y: 596, width: 240, height: 48 },
          actionTargetId: "action.prompt.primary",
        },
        {
          focusId: "cancel",
          nodeId: "runtime.overlay/key:pause.dialog",
          scopeId: "pause.dialog",
          box: { x: 440, y: 238, width: 400, height: 220 },
          disabledReason: "modal-excluded",
        },
      ],
    });
    expect(JSON.stringify(traceCanvas2DFocusGraph(frame, graph))).not.toContain("dispatch");
    expect(JSON.stringify(traceCanvas2DFocusGraph(frame, graph))).not.toContain("KeyboardEvent");
    expect(JSON.stringify(traceCanvas2DFocusGraph(frame, graph))).not.toContain("Gamepad");
  });

  it("reports empty focus graph traces without owning focus state", () => {
    const frame = createRendererConformanceFixture().frame;

    expect(
      traceCanvas2DFocusGraph(frame, normalizeFocusGraph({ scopeId: "pause.dialog", nodes: [] })),
    ).toEqual({
      kind: "focus-graph-trace",
      frameId: 3600,
      scopeId: "pause.dialog",
      result: "no-target",
      targets: [],
    });
  });

  it("traces scroll geometry, visible content, offsets, and action target ids", () => {
    const fixture = createClippedScrollContentFixture();

    expect(traceCanvas2DScrollMetadata(fixture.frame, fixture.scrollMetadata)).toEqual({
      kind: "scroll-metadata-trace",
      frameId: 4600,
      result: "containers",
      containers: [
        {
          containerId: "quest-log-scroll",
          nodeId: "runtime.overlay/key:quest-log",
          contentRect: { x: 80, y: 120, width: 360, height: 640 },
          viewportRect: { x: 80, y: 120, width: 360, height: 220 },
          visibleContentBox: { x: 0, y: 180, width: 360, height: 220 },
          offset: { x: 0, y: 180, revision: 3 },
          maxOffset: { x: 0, y: 420 },
          actionTargetIds: ["action.quest.track-final-conduit"],
          diagnostics: [],
        },
      ],
    });
    expect(
      JSON.stringify(traceCanvas2DScrollMetadata(fixture.frame, fixture.scrollMetadata)),
    ).not.toContain("dispatch");
    expect(
      JSON.stringify(traceCanvas2DScrollMetadata(fixture.frame, fixture.scrollMetadata)),
    ).not.toContain("scrollTop");
  });

  it("reports no scroll containers without reading platform scroll state", () => {
    const fixture = createRendererConformanceFixture();

    expect(
      traceCanvas2DScrollMetadata(fixture.frame, normalizeScrollMetadataFrame({ containers: [] })),
    ).toEqual({
      kind: "scroll-metadata-trace",
      frameId: 3600,
      result: "no-container",
      containers: [],
    });
  });

  it("traces disabled, stale, missing capability, and empty scroll diagnostics", () => {
    const fixture = createRendererConformanceFixture();
    const trace = traceCanvas2DScrollMetadata(
      fixture.frame,
      normalizeScrollMetadataFrame({
        containers: [
          {
            id: "stale-empty-scroll",
            nodeId: "runtime.overlay/key:pause.dialog",
            contentRect: { x: 0, y: 0, width: 0, height: 0 },
            viewportRect: { x: 0, y: 0, width: 320, height: 160 },
            offset: { y: 24 },
            extent: { width: 0, height: 0 },
            hostCapability: { status: "missing", reason: "stale" },
            disabledReason: "stale",
          },
        ],
      }),
    );

    expect(trace.result).toBe("containers");
    expect(trace.containers[0]?.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_SCROLL_MISSING_HOST_CAPABILITY",
      "LW_SCROLL_STALE_CONTAINER",
      "LW_SCROLL_DISABLED",
      "LW_SCROLL_EMPTY_CONTAINER",
      "LW_SCROLL_OUT_OF_RANGE_OFFSET",
    ]);
  });

  it("traces virtual window geometry, range metadata, selection markers, and action targets", () => {
    const fixture = createRealizedVirtualListFixture();

    expect(
      traceCanvas2DVirtualWindow(
        fixture.frame,
        normalizeVirtualWindowMetadataFrame({
          activeWindowId: fixture.virtualWindow.id,
          windows: [fixture.virtualWindow],
        }),
      ),
    ).toEqual({
      kind: "virtual-window-trace",
      frameId: 4700,
      result: "windows",
      windows: [
        {
          windowId: "quest-log-window",
          nodeId: "runtime.overlay/key:quest-log",
          totalCount: 12,
          realizedRange: { startIndex: 4, endIndex: 7 },
          overscanRange: { startIndex: 3, endIndex: 9 },
          selection: { selectedKey: "quest:5", focusedKey: "quest:5", revision: 2 },
          realizedItems: [
            {
              nodeId: "runtime.overlay/key:quest-log/key:quest:4",
              itemKey: "quest:4",
              itemIndex: 4,
              box: { x: 92, y: 120, width: 396, height: 40 },
              actionTargetId: "action.quest:4.activate",
              selected: false,
              focused: false,
            },
            {
              nodeId: "runtime.overlay/key:quest-log/key:quest:5",
              itemKey: "quest:5",
              itemIndex: 5,
              box: { x: 92, y: 168, width: 396, height: 40 },
              actionTargetId: "action.quest:5.activate",
              selected: true,
              focused: true,
            },
            {
              nodeId: "runtime.overlay/key:quest-log/key:quest:6",
              itemKey: "quest:6",
              itemIndex: 6,
              box: { x: 92, y: 216, width: 396, height: 40 },
              actionTargetId: "action.quest:6.activate",
              selected: false,
              focused: false,
            },
          ],
          actionTargetIds: [
            "action.quest:4.activate",
            "action.quest:5.activate",
            "action.quest:6.activate",
          ],
          diagnostics: [],
        },
      ],
    });
    expect(
      JSON.stringify(
        traceCanvas2DVirtualWindow(fixture.frame, { windows: [fixture.virtualWindow] }),
      ),
    ).not.toContain("dispatch");
    expect(
      JSON.stringify(
        traceCanvas2DVirtualWindow(fixture.frame, { windows: [fixture.virtualWindow] }),
      ),
    ).not.toContain("datasource");
  });

  it("reports no virtual windows and virtual window diagnostics without owning selection", () => {
    const fixture = createRealizedVirtualListFixture();

    expect(traceCanvas2DVirtualWindow(fixture.frame, { windows: [] })).toEqual({
      kind: "virtual-window-trace",
      frameId: 4700,
      result: "no-window",
      windows: [],
    });

    const diagnosticTrace = traceCanvas2DVirtualWindow(fixture.frame, {
      windows: [
        {
          ...fixture.virtualWindow,
          selection: { selectedKey: "quest:removed" },
          diagnostics: [
            createVirtualWindowDiagnostic("removedItem", {
              windowId: fixture.virtualWindow.id,
              itemKey: "quest:removed",
            }),
          ],
        },
      ],
    });

    expect(diagnosticTrace.result).toBe("windows");
    expect(diagnosticTrace.windows[0]?.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "LW_VIRTUAL_WINDOW_REMOVED_ITEM",
      "LW_VIRTUAL_WINDOW_STALE_SELECTION",
    ]);
    expect(JSON.stringify(diagnosticTrace)).not.toContain("selection.mutation");
  });

  it("rejects non-finite hit-test points", () => {
    const frame = createRendererConformanceFixture().frame;

    expect(() => traceCanvas2DActionHitTest(frame, { x: Number.NaN, y: 16 })).toThrow(
      /point\.x must be a finite number/,
    );
  });

  it("coordinates editable overlay data from frame nodes to the host bridge request", () => {
    const frame = createEditableTextOverlayFrame();

    expect(
      traceCanvas2DTextInputOverlayCoordination(frame, {
        overlayId: "overlay.pause-player-name",
        nodeId: "runtime.overlay/key:pause.player-name",
        value: "Ada",
        selection: { start: 3, end: 3, direction: "none" },
      }),
    ).toEqual({
      kind: "text-input-overlay-coordination",
      frameId: 4200,
      nodeId: "runtime.overlay/key:pause.player-name",
      result: "request",
      request: {
        overlayId: "overlay.pause-player-name",
        nodeId: "runtime.overlay/key:pause.player-name",
        box: { x: 440, y: 314, width: 400, height: 48 },
        value: "Ada",
        selection: { start: 3, end: 3, direction: "none" },
        placeholder: "Player name",
        inputMode: "text",
        multiline: false,
        ariaLabel: "Player name",
        themeToken: "runtime-ui.dialog.controls",
        commitAction: {
          type: "runtime.input.commit",
          payload: { field: "player-name" },
        },
        cancelAction: {
          type: "runtime.input.cancel",
          payload: { field: "player-name" },
        },
        diagnosticPath: ["frame", "nodes", "runtime.overlay/key:pause.player-name"],
      },
      diagnostics: [],
    });
  });

  it("keeps Canvas2D overlay coordination out of host input lifecycle ownership", () => {
    const frame = createEditableTextOverlayFrame();
    const trace = traceCanvas2DTextInputOverlayCoordination(frame, {
      overlayId: "overlay.pause-player-name",
      nodeId: "runtime.overlay/key:pause.player-name",
      value: "Ada",
    });

    expect(trace.kind).toBe("text-input-overlay-coordination");
    expect(Object.keys(trace)).not.toContain("events");
    expect(JSON.stringify(trace)).not.toContain('"kind":"open"');
    expect(JSON.stringify(trace)).not.toContain('"kind":"focus"');
    expect(JSON.stringify(trace)).not.toContain('"kind":"close"');
  });

  it("diagnoses missing and disabled editable overlay targets", () => {
    const frame = createEditableTextOverlayFrame();

    expect(
      traceCanvas2DTextInputOverlayCoordination(frame, {
        overlayId: "overlay.missing",
        nodeId: "runtime.overlay/key:missing",
        value: "",
      }),
    ).toMatchObject({
      result: "missing-node",
      diagnostics: [
        {
          code: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_MISSING_NODE",
          path: ["renderer-canvas2d", "text-input-overlay", "runtime.overlay/key:missing"],
        },
      ],
    });

    expect(
      traceCanvas2DTextInputOverlayCoordination(
        createEditableTextOverlayFrame({ disabled: true }),
        {
          overlayId: "overlay.pause-player-name",
          nodeId: "runtime.overlay/key:pause.player-name",
          value: "",
        },
      ),
    ).toMatchObject({
      result: "disabled-target",
      diagnostics: [
        {
          code: "LW_CANVAS2D_TEXT_INPUT_OVERLAY_DISABLED_TARGET",
        },
      ],
    });
  });
});

function createEditableTextOverlayFrame(options: { readonly disabled?: boolean } = {}) {
  const fixture = createRendererConformanceFixture();
  const editableNode = {
    id: "runtime.overlay/key:pause.player-name",
    path: ["runtime.overlay", "key:pause.player-name"],
    type: "text-input",
    key: "pause.player-name",
    parentId: "runtime.overlay",
    index: 3,
    box: { x: 440, y: 314, width: 400, height: 48 },
    props: {
      placeholder: "Player name",
      inputMode: "text",
      multiline: false,
      ...(options.disabled === true ? { disabled: true } : {}),
      commitAction: {
        type: "runtime.input.commit",
        payload: { field: "player-name" },
      },
      cancelAction: {
        type: "runtime.input.cancel",
        payload: { field: "player-name" },
      },
    },
    style: {
      themeToken: "runtime-ui.dialog.controls",
    },
  };

  return {
    ...fixture.frame,
    frameId: 4200,
    nodes: [...fixture.frame.nodes, editableNode],
    semantics: [
      ...fixture.frame.semantics,
      {
        id: "semantics.pause.player-name",
        nodeId: editableNode.id,
        role: "text",
        parentId: "semantics.pause.dialog",
        label: "Player name",
        disabled: options.disabled,
      },
    ],
  };
}

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
