import { describe, expect, it } from "vitest";

import { createActionLogInspectorExportPayload } from "../../../apps/playground/src/action-log-inspector.js";
import {
  createSinanUIActionRefRegistryMock,
  gateDemoRuntimeUIViewModelEnvelope,
  sinanUIActionRegistryDiagnosticCodes,
} from "../src/index.js";
import type { SinanUIActionRefRoutingResult } from "../src/index.js";

describe("Sinan-like UIActionRef registry mock", () => {
  it("accepts Gate Demo runtime actions and records a deterministic audit log", () => {
    const registry = createSinanUIActionRefRegistryMock();
    const routed = registry.route(
      {
        type: "runtime.gameplay.interact",
        payload: {
          targetId: "switch_a",
        },
      },
      {
        frameId: gateDemoRuntimeUIViewModelEnvelope.frameId,
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        label: "Press E",
      },
    );

    expect(routed).toEqual({
      sequence: 1,
      frameId: "gate-demo:1024",
      action: {
        type: "runtime.gameplay.interact",
        payload: {
          targetId: "switch_a",
        },
      },
      source: {
        frameId: "gate-demo:1024",
        actionTargetId: "action.prompt.interact.switch_a",
        nodeId: "runtime.main/key:prompt.interact.switch_a",
        label: "Press E",
      },
      routingResult: "accepted",
      diagnostics: [],
    });
    expect(registry.auditLogSnapshot()).toEqual([routed]);
  });

  it("covers rejected, stale, unavailable, disabled, unknown, and no-op routing results", () => {
    const registry = createSinanUIActionRefRegistryMock({
      rejectedActionTypes: ["runtime.gameplay.reject"],
      unavailableActionTypes: ["runtime.gameplay.unavailable"],
      disabledActionTypes: ["runtime.gameplay.disabled"],
      noOpActionTypes: ["runtime.ui.noop"],
    });

    const cases: readonly {
      readonly actionType: string;
      readonly frameId?: string;
      readonly expected: SinanUIActionRefRoutingResult;
    }[] = [
      {
        actionType: "runtime.gameplay.reject",
        expected: "rejected",
      },
      {
        actionType: "runtime.gameplay.interact",
        frameId: "gate-demo:stale",
        expected: "stale",
      },
      {
        actionType: "runtime.gameplay.unavailable",
        expected: "unavailable",
      },
      {
        actionType: "runtime.gameplay.disabled",
        expected: "disabled",
      },
      {
        actionType: "runtime.dialogue.skip",
        expected: "unknown",
      },
      {
        actionType: "runtime.ui.noop",
        expected: "no-op",
      },
    ];

    expect(
      cases.map(({ actionType, frameId }) =>
        registry.route(actionType, {
          frameId,
          nodeId: `node.${actionType}`,
          label: actionType,
        }),
      ),
    ).toEqual([
      expect.objectContaining({ routingResult: "rejected" }),
      expect.objectContaining({ routingResult: "stale" }),
      expect.objectContaining({ routingResult: "unavailable" }),
      expect.objectContaining({ routingResult: "disabled" }),
      expect.objectContaining({ routingResult: "unknown" }),
      expect.objectContaining({ routingResult: "no-op" }),
    ]);
    expect(registry.auditLogSnapshot().map((entry) => entry.routingResult)).toEqual(
      cases.map((entry) => entry.expected),
    );
  });

  it("attaches stable diagnostics to non-accepted routing results", () => {
    const registry = createSinanUIActionRefRegistryMock({
      disabledActionTypes: ["runtime.gameplay.disabled"],
    });

    expect(registry.route("runtime.gameplay.disabled").diagnostics).toEqual([
      {
        code: sinanUIActionRegistryDiagnosticCodes.disabled,
        severity: "warning",
        message: 'Sinan registry mock routed "runtime.gameplay.disabled" as disabled.',
        path: ["action-registry", "disabled"],
        details: {
          actionType: "runtime.gameplay.disabled",
          frameId: "gate-demo:1024",
          routingResult: "disabled",
        },
      },
    ]);
  });

  it("keeps audit log and inspector export data JSON-only", () => {
    const registry = createSinanUIActionRefRegistryMock();

    registry.route("runtime.gameplay.interact", {
      nodeId: "runtime.main/key:prompt.interact.switch_a",
      label: "Press E",
    });
    registry.route("runtime.objective.inspect", {
      nodeId: "runtime.main/key:objective.delivery.cell",
      label: "Deliver the cell",
    });

    const auditLog = registry.auditLogSnapshot();
    const inspectorExport = createActionLogInspectorExportPayload(registry.actionLogSnapshot(), {
      filter: {
        kind: "namespace",
        namespace: "runtime.gameplay",
      },
    });

    expect(JSON.parse(JSON.stringify(auditLog))).toEqual(auditLog);
    expect(inspectorExport.entries).toEqual([
      {
        sequence: 1,
        actionType: "runtime.gameplay.interact",
        action: {
          type: "runtime.gameplay.interact",
        },
        source: {
          nodeId: "runtime.main/key:prompt.interact.switch_a",
          label: "Press E",
        },
        text: "runtime.gameplay.interact - Press E",
      },
    ]);
  });

  it("clears action and audit logs together", () => {
    const registry = createSinanUIActionRefRegistryMock();

    registry.route("runtime.gameplay.interact");
    registry.clear();

    expect(registry.auditLogSnapshot()).toEqual([]);
    expect(registry.actionLogSnapshot()).toEqual([]);
  });
});
