import { isPlainRecord } from "./json-normalize.js";
import type { ResolvedRect } from "./resolved-frame.js";

/**
 * Directional focus movement names understood by host-owned input intent mapping.
 *
 * @public
 */
export type FocusDirection = "up" | "down" | "left" | "right";

/**
 * Explicit directional neighbor ids for a focusable node.
 *
 * @public
 */
export type FocusDirectionalNeighbors = Partial<Record<FocusDirection, string>>;

/**
 * Stable reason why a focus target is present but unavailable.
 *
 * @public
 */
export type FocusDisabledReason =
  | "host-disabled"
  | "missing-capability"
  | "modal-excluded"
  | "stale"
  | "unsupported";

/**
 * Serializable focusable node metadata derived from resolved runtime UI geometry.
 *
 * @public
 */
export interface FocusGraphNode {
  readonly id: string;
  readonly nodeId: string;
  readonly rect: ResolvedRect;
  readonly scopeId: string;
  readonly directionalNeighbors?: FocusDirectionalNeighbors;
  readonly priority: number;
  readonly disabledReason?: FocusDisabledReason;
}

/**
 * Authoring input for {@link normalizeFocusGraphNode}.
 *
 * @public
 */
export interface FocusGraphNodeInput {
  readonly id: string;
  readonly nodeId?: string;
  readonly rect: ResolvedRect;
  readonly scopeId?: string;
  readonly directionalNeighbors?: FocusDirectionalNeighbors;
  readonly priority?: number;
  readonly disabledReason?: FocusDisabledReason;
}

/**
 * Serializable focus graph metadata supplied to host-owned focus navigation.
 *
 * @public
 */
export interface FocusGraph {
  readonly scopeId: string;
  readonly nodes: readonly FocusGraphNode[];
  readonly currentFocusId?: string;
  readonly restoreFocusId?: string;
}

/**
 * Authoring input for {@link normalizeFocusGraph}.
 *
 * @public
 */
export interface FocusGraphInput {
  readonly scopeId?: string;
  readonly nodes: readonly FocusGraphNodeInput[];
  readonly currentFocusId?: string;
  readonly restoreFocusId?: string;
}

/**
 * Normalizes one focus graph node without reading platform focus or input state.
 *
 * @public
 */
export function normalizeFocusGraphNode(input: FocusGraphNodeInput): FocusGraphNode {
  if (!isPlainRecord(input)) {
    throw new TypeError("Focus graph node input must be a plain object.");
  }

  const node: MutableFocusGraphNode = {
    id: normalizeNonEmptyString(input.id, "Focus graph node id"),
    nodeId: normalizeNonEmptyString(input.nodeId ?? input.id, "Focus graph node nodeId"),
    rect: normalizeResolvedRect(input.rect, "Focus graph node rect"),
    scopeId: normalizeNonEmptyString(input.scopeId ?? "root", "Focus graph node scopeId"),
    priority: normalizePriority(input.priority ?? 0),
  };

  if (input.directionalNeighbors !== undefined) {
    node.directionalNeighbors = normalizeDirectionalNeighbors(input.directionalNeighbors);
  }

  if (input.disabledReason !== undefined) {
    node.disabledReason = normalizeDisabledReason(input.disabledReason);
  }

  return node;
}

/**
 * Normalizes a focus graph and validates id references while keeping the host as focus owner.
 *
 * @public
 */
export function normalizeFocusGraph(input: FocusGraphInput): FocusGraph {
  if (!isPlainRecord(input)) {
    throw new TypeError("Focus graph input must be a plain object.");
  }

  if (!Array.isArray(input.nodes)) {
    throw new TypeError("Focus graph nodes must be an array.");
  }

  const scopeId = normalizeNonEmptyString(input.scopeId ?? "root", "Focus graph scopeId");
  const nodes = input.nodes.map((node) => normalizeFocusGraphNode({ scopeId, ...node }));
  const ids = new Set<string>();

  for (const node of nodes) {
    if (ids.has(node.id)) {
      throw new TypeError(`Focus graph node id "${node.id}" must be unique.`);
    }
    ids.add(node.id);
  }

  for (const node of nodes) {
    for (const targetId of Object.values(node.directionalNeighbors ?? {})) {
      if (!ids.has(targetId)) {
        throw new TypeError(`Focus graph neighbor "${targetId}" must reference an existing node.`);
      }
    }
  }

  const graph: MutableFocusGraph = {
    scopeId,
    nodes,
  };

  if (input.currentFocusId !== undefined) {
    graph.currentFocusId = normalizeFocusReference(input.currentFocusId, ids, "currentFocusId");
  }

  if (input.restoreFocusId !== undefined) {
    graph.restoreFocusId = normalizeFocusReference(input.restoreFocusId, ids, "restoreFocusId");
  }

  return graph;
}

type MutableFocusGraphNode = {
  id: string;
  nodeId: string;
  rect: ResolvedRect;
  scopeId: string;
  directionalNeighbors?: FocusDirectionalNeighbors;
  priority: number;
  disabledReason?: FocusDisabledReason;
};

type MutableFocusGraph = {
  scopeId: string;
  nodes: readonly FocusGraphNode[];
  currentFocusId?: string;
  restoreFocusId?: string;
};

const focusDirections = ["up", "down", "left", "right"] as const;
const disabledReasons = [
  "host-disabled",
  "missing-capability",
  "modal-excluded",
  "stale",
  "unsupported",
] as const;

function normalizeDirectionalNeighbors(
  input: FocusDirectionalNeighbors,
): FocusDirectionalNeighbors {
  if (!isPlainRecord(input)) {
    throw new TypeError("Focus graph directionalNeighbors must be a plain object.");
  }

  const neighbors: Record<string, string> = {};
  for (const direction of focusDirections) {
    const targetId = input[direction];
    if (targetId !== undefined) {
      neighbors[direction] = normalizeNonEmptyString(
        targetId,
        `Focus graph directional neighbor ${direction}`,
      );
    }
  }

  return neighbors;
}

function normalizeResolvedRect(input: ResolvedRect, label: string): ResolvedRect {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object.`);
  }

  return {
    x: normalizeFiniteNumber(input.x, `${label}.x`),
    y: normalizeFiniteNumber(input.y, `${label}.y`),
    width: normalizeNonNegativeNumber(input.width, `${label}.width`),
    height: normalizeNonNegativeNumber(input.height, `${label}.height`),
  };
}

function normalizePriority(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError("Focus graph node priority must be an integer.");
  }

  return value;
}

function normalizeDisabledReason(value: unknown): FocusDisabledReason {
  if (disabledReasons.includes(value as FocusDisabledReason)) {
    return value as FocusDisabledReason;
  }

  throw new TypeError("Focus graph disabledReason must be a supported reason.");
}

function normalizeFocusReference(value: string, ids: ReadonlySet<string>, label: string): string {
  const id = normalizeNonEmptyString(value, `Focus graph ${label}`);
  if (!ids.has(id)) {
    throw new TypeError(`Focus graph ${label} must reference an existing node.`);
  }
  return id;
}

function normalizeNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError(`${label} must not be empty.`);
  }

  return normalized;
}

function normalizeFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }

  return value;
}

function normalizeNonNegativeNumber(value: unknown, label: string): number {
  const number = normalizeFiniteNumber(value, label);
  if (number < 0) {
    throw new TypeError(`${label} must be greater than or equal to 0.`);
  }

  return number;
}
