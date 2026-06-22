import { createActionLog, type ResolvedActionTarget } from "@ludoweave/core";
import { mountDomRenderer } from "@ludoweave/renderer-dom";

import { renderActionLogInspector } from "./action-log-inspector.js";
import { createPlaygroundFrame } from "./frame.js";
import { renderThemeResolutionPanel } from "./theme-resolution-panel.js";
import "./styles.css";

const runtimeRoot = requireElement("#runtime-root");
const actionLogRoot = requireElement("#action-log");
const themeResolutionRoot = requireElement("#theme-resolution");
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
renderThemeResolutionPanel(themeResolutionRoot);
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
  renderActionLogInspector(actionLogRoot, actionLog.snapshot());
}

function requireElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}.`);
  }
  return element;
}
