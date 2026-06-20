import type { ActionRef } from "./action-ref.js";
import type { UiDiagnostic } from "./diagnostics.js";
import type { JsonValue } from "./json-value.js";
import type { UiNodePath } from "./tree-normalize.js";
import type { UiStyle } from "./ui-node.js";

/**
 * Resolved rectangle in CSS pixel units before renderer-specific scaling.
 *
 * @public
 */
export interface ResolvedRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Safe area insets supplied by the host viewport.
 *
 * @public
 */
export interface ResolvedSafeArea {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/**
 * Stable viewport metadata used for layout and renderer conformance.
 *
 * @public
 */
export interface ResolvedViewport {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio: number;
  readonly safeArea?: ResolvedSafeArea;
}

/**
 * A normalized node after layout resolution.
 *
 * @public
 */
export interface ResolvedNode {
  /**
   * Stable id derived from the normalized tree path.
   */
  readonly id: string;
  /**
   * Stable root-to-node path.
   */
  readonly path: UiNodePath;
  /**
   * Source node type.
   */
  readonly type: string;
  /**
   * Optional author-provided stable identity within its sibling list.
   */
  readonly key?: string;
  /**
   * Parent resolved node id when this is not the root.
   */
  readonly parentId?: string;
  /**
   * Sibling index after child filtering.
   */
  readonly index: number;
  /**
   * Child resolved node ids in normalized order.
   */
  readonly children?: readonly string[];
  /**
   * Core-owned layout box consumed by renderers.
   */
  readonly box: ResolvedRect;
  /**
   * Serializable source props copied through for renderer behavior decisions.
   */
  readonly props?: Readonly<Record<string, JsonValue>>;
  /**
   * Serializable v0.1 style/layout subset copied through after resolution.
   */
  readonly style?: UiStyle;
  /**
   * Optional host-owned action target associated with this node.
   */
  readonly action?: ActionRef;
}

/**
 * Base fields shared by renderer paint commands.
 *
 * @public
 */
export interface RenderCommandBase {
  readonly id: string;
  readonly nodeId: string;
  readonly box: ResolvedRect;
}

/**
 * Draws a filled or stroked rectangular box.
 *
 * @public
 */
export interface BoxRenderCommand extends RenderCommandBase {
  readonly kind: "box";
  readonly fill?: string;
  readonly stroke?: string;
  readonly radius?: number;
}

/**
 * Draws a text run resolved by the core layout/text pipeline.
 *
 * @public
 */
export interface TextRenderCommand extends RenderCommandBase {
  readonly kind: "text";
  readonly text: string;
  readonly color?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}

/**
 * Renderer command emitted by core resolution and consumed by renderers.
 *
 * @public
 */
export type RenderCommand = BoxRenderCommand | TextRenderCommand;

/**
 * v0.1 semantic role set derived from the same tree as paint commands.
 *
 * @public
 */
export type SemanticRole = "generic" | "surface" | "text" | "button" | "dialog";

/**
 * Semantic tree node used for a11y snapshots and renderer conformance.
 *
 * @public
 */
export interface SemanticNode {
  readonly id: string;
  readonly nodeId: string;
  readonly role: SemanticRole;
  readonly parentId?: string;
  readonly children?: readonly string[];
  readonly label?: string;
  readonly disabled?: boolean;
}

/**
 * Resolved interactive target that can emit a host-owned {@link ActionRef}.
 *
 * @public
 */
export interface ResolvedActionTarget {
  readonly id: string;
  readonly nodeId: string;
  readonly path: UiNodePath;
  readonly action: ActionRef;
  readonly box: ResolvedRect;
  readonly disabled?: boolean;
  readonly label?: string;
}

/**
 * Full-frame snapshot boundary consumed by renderer adapters.
 *
 * @public
 */
export interface ResolvedUiFrame {
  readonly frameId: number;
  readonly viewport: ResolvedViewport;
  readonly nodes: readonly ResolvedNode[];
  readonly paint: readonly RenderCommand[];
  readonly semantics: readonly SemanticNode[];
  readonly actions: readonly ResolvedActionTarget[];
  readonly diagnostics: readonly UiDiagnostic[];
}
