import {
  createFocusNavigationDiagnostic,
  normalizeFocusGraph,
  normalizeHostInputIntent,
  type FocusGraph,
  type ResolvedActionTarget,
  type ResolvedUiFrame,
  type UiDiagnostic,
} from "@ludoweave/core";
import {
  createModalFocusNavigationDraft,
  createModalFocusNavigationSequence,
  type ModalFocusNavigationSequence,
} from "@ludoweave/components";
import {
  traceCanvas2DFocusGraph,
  type Canvas2DFocusGraphTrace,
} from "@ludoweave/renderer-canvas2d";

import {
  createSinanUIActionRefRegistryMock,
  type CreateSinanUIActionRefRegistryMockOptions,
  type SinanUIActionRegistryAuditEntry,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const gateDemoNavigationSequenceVersion = "ludoweave.sinan-gate-demo.navigation.v0.5";

export interface GateDemoNavigationSequenceResult {
  readonly version: typeof gateDemoNavigationSequenceVersion;
  readonly frameId?: string;
  readonly focusGraph: FocusGraph;
  readonly sequence: ModalFocusNavigationSequence;
  readonly registryResults: readonly SinanUIActionRegistryAuditEntry[];
  readonly rendererTrace: Canvas2DFocusGraphTrace;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface CreateGateDemoNavigationSequenceOptions {
  readonly frame?: ResolvedUiFrame;
  readonly frameId?: string;
  readonly registryOptions?: CreateSinanUIActionRefRegistryMockOptions;
  readonly focusGraph?: FocusGraph;
}

export function createGateDemoNavigationSequence(
  options: CreateGateDemoNavigationSequenceOptions = {},
): GateDemoNavigationSequenceResult {
  const mapping =
    options.frame === undefined
      ? mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope)
      : undefined;
  const frame = options.frame ?? mapping?.frame;
  const frameId = options.frameId ?? mapping?.envelopeFrameId;

  if (frame === undefined) {
    return createNavigationFailure({
      ...(frameId === undefined ? {} : { frameId }),
      focusGraph: normalizeFocusGraph({ scopeId: "pause.dialog", nodes: [] }),
      diagnostics: [
        createFocusNavigationDiagnostic("missingTarget", {
          reason: "missing-frame",
        }),
      ],
    });
  }

  const focusGraph = options.focusGraph ?? createGateDemoPauseFocusGraph(frame);
  if (focusGraph.nodes.length === 0) {
    return {
      version: gateDemoNavigationSequenceVersion,
      ...(frameId === undefined ? {} : { frameId }),
      focusGraph,
      sequence: { entries: [], actionLog: [] },
      registryResults: [],
      rendererTrace: traceCanvas2DFocusGraph(frame, focusGraph),
      diagnostics: [],
    };
  }

  const draftInput: MutableModalFocusNavigationDraftInput = {
    scopeId: focusGraph.scopeId,
    restoreFocusKey: "hud.pause-button",
    controls: focusGraph.nodes.map((node) => ({
      id: node.id,
      nodeId: node.nodeId,
      rect: node.rect,
      action: requireActionForFocusNode(frame, node).action,
    })),
  };

  if (focusGraph.currentFocusId !== undefined) {
    draftInput.initialFocusId = focusGraph.currentFocusId;
  }

  const sequence = createModalFocusNavigationSequence(createModalFocusNavigationDraft(draftInput), [
    normalizeHostInputIntent({ kind: "navigate", direction: "down", focusId: "resume" }),
    normalizeHostInputIntent({ kind: "confirm", focusId: "cancel" }),
    normalizeHostInputIntent({ kind: "cancel" }),
  ]);
  const registry = createSinanUIActionRefRegistryMock(options.registryOptions ?? {});

  for (const entry of sequence.actionLog) {
    registry.route(entry.action, createRegistrySource(frameId, entry));
  }

  const rendererTrace = traceCanvas2DFocusGraph(frame, focusGraph);

  return {
    version: gateDemoNavigationSequenceVersion,
    ...(frameId === undefined ? {} : { frameId }),
    focusGraph,
    sequence,
    registryResults: registry.auditLogSnapshot(),
    rendererTrace,
    diagnostics: [],
  };
}

function createGateDemoPauseFocusGraph(frame: ResolvedUiFrame): FocusGraph {
  const resume = requireActionTarget(frame, "runtime.main/key:pause.menu/key:confirm");
  const cancel = requireActionTarget(frame, "runtime.main/key:pause.menu/key:cancel");

  return normalizeFocusGraph({
    scopeId: "pause.dialog",
    currentFocusId: "resume",
    nodes: [
      {
        id: "resume",
        nodeId: resume.nodeId,
        rect: resume.box,
        directionalNeighbors: { down: "cancel" },
      },
      {
        id: "cancel",
        nodeId: cancel.nodeId,
        rect: cancel.box,
        directionalNeighbors: { up: "resume" },
      },
    ],
  });
}

function createNavigationFailure(options: {
  readonly frameId?: string;
  readonly focusGraph: FocusGraph;
  readonly diagnostics: readonly UiDiagnostic[];
}): GateDemoNavigationSequenceResult {
  return {
    version: gateDemoNavigationSequenceVersion,
    ...(options.frameId === undefined ? {} : { frameId: options.frameId }),
    focusGraph: options.focusGraph,
    sequence: { entries: [], actionLog: [] },
    registryResults: [],
    rendererTrace: {
      kind: "focus-graph-trace",
      frameId: 0,
      scopeId: options.focusGraph.scopeId,
      result: "no-target",
      targets: [],
    },
    diagnostics: options.diagnostics,
  };
}

function requireActionForFocusNode(frame: ResolvedUiFrame, node: FocusGraph["nodes"][number]) {
  return requireActionTarget(frame, node.nodeId);
}

function requireActionTarget(frame: ResolvedUiFrame, nodeId: string): ResolvedActionTarget {
  const target = frame.actions.find((candidate) => candidate.nodeId === nodeId);
  if (target === undefined) {
    throw new Error(`Expected Gate Demo navigation action target for ${nodeId}.`);
  }
  return target;
}

type MutableModalFocusNavigationDraftInput = Parameters<
  typeof createModalFocusNavigationDraft
>[0] & {
  initialFocusId?: string;
};

function createRegistrySource(
  frameId: string | undefined,
  entry: ModalFocusNavigationSequence["actionLog"][number],
) {
  return {
    ...(frameId === undefined ? {} : { frameId }),
    ...(entry.nodeId === undefined ? {} : { nodeId: entry.nodeId }),
    ...(entry.label === undefined ? {} : { label: entry.label }),
  };
}
