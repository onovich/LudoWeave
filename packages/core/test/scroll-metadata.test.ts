import { describe, expect, it } from "vitest";

import {
  normalizeScrollContainerMetadata,
  normalizeScrollMetadataFrame,
} from "../src/scroll-metadata.js";

describe("scroll container metadata", () => {
  it("normalizes serializable scroll container metadata", () => {
    const metadata = normalizeScrollContainerMetadata({
      id: " quest-log ",
      nodeId: "node.quest-log",
      contentRect: { x: 24, y: 96, width: 480, height: 960 },
      viewportRect: { x: 24, y: 96, width: 480, height: 320 },
      axis: "y",
      offset: { x: 0, y: 128, revision: 7 },
      extent: { width: 480, height: 960 },
      hostCapability: { status: "available" },
    });

    expect(metadata).toEqual({
      id: "quest-log",
      nodeId: "node.quest-log",
      contentRect: { x: 24, y: 96, width: 480, height: 960 },
      viewportRect: { x: 24, y: 96, width: 480, height: 320 },
      axis: "y",
      offset: { x: 0, y: 128, revision: 7 },
      extent: { width: 480, height: 960 },
      hostCapability: { status: "available" },
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("normalizes a scroll metadata frame with active and restore references", () => {
    const metadata = normalizeScrollMetadataFrame({
      activeContainerId: "objective-panel",
      restoreContainerId: "dialog-copy",
      containers: [
        {
          id: "objective-panel",
          contentRect: { x: 64, y: 128, width: 360, height: 720 },
          viewportRect: { x: 64, y: 128, width: 360, height: 240 },
          offset: { y: 120 },
          extent: { width: 360, height: 720 },
        },
        {
          id: "dialog-copy",
          contentRect: { x: 480, y: 320, width: 420, height: 420 },
          viewportRect: { x: 480, y: 320, width: 420, height: 180 },
          axis: "both",
          offset: { x: 12, y: 36 },
          hostCapability: { status: "disabled", reason: "host-disabled" },
          disabledReason: "host-disabled",
        },
      ],
    });

    expect(metadata).toEqual({
      containers: [
        {
          id: "objective-panel",
          nodeId: "objective-panel",
          contentRect: { x: 64, y: 128, width: 360, height: 720 },
          viewportRect: { x: 64, y: 128, width: 360, height: 240 },
          axis: "y",
          offset: { x: 0, y: 120 },
          extent: { width: 360, height: 720 },
          hostCapability: { status: "available" },
        },
        {
          id: "dialog-copy",
          nodeId: "dialog-copy",
          contentRect: { x: 480, y: 320, width: 420, height: 420 },
          viewportRect: { x: 480, y: 320, width: 420, height: 180 },
          axis: "both",
          offset: { x: 12, y: 36 },
          extent: { width: 420, height: 420 },
          hostCapability: { status: "disabled", reason: "host-disabled" },
          disabledReason: "host-disabled",
        },
      ],
      activeContainerId: "objective-panel",
      restoreContainerId: "dialog-copy",
    });
    expect(JSON.parse(JSON.stringify(metadata))).toEqual(metadata);
  });

  it("rejects platform-like geometry, duplicate ids, missing references, and invalid capability", () => {
    class PlatformRect {
      x = 0;
      y = 0;
      width = 100;
      height = 24;
    }

    expect(() =>
      normalizeScrollContainerMetadata({
        id: "panel",
        contentRect: new PlatformRect(),
        viewportRect: { x: 0, y: 0, width: 100, height: 24 },
      }),
    ).toThrow(/contentRect must be a plain object/);

    expect(() =>
      normalizeScrollMetadataFrame({
        containers: [
          {
            id: "panel",
            contentRect: { x: 0, y: 0, width: 100, height: 200 },
            viewportRect: { x: 0, y: 0, width: 100, height: 100 },
          },
          {
            id: "panel",
            contentRect: { x: 0, y: 0, width: 100, height: 300 },
            viewportRect: { x: 0, y: 0, width: 100, height: 100 },
          },
        ],
      }),
    ).toThrow(/must be unique/);

    expect(() =>
      normalizeScrollMetadataFrame({
        activeContainerId: "missing",
        containers: [
          {
            id: "panel",
            contentRect: { x: 0, y: 0, width: 100, height: 200 },
            viewportRect: { x: 0, y: 0, width: 100, height: 100 },
          },
        ],
      }),
    ).toThrow(/activeContainerId/);

    expect(() =>
      normalizeScrollContainerMetadata({
        id: "panel",
        contentRect: { x: 0, y: 0, width: 100, height: 200 },
        viewportRect: { x: 0, y: 0, width: 100, height: 100 },
        hostCapability: { status: "callback-required" as never },
      }),
    ).toThrow(/hostCapability.status/);
  });
});
