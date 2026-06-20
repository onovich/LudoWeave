import { describe, expect, it } from "vitest";

import { createActionLog } from "../src/action-log.js";

describe("createActionLog", () => {
  it("records normalized ActionRefs with deterministic sequence numbers", () => {
    const log = createActionLog({ startSequence: 10 });

    expect(
      log.record({
        action: "runtime.ui.confirm",
        source: {
          actionTargetId: "action.confirm",
          nodeId: "root/key:confirm",
          label: "Confirm",
        },
      }),
    ).toEqual({
      sequence: 10,
      action: {
        type: "runtime.ui.confirm",
      },
      actionTargetId: "action.confirm",
      nodeId: "root/key:confirm",
      label: "Confirm",
    });
    expect(
      log.record({
        action: {
          type: "runtime.ui.cancel",
          payload: {
            dialogId: "pause",
          },
        },
      }),
    ).toEqual({
      sequence: 11,
      action: {
        type: "runtime.ui.cancel",
        payload: {
          dialogId: "pause",
        },
      },
    });
    expect(log.snapshot()).toMatchInlineSnapshot(`
      [
        {
          "action": {
            "type": "runtime.ui.confirm",
          },
          "actionTargetId": "action.confirm",
          "label": "Confirm",
          "nodeId": "root/key:confirm",
          "sequence": 10,
        },
        {
          "action": {
            "payload": {
              "dialogId": "pause",
            },
            "type": "runtime.ui.cancel",
          },
          "sequence": 11,
        },
      ]
    `);
  });

  it("rejects invalid sequences and arbitrary callback actions", () => {
    expect(() => createActionLog({ startSequence: -1 })).toThrow(/startSequence/);

    const log = createActionLog();
    expect(() =>
      log.record({
        action: (() => undefined) as never,
      }),
    ).toThrow(/ActionRef/);
  });
});
