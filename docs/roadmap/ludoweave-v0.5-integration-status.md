# LudoWeave v0.5 Integration Status

Date: 2026-06-22

Status: Round 1 baseline for the v0.5 Richer Gamepad Navigation bounded track.

Goal guide: [ludoweave-v0.5-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.5-goal-mode-execution-guide.md)

## Accepted Baseline

v0.5 starts after the accepted v0.1, v0.2, v0.3, and v0.4 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, or project JSON state.
- Headless-first `ResolvedUiFrame` snapshots with renderer conformance based on the complete frame boundary.
- ActionRef as a serializable host-owned output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental renderer spike that can trace resolved-frame geometry and action targets, but does not dispatch ActionRefs or own focus, input, or accessibility.
- Typed editable text overlay host bridge data, ActionRef inspector workflows, and bounded future-track planning from v0.3.
- Sinan Gate Demo contract fixtures, host capability snapshots, validation hook, fallback policy, and JSON-only ActionRef audit export from v0.4.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.5 applies them.

## v0.5 Scope

v0.5 is the Richer Gamepad Navigation bounded track inside this repository. It is not a real Sinan integration and it does not read platform input directly.

The phase should provide verifiable host-owned navigation contracts for:

- Focus graph metadata with focusable node id, rect, scope, directional neighbors, priority, disabled reason, and diagnostics.
- Host input intent data for confirm, cancel, navigate up/down/left/right, next, previous, pause, and menu.
- Directional navigation resolver fixtures for explicit neighbor, nearest target, disabled target, missing target, stale key, empty graph, and tie-breaker cases.
- Modal focus scope navigation for Pause/Dialog scope, containFocus, restoreFocus, cancel outputs, and confirm outputs.
- ActionRef-only output paths for navigation, confirm, and cancel.
- DOM playground smoke that exposes navigation metadata without breaking accessibility.
- Canvas2D focus trace fixtures that consume resolved geometry and action targets without input reads or dispatch.
- Sinan-like Gate Demo fixture coverage for a gamepad navigation sequence and deterministic registry mock results.

## Non-Goals

v0.5 must not:

- Import real Sinan editor or runtime source.
- Read or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Take ownership of Director, Timeline, Event, command, save, undo, physical input devices, focus state, rebinding, platform policy, or runtime source-of-truth state.
- Read browser `Gamepad` API, keyboard events, native input events, or platform input state from core or renderer packages.
- Add React, Three, Pixi, WebGPU, Sinan, DOM renderer, or Canvas renderer dependencies to `@ludoweave/core`.
- Turn DOM or Canvas2D into a focus owner, input owner, accessibility owner, ActionRef dispatcher, or layout fact source.
- Implement scroll, virtual list, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, production Canvas2D, input rebinding UI, analog dead-zone handling, or low-level device polling.

## Placement Policy

Use these locations during v0.5:

| Area | Location | Notes |
| --- | --- | --- |
| Generic focus graph, input intent, resolver, diagnostics, and serializable host-owned navigation contracts | `packages/core/src/` | Keep JSON-only and renderer-free. Do not read platform input or import Sinan. |
| Component-level Pause/Dialog focus scope fixtures | `packages/components/src/` and `packages/components/test/` | Components may emit metadata and ActionRefs, but host remains source-of-truth. |
| Shared generic fixtures or conformance helpers | `packages/testing/src/` | Use only when not Sinan-specific and useful across packages. |
| Sinan-like Gate Demo navigation fixtures and validation hook extensions | `examples/sinan-runtime-ui/src/` and `examples/sinan-runtime-ui/test/` | Keep Sinan-like contracts in example/fixture scope. |
| Canvas2D focus geometry/action target traces | `packages/renderer-canvas2d/src/` and `packages/renderer-canvas2d/test/` | Canvas2D may trace resolved metadata but must not dispatch or read input. |
| DOM/playground smoke surfaces | `apps/playground/src/` and `tests/e2e/` / `tests/a11y/` | Use only for visible runtime UI smoke and accessibility checks. |
| Goal, roadmap, runtime UI contract note, release notes, validation logs, and final reports | `docs/goal-mode/`, `docs/roadmap/`, `docs/runtime-ui/`, and `docs/release/` | Keep docs linked from `docs/README.md`. |

## Round Ledger

| Round | Area | Status |
| --- | --- | --- |
| 1 | Contract baseline | This document. |
| 2 | Focus graph metadata | Planned. |
| 3 | Host input intent contract | Planned. |
| 4 | Directional navigation resolver | Planned. |
| 5 | Disabled/stale/missing diagnostics | Planned. |
| 6 | Modal focus scope navigation | Planned. |
| 7 | ActionRef output path | Planned. |
| 8 | DOM playground navigation smoke | Planned. |
| 9 | Canvas2D focus trace | Planned. |
| 10 | Sinan-like Gate Demo navigation sequence | Planned. |
| 11 | Focus navigation contract docs | Planned. |
| 12 | v0.5 integration pass | Planned. |
| 13-15 | Buffers | Use only for tooling, runtime, resolver, example, smoke, or docs fixes. |
| 16 | Final validation and handoff | Planned. |

## Validation Baseline

Round-level validation follows the v0.5 goal guide. The full v0.5 acceptance matrix must include:

- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm structure-check`
- `pnpm api-check`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`
- `git status --short --branch`
- `git ls-remote origin refs/heads/main`

## Round 1 Self-Check

- Debug: this is a documentation-only baseline. Failure should localize to formatting, whitespace, stale docs index links, or an incorrect placement policy.
- Architecture: the baseline keeps physical input, focus state, rebinding, and platform policy host-owned; it does not add runtime dependencies or implementation code.
- Scope: Round 1 does not implement focus graph metadata, host input intent, resolver fixtures, modal scope navigation, DOM smoke, Canvas2D trace, Sinan-like navigation sequence, or final release docs.
