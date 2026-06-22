import type { FocusDirection, FocusGraph, FocusGraphNode } from "./focus-graph.js";

/**
 * Result status for deterministic directional focus resolution.
 *
 * @public
 */
export type DirectionalFocusResultStatus = "resolved" | "no-target";

/**
 * How a directional focus target was selected.
 *
 * @public
 */
export type DirectionalFocusResolutionMethod = "explicit-neighbor" | "nearest-target";

/**
 * Result of resolving one host-owned directional navigation intent.
 *
 * @public
 */
export interface DirectionalFocusResult {
  readonly status: DirectionalFocusResultStatus;
  readonly fromId: string;
  readonly direction: FocusDirection;
  readonly targetId?: string;
  readonly method?: DirectionalFocusResolutionMethod;
}

/**
 * Resolves directional focus from serializable graph metadata without owning focus state.
 *
 * @public
 */
export function resolveDirectionalFocus(
  graph: FocusGraph,
  fromId: string,
  direction: FocusDirection,
): DirectionalFocusResult {
  const from = graph.nodes.find((node) => node.id === fromId);
  if (from === undefined) {
    return {
      status: "no-target",
      fromId,
      direction,
    };
  }

  const explicitTargetId = from.directionalNeighbors?.[direction];
  if (explicitTargetId !== undefined) {
    const explicitTarget = findEnabledNode(graph.nodes, explicitTargetId);
    if (explicitTarget !== undefined) {
      return {
        status: "resolved",
        fromId,
        direction,
        targetId: explicitTarget.id,
        method: "explicit-neighbor",
      };
    }
  }

  const nearest = findNearestDirectionalTarget(graph.nodes, from, direction);
  if (nearest === undefined) {
    return {
      status: "no-target",
      fromId,
      direction,
    };
  }

  return {
    status: "resolved",
    fromId,
    direction,
    targetId: nearest.id,
    method: "nearest-target",
  };
}

function findEnabledNode(
  nodes: readonly FocusGraphNode[],
  id: string,
): FocusGraphNode | undefined {
  return nodes.find((node) => node.id === id && node.disabledReason === undefined);
}

function findNearestDirectionalTarget(
  nodes: readonly FocusGraphNode[],
  from: FocusGraphNode,
  direction: FocusDirection,
): FocusGraphNode | undefined {
  const fromCenter = centerOf(from);
  const scored = nodes
    .filter((node) => node.id !== from.id && node.disabledReason === undefined)
    .map((node) => scoreCandidate(fromCenter, node, direction))
    .filter((candidate): candidate is DirectionalCandidateScore => candidate !== undefined)
    .sort(compareCandidateScore);

  return scored[0]?.node;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface DirectionalCandidateScore {
  readonly node: FocusGraphNode;
  readonly primaryDistance: number;
  readonly perpendicularDistance: number;
}

function scoreCandidate(
  fromCenter: Point,
  node: FocusGraphNode,
  direction: FocusDirection,
): DirectionalCandidateScore | undefined {
  const targetCenter = centerOf(node);
  const deltaX = targetCenter.x - fromCenter.x;
  const deltaY = targetCenter.y - fromCenter.y;

  if (direction === "up" && deltaY >= 0) {
    return undefined;
  }

  if (direction === "down" && deltaY <= 0) {
    return undefined;
  }

  if (direction === "left" && deltaX >= 0) {
    return undefined;
  }

  if (direction === "right" && deltaX <= 0) {
    return undefined;
  }

  if (direction === "up" || direction === "down") {
    return {
      node,
      primaryDistance: Math.abs(deltaY),
      perpendicularDistance: Math.abs(deltaX),
    };
  }

  return {
    node,
    primaryDistance: Math.abs(deltaX),
    perpendicularDistance: Math.abs(deltaY),
  };
}

function compareCandidateScore(
  left: DirectionalCandidateScore,
  right: DirectionalCandidateScore,
): number {
  return (
    left.primaryDistance - right.primaryDistance ||
    left.perpendicularDistance - right.perpendicularDistance ||
    right.node.priority - left.node.priority ||
    left.node.id.localeCompare(right.node.id)
  );
}

function centerOf(node: FocusGraphNode): Point {
  return {
    x: node.rect.x + node.rect.width / 2,
    y: node.rect.y + node.rect.height / 2,
  };
}
