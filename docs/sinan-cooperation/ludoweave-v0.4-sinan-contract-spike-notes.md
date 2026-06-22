# LudoWeave v0.4 Sinan Contract Spike Notes

Date: 2026-06-22

Status: Round 12 integration notes. This is a Sinan-like contract spike inside LudoWeave, not a real Sinan integration.

## Purpose

v0.4 turns the v0.3 Sinan readiness plan into executable fixtures and validation hooks. The spike proves that LudoWeave can consume a versioned Runtime UI envelope, map it into `UiNode` and `ResolvedUiFrame`, validate the host boundary by layer, render a DOM smoke path, trace Canvas2D coordination, and export ActionRef audit data without importing Sinan source or reading Sinan project JSON.

## Contract Surfaces

- Versioned envelope: `ludoweave.sinan-gate-demo.v0.4`, `frameId`, `surface`, `capabilities`, `fallbackPolicy`, and `viewModel`.
- Host capability snapshot: DOM, Canvas2D trace, fallback renderer, text input overlay, action registry, validation hook, viewport, safe area, DPR, and fixture text measurement.
- Gate Demo fixture: Prompt, Subtitle, Objective, Pause, and one editable overlay candidate.
- Adapter mapping: envelope -> component props -> `UiNode` -> `ResolvedUiFrame`.
- Validation hook: mapping, renderer, host capability, action registry, and overlay coordination layers.
- Fallback policy: Sinan-owned fallback snapshot when required capability is missing or requested renderer is unsupported.
- Audit export: JSON-only ActionRef review payload with action type, payload, routing result, frame id, source node, and diagnostics.

## Boundary Guarantees

- No real Sinan import.
- No Sinan project JSON read or mutation.
- No Sinan React Editor replacement.
- Host and Sinan remain source-of-truth for runtime state, command routing, input, focus, accessibility, and fallback UI.
- `@ludoweave/core` does not depend on React, Three, Pixi, WebGPU, Sinan, DOM renderer, or Canvas renderer.
- ActionRef stays serializable; no arbitrary callback crosses the boundary.
- DOM and Canvas2D consume `ResolvedUiFrame`; neither renderer becomes a layout source of truth.
- Canvas2D traces action targets and editable overlay coordination but does not dispatch ActionRefs or own input/focus/a11y.

## Review Artifacts

- Example source: `examples/sinan-runtime-ui/src/`.
- Contract tests: `examples/sinan-runtime-ui/test/`.
- DOM smoke: `apps/playground/` and `tests/e2e/playground.spec.ts`.
- A11y smoke: `tests/a11y/playground-a11y.spec.ts`.
- Canvas2D Gate Demo trace: `packages/renderer-canvas2d/test/gate-demo-trace.test.ts`.
- Integration status: `docs/roadmap/ludoweave-v0.4-integration-status.md`.

## Remaining Before v0.4 Final

- Run the Round 12 validation matrix and publish this integration pass.
- Use buffer rounds only if tooling, runtime, contract, UI smoke, docs, or validation drift appears.
- In Round 16, run the final full matrix and produce final validation log, final report, and recommended v0.5 entry.
