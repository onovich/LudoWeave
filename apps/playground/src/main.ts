import {
  calculateFixedVirtualWindowRange,
  collectRichTextDiagnostics,
  collectVirtualWindowDiagnostics,
  createActionLog,
  normalizeHostCollectionIntent,
  normalizeHostRichTextPolicySnapshot,
  normalizeHostScrollIntent,
  normalizeHostInputIntent,
  normalizeRichTextMetadata,
  normalizeScrollMetadataFrame,
  normalizeScrollOffsetForContainer,
  normalizeVirtualWindowMetadata,
  resolveRichTextThemeTokenRefs,
  resolveScrollRestoration,
  reviewRichTextA11yMetadata,
  runtimeUiThemeTokens,
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
const virtualListSmokeRoot = requireElement("#virtual-list-smoke");
const virtualListStatus = requireElement("#virtual-list-status");
const richTextSmokeRoot = requireElement("#rich-text-smoke");
const richTextStatus = requireElement("#rich-text-status");
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
renderVirtualListSmoke();
renderRichTextSmoke();
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

function renderVirtualListSmoke(): void {
  const range = calculateFixedVirtualWindowRange({
    totalCount: 12,
    itemExtent: 48,
    viewportExtent: 144,
    scrollOffset: 192,
    overscan: { before: 1, after: 2 },
  });
  const virtualWindow = normalizeVirtualWindowMetadata({
    id: "quest-log-window",
    nodeId: "runtime.overlay/key:quest-log",
    itemKeyNamespace: "quest",
    totalCount: range.totalCount,
    realizedRange: range.realizedRange,
    overscanRange: range.overscanRange,
    estimatedItemSize: { width: 420, height: range.itemExtent },
    viewportRect: { x: 80, y: 120, width: 420, height: 144 },
    scrollContainerId: "quest-log-scroll",
    selection: { selectedKey: "quest:5", focusedKey: "quest:5", revision: 2 },
    hostCapability: { status: "available" },
  });
  const hostIntents = [
    normalizeHostCollectionIntent({
      kind: "select-item",
      windowId: virtualWindow.id,
      itemKeyNamespace: virtualWindow.itemKeyNamespace,
      itemKey: "quest:5",
    }),
    normalizeHostCollectionIntent({
      kind: "activate-item",
      windowId: virtualWindow.id,
      itemKeyNamespace: virtualWindow.itemKeyNamespace,
      itemKey: "quest:5",
    }),
    normalizeHostCollectionIntent({
      kind: "move-selection",
      windowId: virtualWindow.id,
      itemKeyNamespace: virtualWindow.itemKeyNamespace,
      direction: "next",
      repeat: true,
    }),
    normalizeHostCollectionIntent({
      kind: "request-window",
      windowId: virtualWindow.id,
      itemKeyNamespace: virtualWindow.itemKeyNamespace,
      requestedRange: { startIndex: 6, endIndex: 9 },
    }),
    normalizeHostCollectionIntent({
      kind: "restore-selection",
      windowId: virtualWindow.id,
      itemKeyNamespace: virtualWindow.itemKeyNamespace,
      restoreSelection: virtualWindow.selection,
    }),
  ];
  const diagnostics = collectVirtualWindowDiagnostics({
    window: {
      id: "stale-quest-window",
      itemKeyNamespace: "quest",
      totalCount: 10,
      realizedRange: { startIndex: 2, endIndex: 6 },
      estimatedItemSize: { width: 420, height: 48 },
      hostCapability: { status: "missing", reason: "missing-capability" },
      selection: {
        selectedKey: "quest:removed",
        focusedKey: "quest:9",
        anchorKey: "quest:2",
      },
    },
    realizedItems: [
      { index: 2, key: "quest:2" },
      { index: 3 },
      { index: 4, key: "quest:4" },
      { index: 5, key: "quest:4" },
    ],
    knownItemKeys: ["quest:2", "quest:3", "quest:4", "quest:9"],
  }).map((diagnostic) => diagnostic.code);

  virtualListStatus.textContent = "PASS";
  virtualListStatus.dataset.virtualListStatus = "pass";
  virtualListSmokeRoot.dataset.virtualListWindowId = virtualWindow.id;
  virtualListSmokeRoot.dataset.virtualListRealizedRange = `${virtualWindow.realizedRange.startIndex}:${virtualWindow.realizedRange.endIndex}`;
  virtualListSmokeRoot.dataset.virtualListSelection = virtualWindow.selection.selectedKey ?? "";
  virtualListSmokeRoot.dataset.virtualListIntentCount = String(hostIntents.length);
  virtualListSmokeRoot.dataset.virtualListDiagnosticCount = String(diagnostics.length);
  virtualListSmokeRoot.replaceChildren(
    createVirtualListMeta("Window", virtualWindow.id),
    createVirtualListMeta(
      "Realized range",
      `${virtualWindow.realizedRange.startIndex}-${virtualWindow.realizedRange.endIndex}`,
    ),
    createVirtualListMeta("Selection", virtualWindow.selection.selectedKey ?? "none"),
    createVirtualListList(
      "Metadata",
      [
        `total:${virtualWindow.totalCount}`,
        `overscan:${virtualWindow.overscanRange.startIndex}-${virtualWindow.overscanRange.endIndex}`,
        `host:${virtualWindow.hostCapability.status}`,
      ],
      "virtual-list-metadata",
    ),
    createVirtualListList(
      "Host intents",
      hostIntents.map((intent) => `${intent.kind}:${intent.action.type}`),
      "virtual-list-intent",
    ),
    createVirtualListList("Diagnostics", diagnostics, "virtual-list-diagnostic"),
  );
}

function renderRichTextSmoke(): void {
  const richText = normalizeRichTextMetadata({
    id: "subtitle.rich-text-smoke",
    nodeId: "runtime.overlay/key:subtitle.primary",
    localeHint: "en-US",
    plainTextFallback: "Mira: The north gate is sealed. <unsafe>",
    spans: [
      {
        id: "span.speaker",
        kind: "speaker",
        label: "Speaker",
        rendererHints: ["speaker"],
        themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
      },
      {
        id: "span.tone",
        kind: "tone",
        label: "Warning",
        parentSpanId: "span.speaker",
        rendererHints: ["accent"],
        themeTokenRefs: [runtimeUiThemeTokens.objective.title],
      },
      {
        id: "span.unsupported",
        kind: "unsupported",
        fallbackText: "[sigil]",
        rendererHints: ["muted"],
      },
    ],
    runs: [
      {
        id: "run.speaker",
        text: "Mira",
        spanIds: ["span.speaker"],
        themeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
        rendererHints: ["speaker"],
      },
      {
        id: "run.body",
        text: ": The north gate is sealed. ",
        spanIds: ["span.tone"],
        themeTokenRefs: [runtimeUiThemeTokens.objective.title],
        rendererHints: ["accent"],
      },
      {
        id: "run.unsafe",
        text: "<unsafe>",
        spanIds: ["span.unsupported"],
        rendererHints: ["muted"],
      },
    ],
    hostPolicy: {
      localizedContent: "approved",
      markupPolicy: "approved",
      sanitization: "approved",
      accessibilityReview: "pending",
    },
    a11y: {
      label: "Mira says the north gate is sealed.",
      description: "Host-reviewed dialogue fallback.",
      liveRegion: "polite",
      pronunciationHint: "Mee-rah",
      reviewStatus: "pending",
    },
  });
  const hostPolicy = normalizeHostRichTextPolicySnapshot({
    blockId: richText.id,
    localeHint: richText.localeHint,
    contentRevision: 1,
    accessibilityReview: { status: "pending" },
  });
  const tokenResolution = resolveRichTextThemeTokenRefs({
    metadata: richText,
    knownThemeTokenRefs: [runtimeUiThemeTokens.subtitle.text, runtimeUiThemeTokens.objective.title],
    context: { focused: true },
  });
  const a11yReview = reviewRichTextA11yMetadata({ metadata: richText });
  const diagnostics = collectRichTextDiagnostics({
    metadata: {
      id: "subtitle.rich-text-diagnostic",
      nodeId: "runtime.overlay/key:subtitle.diagnostic",
      localeHint: "en-US",
      plainTextFallback: "",
      spans: [
        { id: "span.unsupported", kind: "unsupported" },
        { id: "span.one", kind: "emphasis" },
        { id: "span.two", kind: "tone", parentSpanId: "span.one" },
        { id: "span.three", kind: "speaker", parentSpanId: "span.two" },
      ],
      runs: [
        { id: "run.empty", text: "" },
        { id: "run.unknown-token", text: "Unknown", themeTokenRefs: ["runtime-ui.unknown.text"] },
      ],
      hostPolicy: { sanitization: "missing" },
      a11y: { label: "Diagnostic rich text.", reviewStatus: "missing" },
    },
    knownThemeTokenRefs: [runtimeUiThemeTokens.subtitle.text],
    hostPolicy,
    maxNestedSpanDepth: 2,
  }).map((diagnostic) => diagnostic.code);
  const policyRows = [
    `localized:${hostPolicy.localizedContent.status}`,
    `markup:${hostPolicy.markupPolicy.status}`,
    `sanitization:${hostPolicy.sanitization.status}`,
    `a11y:${hostPolicy.accessibilityReview.status}`,
    `measurement:${hostPolicy.textMeasurement.status}`,
  ];

  richTextStatus.textContent = "PASS";
  richTextStatus.dataset.richTextStatus = "pass";
  richTextSmokeRoot.dataset.richTextBlockId = richText.id;
  richTextSmokeRoot.dataset.richTextFallback = richText.plainTextFallback;
  richTextSmokeRoot.dataset.richTextRunCount = String(richText.runs.length);
  richTextSmokeRoot.dataset.richTextDiagnosticCount = String(diagnostics.length);
  richTextSmokeRoot.replaceChildren(
    createRichTextMeta("Block", richText.id),
    createRichTextMeta("Fallback", richText.plainTextFallback),
    createRichTextMeta("A11y label", a11yReview.label),
    createRichTextList(
      "Runs",
      richText.runs.map((run) => `${run.id}:${run.text}`),
      "rich-text-run",
    ),
    createRichTextList(
      "Spans",
      richText.spans.map((span) => `${span.kind}:${span.id}`),
      "rich-text-span",
    ),
    createRichTextList("Host policy", policyRows, "rich-text-policy"),
    createRichTextList(
      "Theme tokens",
      tokenResolution.usages.map(
        (usage) => `${usage.ownerKind}:${usage.ownerId}:${usage.tokenRef}:${usage.status}`,
      ),
      "rich-text-token",
    ),
    createRichTextList(
      "A11y diagnostics",
      a11yReview.diagnostics.map((diagnostic) => diagnostic.code),
      "rich-text-a11y-diagnostic",
    ),
    createRichTextList("Diagnostics", diagnostics, "rich-text-diagnostic"),
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

function createVirtualListMeta(label: string, value: string): HTMLElement {
  const row = document.createElement("p");
  row.className = "virtual-list-smoke__meta";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  row.replaceChildren(labelElement, valueElement);
  return row;
}

function createVirtualListList(
  label: string,
  values: readonly string[],
  itemAttribute: string,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "virtual-list-smoke__group";

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

function createRichTextMeta(label: string, value: string): HTMLElement {
  const row = document.createElement("p");
  row.className = "rich-text-smoke__meta";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  row.replaceChildren(labelElement, valueElement);
  return row;
}

function createRichTextList(
  label: string,
  values: readonly string[],
  itemAttribute: string,
): HTMLElement {
  const group = document.createElement("div");
  group.className = "rich-text-smoke__group";

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
