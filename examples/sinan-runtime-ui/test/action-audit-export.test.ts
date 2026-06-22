import { describe, expect, it } from "vitest";

import { createActionLogInspectorExportPayload } from "../../../apps/playground/src/action-log-inspector.js";
import {
  createGateDemoActionAuditExportPayload,
  createSinanActionAuditExportJson,
  createSinanActionAuditExportPayload,
  createSinanUIActionRefRegistryMock,
  sinanActionAuditExportVersion,
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
});
