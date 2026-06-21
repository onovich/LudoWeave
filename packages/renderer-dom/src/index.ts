import type { ResolvedNode, ResolvedRect, ResolvedUiFrame, SemanticNode } from "@ludoweave/core";

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
      const semanticsByNodeId = createSemanticMap(frame.semantics);
      const elements = frame.nodes.map((node) =>
        renderResolvedNode(documentRef, node, semanticsByNodeId.get(node.id)),
      );
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

function renderResolvedNode(
  documentRef: Document,
  node: ResolvedNode,
  semantics: SemanticNode | undefined,
): HTMLElement {
  const element = documentRef.createElement(getTagName(node));
  element.dataset.ludoweaveNodeId = node.id;
  element.dataset.ludoweaveNodeType = node.type;
  applyThemeToken(element, node);
  applyBox(element, node.box);
  applySemantics(element, node, semantics);

  const text = getNodeText(node);
  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createSemanticMap(semantics: readonly SemanticNode[]): Map<string, SemanticNode> {
  const map = new Map<string, SemanticNode>();
  for (const semantic of semantics) {
    map.set(semantic.nodeId, semantic);
  }
  return map;
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

function applyThemeToken(element: HTMLElement, node: ResolvedNode): void {
  const themeToken = node.style?.themeToken;
  if (typeof themeToken === "string") {
    element.dataset.ludoweaveThemeToken = themeToken;
  }
}

function applySemantics(
  element: HTMLElement,
  node: ResolvedNode,
  semantics: SemanticNode | undefined,
): void {
  if (node.type === "button" || node.type === "pressable") {
    element.setAttribute("type", "button");
  }

  if (semantics?.role === "dialog") {
    element.setAttribute("role", "dialog");
  }

  if (semantics?.role === "button" && node.type !== "button" && node.type !== "pressable") {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
  }

  if (node.props?.modal === true) {
    element.setAttribute("aria-modal", "true");
  }

  const label = getSemanticLabel(node, semantics);
  if (label !== undefined && node.type !== "text") {
    element.setAttribute("aria-label", label);
  }

  if (node.props?.disabled === true || semantics?.disabled === true) {
    if (node.type === "button" || node.type === "pressable") {
      element.setAttribute("disabled", "");
    } else {
      element.setAttribute("aria-disabled", "true");
    }
  }
}

function getSemanticLabel(
  node: ResolvedNode,
  semantics: SemanticNode | undefined,
): string | undefined {
  if (semantics?.label !== undefined) {
    return semantics.label;
  }

  const label = node.props?.label;
  if (typeof label === "string") {
    return label;
  }

  const title = node.props?.title;
  if (typeof title === "string") {
    return title;
  }

  return undefined;
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

  const title = node.props?.title;
  if (typeof title === "string") {
    const body = node.props?.body;
    return typeof body === "string" ? `${title}\n${body}` : title;
  }

  return undefined;
}
