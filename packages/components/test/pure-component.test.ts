import { describe, expect, it } from "vitest";

import { definePureComponent } from "../src/index.js";

describe("definePureComponent", () => {
  it("defines a renderer-agnostic pure component convention", () => {
    const Label = definePureComponent<{ readonly text: string }>(
      {
        displayName: "Label",
      },
      ({ text }) => ({
        type: "text",
        key: "label",
        props: {
          text,
        },
      }),
    );

    expect(Label.kind).toBe("ludoweave.pure-component");
    expect(Label.metadata).toEqual({
      displayName: "Label",
    });
    expect(Label.render({ text: "Ready" })).toEqual({
      type: "text",
      key: "label",
      props: {
        text: "Ready",
      },
    });
  });

  it("normalizes metadata deterministically", () => {
    const Label = definePureComponent(
      {
        displayName: "  Label  ",
      },
      () => ({
        type: "text",
      }),
    );

    expect(Label.metadata.displayName).toBe("Label");
    expect(() =>
      definePureComponent(
        {
          displayName: " ",
        },
        () => ({
          type: "text",
        }),
      ),
    ).toThrow(/displayName/);
  });
});
