import {
  createActionLog,
  normalizeHostScrollIntent,
  normalizeHostInputIntent,
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
  resolveScrollRestoration,
  type ResolvedActionTarget,
} from "@ludoweave/core";
import {
  createModalFocusNavigationDraft,
  createModalFocusNavigationSequence,
} from "@ludoweave/components";
import { mountDomRenderer } from "@ludoweave/renderer-dom";

import { gateDemoRuntimeUIViewModelEnvelope } from "../../../examples/sinan-runtime-ui/src/fixture.js";
import { mapRuntimeUIViewModelEnvelopeToResolvedFrame } from "../../../examples/sinan-runtime-ui/src/resolved-frame-adapter.js";
import {
  createActionLogInspectorExport,
  renderActionLogInspector,
  type ActionLogInspectorFilter,
} from "./action-log-inspector.js";
import { createPlaygroundFrame } from "./frame.js";
import { renderThemeResolutionPanel } from "./theme-resolution-panel.js";
import "./styles.css";

const runtimeRoot = requireElement("#runtime-root");
const actionLogRoot = requireElement("#action-log");
const actionLogFilter = requireElement<HTMLSelectElement>("#action-log-filter");
const actionLogExportButton = requireElement<HTMLButtonElement>("#action-log-export");
const actionLogClearButton = requireElement<HTMLButtonElement>("#action-log-clear");
const actionLogExportOutput = requireElement<HTMLPreElement>("#action-log-export-output");
const themeResolutionRoot = requireElement("#theme-resolution");
const gateDemoStage = requireElement("#gate-demo-stage");
const gateDemoRuntimeRoot = requireElement("#gate-demo-runtime-root");
const gateDemoStatus = requireElement("#gate-demo-status");
const navigationSmokeRoot = requireElement("#navigation-smoke");
const navigationStatus = requireElement("#navigation-status");
const scrollSmokeRoot = requireElement("#scroll-smoke");
const scrollStatus = requireElement("#scroll-status");
const actionLog = createActionLog();

const renderer = mountDomRenderer({
  root: runtimeRoot,
});
const gateDemoRenderer = mountDomRenderer({
  root: gateDemoRuntimeRoot,
  id: "ludoweave.dom.gate-demo",
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
renderGateDemoSmoke();
renderNavigationSmoke();
renderScrollSmoke();
window.addEventListener("resize", render);
window.addEventListener("resize", scaleGateDemoSmoke);
actionLogFilter.addEventListener("change", renderActionLog);
actionLogExportButton.addEventListener("click", exportActionLog);
actionLogClearButton.addEventListener("click", clearActionLog);

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
  renderActionLogInspector(actionLogRoot, actionLog.snapshot(), {
    filter: parseActionLogFilter(actionLogFilter.value),
  });
}

function exportActionLog(): void {
  actionLogExportOutput.textContent = createActionLogInspectorExport(actionLog.snapshot(), {
    filter: parseActionLogFilter(actionLogFilter.value),
  });
}

function clearActionLog(): void {
  actionLog.clear();
  actionLogExportOutput.textContent = "";
  renderActionLog();
}

function renderGateDemoSmoke(): void {
  const result = mapRuntimeUIViewModelEnvelopeToResolvedFrame(gateDemoRuntimeUIViewModelEnvelope);

  if (result.frame === undefined) {
    gateDemoStatus.textContent = "FAIL";
    gateDemoStatus.dataset.gateDemoStatus = "fail";
    gateDemoStatus.dataset.gateDemoDiagnostics = String(result.diagnostics.length);
    return;
  }

  gateDemoRenderer.render(result.frame);
  gateDemoStatus.textContent = result.ok ? "PASS" : "FAIL";
  gateDemoStatus.dataset.gateDemoStatus = result.ok ? "pass" : "fail";
  gateDemoStatus.dataset.gateDemoDiagnostics = String(result.diagnostics.length);
  scaleGateDemoSmoke();
}

function scaleGateDemoSmoke(): void {
  const widthScale = gateDemoStage.clientWidth / 1280;
  const heightScale = gateDemoStage.clientHeight / 720;
  const scale = Math.max(0.1, Math.min(widthScale, heightScale));

  gateDemoRuntimeRoot.style.width = "1280px";
  gateDemoRuntimeRoot.style.height = "720px";
  gateDemoRuntimeRoot.style.transform = `scale(${scale})`;
}

function renderNavigationSmoke(): void {
  const draft = createModalFocusNavigationDraft({
    scopeId: "pause.dialog",
    initialFocusId: "resume",
    restoreFocusKey: "hud.pause-button",
    controls: [
      {
        id: "resume",
        rect: { x: 440, y: 320, width: 240, height: 44 },
        action: "runtime.pause.resume",
      },
      {
        id: "cancel",
        rect: { x: 440, y: 376, width: 240, height: 44 },
        action: "runtime.ui.cancel",
      },
    ],
  });
  const intents = [
    normalizeHostInputIntent({ kind: "navigate", direction: "down", focusId: "resume" }),
    normalizeHostInputIntent({ kind: "confirm", focusId: "cancel" }),
    normalizeHostInputIntent({ kind: "cancel" }),
  ];
  const sequence = createModalFocusNavigationSequence(draft, intents);

  navigationStatus.textContent = "PASS";
  navigationStatus.dataset.navigationStatus = "pass";
  navigationSmokeRoot.dataset.navigationCurrentFocus = draft.focusGraph.currentFocusId ?? "";
  navigationSmokeRoot.dataset.navigationIntentCount = String(intents.length);
  navigationSmokeRoot.dataset.navigationActionCount = String(sequence.actionLog.length);
  navigationSmokeRoot.replaceChildren(
    createNavigationMeta("Scope", draft.scope.scopeId),
    createNavigationMeta("Current focus", draft.focusGraph.currentFocusId ?? "none"),
    createNavigationMeta("Restore focus", draft.scope.restoreFocusKey ?? "none"),
    createNavigationList(
      "Focus graph",
      draft.focusGraph.nodes.map((node) => `${node.id}:${node.scopeId}`),
      "navigation-focus-node",
    ),
    createNavigationList(
      "Host intents",
      intents.map((intent) =>
        intent.kind === "navigate" ? `${intent.kind}:${intent.direction}` : intent.kind,
      ),
      "navigation-intent",
    ),
    createNavigationList(
      "ActionRef outputs",
      sequence.actionLog.map((entry) => entry.action.type),
      "navigation-action",
    ),
  );
}

function renderScrollSmoke(): void {
  const scrollMetadata = normalizeScrollMetadataFrame({
    activeContainerId: "quest-log-scroll",
    containers: [
      {
        id: "quest-log-scroll",
        nodeId: "runtime.overlay/key:quest-log",
        contentRect: { x: 80, y: 120, width: 360, height: 640 },
        viewportRect: { x: 80, y: 120, width: 360, height: 220 },
        axis: "y",
        offset: { x: 0, y: 180, revision: 3 },
        extent: { width: 360, height: 640 },
        hostCapability: { status: "available" },
      },
    ],
  });
  const scrollContainer = scrollMetadata.containers[0];
  if (scrollContainer === undefined) {
    throw new Error("Scroll smoke expected one scroll container.");
  }

  const offset = normalizeScrollOffsetForContainer(scrollContainer);
  const hostIntents = [
    normalizeHostScrollIntent({
      kind: "line",
      containerId: scrollContainer.id,
      direction: "down",
    }),
    normalizeHostScrollIntent({
      kind: "page",
      containerId: scrollContainer.id,
      direction: "down",
    }),
    normalizeHostScrollIntent({
      kind: "edge",
      containerId: scrollContainer.id,
      edge: "end",
    }),
    normalizeHostScrollIntent({
      kind: "restore",
      containerId: scrollContainer.id,
      restoreOffset: offset.normalizedOffset,
    }),
  ];
  const diagnosticsSource = normalizeScrollOffsetForContainer(
    {
      id: "stale-empty-scroll",
      contentRect: { x: 0, y: 0, width: 0, height: 0 },
      viewportRect: { x: 0, y: 0, width: 320, height: 160 },
      offset: { y: 24 },
      extent: { width: 0, height: 0 },
      hostCapability: { status: "missing", reason: "stale" },
      disabledReason: "stale",
    },
    { y: 24 },
  );
  const removedRestoration = resolveScrollRestoration(
    {
      containers: [scrollContainer],
    },
    "removed-scroll",
    { y: 120 },
  );
  const diagnostics = [
    ...diagnosticsSource.diagnostics.map((diagnostic) => diagnostic.code),
    ...removedRestoration.diagnostics.map((diagnostic) => diagnostic.code),
  ];

  scrollStatus.textContent = "PASS";
  scrollStatus.dataset.scrollStatus = "pass";
  scrollSmokeRoot.dataset.scrollContainerId = scrollContainer.id;
  scrollSmokeRoot.dataset.scrollOffsetY = String(offset.normalizedOffset.y);
  scrollSmokeRoot.dataset.scrollIntentCount = String(hostIntents.length);
  scrollSmokeRoot.dataset.scrollDiagnosticCount = String(diagnostics.length);
  scrollSmokeRoot.replaceChildren(
    createScrollMeta("Container", scrollContainer.id),
    createScrollMeta("Visible box", `0,${offset.normalizedOffset.y},360,220`),
    createScrollMeta("Offset", `x:${offset.normalizedOffset.x} y:${offset.normalizedOffset.y}`),
    createScrollList(
      "Metadata",
      [
        `axis:${scrollContainer.axis}`,
        `extent:${scrollContainer.extent.width}x${scrollContainer.extent.height}`,
        `host:${scrollContainer.hostCapability.status}`,
      ],
      "scroll-metadata",
    ),
    createScrollList(
      "Host intents",
      hostIntents.map((intent) => `${intent.kind}:${intent.action.type}`),
      "scroll-intent",
    ),
    createScrollList("Diagnostics", diagnostics, "scroll-diagnostic"),
  );
}

function createNavigationMeta(label: string, value: string): HTMLElement {
  const row = document.createElement("p");
  row.className = "navigation-smoke__meta";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  row.replaceChildren(labelElement, valueElement);
  return row;
}

function createNavigationList(
  label: string,
  values: readonly string[],
  itemAttribute: string,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "navigation-smoke__group";

  const heading = document.createElement("h3");
  heading.textContent = label;

  const list = document.createElement("ol");
  for (const value of values) {
    const item = document.createElement("li");
    item.setAttribute(`data-${itemAttribute}`, value);
    item.textContent = value;
    list.append(item);
  }

  group.replaceChildren(heading, list);
  return group;
}

function createScrollMeta(label: string, value: string): HTMLElement {
  const row = document.createElement("p");
  row.className = "scroll-smoke__meta";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  row.replaceChildren(labelElement, valueElement);
  return row;
}

function createScrollList(
  label: string,
  values: readonly string[],
  itemAttribute: string,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "scroll-smoke__group";

  const heading = document.createElement("h3");
  heading.textContent = label;

  const list = document.createElement("ol");
  for (const value of values) {
    const item = document.createElement("li");
    item.setAttribute(`data-${itemAttribute}`, value);
    item.textContent = value;
    list.append(item);
  }

  group.replaceChildren(heading, list);
  return group;
}

function parseActionLogFilter(value: string): ActionLogInspectorFilter {
  const [kind, query] = value.split(":", 2);
  if (kind === "namespace" && query !== undefined && query.length > 0) {
    return { kind: "namespace", namespace: query };
  }

  if (kind === "type" && query !== undefined && query.length > 0) {
    return { kind: "action-type", actionType: query };
  }

  return { kind: "all" };
}

function requireElement<TElement extends HTMLElement = HTMLElement>(selector: string): TElement {
  const element = document.querySelector<TElement>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}.`);
  }
  return element;
}
