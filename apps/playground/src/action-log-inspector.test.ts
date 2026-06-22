import { describe, expect, it } from "vitest";
import type { UiActionLogEntry } from "@ludoweave/core";

import {
  createActionLogInspectorItems,
  formatActionLogInspectorEntry,
  getActionLogInspectorEmptyText,
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

  it("filters entries by exact action type", () => {
    expect(
      createActionLogInspectorItems(createEntries(), {
        filter: {
          kind: "action-type",
          actionType: "runtime.objective.inspect",
        },
      }),
    ).toEqual([
      {
        sequence: 2,
        actionType: "runtime.objective.inspect",
        text: 'runtime.objective.inspect - Deliver the cell - {"objectiveId":"delivery"}',
      },
    ]);
  });

  it("filters multiple entries by action namespace", () => {
    expect(
      createActionLogInspectorItems(createEntries(), {
        filter: {
          kind: "namespace",
          namespace: "runtime.pause",
        },
      }).map((item) => item.actionType),
    ).toEqual(["runtime.pause.resume", "runtime.pause.close"]);
  });

  it("returns an empty list for no match and stale empty history cases", () => {
    const staleFilter = {
      kind: "namespace",
      namespace: "runtime.dialogue",
    } as const;

    expect(createActionLogInspectorItems(createEntries(), { filter: staleFilter })).toEqual([]);
    expect(createActionLogInspectorItems([], { filter: staleFilter })).toEqual([]);
    expect(getActionLogInspectorEmptyText([], { filter: staleFilter })).toBe(
      "Waiting for ActionRef",
    );
    expect(getActionLogInspectorEmptyText(createEntries(), { filter: staleFilter })).toBe(
      "No matching ActionRef",
    );
  });
});

function createEntries(): readonly UiActionLogEntry[] {
  return [
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
    {
      sequence: 3,
      action: {
        type: "runtime.pause.resume",
      },
      nodeId: "root/key:pause/key:confirm",
      label: "Confirm",
    },
    {
      sequence: 4,
      action: {
        type: "runtime.pause.close",
      },
      nodeId: "root/key:pause/key:cancel",
      label: "Cancel",
    },
  ];
}
