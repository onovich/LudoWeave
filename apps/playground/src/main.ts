import { mountDomRenderer } from "@ludoweave/renderer-dom";
import { createActionLog, type ResolvedActionTarget, type UiActionLogEntry } from "@ludoweave/core";

import { createPlaygroundFrame } from "./frame.js";
import "./styles.css";

const runtimeRoot = requireElement("#runtime-root");
const actionLogRoot = requireElement("#action-log");
const actionLog = createActionLog();

const renderer = mountDomRenderer({
  root: runtimeRoot,
});

function render(): void {
  const bounds = runtimeRoot.getBoundingClientRect();
  const frame = createPlaygroundFrame({
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height),
    devicePixelRatio: window.devicePixelRatio || 1,
  });

  renderer.render(frame);
  wireActionTargets(frame.actions);
}

renderActionLog();
render();
window.addEventListener("resize", render);

function wireActionTargets(actions: readonly ResolvedActionTarget[]): void {
  const elements = runtimeRoot.querySelectorAll<HTMLElement>("[data-ludoweave-node-id]");
  for (const action of actions) {
    const element = Array.from(elements).find(
      (candidate) => candidate.dataset.ludoweaveNodeId === action.nodeId,
    );
    if (element === undefined) {
      continue;
    }

    element.addEventListener("click", () => recordAction(action));
    if (element.tagName === "BUTTON") {
      continue;
    }

    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      recordAction(action);
    });
  }
}

function recordAction(action: ResolvedActionTarget): void {
  actionLog.record({
    action: action.action,
    source: {
      actionTargetId: action.id,
      nodeId: action.nodeId,
      ...(action.label === undefined ? {} : { label: action.label }),
    },
  });
  renderActionLog();
}

function renderActionLog(): void {
  const entries = actionLog.snapshot();
  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "action-log__empty";
    empty.textContent = "Waiting for ActionRef";
    actionLogRoot.replaceChildren(empty);
    return;
  }

  actionLogRoot.replaceChildren(...entries.map(createActionLogItem));
}

function createActionLogItem(entry: UiActionLogEntry): HTMLLIElement {
  const item = document.createElement("li");
  item.dataset.actionSequence = String(entry.sequence);
  item.dataset.actionType = entry.action.type;
  item.textContent = formatActionLogEntry(entry);
  return item;
}

function formatActionLogEntry(entry: UiActionLogEntry): string {
  const label = entry.label === undefined ? "" : ` · ${entry.label}`;
  const payload =
    entry.action.payload === undefined ? "" : ` · ${JSON.stringify(entry.action.payload)}`;
  return `${entry.action.type}${label}${payload}`;
}

function requireElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}.`);
  }
  return element;
}
