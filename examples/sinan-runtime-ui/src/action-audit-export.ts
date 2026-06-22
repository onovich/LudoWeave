import type { JsonValue, UiDiagnostic } from "@ludoweave/core";

import {
  createSinanUIActionRefRegistryMock,
  type SinanUIActionRegistryAuditEntry,
  type SinanUIActionRegistrySource,
} from "./action-registry.js";
import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "./resolved-frame-adapter.js";

export const sinanActionAuditExportVersion = "ludoweave.sinan-action-audit.v0.4";

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
