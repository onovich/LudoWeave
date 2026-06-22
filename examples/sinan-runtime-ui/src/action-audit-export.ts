import type { JsonValue, UiDiagnostic } from "@ludoweave/core";

import {
  createSinanUIActionRefRegistryMock,
  type SinanUIActionRegistryAuditEntry,
  type SinanUIActionRegistrySource,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { createGateDemoRichTextSequence } from "./gate-demo-rich-text.js";
import { createGateDemoScrollSequence } from "./gate-demo-scroll.js";
import { createGateDemoVirtualListSequence } from "./gate-demo-virtual-list.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const sinanActionAuditExportVersion = "ludoweave.sinan-action-audit.v0.4";
export const sinanScrollAuditExportVersion = "ludoweave.sinan-scroll-audit.v0.6";
export const sinanVirtualListAuditExportVersion = "ludoweave.sinan-virtual-list-audit.v0.7";
export const sinanRichTextAuditExportVersion = "ludoweave.sinan-rich-text-audit.v0.8";

export interface SinanActionAuditExportSource {
  readonly actionTargetId?: string;
  readonly nodeId?: string;
  readonly label?: string;
}

export interface SinanActionAuditExportEntry {
  readonly sequence: number;
  readonly frameId: string;
  readonly actionType: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
  readonly routingResult: SinanUIActionRegistryAuditEntry["routingResult"];
  readonly source: SinanActionAuditExportSource;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface SinanActionAuditExportPayload {
  readonly version: typeof sinanActionAuditExportVersion;
  readonly entries: readonly SinanActionAuditExportEntry[];
}

export interface SinanScrollAuditExportEntry {
  readonly sequence: number;
  readonly frameId: string;
  readonly intentKind: string;
  readonly containerId: string;
  readonly actionType: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
  readonly routingResult: SinanUIActionRegistryAuditEntry["routingResult"];
  readonly source: SinanActionAuditExportSource;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface SinanScrollAuditExportPayload {
  readonly version: typeof sinanScrollAuditExportVersion;
  readonly entries: readonly SinanScrollAuditExportEntry[];
}

export interface SinanVirtualListAuditExportEntry {
  readonly sequence: number;
  readonly frameId: string;
  readonly intentKind: string;
  readonly windowId: string;
  readonly itemKey?: string;
  readonly actionType: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
  readonly routingResult: SinanUIActionRegistryAuditEntry["routingResult"];
  readonly source: SinanActionAuditExportSource;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface SinanVirtualListAuditExportPayload {
  readonly version: typeof sinanVirtualListAuditExportVersion;
  readonly entries: readonly SinanVirtualListAuditExportEntry[];
}

export interface SinanRichTextAuditExportEntry {
  readonly sequence: number;
  readonly frameId: string;
  readonly intentKind: string;
  readonly blockId: string;
  readonly nodeId: string;
  readonly localeHint: string;
  readonly plainTextFallback: string;
  readonly actionType: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
  readonly routingResult: SinanUIActionRegistryAuditEntry["routingResult"];
  readonly source: SinanActionAuditExportSource;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface SinanRichTextAuditExportPayload {
  readonly version: typeof sinanRichTextAuditExportVersion;
  readonly localizedText: readonly JsonValue[];
  readonly fallbackPolicy: Readonly<Record<string, JsonValue>>;
  readonly hostPolicy: Readonly<Record<string, JsonValue>>;
  readonly rendererTrace: Readonly<Record<string, JsonValue>>;
  readonly entries: readonly SinanRichTextAuditExportEntry[];
}

export function createSinanActionAuditExportPayload(
  entries: readonly SinanUIActionRegistryAuditEntry[],
): SinanActionAuditExportPayload {
  return {
    version: sinanActionAuditExportVersion,
    entries: entries.map((entry) => createExportEntry(entry)),
  };
}

export function createSinanActionAuditExportJson(
  entries: readonly SinanUIActionRegistryAuditEntry[],
): string {
  return JSON.stringify(createSinanActionAuditExportPayload(entries), null, 2);
}

export function createGateDemoActionAuditExportPayload(): SinanActionAuditExportPayload {
  const mapping = mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope);

  if (mapping.frame === undefined || mapping.envelopeFrameId === undefined) {
    throw new Error("Gate Demo ActionRef audit export requires a resolved frame.");
  }

  const registry = createSinanUIActionRefRegistryMock();

  for (const actionTarget of mapping.frame.actions) {
    registry.route(actionTarget.action, {
      frameId: mapping.envelopeFrameId,
      actionTargetId: actionTarget.id,
      nodeId: actionTarget.nodeId,
      ...(actionTarget.label === undefined ? {} : { label: actionTarget.label }),
    });
  }

  return createSinanActionAuditExportPayload(registry.auditLogSnapshot());
}

export function createGateDemoScrollAuditExportPayload(): SinanScrollAuditExportPayload {
  const sequence = createGateDemoScrollSequence();

  return {
    version: sinanScrollAuditExportVersion,
    entries: sequence.registryResults.map((entry, index) => {
      const intent = sequence.intents[index];
      if (intent === undefined) {
        throw new Error("Gate Demo scroll audit export requires matching intent records.");
      }

      return {
        sequence: entry.sequence,
        frameId: entry.frameId,
        intentKind: intent.kind,
        containerId: intent.containerId,
        actionType: entry.action.type,
        ...(entry.action.payload === undefined ? {} : { payload: entry.action.payload }),
        routingResult: entry.routingResult,
        source: createExportSource(entry.source),
        diagnostics: [...entry.diagnostics, ...sequence.diagnostics],
      };
    }),
  };
}

export function createGateDemoVirtualListAuditExportPayload(): SinanVirtualListAuditExportPayload {
  const sequence = createGateDemoVirtualListSequence();

  return {
    version: sinanVirtualListAuditExportVersion,
    entries: sequence.registryResults.map((entry, index) => {
      const intent = sequence.intents[index];
      if (intent === undefined) {
        throw new Error("Gate Demo virtual list audit export requires matching intent records.");
      }

      return {
        sequence: entry.sequence,
        frameId: entry.frameId,
        intentKind: intent.kind,
        windowId: intent.windowId,
        ...(intent.itemKey === undefined ? {} : { itemKey: intent.itemKey }),
        actionType: entry.action.type,
        ...(entry.action.payload === undefined ? {} : { payload: entry.action.payload }),
        routingResult: entry.routingResult,
        source: createExportSource(entry.source),
        diagnostics: [...entry.diagnostics, ...sequence.diagnostics],
      };
    }),
  };
}

export function createGateDemoRichTextAuditExportPayload(): SinanRichTextAuditExportPayload {
  const sequence = createGateDemoRichTextSequence();
  const block = sequence.richTextMetadata.blocks[0];

  if (block === undefined) {
    throw new Error("Gate Demo rich text audit export requires one metadata block.");
  }

  return {
    version: sinanRichTextAuditExportVersion,
    localizedText: sequence.localizedText as unknown as readonly JsonValue[],
    fallbackPolicy: sequence.fallbackPolicy as unknown as Readonly<Record<string, JsonValue>>,
    hostPolicy: sequence.hostPolicy as unknown as Readonly<Record<string, JsonValue>>,
    rendererTrace: sequence.rendererTrace as unknown as Readonly<Record<string, JsonValue>>,
    entries: sequence.registryResults.map((entry, index) => {
      const intent = sequence.intents[index];
      if (intent === undefined) {
        throw new Error("Gate Demo rich text audit export requires matching intent records.");
      }

      return {
        sequence: entry.sequence,
        frameId: entry.frameId,
        intentKind: intent.kind,
        blockId: intent.blockId,
        nodeId: block.nodeId,
        localeHint: block.localeHint,
        plainTextFallback: block.plainTextFallback,
        actionType: entry.action.type,
        ...(entry.action.payload === undefined ? {} : { payload: entry.action.payload }),
        routingResult: entry.routingResult,
        source: createExportSource(entry.source),
        diagnostics: [...entry.diagnostics, ...sequence.diagnostics],
      };
    }),
  };
}

function createExportEntry(entry: SinanUIActionRegistryAuditEntry): SinanActionAuditExportEntry {
  return {
    sequence: entry.sequence,
    frameId: entry.frameId,
    actionType: entry.action.type,
    ...(entry.action.payload === undefined ? {} : { payload: entry.action.payload }),
    routingResult: entry.routingResult,
    source: createExportSource(entry.source),
    diagnostics: entry.diagnostics,
  };
}

function createExportSource(source: SinanUIActionRegistrySource): SinanActionAuditExportSource {
  return {
    ...(source.actionTargetId === undefined ? {} : { actionTargetId: source.actionTargetId }),
    ...(source.nodeId === undefined ? {} : { nodeId: source.nodeId }),
    ...(source.label === undefined ? {} : { label: source.label }),
  };
}
