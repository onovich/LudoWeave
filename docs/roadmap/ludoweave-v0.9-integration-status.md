# LudoWeave v0.9 Integration Status

Date: 2026-06-23

Status: Round 5 boundary checklist complete for the v0.9 Bounded Sinan Handoff Checklist track.

Goal guide: [ludoweave-v0.9-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.9-goal-mode-execution-guide.md)

## Accepted Baseline

v0.9 starts after the accepted v0.1 through v0.8 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, route persistence, project JSON, asset store, gameplay state, or registry state.
- Headless-first complete `ResolvedUiFrame` snapshots with renderer conformance based on the frame boundary.
- `ActionRef` as a callback-free, serializable, host-routed output.
- DOM renderer consumption of core layout boxes without becoming a second layout, input, accessibility, scroll, text, or native side-effect source of truth.
- Canvas2D as an experimental trace surface that consumes resolved-frame metadata but does not dispatch `ActionRef`s or mutate focus, input, scroll, selection, text, accessibility, datasource, or platform state.
- Host-owned focus navigation, scroll metadata, virtual list metadata, and rich text metadata contracts from v0.5 through v0.8.
- Sinan-like Gate Demo fixtures, fallback policy, validation hook layers, and JSON-only audit exports for review without importing Sinan.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.9 packages those decisions for Sinan review.

## v0.9 Scope

v0.9 is the Bounded Sinan Handoff Checklist track. It is a review package, not a real Sinan integration.

The phase should provide a Sinan-reviewable handoff package containing:

- A handoff overview that explains what Sinan should review and what remains outside this repository.
- A contract coverage matrix for the v0.4 through v0.8 Runtime UI contracts.
- A fixture manifest with review purpose, source-of-truth owner, expected result, and validation command per fixture.
- A boundary checklist that keeps Sinan host responsibilities and LudoWeave responsibilities explicit.
- A host capability checklist for minimum viable handoff, nice-to-have capabilities, and items blocked on Sinan decisions.
- ActionRef registry, fallback policy, renderer conformance, DOM/a11y smoke, and Canvas2D trace review packs.
- A gap ledger, review matrix, final handoff checklist, release notes draft, validation log, and final report.

## Non-Goals

v0.9 must not:

- Import real Sinan editor or runtime source.
- Read, write, or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Create a real `@ludoweave/sinan` adapter package, publish a package, rename packages, or change release policy.
- Put Sinan Timeline, Director, Event, command, save, undo, registry, editor store, project JSON, asset store, or gameplay state into the core API.
- Take ownership of `RuntimeUIViewModel` semantics, registry, command routing, runtime state, input, focus, scroll, selection, text state, localized content, sanitization, accessibility review, text measurement, platform policy, fallback UI, or side effects.
- Add React, Three, Pixi, WebGPU, Sinan, DOM, Canvas, Ajv, schema runtime, HTML parser, or Markdown parser dependencies to `@ludoweave/core`.
- Implement datasource loading, production Canvas2D, full DevTools, Pixi/WebGPU, rich text editing, HTML/Markdown import, a real localization pipeline, or broad editor integration.

## Placement Policy

Use these locations during v0.9:

| Area | Location | Notes |
| --- | --- | --- |
| Handoff overview, matrices, checklists, review packs, audit examples, gap ledger, and final Sinan handoff docs | `docs/sinan-cooperation/` | Output review artifacts only. Do not introduce real Sinan adapters or project mutation paths. |
| Integration status and round ledger | `docs/roadmap/` | Keep this file current as the review package moves through the rounds. |
| Release notes, final validation log, and final report | `docs/release/` | Record evidence and final acceptance handoff state. |
| Existing contracts, fixtures, tests, playground, and examples | existing v0.4-v0.8 paths | Reference and summarize. Do not broaden runtime behavior unless the guide explicitly requires it. |
| Role routing | `Role.md` | Keep role-only. Do not store phase, goal, round, or completion state here. |

## Round Ledger

| Round | Area | Status |
| --- | --- | --- |
| 1 | Handoff baseline | Complete. |
| 2 | Handoff overview | Complete. |
| 3 | Contract coverage matrix | Complete. |
| 4 | Fixture manifest | Complete. |
| 5 | Boundary checklist | Complete. |
| 6 | Host capability checklist | Pending. |
| 7 | ActionRef registry review pack | Pending. |
| 8 | Fallback policy review pack | Pending. |
| 9 | Renderer conformance review pack | Pending. |
| 10 | DOM and a11y smoke review pack | Pending. |
| 11 | Canvas2D trace review pack | Pending. |
| 12 | Gap ledger and final handoff docs | Pending. |
| 13-15 | Buffers | Not used. |
| 16 | Final validation and planner handoff | Pending. |

## Validation Baseline

Round-level validation follows the v0.9 goal guide. The full v0.9 acceptance matrix must include:

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

- Debug: this is a documentation-only baseline. Failure should localize to formatting, whitespace, stale docs index links, or an incorrect placement/non-goal statement.
- Architecture: the baseline keeps Sinan host ownership over semantics, registry, command routing, runtime state, input, focus, scroll, selection, text, localization, sanitization, accessibility review, text measurement, platform policy, fallback UI, and side effects.
- Scope: Round 1 does not create real adapters, mutate project JSON, change source contracts, add package dependencies, or implement renderer/runtime behavior.
