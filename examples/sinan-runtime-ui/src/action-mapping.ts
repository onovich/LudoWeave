import type { ActionRefInput } from "@ludoweave/core";

import type { RuntimeUIPromptElement } from "./view-model.js";

export function mapRuntimeUIPromptAction(element: RuntimeUIPromptElement): ActionRefInput {
  if (element.payload === undefined) {
    return element.action;
  }

  if (typeof element.action === "string") {
    return {
      type: element.action,
      payload: element.payload,
    };
  }

  return {
    ...element.action,
    payload: element.payload,
  };
}
