# LudoWeave v0.4 Release Notes Draft

Date: 2026-06-22

Status: Draft after Round 12 integration pass.

## Summary

LudoWeave v0.4 adds a Sinan Gate Demo Contract Spike. The phase stays inside the LudoWeave repository and uses Sinan-like fixtures to validate the Runtime UI boundary before any real Sinan integration.

## Added

- Versioned Runtime UI envelope fixture and diagnostics.
- Host capability snapshot for DOM, Canvas2D trace, fallback renderer, text input overlay, action registry, validation hook, safe area, viewport, DPR, and text measurement.
- UIActionRef registry mock with accepted, rejected, stale, unavailable, disabled, unknown, and no-op routing results.
- Gate Demo fixture covering Prompt, Subtitle, Objective, Pause, and one editable overlay candidate.
- Adapter path from envelope to LudoWeave components, `UiNode`, and `ResolvedUiFrame`.
- Layer-specific validation hook with machine-readable PASS/FAIL output.
- Playground DOM Gate Demo smoke path plus e2e and a11y assertions.
- Canvas2D Gate Demo action hit-test and editable overlay coordination trace tests.
- Sinan-owned fallback renderer policy for missing capability or unsupported renderer routes.
- JSON-only ActionRef audit export payload for Sinan review.

## Preserved Boundaries

- No real Sinan import.
- No Sinan project JSON read/write.
- No Sinan React Editor replacement.
- No Director, Timeline, Event, command, save, undo, input, focus, or accessibility ownership transfer.
- No arbitrary callback ActionRefs.
- No production Canvas2D, Pixi/WebGPU, full DevTools, scroll, virtual list, or rich text implementation.

## Round 12 Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `Validate.cmd` | PASS | Real ops wrapper validation: lint, typecheck, build, test, structure-check, api-check. |
| `Smoke.cmd` | PASS | Real smoke wrapper: e2e then a11y. |
| `pnpm validate` | PASS | Full package validation passed. |
| `pnpm test:e2e` | PASS | Playground Gate Demo DOM smoke passed. |
| `pnpm test:a11y` | PASS | No blocking accessibility violations. |
| `pnpm format` | PASS | Prettier check passed. |

## Recommended Next Steps

- Use buffer rounds only for validation, tooling, contract, UI smoke, or docs fixes.
- Finish Round 16 with final report, final validation log, and a focused v0.5 recommendation.
