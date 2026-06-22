# LudoWeave v0.8 Integration Status

Date: 2026-06-22

Status: Round 12 implementation complete for the v0.8 Bounded Rich Text Metadata track; final validation remains pending.

Goal guide: [ludoweave-v0.8-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.8-goal-mode-execution-guide.md)

## Accepted Baseline

v0.8 starts after the accepted v0.1 through v0.7 milestones. The current baseline includes:

- Runtime UI only; LudoWeave does not replace Sinan Editor or own Director, Timeline, Event, command, save, undo, route persistence, project JSON, or gameplay state.
- Headless-first complete `ResolvedUiFrame` snapshots with renderer conformance based on the frame boundary.
- ActionRef as a serializable host-owned output; arbitrary callbacks are not allowed in core contracts.
- DOM renderer consumption of core layout boxes without becoming a second layout source of truth.
- Canvas2D as an experimental trace surface that consumes resolved-frame geometry and action targets but does not dispatch ActionRefs or own focus, input, accessibility, scroll state, selection state, text content, or native side effects.
- Host-owned focus navigation, scroll metadata, and virtual list metadata contracts.
- Sinan-like Gate Demo fixtures, fallback policy, validation hook layers, and JSON-only audit exports for review without importing Sinan.

No new ADR is required for Round 1. ADR-0001 through ADR-0004 remain accepted and unchanged; this document records how v0.8 applies them to bounded rich text metadata.

## v0.8 Scope

v0.8 is the Bounded Rich Text Metadata track inside this repository. It is not a real Sinan integration, not a rich text editor, not an HTML or Markdown import pipeline, and not a browser text engine replacement.

The phase should provide verifiable host-owned rich text coordination contracts for:

- JSON-only rich text metadata with text block id, locale hint, plain text fallback, inline text runs, semantic span ids, renderer hints, theme token references, accessibility review metadata, host policy flags, and diagnostics.
- Host-owned rich text policy metadata stating that localized content, markup policy, sanitization, narrative state, accessibility review, text measurement policy/source, font selection policy, and platform policy remain owned by the host or Sinan RuntimeUISystem.
- Serializable inline run fixtures for emphasis, speaker, tone, choice hint, disabled/locked reason, theme token references, nested span flattening, deterministic ordering, and unsupported span fallback.
- Plain text fallback fixtures proving renderers can output stable reviewable text without parsing rich markup.
- Unsupported rich text diagnostics for unsupported span types, missing fallback text, invalid token references, missing host sanitization, non-serializable payloads, empty runs, and nested span overflow.
- Theme token integration where rich text spans reference tokens but do not embed renderer-specific style objects.
- Accessibility review metadata for host-reviewable labels, descriptions, live region policy, pronunciation hints, and review status without platform accessibility side effects.
- Renderer conformance proving headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus rich text metadata sidecar without reparsing markup or measuring text.
- DOM playground smoke proving no `innerHTML` path is used for rich text metadata display.
- Canvas2D rich text traces for run geometry, span metadata, fallback text, theme token ids, and action target ids without dispatch or mutation.
- Sinan-like Gate Demo rich text fixtures, registry mock results, fallback policy, validation hook layer, and JSON-only audit export.

## Non-Goals

v0.8 must not:

- Import real Sinan editor or runtime source.
- Read or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Take ownership of Director, Timeline, Event, command, save, undo, route persistence, collection data, data loading, selection state, scroll state, input policy, platform policy, localized content source, sanitization, accessibility review, native side effects, or gameplay state.
- Parse HTML, use `innerHTML`, or add a Markdown parser in core.
- Implement a rich text editor, IME, editing selection, clipboard, copy/paste, text input composition, or `contenteditable`.
- Implement bidi shaping, hyphenation, font fallback, a line breaking engine, a browser text engine replacement, or a text measurement engine.
- Read DOM measurement, `IntersectionObserver`, `ResizeObserver`, browser scroll state, wheel, touch, keyboard, gamepad, native input events, datasource state, or platform input state from core or renderer packages.
- Add React, Three, Pixi, WebGPU, Sinan, DOM renderer, Canvas renderer, Markdown parser, HTML parser, Ajv, schema runtime, datasource, or browser observer dependencies to `@ludoweave/core`.
- Turn DOM or Canvas2D into a text content owner, sanitization owner, text measurement source, accessibility review source, layout source, input owner, ActionRef dispatcher, or native side-effect source.
- Implement datasource access, pagination, async loading, cache invalidation, item diffing, infinite scrolling, renderer recycling pool public contracts, virtualized rich text DOM pools, production Canvas2D, full DevTools, Pixi/WebGPU, or real Sinan integration.

## Placement Policy

Use these locations during v0.8:

| Area | Location | Notes |
| --- | --- | --- |
| Generic rich text metadata, host policy, inline run helpers, diagnostics, token references, accessibility review metadata, and serializable contracts | `packages/core/src/` | Keep JSON-only, renderer-free, parser-free, and Sinan-free. Do not read DOM measurement, datasource state, native input, or platform state. |
| Shared generic fixtures or renderer conformance helpers | `packages/testing/src/` | Use only when not Sinan-specific and useful across packages. |
| DOM/playground smoke surfaces | `apps/playground/src/` and `tests/e2e/` / `tests/a11y/` | Use only for visible runtime UI smoke and accessibility checks. Do not use `innerHTML`, browser text measurement, observers, datasource loading, or DOM recycling as source-of-truth. |
| Canvas2D rich text geometry/action target traces | `packages/renderer-canvas2d/src/` and `packages/renderer-canvas2d/test/` | Canvas2D may trace resolved metadata but must not dispatch, mutate text/selection/scroll state, read input, shape text, or own accessibility. |
| Sinan-like Gate Demo rich text fixtures and validation hook extensions | `examples/sinan-runtime-ui/src/` and `examples/sinan-runtime-ui/test/` | Keep Sinan-like contracts in example/fixture scope. |
| Goal, roadmap, runtime UI contract note, release notes, validation logs, and final reports | `docs/goal-mode/`, `docs/roadmap/`, `docs/runtime-ui/`, and `docs/release/` | Keep docs linked from `docs/README.md`. |

## Round Ledger

| Round | Area | Status |
| --- | --- | --- |
| 1 | Contract baseline | Complete. |
| 2 | Rich text metadata contract | Complete. |
| 3 | Host rich text policy contract | Complete. |
| 4 | Inline run fixture | Complete. |
| 5 | Plain text fallback fixture | Complete. |
| 6 | Rich text diagnostics | Complete. |
| 7 | Theme token integration | Complete. |
| 8 | Accessibility review metadata | Complete. |
| 9 | Renderer conformance frame | Complete. |
| 10 | DOM no-innerHTML smoke | Complete. |
| 11 | Canvas2D rich text trace | Complete. |
| 12 | Sinan-like fixture, audit export, docs | Complete. |
| 13-15 | Buffers | Not used. |
| 16 | Final validation and handoff | Pending. |

## Validation Baseline

Round-level validation follows the v0.8 goal guide. The full v0.8 acceptance matrix must include:

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
- Architecture: the baseline keeps localized content, markup policy, sanitization, narrative state, accessibility review, text measurement policy/source, font selection policy, platform policy, selection state, scroll state, input state, and side effects host-owned.
- Scope: Round 1 does not implement rich text metadata types, host policy contracts, inline run fixtures, fallback fixtures, diagnostics, token integration, accessibility metadata, renderer conformance, DOM smoke, Canvas2D trace, Gate Demo rich text fixtures, audit export, or final release docs.
