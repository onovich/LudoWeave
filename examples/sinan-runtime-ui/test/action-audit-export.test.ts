import { describe, expect, it } from "vitest";
import { normalizeHostInputIntent } from "@ludoweave/core";
import {
  createModalFocusNavigationDraft,
  createModalFocusNavigationSequence,
} from "@ludoweave/components";

import { createActionLogInspectorExportPayload } from "../../../apps/playground/src/action-log-inspector.js";
import {
  createGateDemoActionAuditExportPayload,
  createGateDemoScrollAuditExportPayload,
  createGateDemoVirtualListAuditExportPayload,
  createSinanActionAuditExportJson,
  createSinanActionAuditExportPayload,
  createSinanUIActionRefRegistryMock,
  sinanActionAuditExportVersion,
  sinanScrollAuditExportVersion,
  sinanVirtualListAuditExportVersion,
  sinanUIActionRegistryDiagnosticCodes,
} from "../src/index.js";

describe("Sinan ActionRef audit export", () => {
  it("exports Gate Demo ActionRefs with routing result, frame id, source node, and diagnostics", () => {
    const payload = createGateDemoActionAuditExportPayload();

    expect(payload.version).toBe(sinanActionAuditExportVersion);
    expect(payload.entries.map((entry) => entry.actionType)).toEqual([
      "runtime.gameplay.interact",
      "runtime.objective.inspect",
      "runtime.pause.resume",
      "runtime.pause.close",
    ]);
    expect(payload.entries[0]).toEqual({
      sequence: 1,
      frameId: "gate-demo:1024",
      actionType: "runtime.gameplay.interact",
      payload: {
        targetId: "switch_a",
      },
      routingResult: "accepted",
      source: {
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        label: "Press E",
      },
      diagnostics: [],
    });
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("includes routing diagnostics for non-accepted registry results", () => {
    const registry = createSinanUIActionRefRegistryMock({
      disabledActionTypes: ["runtime.pause.close"],
    });

    registry.route("runtime.pause.close", {
      frameId: "gate-demo:1024",
      nodeId: "runtime.main/key:pause.menu/key:cancel",
      label: "Cancel",
    });

    expect(createSinanActionAuditExportPayload(registry.auditLogSnapshot())).toEqual({
      version: sinanActionAuditExportVersion,
      entries: [
        {
          sequence: 1,
          frameId: "gate-demo:1024",
          actionType: "runtime.pause.close",
          routingResult: "disabled",
          source: {
            nodeId: "runtime.main/key:pause.menu/key:cancel",
            label: "Cancel",
          },
          diagnostics: [
            {
              code: sinanUIActionRegistryDiagnosticCodes.disabled,
              severity: "warning",
              message: 'Sinan registry mock routed "runtime.pause.close" as disabled.',
              path: ["action-registry", "disabled"],
              details: {
                actionType: "runtime.pause.close",
                frameId: "gate-demo:1024",
                routingResult: "disabled",
              },
            },
          ],
        },
      ],
    });
  });

  it("keeps the audit export JSON-only and compatible with inspector exports", () => {
    const auditPayload = createGateDemoActionAuditExportPayload();
    const auditJson = createSinanActionAuditExportJson(
      createSinanUIActionRefRegistryMock().auditLogSnapshot(),
    );
    const inspectorPayload = createActionLogInspectorExportPayload([
      {
        sequence: auditPayload.entries[0]!.sequence,
        action: {
          type: auditPayload.entries[0]!.actionType,
          payload: auditPayload.entries[0]!.payload,
        },
        nodeId: auditPayload.entries[0]!.source.nodeId,
        label: auditPayload.entries[0]!.source.label,
      },
    ]);

    expect(JSON.stringify(auditPayload)).not.toContain("HTML");
    expect(JSON.stringify(auditPayload)).not.toContain("MouseEvent");
    expect(JSON.stringify(auditPayload)).not.toContain("KeyboardEvent");
    expect(JSON.parse(JSON.stringify(auditPayload))).toEqual(auditPayload);
    expect(JSON.parse(auditJson)).toEqual({
      version: sinanActionAuditExportVersion,
      entries: [],
    });
    expect(inspectorPayload.entries[0]?.actionType).toBe("runtime.gameplay.interact");
  });

  it("exports modal navigation ActionRefs through the existing inspector payload", () => {
    const draft = createModalFocusNavigationDraft({
      scopeId: "pause.dialog",
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
    const sequence = createModalFocusNavigationSequence(draft, [
      normalizeHostInputIntent({ kind: "navigate", direction: "down", focusId: "resume" }),
      normalizeHostInputIntent({ kind: "confirm", focusId: "cancel" }),
    ]);

    expect(createActionLogInspectorExportPayload(sequence.actionLog)).toMatchObject({
      version: "ludoweave.action-log-inspector.v0.3",
      entries: [
        {
          sequence: 1,
          actionType: "runtime.ui.cancel",
          text: "runtime.ui.cancel - cancel",
        },
      ],
    });
    expect(JSON.parse(JSON.stringify(sequence))).toEqual(sequence);
  });

  it("exports Gate Demo scroll intent, registry, and diagnostics review payloads", () => {
    const payload = createGateDemoScrollAuditExportPayload();

    expect(payload.version).toBe(sinanScrollAuditExportVersion);
    expect(payload.entries.map((entry) => entry.intentKind)).toEqual([
      "line",
      "page",
      "edge",
      "restore",
    ]);
    expect(payload.entries.every((entry) => entry.actionType === "runtime.scroll.intent")).toBe(
      true,
    );
    expect(payload.entries.every((entry) => entry.routingResult === "accepted")).toBe(true);
    expect(payload.entries[0]).toMatchObject({
      sequence: 1,
      frameId: "gate-demo:1024",
      intentKind: "line",
      containerId: "gate-demo-objective-scroll",
      actionType: "runtime.scroll.intent",
      payload: {
        kind: "line",
        containerId: "gate-demo-objective-scroll",
        axis: "y",
        repeat: false,
        direction: "down",
      },
      source: {
        nodeId: "runtime.main/key:objective.delivery.cell",
        label: "Gate Demo scroll intent",
      },
      diagnostics: [],
    });
    expect(JSON.stringify(payload)).not.toContain("WheelEvent");
    expect(JSON.stringify(payload)).not.toContain("scrollTop");
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("exports Gate Demo virtual list window, selection, registry, and diagnostics review payloads", () => {
    const payload = createGateDemoVirtualListAuditExportPayload();

    expect(payload.version).toBe(sinanVirtualListAuditExportVersion);
    expect(payload.entries.map((entry) => entry.intentKind)).toEqual([
      "select-item",
      "activate-item",
      "move-selection",
      "request-window",
      "restore-selection",
    ]);
    expect(payload.entries.every((entry) => entry.actionType === "runtime.collection.intent")).toBe(
      true,
    );
    expect(payload.entries.every((entry) => entry.windowId === "gate-demo-quest-window")).toBe(
      true,
    );
    expect(payload.entries.every((entry) => entry.routingResult === "accepted")).toBe(true);
    expect(payload.entries[0]).toMatchObject({
      sequence: 1,
      frameId: "gate-demo:1024",
      intentKind: "select-item",
      windowId: "gate-demo-quest-window",
      itemKey: "quest:3",
      actionType: "runtime.collection.intent",
      payload: {
        kind: "select-item",
        windowId: "gate-demo-quest-window",
        itemKeyNamespace: "quest",
        repeat: false,
        itemKey: "quest:3",
      },
      source: {
        nodeId: "runtime.main/key:quest-log",
        label: "Gate Demo virtual list intent",
      },
      diagnostics: [],
    });
    expect(JSON.stringify(payload)).not.toContain("Promise");
    expect(JSON.stringify(payload)).not.toContain("datasource");
    expect(JSON.stringify(payload)).not.toContain("HTMLElement");
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });
});
