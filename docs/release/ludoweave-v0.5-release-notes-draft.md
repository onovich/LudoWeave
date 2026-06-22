# LudoWeave v0.5 Release Notes Draft

Date: 2026-06-22

Status: Draft after Round 12 integration pass.

## Summary

LudoWeave v0.5 adds the Richer Gamepad Navigation bounded track. The phase keeps physical input devices, focus state, rebinding, and platform policy host-owned while adding serializable focus graph metadata, host input intent contracts, deterministic directional resolution, modal scope navigation, DOM smoke coverage, Canvas2D focus traces, and Sinan-like Gate Demo navigation fixtures.

## Added

- Focus graph metadata in `@ludoweave/core` with focusable id, rect, scope, directional neighbors, priority, disabled reason, and stable diagnostics.
- Host input intent contract for confirm, cancel, navigate up/down/left/right, next, previous, pause, and menu.
- Directional focus resolver with explicit neighbor preference, nearest target fallback, stable tie-breakers, and failure diagnostics.
- Modal focus scope navigation helper for Dialog/Pause-style controls, confirm/cancel ActionRef outputs, and action log recording.
- DOM Playground v0.5 navigation smoke panel covered by e2e and a11y checks.
- Canvas2D focus graph trace for focusable geometry and action target ids without input reads or dispatch.
- Sinan-like Gate Demo gamepad navigation sequence with deterministic registry mock results.
- Navigation layer in the Gate Demo validation hook for mapping, registry, and renderer trace localization.
- Runtime UI focus navigation contract documentation.

## Preserved Boundaries

- No real Sinan import.
- No Sinan project JSON read/write.
- No Sinan React Editor replacement.
- No ownership transfer for physical input devices, focus state, rebinding, platform policy, native focus, accessibility focus, command routing, save, undo, Timeline, Event, or Director.
- No browser `Gamepad` API, keyboard event, native input event, DOM node, React component, or closure in core or renderer contracts.
- No arbitrary callback ActionRefs.
- Canvas2D remains trace-only for focus/action metadata and does not dispatch or own input.
- DOM and Canvas2D remain consumers of resolved frame and metadata, not layout or input sources of truth.
- No scroll, virtual list, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, production Canvas2D, input rebinding UI, analog dead-zone handling, or low-level device polling.

## Round 12 Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `Validate.cmd` | PASS | Real ops wrapper validation: lint, typecheck, build, test, structure-check, api-check. |
| `Smoke.cmd` | PASS | Real smoke wrapper: e2e then a11y. |
| `pnpm validate` | PASS | Full package validation passed. |
| `pnpm test:e2e` | PASS | Playground navigation DOM smoke passed. |
| `pnpm test:a11y` | PASS | No blocking accessibility violations. |
| `pnpm format` | PASS | Prettier check passed. |

## Recommended Next Steps

- Use buffer rounds only for validation, tooling, resolver, UI smoke, example, or docs fixes.
- Finish Round 16 with final validation log, final report, and a focused v0.6 recommendation.
