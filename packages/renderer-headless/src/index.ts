import type { ResolvedUiFrame } from "@ludoweave/core";

/**
 * Result returned by the headless renderer after consuming a full frame.
 *
 * @public
 */
export interface HeadlessRenderResult {
  readonly rendererId: string;
  readonly frameId: number;
  readonly frame: ResolvedUiFrame;
}

/**
 * Minimal headless renderer interface for deterministic frame snapshots.
 *
 * @public
 */
export interface HeadlessRenderer {
  readonly id: string;
  render(frame: ResolvedUiFrame): HeadlessRenderResult;
  dispose(): void;
}

/**
 * Options for {@link createHeadlessRenderer}.
 *
 * @public
 */
export interface HeadlessRendererOptions {
  readonly id?: string;
}

/**
 * Creates a renderer that records frame consumption without touching DOM or canvas APIs.
 *
 * @public
 */
export function createHeadlessRenderer(options: HeadlessRendererOptions = {}): HeadlessRenderer {
  const id = options.id ?? "ludoweave.headless";
  let disposed = false;

  return {
    id,
    render(frame) {
      if (disposed) {
        throw new Error("HeadlessRenderer has been disposed.");
      }

      return {
        rendererId: id,
        frameId: frame.frameId,
        frame,
      };
    },
    dispose() {
      disposed = true;
    },
  };
}
