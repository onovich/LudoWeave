import type { ResolvedUiFrame } from "@ludoweave/core";

/**
 * Minimal DOM root contract used by the renderer.
 *
 * @public
 */
export interface DomRendererRoot {
  replaceChildren(...nodes: Node[]): void;
}

/**
 * Result returned after a DOM renderer consumes a frame.
 *
 * @public
 */
export interface DomRenderResult {
  readonly rendererId: string;
  readonly frameId: number;
  readonly frame: ResolvedUiFrame;
  readonly mounted: boolean;
}

/**
 * DOM renderer lifecycle interface.
 *
 * @public
 */
export interface DomRenderer {
  readonly id: string;
  readonly root: DomRendererRoot;
  render(frame: ResolvedUiFrame): DomRenderResult;
  dispose(): void;
}

/**
 * Options for {@link mountDomRenderer}.
 *
 * @public
 */
export interface DomRendererOptions {
  readonly root: DomRendererRoot;
  readonly id?: string;
}

/**
 * Mounts a DOM renderer that consumes complete ResolvedUiFrame snapshots.
 *
 * @public
 */
export function mountDomRenderer(options: DomRendererOptions): DomRenderer {
  const id = options.id ?? "ludoweave.dom";
  let disposed = false;

  return {
    id,
    root: options.root,
    render(frame) {
      if (disposed) {
        throw new Error("DomRenderer has been disposed.");
      }

      return {
        rendererId: id,
        frameId: frame.frameId,
        frame,
        mounted: true,
      };
    },
    dispose() {
      if (!disposed) {
        options.root.replaceChildren();
        disposed = true;
      }
    },
  };
}
