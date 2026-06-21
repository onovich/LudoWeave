import type { UiActionLogEntry } from "@ludoweave/core";

export interface ActionLogInspectorItem {
  readonly sequence: number;
  readonly actionType: string;
  readonly text: string;
}

export interface RenderActionLogInspectorOptions {
  readonly emptyText?: string;
}

export function createActionLogInspectorItems(
  entries: readonly UiActionLogEntry[],
): readonly ActionLogInspectorItem[] {
  return entries.map((entry) => ({
    sequence: entry.sequence,
    actionType: entry.action.type,
    text: formatActionLogInspectorEntry(entry),
  }));
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
  const items = createActionLogInspectorItems(entries);

  if (items.length === 0) {
    const empty = documentRef.createElement("li");
    empty.className = "action-log__empty";
    empty.textContent = options.emptyText ?? "Waiting for ActionRef";
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
