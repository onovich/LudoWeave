import { createRichTextPlainFallbackFixture } from "@ludoweave/testing";
import { describe, expect, it } from "vitest";

import { createHeadlessRenderer, serializeHeadlessFrame } from "../src/index.js";

describe("headless rich text fallback fixture", () => {
  it("serializes plain fallback text without parsing rich markup", () => {
    const fixture = createRichTextPlainFallbackFixture();
    const renderer = createHeadlessRenderer({ id: "rich-text-fallback.headless" });
    const result = renderer.render(fixture.frame);

    expect(result.frame).toBe(fixture.frame);
    expect(result.snapshot).toBe(serializeHeadlessFrame(fixture.frame));
    expect(result.snapshot).toContain('"frameId": 4800');
    expect(result.snapshot).toContain('"plainTextFallback": "Mira: The north gate is sealed."');
    expect(result.snapshot).toContain('"text": "Mira: The north gate is sealed."');
    expect(result.snapshot).not.toContain("innerHTML");
    expect(result.snapshot).not.toContain("contenteditable");
    expect(fixture.metadata.diagnostics).toHaveLength(2);
  });
});
