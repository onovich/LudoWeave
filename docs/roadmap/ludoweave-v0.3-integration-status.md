# LudoWeave v0.3 Integration Status

Date: 2026-06-22

Status: Round 12 integration pass for the v0.3 host bridge and renderer coordination phase.

Goal guide: [ludoweave-v0.3-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.3-goal-mode-execution-guide.md)

## Accepted Baseline

v0.3 starts after the accepted v0.1 and v0.2 milestones. The current baseline already includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, or undo state.
- Headless-first `ResolvedUiFrame` snapshots with renderer conformance based on the complete frame boundary.
- ActionRef as the only runtime UI interaction output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental renderer spike that consumes `ResolvedUiFrame` paint commands only.
- DOM input overlay as a v0.2 design note; v0.3 now adds the typed host bridge draft and fixtures.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.3 applies them.

## Integrated Scope Through Round 12

- Added typed text input overlay bridge data in `@ludoweave/core`, including request, selection, input mode, commit/cancel ActionRefs, lifecycle reason, capability status, and snapshot normalization.
- Added text input overlay bridge fixtures in `@ludoweave/testing`, covering open, update, focus, snapshot, close, missing capability, stale node, removed node, and disabled editable target states.
- Added Canvas2D action hit-test tracing derived from `ResolvedUiFrame.actions`; the trace reports target, disabled target, no target, and outside viewport without dispatch.
- Added Canvas2D text input overlay coordination tracing that hands resolved box, semantic label, theme token, and commit/cancel ActionRefs to the host bridge request.
- Added a concrete runtime UI theme resolution fixture for default and high-contrast states without adding a schema runtime dependency to core.
- Updated Playground to show v0.3 theme resolution states while preserving Prompt, Subtitle, Dialog, Objective, e2e, and a11y coverage.
- Hardened the lightweight ActionRef inspector with namespace/type filtering, no-match behavior, JSON export, and clear-history workflow.
- Added bounded v0.4+ planning docs for scroll, virtual list, rich text, and richer gamepad navigation.
- Added a Sinan host integration readiness plan covering RuntimeUIViewModel versioning, UIActionRef registry, host bridge capability, editable text overlay support, and Gate Demo validation hooks.

## v0.3 Scope

v0.3 hardens the v0.2 design notes into verifiable host bridge and renderer coordination contracts:

- Typed editable text overlay host bridge draft.
- Canvas2D hit-test trace and overlay coordination conformance.
- Concrete theme resolution fixture for renderer or playground usage.
- Lightweight ActionRef inspector filtering, JSON export, and history clearing.
- Playground v0.3 UI state that demonstrates the above without becoming a DevTools surface.
- Bounded planning documents for scroll, virtual list, rich text, and richer gamepad navigation.
- Sinan host integration readiness plan without importing or modifying Sinan.

## Host Bridge Boundary

The editable text overlay bridge is a host capability contract, not a Canvas2D feature and not a core layout primitive.

The v0.3 host bridge draft may define serializable data for:

- Overlay open, update, focus, close, and snapshot operations.
- Stable overlay and node identifiers.
- Resolved CSS pixel box data copied from `ResolvedUiFrame`.
- Text value, placeholder, selection range, input mode, multiline state, and composition snapshot hints.
- Semantic label and theme token hints for host styling and accessibility.
- Commit and cancel ActionRefs emitted by the host.
- Lifecycle reasons and capability status diagnostics.

The draft must not include:

- DOM nodes, Canvas contexts, React components, platform widgets, native events, closures, or non-serializable references.
- Host state mutation rules.
- Sinan-specific editor store, Director, Timeline, Event, command, save, or undo objects.

The host remains responsible for native input, IME, selection, clipboard, focus, accessibility, ActionRef registry dispatch, and fallback input flows.

## Canvas2D Coordination Boundary

Canvas2D remains a renderer adapter that consumes `ResolvedUiFrame`.

v0.3 may add:

- A deterministic hit-test or action target trace derived from `ResolvedUiFrame.actions`.
- Overlay coordination fixtures that extract resolved box, node id, semantic label, theme token, and commit/cancel ActionRefs for the host bridge.
- Diagnostics for missing overlay capability, stale node, removed node, disabled editable target, unsupported renderer state, and no target.

Canvas2D must not:

- Dispatch ActionRefs.
- Own focus, text input, accessibility, selection, IME, or host routing.
- Recompute layout or become source-of-truth for resolved boxes.
- Implement production renderer features outside the accepted spike subset.

## Theme Resolution Boundary

v0.2 added theme token metadata. v0.3 adds a concrete resolution fixture so the metadata can be observed in renderer or playground tests.

The v0.3 theme resolution work may:

- Map Prompt, Subtitle, Dialog, and Objective theme tokens to stable visual hints.
- Provide deterministic fixtures for default and alternate theme states.
- Keep host override and renderer fallback behavior explicit.

It must not:

- Add Ajv or schema runtime dependencies to `@ludoweave/core`.
- Turn renderer theme resolution into a new source-of-truth for component props or layout.
- Replace host styling policy.

## ActionRef Inspector Boundary

The playground ActionRef inspector stays lightweight.

v0.3 may add:

- Filtering by action type or namespace.
- No-match and empty-history states.
- JSON export of serializable action history.
- Clear-history workflow.

It must not become:

- A full DevTools protocol.
- A debugger for arbitrary host state.
- A callback execution surface.
- A bridge to DOM, native, or Sinan editor objects.

## Future Track Boundary

Scroll, virtual list, rich text, and richer gamepad navigation are v0.4+ planning tracks in this phase.

Round 10 should produce bounded planning docs that define:

- Source-of-truth ownership.
- Non-goals.
- Required fixtures.
- Validation strategy.
- Entry criteria for a later implementation phase.

These features must not be implemented in v0.3 runtime code.

## Sinan Integration Boundary

v0.3 prepares for real Sinan host integration but does not perform it.

The readiness plan should identify what Sinan needs to expose:

- RuntimeUIViewModel versioning and compatibility signals.
- UIActionRef registry contract.
- Host bridge capabilities for overlays and input fallback.
- Gate Demo validation hook.
- Action log and diagnostic review paths.

The repository must not import Sinan editor internals, read or modify Sinan project JSON, or replace Sinan React Editor.

## Round Ledger

| Round | Area | Expected Status |
| --- | --- | --- |
| 1 | Contract baseline | Create this status doc and confirm ADR inheritance. |
| 2 | Typed text overlay host bridge | Completed in `c26e4c0`. |
| 3 | Overlay bridge fixtures | Completed in `0cea2b9`. |
| 4 | Canvas2D hit-test trace | Completed in `5575391`. |
| 5 | Canvas2D overlay coordination | Completed in `3751a3d`. |
| 6 | Theme resolution fixture | Completed in `45614fa`. |
| 7 | Playground theme state | Completed in `353c6e7`. |
| 8 | Inspector filtering | Completed in `76071c8`. |
| 9 | Inspector export | Completed in `1ce5514`. |
| 10 | Future tracks | Completed in `443401f`. |
| 11 | Sinan readiness | Completed in `44c62f4`. |
| 12 | Integration pass | Update release drafts and verify the combined scope. |
| 13-15 | Buffers | Fix tooling, runtime, renderer, or docs drift if needed. |
| 16 | Final handoff | Run full validation and publish final report/log. |

## Validation Baseline

Round-level validation follows the goal guide. The full v0.3 acceptance matrix must include:

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

- Debug: this is a documentation-only baseline. Failure should localize to formatting, whitespace, or stale docs index links.
- Architecture: the baseline inherits accepted ADRs and does not introduce new runtime ownership or dependencies.
- Scope: no typed bridge implementation, Canvas2D behavior, theme resolver, inspector workflow, or Sinan integration is added in Round 1.

## Commit Range Through Round 11

- `0368d30 docs(roadmap): establish v0.3 baseline`
- `c26e4c0 feat(core): add text input overlay bridge draft`
- `0cea2b9 test(testing): add text input overlay bridge fixtures`
- `5575391 feat(renderer-canvas2d): trace action hit tests`
- `3751a3d feat(renderer-canvas2d): coordinate text input overlays`
- `45614fa test(testing): add theme resolution fixture`
- `353c6e7 feat(playground): show theme resolution states`
- `76071c8 feat(playground): filter action log inspector`
- `1ce5514 feat(playground): export and clear action logs`
- `443401f docs(roadmap): bound future runtime ui tracks`
- `44c62f4 docs(sinan): plan host integration readiness`

## Round 12 Self-Check

- Debug: integrated scope is covered by typed normalizers, fixture tests, renderer tests, Playground e2e/a11y smoke, docs checks, and wrapper validation.
- Architecture: host and Sinan remain source-of-truth; core remains renderer/Sinan-free; Canvas2D traces targets and overlay requests but does not own focus, input, a11y, or dispatch.
- Scope: v0.3 integration pass updates docs and release notes only; it does not implement scroll, virtual list, rich text, richer gamepad navigation, Pixi/WebGPU, or real Sinan integration.
