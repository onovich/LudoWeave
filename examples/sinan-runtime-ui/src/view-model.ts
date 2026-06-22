import type { ActionRefInput, JsonValue, TextInputOverlayInputMode } from "@ludoweave/core";

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
  | RuntimeUIObjectiveElement
  | RuntimeUIPauseElement
  | RuntimeUIEditableOverlayCandidateElement;

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

export interface RuntimeUIPauseElement {
  readonly type: "pause";
  readonly id: string;
  readonly title: string;
  readonly confirmAction?: ActionRefInput;
  readonly cancelAction?: ActionRefInput;
}

export interface RuntimeUIEditableOverlayCandidateElement {
  readonly type: "editable-overlay-candidate";
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly placeholder?: string;
  readonly inputMode?: TextInputOverlayInputMode;
  readonly multiline: boolean;
  readonly requiredCapability: "overlay.text-input";
  readonly commitAction: ActionRefInput;
  readonly cancelAction: ActionRefInput;
  readonly fallbackAction?: ActionRefInput;
}
