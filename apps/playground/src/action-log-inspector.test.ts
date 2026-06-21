import { describe, expect, it } from "vitest";
import type { UiActionLogEntry } from "@ludoweave/core";

import {
  createActionLogInspectorItems,
  formatActionLogInspectorEntry,
} from "./action-log-inspector.js";

describe("ActionRef log inspector", () => {
  it("formats entries for a lightweight action history", () => {
    const entries: readonly UiActionLogEntry[] = [
      {
        sequence: 1,
        action: {
          type: "runtime.gameplay.interact",
        },
        nodeId: "root/key:prompt",
        label: "Press E",
      },
      {
        sequence: 2,
        action: {
          type: "runtime.objective.inspect",
          payload: {
            objectiveId: "delivery",
          },
        },
        nodeId: "root/key:objective.delivery",
        label: "Deliver the cell",
      },
    ];

    expect(createActionLogInspectorItems(entries)).toEqual([
      {
        sequence: 1,
        actionType: "runtime.gameplay.interact",
        text: "runtime.gameplay.interact - Press E",
      },
      {
        sequence: 2,
        actionType: "runtime.objective.inspect",
        text: 'runtime.objective.inspect - Deliver the cell - {"objectiveId":"delivery"}',
      },
    ]);
    expect(formatActionLogInspectorEntry(entries[1]!)).toBe(
      'runtime.objective.inspect - Deliver the cell - {"objectiveId":"delivery"}',
    );
  });
});
