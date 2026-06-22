import { describe, expect, it } from "vitest";

import {
  createScrollDiagnostic,
  scrollDiagnosticCodes,
} from "../src/scroll-diagnostics.js";

describe("scroll diagnostics", () => {
  it("uses stable diagnostic codes for scroll metadata failures", () => {
    expect(scrollDiagnosticCodes).toEqual({
      disabledScroll: "LW_SCROLL_DISABLED",
      emptyContainer: "LW_SCROLL_EMPTY_CONTAINER",
      missingHostCapability: "LW_SCROLL_MISSING_HOST_CAPABILITY",
      outOfRangeOffset: "LW_SCROLL_OUT_OF_RANGE_OFFSET",
      removedContainer: "LW_SCROLL_REMOVED_CONTAINER",
      staleContainer: "LW_SCROLL_STALE_CONTAINER",
    });
  });

  it("reports missing host capability as an error diagnostic", () => {
    expect(
      createScrollDiagnostic("missingHostCapability", {
        containerId: "quest-log",
        capability: "host.scroll",
      }),
    ).toEqual({
      code: "LW_SCROLL_MISSING_HOST_CAPABILITY",
      severity: "error",
      message: "Host scroll capability is missing.",
      details: {
        containerId: "quest-log",
        capability: "host.scroll",
      },
    });
  });
});
