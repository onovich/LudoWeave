import type { ActionRef, ActionRefInput } from "./action-ref.js";
import { normalizeActionRef } from "./action-ref.js";
import type { JsonValue } from "./json-value.js";
import { isPlainRecord, normalizeJsonObject } from "./json-normalize.js";

/**
 * v0.1 placeholder for the LudoWeave style/layout subset.
 *
 * @public
 */
export type UiStyle = Readonly<Record<string, JsonValue>>;

/**
 * Serializable UI intermediate representation consumed by the core runtime.
 *
 * @public
 */
export interface UiNode {
  /**
   * Stable component or primitive type name.
   */
  readonly type: string;
  /**
   * Optional author-provided stable identity within its sibling list.
   */
  readonly key?: string;
  /**
   * Serializable component props.
   */
  readonly props?: Readonly<Record<string, JsonValue>>;
  /**
   * Serializable v0.1 style/layout subset.
   */
  readonly style?: UiStyle;
  /**
   * Optional host-owned action emitted by this node.
   */
  readonly action?: ActionRef;
  /**
   * Normalized child nodes.
   */
  readonly children?: readonly UiNode[];
}

/**
 * Authoring input accepted before tree normalization.
 *
 * @public
 */
export interface UiNodeInput {
  readonly type: string;
  readonly key?: string;
  readonly props?: Readonly<Record<string, JsonValue>>;
  readonly style?: UiStyle;
  readonly action?: ActionRefInput;
  readonly children?: UiNodeChildrenInput;
}

/**
 * Child input accepted by {@link normalizeUiNode}.
 *
 * @public
 */
export type UiNodeChildrenInput =
  | UiNodeInput
  | readonly (UiNodeInput | null | false | undefined)[]
  | null
  | false
  | undefined;

/**
 * Converts authoring input into a serializable {@link UiNode} tree.
 *
 * @public
 */
export function normalizeUiNode(input: UiNodeInput): UiNode {
  if (!isPlainRecord(input)) {
    throw new TypeError("UiNode input must be a plain object.");
  }

  const type = normalizeNodeType(input.type);
  const normalized: MutableUiNode = { type };

  if (input.key !== undefined) {
    normalized.key = normalizeNodeKey(input.key);
  }

  if (input.props !== undefined) {
    if (!isPlainRecord(input.props)) {
      throw new TypeError("UiNode props must be a plain JSON object.");
    }
    normalized.props = normalizeJsonObject(input.props, "props");
  }

  if (input.style !== undefined) {
    if (!isPlainRecord(input.style)) {
      throw new TypeError("UiNode style must be a plain JSON object.");
    }
    normalized.style = normalizeJsonObject(input.style, "style");
  }

  if (input.action !== undefined) {
    normalized.action = normalizeActionRef(input.action);
  }

  const children = normalizeChildren(input.children);
  if (children.length > 0) {
    normalized.children = children;
  }

  return normalized;
}

type MutableUiNode = {
  type: string;
  key?: string;
  props?: Readonly<Record<string, JsonValue>>;
  style?: UiStyle;
  action?: ActionRef;
  children?: readonly UiNode[];
};

function normalizeChildren(children: UiNodeChildrenInput): readonly UiNode[] {
  if (children === undefined || children === null || children === false) {
    return [];
  }

  if (Array.isArray(children)) {
    return children
      .filter(
        (child): child is UiNodeInput => child !== undefined && child !== null && child !== false,
      )
      .map((child) => normalizeUiNode(child));
  }

  return [normalizeUiNode(children as UiNodeInput)];
}

function normalizeNodeType(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("UiNode type must be a string.");
  }

  const type = value.trim();
  if (type.length === 0) {
    throw new TypeError("UiNode type must not be empty.");
  }

  return type;
}

function normalizeNodeKey(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("UiNode key must be a string.");
  }

  const key = value.trim();
  if (key.length === 0) {
    throw new TypeError("UiNode key must not be empty.");
  }

  return key;
}
