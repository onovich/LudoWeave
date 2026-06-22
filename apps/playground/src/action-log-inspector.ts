import type { UiActionLogEntry } from "@ludoweave/core";

export interface ActionLogInspectorItem {
  readonly sequence: number;
  readonly actionType: string;
  readonly text: string;
}

export type ActionLogInspectorFilter =
  | {
      readonly kind: "all";
    }
  | {
      readonly kind: "action-type";
      readonly actionType: string;
    }
  | {
      readonly kind: "namespace";
      readonly namespace: string;
    };

export interface CreateActionLogInspectorItemsOptions {
  readonly filter?: ActionLogInspectorFilter;
}

export interface ActionLogInspectorExportSource {
  readonly actionTargetId?: string;
  readonly label?: string;
  readonly nodeId?: string;
}

export interface ActionLogInspectorExportEntry {
  readonly sequence: number;
  readonly actionType: string;
  readonly action: UiActionLogEntry["action"];
  readonly source: ActionLogInspectorExportSource;
  readonly text: string;
}

export interface ActionLogInspectorExportPayload {
  readonly version: "ludoweave.action-log-inspector.v0.3";
  readonly filter: ActionLogInspectorFilter;
  readonly entries: readonly ActionLogInspectorExportEntry[];
}

export interface RenderActionLogInspectorOptions {
  readonly filter?: ActionLogInspectorFilter;
  readonly emptyText?: string;
  readonly noMatchText?: string;
}

export function createActionLogInspectorItems(
  entries: readonly UiActionLogEntry[],
  options: CreateActionLogInspectorItemsOptions = {},
): readonly ActionLogInspectorItem[] {
  return filterActionLogEntries(entries, options.filter).map((entry) => ({
    sequence: entry.sequence,
    actionType: entry.action.type,
    text: formatActionLogInspectorEntry(entry),
  }));
}

export function filterActionLogEntries(
  entries: readonly UiActionLogEntry[],
  filter: ActionLogInspectorFilter | undefined,
): readonly UiActionLogEntry[] {
  return entries.filter((entry) => matchesActionLogFilter(entry, filter));
}

export function createActionLogInspectorExportPayload(
  entries: readonly UiActionLogEntry[],
  options: CreateActionLogInspectorItemsOptions = {},
): ActionLogInspectorExportPayload {
  const filter = options.filter ?? { kind: "all" };

  return {
    version: "ludoweave.action-log-inspector.v0.3",
    filter,
    entries: filterActionLogEntries(entries, filter).map((entry) => ({
      sequence: entry.sequence,
      actionType: entry.action.type,
      action: entry.action,
      source: createActionLogInspectorExportSource(entry),
      text: formatActionLogInspectorEntry(entry),
    })),
  };
}

export function createActionLogInspectorExport(
  entries: readonly UiActionLogEntry[],
  options: CreateActionLogInspectorItemsOptions = {},
): string {
  return JSON.stringify(createActionLogInspectorExportPayload(entries, options), null, 2);
}

export function formatActionLogInspectorEntry(entry: UiActionLogEntry): string {
  const label = entry.label === undefined ? "" : ` - ${entry.label}`;
  const payload =
    entry.action.payload === undefined ? "" : ` - ${JSON.stringify(entry.action.payload)}`;
  return `${entry.action.type}${label}${payload}`;
}

export function renderActionLogInspector(
  root: HTMLElement,
  entries: readonly UiActionLogEntry[],
  options: RenderActionLogInspectorOptions = {},
): void {
  const documentRef = root.ownerDocument;
  const items = createActionLogInspectorItems(
    entries,
    options.filter === undefined ? {} : { filter: options.filter },
  );

  if (items.length === 0) {
    const empty = documentRef.createElement("li");
    empty.className = "action-log__empty";
    empty.textContent = getActionLogInspectorEmptyText(entries, options);
    root.replaceChildren(empty);
    return;
  }

  root.replaceChildren(
    ...items.map((item) => {
      const element = documentRef.createElement("li");
      element.dataset.actionSequence = String(item.sequence);
      element.dataset.actionType = item.actionType;
      element.textContent = item.text;
      return element;
    }),
  );
}

export function getActionLogInspectorEmptyText(
  entries: readonly UiActionLogEntry[],
  options: RenderActionLogInspectorOptions = {},
): string {
  if (entries.length === 0) {
    return options.emptyText ?? "Waiting for ActionRef";
  }

  return options.noMatchText ?? "No matching ActionRef";
}

function matchesActionLogFilter(
  entry: UiActionLogEntry,
  filter: ActionLogInspectorFilter | undefined,
): boolean {
  if (filter === undefined || filter.kind === "all") {
    return true;
  }

  if (filter.kind === "action-type") {
    return entry.action.type === filter.actionType;
  }

  return (
    entry.action.type === filter.namespace || entry.action.type.startsWith(`${filter.namespace}.`)
  );
}

function createActionLogInspectorExportSource(
  entry: UiActionLogEntry,
): ActionLogInspectorExportSource {
  return {
    ...(entry.actionTargetId === undefined ? {} : { actionTargetId: entry.actionTargetId }),
    ...(entry.label === undefined ? {} : { label: entry.label }),
    ...(entry.nodeId === undefined ? {} : { nodeId: entry.nodeId }),
  };
}
