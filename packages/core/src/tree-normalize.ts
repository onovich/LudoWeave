import {
  coreDiagnosticCodes,
  createDiagnosticSink,
  type DiagnosticSink,
  type UiDiagnostic,
} from "./diagnostics.js";
import type { UiNode, UiNodeInput } from "./ui-node.js";
import { normalizeUiNode } from "./ui-node.js";

/**
 * Stable normalized path from root to a node.
 *
 * @public
 */
export type UiNodePath = readonly string[];

/**
 * Normalized node with stable identity metadata.
 *
 * @public
 */
export interface NormalizedUiNode extends Omit<UiNode, "children"> {
  /**
   * Stable id derived from the normalized path.
   */
  readonly id: string;
  /**
   * Stable root-to-node path.
   */
  readonly path: UiNodePath;
  /**
   * Parent node id when this is not the root.
   */
  readonly parentId?: string;
  /**
   * Sibling index after child filtering.
   */
  readonly index: number;
  /**
   * Normalized child nodes.
   */
  readonly children?: readonly NormalizedUiNode[];
}

/**
 * Normalized tree plus deterministic flattened node order.
 *
 * @public
 */
export interface NormalizedUiTree {
  readonly root: NormalizedUiNode;
  readonly nodes: readonly NormalizedUiNode[];
  readonly diagnostics: readonly UiDiagnostic[];
}

/**
 * Options for {@link normalizeUiTree}.
 *
 * @public
 */
export interface NormalizeUiTreeOptions {
  readonly rootPath?: string;
  readonly diagnostics?: DiagnosticSink;
}

/**
 * Normalizes authoring input into a keyed, path-addressable UI tree.
 *
 * @public
 */
export function normalizeUiTree(
  input: UiNodeInput,
  options: NormalizeUiTreeOptions = {},
): NormalizedUiTree {
  const diagnostics = options.diagnostics ?? createDiagnosticSink();
  const rootPath = normalizeRootPath(options.rootPath ?? "root");
  const rootNode = normalizeUiNode(input);
  const nodes: NormalizedUiNode[] = [];
  const root = normalizeNode(rootNode, {
    diagnostics,
    index: 0,
    nodes,
    parentId: undefined,
    path: [rootPath],
  });

  return {
    root,
    nodes,
    diagnostics: diagnostics.snapshot(),
  };
}

type NormalizeNodeContext = {
  readonly diagnostics: DiagnosticSink;
  readonly index: number;
  readonly nodes: NormalizedUiNode[];
  readonly parentId: string | undefined;
  readonly path: UiNodePath;
};

function normalizeNode(node: UiNode, context: NormalizeNodeContext): NormalizedUiNode {
  const childInputs = node.children ?? [];
  reportDuplicateSiblingKeys(childInputs, context);
  const id = pathToId(context.path);

  const normalized: MutableNormalizedUiNode = {
    ...withoutChildren(node),
    id,
    path: context.path,
    index: context.index,
  };

  if (context.parentId !== undefined) {
    normalized.parentId = context.parentId;
  }

  context.nodes.push(normalized);

  const children = childInputs.map((child, index) =>
    normalizeNode(child, {
      diagnostics: context.diagnostics,
      index,
      nodes: context.nodes,
      parentId: id,
      path: [...context.path, createPathSegment(child, index)],
    }),
  );

  if (children.length > 0) {
    normalized.children = children;
  }

  return normalized;
}

type MutableNormalizedUiNode = {
  id: string;
  path: UiNodePath;
  parentId?: string;
  index: number;
} & Omit<UiNode, "children"> & {
    children?: readonly NormalizedUiNode[];
  };

function withoutChildren(node: UiNode): Omit<UiNode, "children"> {
  return {
    type: node.type,
    ...(node.key === undefined ? {} : { key: node.key }),
    ...(node.props === undefined ? {} : { props: node.props }),
    ...(node.style === undefined ? {} : { style: node.style }),
    ...(node.action === undefined ? {} : { action: node.action }),
  };
}

function createPathSegment(node: UiNode, index: number): string {
  if (node.key !== undefined) {
    return `key:${encodePathPart(node.key)}`;
  }

  return `index:${index.toString().padStart(4, "0")}:${encodePathPart(node.type)}`;
}

function reportDuplicateSiblingKeys(
  children: readonly UiNode[],
  context: NormalizeNodeContext,
): void {
  const seenKeys = new Set<string>();

  for (const child of children) {
    if (child.key === undefined) {
      continue;
    }

    if (seenKeys.has(child.key)) {
      context.diagnostics.report({
        code: coreDiagnosticCodes.invalidUiNode,
        severity: "warning",
        message: `Duplicate sibling key '${child.key}' will share an identity segment.`,
        path: context.path,
        details: {
          key: child.key,
          parentId: pathToId(context.path),
        },
      });
      continue;
    }

    seenKeys.add(child.key);
  }
}

function normalizeRootPath(value: string): string {
  const rootPath = value.trim();
  if (rootPath.length === 0) {
    throw new TypeError("normalizeUiTree rootPath must not be empty.");
  }

  return encodePathPart(rootPath);
}

function encodePathPart(value: string): string {
  return encodeURIComponent(value).replaceAll("%2F", "%252F");
}

function pathToId(path: UiNodePath): string {
  return path.join("/");
}
