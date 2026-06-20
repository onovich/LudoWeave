import type { ResolvedNode, ResolvedRect, ResolvedUiFrame } from "@ludoweave/core";

/**
 * Minimal DOM root contract used by the renderer.
 *
 * @public
 */
export type DomRendererRoot = HTMLElement;

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
  readonly document?: Document;
  readonly id?: string;
}

/**
 * Mounts a DOM renderer that consumes complete ResolvedUiFrame snapshots.
 *
 * @public
 */
export function mountDomRenderer(options: DomRendererOptions): DomRenderer {
  const id = options.id ?? "ludoweave.dom";
  const documentRef = options.document ?? options.root.ownerDocument;
  let disposed = false;

  return {
    id,
    root: options.root,
    render(frame) {
      if (disposed) {
        throw new Error("DomRenderer has been disposed.");
      }
      const elements = frame.nodes.map((node) => renderResolvedNode(documentRef, node));
      options.root.replaceChildren(...elements);

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

function renderResolvedNode(documentRef: Document, node: ResolvedNode): HTMLElement {
  const element = documentRef.createElement(getTagName(node));
  element.dataset.ludoweaveNodeId = node.id;
  element.dataset.ludoweaveNodeType = node.type;
  applyBox(element, node.box);

  const text = getNodeText(node);
  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function getTagName(node: ResolvedNode): keyof HTMLElementTagNameMap {
  if (node.type === "button" || node.type === "pressable") {
    return "button";
  }

  if (node.type === "text") {
    return "span";
  }

  if (node.type === "dialog") {
    return "section";
  }

  return "div";
}

function applyBox(element: HTMLElement, box: ResolvedRect): void {
  element.style.position = "absolute";
  element.style.left = `${box.x}px`;
  element.style.top = `${box.y}px`;
  element.style.width = `${box.width}px`;
  element.style.height = `${box.height}px`;
}

function getNodeText(node: ResolvedNode): string | undefined {
  const text = node.props?.text;
  if (typeof text === "string") {
    return text;
  }

  const label = node.props?.label;
  if (typeof label === "string") {
    return label;
  }

  return undefined;
}
