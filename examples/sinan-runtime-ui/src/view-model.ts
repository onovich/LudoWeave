import type { ActionRefInput, JsonValue } from "@ludoweave/core";

export interface RuntimeUIViewModel {
  readonly frame: number;
  readonly source: "sinan-like";
  readonly layers: readonly RuntimeUILayer[];
}

export interface RuntimeUILayer {
  readonly id: string;
  readonly zIndex: number;
  readonly elements: readonly RuntimeUIElement[];
}

export type RuntimeUIElement =
  | RuntimeUIPromptElement
  | RuntimeUISubtitleElement
  | RuntimeUIObjectiveElement;

export interface RuntimeUIPromptElement {
  readonly type: "prompt";
  readonly id: string;
  readonly text: string;
  readonly action: ActionRefInput;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}

export interface RuntimeUISubtitleElement {
  readonly type: "subtitle";
  readonly id: string;
  readonly text: string;
  readonly speaker?: string;
}

export interface RuntimeUIObjectiveElement {
  readonly type: "objective";
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly status?: "active" | "completed" | "failed";
  readonly action?: ActionRefInput;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}
