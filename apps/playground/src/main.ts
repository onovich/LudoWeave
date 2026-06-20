import { mountDomRenderer } from "@ludoweave/renderer-dom";

import { createPlaygroundFrame } from "./frame.js";
import "./styles.css";

const runtimeRoot = requireElement("#runtime-root");

const renderer = mountDomRenderer({
  root: runtimeRoot,
});

function render(): void {
  const bounds = runtimeRoot.getBoundingClientRect();
  renderer.render(
    createPlaygroundFrame({
      width: Math.max(1, bounds.width),
      height: Math.max(1, bounds.height),
      devicePixelRatio: window.devicePixelRatio || 1,
    }),
  );
}

render();
window.addEventListener("resize", render);

function requireElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}.`);
  }
  return element;
}
