# LudoWeave v0.9 Sinan Handoff Overview

Date: 2026-06-23

Status: Round 2 handoff overview for Sinan review.

Related guide: [ludoweave-v0.9-goal-mode-execution-guide.md](../goal-mode/ludoweave-v0.9-goal-mode-execution-guide.md)

## Purpose

This document is the front door for the v0.9 Bounded Sinan Handoff Checklist. It gathers the v0.4 through v0.8 Runtime UI contract work into a reviewable package so Sinan can decide whether the current boundaries, fixtures, diagnostics, and validation evidence are sufficient before any real integration work starts.

The handoff package is intentionally documentary and evidentiary. It does not import Sinan, mutate Sinan project data, replace the Sinan React Editor, create a production adapter package, or move Sinan-owned runtime responsibilities into LudoWeave.

## Current Positioning

LudoWeave currently contributes a bounded Runtime UI layer:

- It describes UI surfaces through JSON-serializable contracts, `UiNode` trees, and complete `ResolvedUiFrame` snapshots.
- It emits callback-free `ActionRef` records that the host or Sinan RuntimeUISystem routes through its own registry and command policy.
- It provides headless, DOM, and Canvas2D review surfaces that consume resolved metadata rather than owning layout, input, accessibility, scroll, selection, text, datasource, platform, or side-effect state.
- It ships Sinan-like example fixtures and tests under `examples/sinan-runtime-ui/` for review without linking against Sinan source.

Sinan remains the source of truth for `RuntimeUIViewModel` semantics, registry ownership, command routing, runtime state, project JSON, localized content, sanitization, accessibility review, text measurement, input/focus/scroll/selection/text state, platform policy, fallback UI, and side effects.

## Artifact Timeline

| Milestone | Review Value | Primary Artifacts |
| --- | --- | --- |
| v0.4 Sinan contract spike | Proves a Sinan-like envelope can be mapped to LudoWeave Runtime UI without importing Sinan. | [v0.4 notes](ludoweave-v0.4-sinan-contract-spike-notes.md), `examples/sinan-runtime-ui/src/`, `examples/sinan-runtime-ui/test/` |
| v0.5 richer gamepad navigation | Defines host-owned physical input and LudoWeave-described focus metadata. | [Focus Navigation Contract](../runtime-ui/focus-navigation-contract.md), `packages/core/src/focus-graph.ts`, `examples/sinan-runtime-ui/src/gate-demo-navigation.ts` |
| v0.6 bounded scroll metadata | Defines host-owned scroll intent/state and LudoWeave-described scroll candidates. | [Scroll Metadata Contract](../runtime-ui/scroll-metadata-contract.md), `packages/core/src/scroll-metadata.ts`, `examples/sinan-runtime-ui/src/gate-demo-scroll.ts` |
| v0.7 bounded virtual list metadata | Defines host-owned collection data and LudoWeave-described virtual windows. | [Virtual List Metadata Contract](../runtime-ui/virtual-list-metadata-contract.md), `packages/core/src/virtual-window-metadata.ts`, `examples/sinan-runtime-ui/src/gate-demo-virtual-list.ts` |
| v0.8 bounded rich text metadata | Defines JSON-only rich text metadata, policy, diagnostics, a11y review metadata, and trace fixtures. | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md), `packages/core/src/rich-text-metadata.ts`, `examples/sinan-runtime-ui/src/gate-demo-rich-text.ts` |

## Review Entry Points

Sinan reviewers should start with these questions:

| Question | Where To Review | Expected Signal |
| --- | --- | --- |
| Are responsibilities split correctly between Sinan host and LudoWeave? | Boundary checklist and host capability checklist in this v0.9 package. | Each source-of-truth area has a single owner and a documented handoff route. |
| Are existing contracts broad enough for Prompt, Subtitle, Objective, Pause, focus, scroll, virtual list, and rich text review? | Contract coverage matrix. | Each surface is marked ready, decision-needed, or deferred. |
| Are fixtures reviewable without real Sinan data? | Fixture manifest and `examples/sinan-runtime-ui/`. | Each fixture has a source path, owner, expected result, and validation command. |
| Are registry and fallback decisions auditable? | ActionRef registry review pack, fallback policy review pack, and audit examples. | Accepted, rejected, stale, unavailable, disabled, unknown, and no-op routes remain serializable. |
| Do renderers consume metadata without becoming owners? | Renderer conformance review pack, DOM/a11y smoke review pack, and Canvas2D trace review pack. | Headless, DOM, and Canvas2D agree on `ResolvedUiFrame` boundaries and metadata consumption. |

## Non-Entry Points

Sinan reviewers should not use v0.9 as approval to:

- Wire a real Sinan adapter into this repository.
- Read or write Sinan project JSON.
- Replace Sinan React Editor surfaces.
- Move Sinan Timeline, Director, Event, registry, command, save, undo, asset store, editor store, or gameplay state into LudoWeave core.
- Treat Canvas2D as a production renderer or ActionRef dispatcher.
- Treat DOM smoke as a source of truth for layout, input, accessibility review, browser text measurement, scroll state, or virtualized datasource state.
- Treat rich text metadata as HTML, Markdown, `innerHTML`, content editing, IME, clipboard, copy/paste, bidi shaping, hyphenation, font fallback, or text measurement implementation.

## Handoff Definition

v0.9 is ready for Sinan review when the repository contains:

- A contract coverage matrix, fixture manifest, boundary checklist, host capability checklist, review packs, gap ledger, review matrix, and final handoff checklist.
- A release notes draft, final validation log, and final report linked from `docs/README.md`.
- Passing validation evidence for the guide-required wrappers, targeted commands, final matrix, and remote alignment.

v0.9 is not considered a real integration milestone until Sinan separately approves host capability routes, registry semantics, fallback policy, project ownership, and adapter boundaries outside this repository.
