# LudoWeave v0.4 Integration Status

Date: 2026-06-22

Status: Round 1 contract baseline for the v0.4 Sinan Gate Demo Contract Spike.

Goal guide: [ludoweave-v0.4-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.4-goal-mode-execution-guide.md)

## Accepted Baseline

v0.4 starts after the accepted v0.1, v0.2, and v0.3 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, or project JSON state.
- Headless-first `ResolvedUiFrame` snapshots with renderer conformance based on the complete frame boundary.
- ActionRef as a serializable host-owned output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental renderer spike that can trace action targets and overlay coordination, but does not dispatch ActionRefs or own focus, input, or accessibility.
- Typed editable text overlay host bridge data and fixtures from v0.3.
- ActionRef inspector filtering, JSON export, and clear-history workflows from v0.3.
- Sinan host integration readiness docs from v0.3.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.4 applies them.

## v0.4 Scope

v0.4 is a Sinan Gate Demo Contract Spike inside this repository. It is not a real Sinan integration.

The phase should provide verifiable Sinan-like fixtures and validation surfaces for:

- Versioned `RuntimeUIViewModel` envelope data.
- Host capability snapshots for DOM, Canvas2D, fallback renderer, text input overlay, action registry, validation hook, safe area, viewport, DPR, and text measurement source.
- UIActionRef registry mock routing results.
- Gate Demo fixture data for Prompt, Subtitle, Objective, Pause, and one editable overlay candidate.
- Adapter mapping from the versioned envelope to LudoWeave components, `UiNode`, and `ResolvedUiFrame`.
- Layer-specific validation hook output for mapping, renderer, host capability, action registry, and overlay coordination.
- DOM smoke, Canvas2D trace, fallback renderer policy, and JSON-only ActionRef audit export paths.

## Non-Goals

v0.4 must not:

- Import real Sinan editor or runtime source.
- Read or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Take ownership of Director, Timeline, Event, command, save, undo, input policy, focus policy, accessibility policy, or runtime source-of-truth state.
- Add React, Three, Pixi, WebGPU, Sinan, DOM renderer, or Canvas renderer dependencies to `@ludoweave/core`.
- Turn Canvas2D into an ActionRef dispatcher, input owner, focus owner, accessibility owner, or production renderer.
- Implement scroll, virtual list, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, or production Canvas2D.

## Placement Policy

Use these locations during v0.4:

| Area | Location | Notes |
| --- | --- | --- |
| Versioned Sinan-like envelope, adapter, Gate Demo fixture, registry mock, fallback policy, and validation hook | `examples/sinan-runtime-ui/src/` | Keep Sinan-like contracts in example/fixture scope. Do not import Sinan source or leak Sinan types into core. |
| Example-specific tests | `examples/sinan-runtime-ui/test/` | Cover supported, unsupported, stale, missing capability, fallback, and routing result states. |
| Shared generic fixtures or conformance helpers | `packages/testing/src/` | Use only when the helper is not Sinan-specific and benefits multiple packages. |
| Generic serializable core contracts | `packages/core/src/` | Add only when a later round needs a host-agnostic runtime UI contract. Core must remain renderer-free and Sinan-free. |
| Canvas2D action target and overlay coordination traces | `packages/renderer-canvas2d/src/` | Canvas2D may trace resolved-frame data but must not dispatch ActionRefs or own host input. |
| DOM/playground smoke surfaces | `apps/playground/src/` and `tests/e2e/` / `tests/a11y/` | Use only for visible runtime UI smoke and accessibility checks. |
| Goal, roadmap, Sinan notes, release notes, validation logs, and final reports | `docs/goal-mode/`, `docs/roadmap/`, `docs/sinan-cooperation/`, and `docs/release/` | Keep docs linked from `docs/README.md`. |

## Round Ledger

| Round | Area | Expected Status |
| --- | --- | --- |
| 1 | Contract baseline | Create this status doc, confirm v0.4 is a contract spike, and define placement policy. |
| 2 | Versioned RuntimeUIViewModel envelope | Planned. |
| 3 | Host capability snapshot | Planned. |
| 4 | UIActionRef registry mock | Planned. |
| 5 | Gate Demo fixture | Planned. |
| 6 | Adapter mapping to `ResolvedUiFrame` | Planned. |
| 7 | Validation hook and layer reporter | Planned. |
| 8 | DOM Gate Demo smoke | Planned. |
| 9 | Canvas2D Gate Demo trace | Planned. |
| 10 | Fallback renderer policy | Planned. |
| 11 | ActionRef audit export for Sinan review | Planned. |
| 12 | v0.4 integration pass | Planned. |
| 13-15 | Buffers | Use only for tooling, runtime, contract, or docs fixes. |
| 16 | Final validation and handoff | Planned. |

## Validation Baseline

Round-level validation follows the v0.4 goal guide. The full v0.4 acceptance matrix must include:

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
- Architecture: the baseline keeps Sinan-like contracts in example/fixture scope, keeps host and Sinan as source-of-truth, and does not add runtime dependencies or implementation code.
- Scope: Round 1 does not implement envelope parsing, capability snapshots, registry routing, Gate Demo rendering, validation hooks, fallback policy, DOM smoke, Canvas2D traces, or ActionRef audit export.
