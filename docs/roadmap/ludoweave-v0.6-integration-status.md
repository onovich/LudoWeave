# LudoWeave v0.6 Integration Status

Date: 2026-06-22

Status: Round 1 baseline for the v0.6 Bounded Scroll Metadata track.

Goal guide: [ludoweave-v0.6-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.6-goal-mode-execution-guide.md)

## Accepted Baseline

v0.6 starts after the accepted v0.1 through v0.5 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, route persistence, or project JSON state.
- Headless-first complete `ResolvedUiFrame` snapshots with renderer conformance based on the frame boundary.
- ActionRef as a serializable host-owned output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental trace surface that consumes resolved-frame geometry and action targets but does not dispatch ActionRefs or own focus, input, accessibility, scroll state, or native side effects.
- Typed editable text overlay host bridge data, ActionRef inspector workflows, bounded future-track planning, Sinan Gate Demo fixtures, fallback policy, JSON-only ActionRef audit export, and v0.5 host-owned focus navigation contracts.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.6 applies them to bounded scroll metadata.

## v0.6 Scope

v0.6 is the Bounded Scroll Metadata track inside this repository. It is not a real Sinan integration and it does not read browser or native scroll/input state.

The phase should provide verifiable host-owned scroll coordination contracts for:

- Scroll container metadata with container id, content rect, viewport rect, axis, offset snapshot, extent, disabled reason, host capability, and diagnostics.
- Host scroll intent data for line, page, edge, and restore operations that produces ActionRef-only outputs.
- Deterministic offset normalization and diagnostics for missing capability, stale container, removed container restoration, out-of-range offset, disabled scroll, and empty container cases.
- Clipped content / visible content box fixtures that describe the visible area without implementing a virtual list or CSS overflow engine.
- Renderer conformance proving headless, DOM, and Canvas2D consume the same resolved scroll metadata.
- DOM playground smoke that exposes scroll metadata, host offset snapshots, available intents, and diagnostics without owning browser scroll state.
- Canvas2D scroll trace fixtures that report scroll container geometry, visible content, offset snapshots, and action target ids without input reads, dispatch, or mutation.
- Sinan-like Gate Demo scroll fixtures with a host-owned sequence, deterministic registry mock results, fallback policy, validation hook coverage, and JSON-only audit export.

## Non-Goals

v0.6 must not:

- Import real Sinan editor or runtime source.
- Read or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Take ownership of Director, Timeline, Event, command, save, undo, route persistence, physical input devices, native scroll side effects, runtime state, or platform input policy.
- Read browser scroll state, `wheel`, `touch`, keyboard, Gamepad, native input events, DOM `scrollTop` / `scrollLeft`, or platform input state from core or renderer packages.
- Add React, Three, Pixi, WebGPU, Sinan, DOM renderer, or Canvas renderer dependencies to `@ludoweave/core`.
- Turn DOM or Canvas2D into a scroll state owner, layout source, input owner, accessibility owner, ActionRef dispatcher, or native side-effect source.
- Implement a browser-compatible CSS overflow model, nested scroll physics, momentum or inertial scrolling, a touch gesture engine, core scrollbar rendering, virtual list, infinite scrolling, pagination, recycling pools, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, or production Canvas2D.

## Placement Policy

Use these locations during v0.6:

| Area | Location | Notes |
| --- | --- | --- |
| Generic scroll metadata, host scroll intent, offset normalization, diagnostics, and serializable contracts | `packages/core/src/` | Keep JSON-only and renderer-free. Do not read browser/native scroll or platform input state. |
| Shared generic fixtures or renderer conformance helpers | `packages/testing/src/` | Use only when not Sinan-specific and useful across packages. |
| DOM/playground smoke surfaces | `apps/playground/src/` and `tests/e2e/` / `tests/a11y/` | Use only for visible runtime UI smoke and accessibility checks. Do not depend on browser scroll position as source-of-truth. |
| Canvas2D scroll geometry/action target traces | `packages/renderer-canvas2d/src/` and `packages/renderer-canvas2d/test/` | Canvas2D may trace resolved metadata but must not dispatch, mutate scroll state, read input, or own accessibility. |
| Sinan-like Gate Demo scroll fixtures and validation hook extensions | `examples/sinan-runtime-ui/src/` and `examples/sinan-runtime-ui/test/` | Keep Sinan-like contracts in example/fixture scope. |
| Goal, roadmap, runtime UI contract note, release notes, validation logs, and final reports | `docs/goal-mode/`, `docs/roadmap/`, `docs/runtime-ui/`, and `docs/release/` | Keep docs linked from `docs/README.md`. |

## Round Ledger

| Round | Area | Status |
| --- | --- | --- |
| 1 | Contract baseline | In progress. |
| 2 | Scroll metadata contract | Planned. |
| 3 | Host scroll intent contract | Planned. |
| 4 | Offset normalization and diagnostics | Planned. |
| 5 | Clipped content fixture | Planned. |
| 6 | Renderer conformance frame | Planned. |
| 7 | DOM playground scroll coordination smoke | Planned. |
| 8 | Canvas2D scroll trace | Planned. |
| 9 | Sinan-like Gate Demo scroll fixture | Planned. |
| 10 | Fallback policy and audit export | Planned. |
| 11 | Scroll metadata contract docs | Planned. |
| 12 | v0.6 integration pass | Planned. |
| 13-15 | Buffers | Reserved for fixes only. |
| 16 | Final validation and handoff | Planned. |

## Validation Baseline

Round-level validation follows the v0.6 goal guide. The full v0.6 acceptance matrix must include:

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

- Debug: this is a documentation-only baseline. Failure should localize to formatting, whitespace, stale docs index links, or an incorrect placement/non-goal policy.
- Architecture: the baseline keeps scroll intent, route changes, persistence, input policy, restoration, physical input, native scroll side effects, and runtime source-of-truth state host-owned.
- Scope: Round 1 does not implement scroll metadata types, host scroll intent, offset normalization, clipped content fixtures, renderer conformance, DOM smoke, Canvas2D trace, Gate Demo scroll fixtures, fallback/audit export, or final release docs.
