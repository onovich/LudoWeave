import {
  createActionLog,
  normalizeUiDiagnostic,
  type ActionRef,
  type ActionRefInput,
  type UiActionLogEntry,
  type UiActionLogSource,
  type UiDiagnostic,
} from "@ludoweave/core";

import { gateDemoRuntimeUIViewModelEnvelope } from "./fixture.js";

export type SinanUIActionRefRoutingResult =
  | "accepted"
  | "rejected"
  | "stale"
  | "unavailable"
  | "disabled"
  | "unknown"
  | "no-op";

export interface SinanUIActionRegistrySource extends UiActionLogSource {
  readonly frameId?: string;
}

export interface SinanUIActionRegistryAuditEntry {
  readonly sequence: number;
  readonly frameId: string;
  readonly action: ActionRef;
  readonly source: SinanUIActionRegistrySource;
  readonly routingResult: SinanUIActionRefRoutingResult;
  readonly diagnostics: readonly UiDiagnostic[];
}

export interface SinanUIActionRefRegistryMock {
  route(
    action: ActionRefInput,
    source?: SinanUIActionRegistrySource,
  ): SinanUIActionRegistryAuditEntry;
  auditLogSnapshot(): readonly SinanUIActionRegistryAuditEntry[];
  actionLogSnapshot(): readonly UiActionLogEntry[];
  clear(): void;
}

export interface CreateSinanUIActionRefRegistryMockOptions {
  readonly frameId?: string;
  readonly available?: boolean;
  readonly acceptedNamespaces?: readonly string[];
  readonly rejectedActionTypes?: readonly string[];
  readonly staleFrameIds?: readonly string[];
  readonly unavailableActionTypes?: readonly string[];
  readonly disabledActionTypes?: readonly string[];
  readonly noOpActionTypes?: readonly string[];
}

export const sinanUIActionRegistryDiagnosticCodes = Object.freeze({
  rejected: "LW_EXAMPLE_ACTION_REGISTRY_REJECTED",
  stale: "LW_EXAMPLE_ACTION_REGISTRY_STALE",
  unavailable: "LW_EXAMPLE_ACTION_REGISTRY_UNAVAILABLE",
  disabled: "LW_EXAMPLE_ACTION_REGISTRY_DISABLED",
  unknown: "LW_EXAMPLE_ACTION_REGISTRY_UNKNOWN",
  noOp: "LW_EXAMPLE_ACTION_REGISTRY_NO_OP",
});

export function createSinanUIActionRefRegistryMock(
  options: CreateSinanUIActionRefRegistryMockOptions = {},
): SinanUIActionRefRegistryMock {
  const config = createRegistryConfig(options);
  const actionLog = createActionLog();
  const auditLog: SinanUIActionRegistryAuditEntry[] = [];

  return {
    route(action, source = {}) {
      const frameId = source.frameId ?? config.frameId;
      const actionLogSource = toUiActionLogSource(source);
      const actionLogEntry = actionLog.record(
        actionLogSource === undefined ? { action } : { action, source: actionLogSource },
      );
      const routingResult = resolveRoutingResult(actionLogEntry.action, frameId, config);
      const auditEntry: SinanUIActionRegistryAuditEntry = {
        sequence: actionLogEntry.sequence,
        frameId,
        action: actionLogEntry.action,
        source: createAuditSource(actionLogEntry, frameId),
        routingResult,
        diagnostics: createRoutingDiagnostics(routingResult, actionLogEntry.action, frameId),
      };

      auditLog.push(auditEntry);
      return cloneAuditEntry(auditEntry);
    },
    auditLogSnapshot() {
      return auditLog.map((entry) => cloneAuditEntry(entry));
    },
    actionLogSnapshot() {
      return actionLog.snapshot();
    },
    clear() {
      actionLog.clear();
      auditLog.length = 0;
    },
  };
}

interface RegistryConfig {
  readonly frameId: string;
  readonly available: boolean;
  readonly acceptedNamespaces: ReadonlySet<string>;
  readonly rejectedActionTypes: ReadonlySet<string>;
  readonly staleFrameIds: ReadonlySet<string>;
  readonly unavailableActionTypes: ReadonlySet<string>;
  readonly disabledActionTypes: ReadonlySet<string>;
  readonly noOpActionTypes: ReadonlySet<string>;
}

function createRegistryConfig(options: CreateSinanUIActionRefRegistryMockOptions): RegistryConfig {
  return {
    frameId: options.frameId ?? gateDemoRuntimeUIViewModelEnvelope.frameId,
    available: options.available ?? true,
    acceptedNamespaces: new Set(
      options.acceptedNamespaces ?? [
        "runtime.gameplay",
        "runtime.objective",
        "runtime.pause",
        "runtime.collection",
        "runtime.scroll",
        "runtime.richText",
        "runtime.ui",
        "runtime.input",
      ],
    ),
    rejectedActionTypes: new Set(options.rejectedActionTypes ?? []),
    staleFrameIds: new Set(options.staleFrameIds ?? []),
    unavailableActionTypes: new Set(options.unavailableActionTypes ?? []),
    disabledActionTypes: new Set(options.disabledActionTypes ?? []),
    noOpActionTypes: new Set(options.noOpActionTypes ?? ["runtime.ui.noop"]),
  };
}

function resolveRoutingResult(
  action: ActionRef,
  frameId: string,
  config: RegistryConfig,
): SinanUIActionRefRoutingResult {
  if (!config.available || config.unavailableActionTypes.has(action.type)) {
    return "unavailable";
  }

  if (frameId !== config.frameId || config.staleFrameIds.has(frameId)) {
    return "stale";
  }

  if (config.disabledActionTypes.has(action.type)) {
    return "disabled";
  }

  if (config.rejectedActionTypes.has(action.type)) {
    return "rejected";
  }

  if (config.noOpActionTypes.has(action.type)) {
    return "no-op";
  }

  if (matchesAcceptedNamespace(action.type, config.acceptedNamespaces)) {
    return "accepted";
  }

  return "unknown";
}

function matchesAcceptedNamespace(actionType: string, namespaces: ReadonlySet<string>): boolean {
  for (const namespace of namespaces) {
    if (actionType === namespace || actionType.startsWith(`${namespace}.`)) {
      return true;
    }
  }

  return false;
}

function createRoutingDiagnostics(
  routingResult: SinanUIActionRefRoutingResult,
  action: ActionRef,
  frameId: string,
): readonly UiDiagnostic[] {
  if (routingResult === "accepted") {
    return [];
  }

  const codeByResult = {
    rejected: sinanUIActionRegistryDiagnosticCodes.rejected,
    stale: sinanUIActionRegistryDiagnosticCodes.stale,
    unavailable: sinanUIActionRegistryDiagnosticCodes.unavailable,
    disabled: sinanUIActionRegistryDiagnosticCodes.disabled,
    unknown: sinanUIActionRegistryDiagnosticCodes.unknown,
    "no-op": sinanUIActionRegistryDiagnosticCodes.noOp,
  } satisfies Record<Exclude<SinanUIActionRefRoutingResult, "accepted">, string>;

  const severity = routingResult === "no-op" ? "info" : "warning";

  return [
    normalizeUiDiagnostic({
      code: codeByResult[routingResult],
      severity,
      message: `Sinan registry mock routed "${action.type}" as ${routingResult}.`,
      path: ["action-registry", routingResult],
      details: {
        actionType: action.type,
        frameId,
        routingResult,
      },
    }),
  ];
}

function toUiActionLogSource(source: SinanUIActionRegistrySource): UiActionLogSource | undefined {
  const actionLogSource: MutableUiActionLogSource = {};

  if (source.actionTargetId !== undefined) {
    actionLogSource.actionTargetId = source.actionTargetId;
  }

  if (source.nodeId !== undefined) {
    actionLogSource.nodeId = source.nodeId;
  }

  if (source.label !== undefined) {
    actionLogSource.label = source.label;
  }

  if (
    actionLogSource.actionTargetId === undefined &&
    actionLogSource.nodeId === undefined &&
    actionLogSource.label === undefined
  ) {
    return undefined;
  }

  return actionLogSource;
}

function createAuditSource(
  actionLogEntry: UiActionLogEntry,
  frameId: string,
): SinanUIActionRegistrySource {
  return {
    frameId,
    ...(actionLogEntry.actionTargetId === undefined
      ? {}
      : { actionTargetId: actionLogEntry.actionTargetId }),
    ...(actionLogEntry.nodeId === undefined ? {} : { nodeId: actionLogEntry.nodeId }),
    ...(actionLogEntry.label === undefined ? {} : { label: actionLogEntry.label }),
  };
}

function cloneAuditEntry(entry: SinanUIActionRegistryAuditEntry): SinanUIActionRegistryAuditEntry {
  return JSON.parse(JSON.stringify(entry)) as SinanUIActionRegistryAuditEntry;
}

type MutableUiActionLogSource = {
  actionTargetId?: string;
  nodeId?: string;
  label?: string;
};
