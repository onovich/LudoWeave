import { describe, expect, it } from "vitest";

import { Objective } from "../src/index.js";

describe("Objective", () => {
  it("renders a serializable active objective node", () => {
    expect(
      Objective.render({
        key: "objective.delivery",
        title: "Deliver the cell",
        body: "Bring the energy cell to the gate.",
      }),
    ).toEqual({
      type: "objective",
      key: "objective.delivery",
      props: {
        title: "Deliver the cell",
        body: "Bring the energy cell to the gate.",
        status: "active",
      },
      style: {
        themeToken: "runtime-ui.objective.root",
      },
    });
  });

  it("supports status and optional ActionRef", () => {
    expect(
      Objective.render({
        title: "Open the gate",
        status: "completed",
        action: {
          type: "runtime.objective.inspect",
          payload: {
            objectiveId: "gate",
          },
        },
      }),
    ).toEqual({
      type: "objective",
      key: "objective",
      props: {
        title: "Open the gate",
        status: "completed",
      },
      style: {
        themeToken: "runtime-ui.objective.root",
      },
      action: {
        type: "runtime.objective.inspect",
        payload: {
          objectiveId: "gate",
        },
      },
    });
  });
});
