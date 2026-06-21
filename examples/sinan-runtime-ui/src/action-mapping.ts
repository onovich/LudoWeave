import type { ActionRefInput } from "@ludoweave/core";

import type { RuntimeUIObjectiveElement, RuntimeUIPromptElement } from "./view-model.js";

type RuntimeUIActionPayload =
  | RuntimeUIPromptElement["payload"]
  | RuntimeUIObjectiveElement["payload"];

export function mapRuntimeUIPromptAction(element: RuntimeUIPromptElement): ActionRefInput {
  return mapRuntimeUIAction(element.action, element.payload);
}

export function mapRuntimeUIObjectiveAction(element: RuntimeUIObjectiveElement): ActionRefInput {
  if (element.action === undefined) {
    throw new TypeError("Runtime UI objective action is not defined.");
  }

  return mapRuntimeUIAction(element.action, element.payload);
}

function mapRuntimeUIAction(
  action: ActionRefInput,
  payload: RuntimeUIActionPayload,
): ActionRefInput {
  if (payload === undefined) {
    return action;
  }

  if (typeof action === "string") {
    return {
      type: action,
      payload,
    };
  }

  return {
    ...action,
    payload,
  };
}
