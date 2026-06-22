import {
  createScrollDiagnostic,
  normalizeHostScrollIntent,
  normalizeScrollMetadataFrame,
  type HostScrollIntent,
  type ResolvedNode,
  type ResolvedUiFrame,
  type ScrollMetadataFrame,
  type UiDiagnostic,
} from "@ludoweave/core";
import {
  traceCanvas2DScrollMetadata,
  type Canvas2DScrollMetadataTrace,
} from "@ludoweave/renderer-canvas2d";

import {
  createSinanUIActionRefRegistryMock,
  type CreateSinanUIActionRefRegistryMockOptions,
  type SinanUIActionRegistryAuditEntry,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const gateDemoScrollSequenceVersion = "ludoweave.sinan-gate-demo.scroll.v0.6";

export interface GateDemoScrollSequenceResult {
  readonly version: typeof gateDemoScrollSequenceVersion;
  readonly frameId?: string;
  readonly scrollMetadata: ScrollMetadataFrame;
  readonly intents: readonly HostScrollIntent[];
  readonly registryResults: readonly SinanUIActionRegistryAuditEntry[];
  readonly rendererTrace: Canvas2DScrollMetadataTrace;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface CreateGateDemoScrollSequenceOptions {
  readonly frame?: ResolvedUiFrame;
  readonly frameId?: string;
  readonly registryOptions?: CreateSinanUIActionRefRegistryMockOptions;
  readonly scrollMetadata?: ScrollMetadataFrame;
}

export function createGateDemoScrollSequence(
  options: CreateGateDemoScrollSequenceOptions = {},
): GateDemoScrollSequenceResult {
  const mapping =
    options.frame === undefined
      ? mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope)
      : undefined;
  const frame = options.frame ?? mapping?.frame;
  const frameId = options.frameId ?? mapping?.envelopeFrameId;

  if (frame === undefined) {
    return createScrollFailure({
      ...(frameId === undefined ? {} : { frameId }),
      diagnostics: [
        createScrollDiagnostic("removedContainer", {
          reason: "missing-frame",
        }),
      ],
    });
  }

  const scrollMetadata = options.scrollMetadata ?? createGateDemoScrollMetadata(frame);
  const rendererTrace = traceCanvas2DScrollMetadata(frame, scrollMetadata);
  const firstContainer =
    rendererTrace.result === "containers" ? rendererTrace.containers[0] : undefined;
  const intents =
    firstContainer === undefined ? [] : createHostScrollIntentSequence(firstContainer.containerId);
  const registry = createSinanUIActionRefRegistryMock(options.registryOptions ?? {});

  for (const intent of intents) {
    registry.route(intent.action, {
      ...(frameId === undefined ? {} : { frameId }),
      ...(firstContainer === undefined ? {} : { nodeId: firstContainer.nodeId }),
      label: "Gate Demo scroll intent",
    });
  }

  return {
    version: gateDemoScrollSequenceVersion,
    ...(frameId === undefined ? {} : { frameId }),
    scrollMetadata,
    intents,
    registryResults: registry.auditLogSnapshot(),
    rendererTrace,
    diagnostics:
      rendererTrace.result === "containers"
        ? rendererTrace.containers.flatMap((container) => container.diagnostics)
        : [],
  };
}

function createGateDemoScrollMetadata(frame: ResolvedUiFrame): ScrollMetadataFrame {
  const objective = requireNode(frame, "runtime.main/key:objective.delivery.cell");

  return normalizeScrollMetadataFrame({
    activeContainerId: "gate-demo-objective-scroll",
    containers: [
      {
        id: "gate-demo-objective-scroll",
        nodeId: objective.id,
        contentRect: {
          ...objective.box,
          height: objective.box.height + 240,
        },
        viewportRect: objective.box,
        axis: "y",
        offset: { x: 0, y: 96, revision: 1 },
        extent: { width: objective.box.width, height: objective.box.height + 240 },
        hostCapability: { status: "available" },
      },
    ],
  });
}

function createHostScrollIntentSequence(containerId: string): readonly HostScrollIntent[] {
  return [
    normalizeHostScrollIntent({ kind: "line", containerId, direction: "down" }),
    normalizeHostScrollIntent({ kind: "page", containerId, direction: "down" }),
    normalizeHostScrollIntent({ kind: "edge", containerId, edge: "end" }),
    normalizeHostScrollIntent({
      kind: "restore",
      containerId,
      restoreOffset: { x: 0, y: 96, revision: 1 },
    }),
  ];
}

function createScrollFailure(options: {
  readonly frameId?: string;
  readonly diagnostics: readonly UiDiagnostic[];
}): GateDemoScrollSequenceResult {
  return {
    version: gateDemoScrollSequenceVersion,
    ...(options.frameId === undefined ? {} : { frameId: options.frameId }),
    scrollMetadata: normalizeScrollMetadataFrame({ containers: [] }),
    intents: [],
    registryResults: [],
    rendererTrace: {
      kind: "scroll-metadata-trace",
      frameId: 0,
      result: "no-container",
      containers: [],
    },
    diagnostics: options.diagnostics,
  };
}

function requireNode(frame: ResolvedUiFrame, nodeId: string): ResolvedNode {
  const node = frame.nodes.find((candidate) => candidate.id === nodeId);
  if (node === undefined) {
    throw new Error(`Expected Gate Demo scroll container node ${nodeId}.`);
  }
  return node;
}
