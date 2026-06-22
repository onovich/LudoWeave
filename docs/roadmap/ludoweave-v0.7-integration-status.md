# LudoWeave v0.7 Integration Status

Date: 2026-06-22

Status: Round 12 integration pass for the v0.7 Bounded Virtual List Metadata track.

Goal guide: [ludoweave-v0.7-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.7-goal-mode-execution-guide.md)

## Accepted Baseline

v0.7 starts after the accepted v0.1 through v0.6 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, route persistence, project JSON, or gameplay state.
- Headless-first complete `ResolvedUiFrame` snapshots with renderer conformance based on the frame boundary.
- ActionRef as a serializable host-owned output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental trace surface that consumes resolved-frame geometry and action targets but does not dispatch ActionRefs or own focus, input, accessibility, scroll state, selection state, or native side effects.
- Typed editable text overlay host bridge data, ActionRef inspector workflows, bounded future-track planning, Sinan Gate Demo fixtures, fallback policy, JSON-only ActionRef audit export, host-owned focus navigation contracts, and host-owned scroll metadata contracts.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.7 applies them to bounded virtual list metadata.

## v0.7 Scope

v0.7 is the Bounded Virtual List Metadata track inside this repository. It is not a real Sinan integration and it does not implement a datasource, pagination, infinite scrolling, renderer recycling pool, or DOM recycling pool.

The phase should provide verifiable host-owned virtual list coordination contracts for:

- `VirtualWindow` metadata with list id, item key namespace, total count snapshot, realized range, overscan range, estimated item size, viewport or scroll container reference, selection snapshot, host capability status, and diagnostics.
- Host collection/window intent outputs for select item, activate item, move selection, request window, and restore selection using ActionRef-only values.
- Deterministic fixed-size range calculation fixtures for empty, short, clamped, overscan, stale, and removed-item cases.
- Stable item key and selection diagnostics for duplicate keys, missing keys, stale selection, removed items, invalid ranges, and missing host capability.
- Realized item fixtures proving virtualized items are ordinary resolved nodes chosen by the host for the current frame.
- Shared renderer conformance proving headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus virtual window metadata sidecar.
- DOM playground smoke exposing virtual window metadata, realized range, selection snapshot, available host intents, and diagnostics without owning browser scroll state or DOM recycling.
- Canvas2D virtual window traces for realized item geometry, range metadata, selection markers, and action target ids without input reads, dispatch, or selection/scroll mutation.
- Sinan-like Gate Demo virtual list fixtures with host-owned list window sequences, registry mock results, fallback policy, validation hook layers, and JSON-only audit export.

## Integrated Scope Through Round 12

- Added virtual window metadata in `@ludoweave/core` with list id, node id, item key namespace, total count snapshot, realized range, overscan range, estimated item size, viewport or scroll reference, selection snapshot, host capability, and JSON-only normalization.
- Added host-owned collection/window intents for select item, activate item, move selection, request window, and restore selection with `runtime.collection.intent` ActionRef-only output.
- Added deterministic fixed-size virtual window range calculation for empty, short, overscan, clamped, and out-of-range offset cases using only host-provided numeric metadata.
- Added stable virtual window diagnostics for duplicate keys, missing item keys, stale selection, removed items, invalid ranges, and missing host capability.
- Added realized item fixtures proving virtualized list rows are ordinary resolved nodes selected by the host for the current frame.
- Added shared renderer conformance virtual window sidecar for headless, DOM, and Canvas2D.
- Added Playground v0.7 virtual list smoke exposing metadata, realized range, selection snapshot, host intents, and diagnostics with e2e/a11y coverage.
- Added Canvas2D virtual window trace output for realized item geometry, range metadata, selection markers, action target ids, and diagnostics without input reads, dispatch, or mutation.
- Added Sinan-like Gate Demo virtual list sequence with deterministic registry mock results and a virtual-list validation hook layer.
- Added virtual-list-specific fallback policy and JSON-only virtual list audit export.
- Added the runtime UI virtual list metadata contract note.

## Non-Goals

v0.7 must not:

- Import real Sinan editor or runtime source.
- Read or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Take ownership of Director, Timeline, Event, command, save, undo, route persistence, collection data, data loading, selection state, scroll state, input policy, platform policy, native side effects, or gameplay state.
- Read DOM measurement, `IntersectionObserver`, `ResizeObserver`, browser scroll state, wheel, touch, keyboard, gamepad, native input events, datasource state, or platform input state from core or renderer packages.
- Add React, Three, Pixi, WebGPU, Sinan, DOM renderer, Canvas renderer, datasource, or browser observer dependencies to `@ludoweave/core`.
- Turn DOM or Canvas2D into a collection data owner, selection owner, scroll state owner, layout source, input owner, accessibility owner, ActionRef dispatcher, or native side-effect source.
- Implement datasource access, pagination, async loading, cache invalidation, item diffing, infinite scrolling, renderer recycling pool public contracts, virtualized DOM pools, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, or production Canvas2D.
- Rework the v0.6 scroll metadata contract into a full scroll engine.

## Placement Policy

Use these locations during v0.7:

| Area | Location | Notes |
| --- | --- | --- |
| Generic virtual window metadata, host collection intents, range helpers, diagnostics, and serializable contracts | `packages/core/src/` | Keep JSON-only and renderer-free. Do not read DOM measurement, datasource state, native input, or platform state. |
| Shared generic fixtures or renderer conformance helpers | `packages/testing/src/` | Use only when not Sinan-specific and useful across packages. |
| DOM/playground smoke surfaces | `apps/playground/src/` and `tests/e2e/` / `tests/a11y/` | Use only for visible runtime UI smoke and accessibility checks. Do not depend on browser scroll position, DOM recycling, observers, or datasource loading as source-of-truth. |
| Canvas2D virtual window geometry/action target traces | `packages/renderer-canvas2d/src/` and `packages/renderer-canvas2d/test/` | Canvas2D may trace resolved metadata but must not dispatch, mutate selection/scroll state, read input, or own accessibility. |
| Sinan-like Gate Demo virtual list fixtures and validation hook extensions | `examples/sinan-runtime-ui/src/` and `examples/sinan-runtime-ui/test/` | Keep Sinan-like contracts in example/fixture scope. |
| Goal, roadmap, runtime UI contract note, release notes, validation logs, and final reports | `docs/goal-mode/`, `docs/roadmap/`, `docs/runtime-ui/`, and `docs/release/` | Keep docs linked from `docs/README.md`. |

## Round Ledger

| Round | Area | Status |
| --- | --- | --- |
| 1 | Contract baseline | Completed in `4d95f82`. |
| 2 | Virtual window metadata contract | Completed in `57487bb`. |
| 3 | Host collection intent contract | Completed in `f01a5e5`. |
| 4 | Deterministic range calculation fixture | Completed in `e70bae4`. |
| 5 | Item key and selection diagnostics | Completed in `14d8ab2`. |
| 6 | Realized item fixture | Completed in `a5f4fe8`. |
| 7 | Renderer conformance frame | Completed in `a14cf82`. |
| 8 | DOM playground virtual window smoke | Completed in `eeaf164`. |
| 9 | Canvas2D virtual window trace | Completed in `f70b15b`. |
| 10 | Sinan-like Gate Demo virtual list fixture | Completed in `d945181`. |
| 11 | Fallback policy and audit export | Completed in `af39453`. |
| 12 | v0.7 integration pass and docs | This document and release notes draft. |
| 13-15 | Buffers | Pending. |
| 16 | Final validation and handoff | Pending. |

## Validation Baseline

Round-level validation follows the v0.7 goal guide. The full v0.7 acceptance matrix must include:

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
- Architecture: the baseline keeps collection data, item identity, data loading, selection state, scroll state, route changes, persistence, input policy, and platform policy host-owned.
- Scope: Round 1 does not implement virtual window metadata types, host collection intents, range helpers, diagnostics, realized item fixtures, renderer conformance, DOM smoke, Canvas2D trace, Gate Demo virtual list fixtures, fallback/audit export, or final release docs.

## Round 12 Validation Snapshot

| Command | Result |
| --- | --- |
| `Validate.cmd` | PASS |
| `Smoke.cmd` | PASS |
| `pnpm validate` | PASS |
| `pnpm test:e2e` | PASS after sequential rerun; initial parallel run contended with `pnpm test:a11y` for port 5187. |
| `pnpm test:a11y` | PASS |
| `pnpm format` | PASS |
| `git diff --check` | PASS |

## Round 12 Self-Check

- Debug: integrated scope is covered by core metadata/intent/range/diagnostics tests, realized item fixture tests, renderer conformance tests, Playground e2e/a11y smoke, Canvas2D virtual window trace tests, Sinan-like virtual list sequence tests, validation hook layer tests, fallback policy tests, and virtual list audit export tests.
- Architecture: host remains source-of-truth for collection data, item identity, data loading, selection state, scroll state, route changes, persistence, input policy, platform policy, native side effects, command routing, save, undo, Director, Timeline, and Event. Core and renderer packages do not read DOM measurement, observers, browser scroll state, native input events, datasource state, or platform input state.
- Scope: Round 12 updates integration docs and release notes only. It does not implement datasource access, pagination, async loading, cache invalidation, item diffing, infinite scrolling, renderer recycling pools, DOM recycling pools, rich text, real Sinan integration, production Canvas2D, Pixi/WebGPU, or full DevTools.
