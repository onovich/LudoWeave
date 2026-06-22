# LudoWeave v0.9 Boundary Checklist

Date: 2026-06-23

Status: Round 5 boundary checklist.

Related overview: [ludoweave-v0.9-sinan-handoff-overview.md](ludoweave-v0.9-sinan-handoff-overview.md)

## Review Rule

Each row must have exactly one owner for source-of-truth state. LudoWeave may provide review artifacts, serializable metadata, fixtures, diagnostics, and validation evidence; Sinan host or RuntimeUISystem owns real runtime state, policy, persistence, side effects, and project semantics.

## Checklist

| Boundary | Sinan / Host Owns | LudoWeave May Provide | v0.9 Rule | Evidence |
| --- | --- | --- | --- | --- |
| Sinan project JSON | Project schema, read/write policy, persistence, migration, save/undo implications | No project JSON integration | Do not read, write, or mutate Sinan project JSON. | Non-goal in [integration status](../roadmap/ludoweave-v0.9-integration-status.md) |
| Sinan React Editor | Editor UI, editor store, inspector behavior, authoring workflow, replacement policy | Runtime UI review fixtures only | Do not replace the Sinan React Editor. | [ADR-0001](../adr/0001-runtime-ui-only.md) |
| RuntimeUIViewModel semantics | Real view model meaning, lifecycle, registry route, frame ownership | JSON-only example envelope and adapter fixture | Do not treat example fixture semantics as Sinan production semantics. | `examples/sinan-runtime-ui/src/view-model.ts` |
| Director, Timeline, Event | Authoring model, timeline playback, event graph, command model | No core API surface for these systems | Do not put Director, Timeline, or Event state into LudoWeave core. | [contract matrix](ludoweave-v0.9-contract-coverage-matrix.md) |
| Registry | Action lookup, permission, availability, stale-frame policy, disabled reason policy | Serializable `ActionRef` and example registry outcomes | Keep registry policy host-owned; ActionRef remains callback-free. | `packages/core/src/action-ref.ts`, `examples/sinan-runtime-ui/src/action-registry.ts` |
| Command, save, undo | Command execution, side effects, save model, undo stack, transaction boundaries | Audit-ready action routing records | Do not dispatch commands, save, or undo from core, DOM, or Canvas2D. | [ADR-0003](../adr/0003-actionref-no-arbitrary-callback.md) |
| Asset store and gameplay state | Asset identity, loading, runtime gameplay state, mutation policy | No datasource or gameplay mutation path | Do not add datasource loading or gameplay state to Runtime UI contracts. | [fixture manifest](ludoweave-v0.9-fixture-manifest.md) |
| Physical input and platform policy | Keyboard, gamepad, touch, native input events, rebinding, repeat policy, platform rules | Host input intent values and focus metadata | Do not read browser Gamepad API, keyboard events, or native input state from core/renderers. | [Focus Navigation Contract](../runtime-ui/focus-navigation-contract.md) |
| Focus state | Current focus, restoration, input scope, native accessibility focus side effects | Focus graph metadata and deterministic resolver helpers | LudoWeave describes focus candidates; host moves focus. | `packages/core/src/focus-graph.ts` |
| Scroll state | Offset, persistence, restoration, route changes, native scroll side effects | Scroll metadata, candidates, and host scroll intent shape | Do not read browser scroll state or mutate scroll state from core/renderers. | [Scroll Metadata Contract](../runtime-ui/scroll-metadata-contract.md) |
| Collection and selection state | Datasource, item identity, loading, pagination, selection, cache invalidation | Virtual window metadata and host collection intent shape | Do not load datasource or infer collection truth in renderers. | [Virtual List Metadata Contract](../runtime-ui/virtual-list-metadata-contract.md) |
| Localized text content | Localized source strings, narrative state, translation lifecycle | Plain text fallback and rich text metadata references | Do not turn LudoWeave into the localization pipeline. | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md) |
| Sanitization and markup policy | Allowed markup policy, sanitization review, unsafe content handling | JSON-only runs, semantic spans, diagnostics | Do not parse HTML or Markdown; do not use `innerHTML`. | `packages/core/src/rich-text-metadata.ts`, `tests/e2e/playground.spec.ts` |
| Accessibility review | Labels, descriptions, live region policy, review status, native a11y side effects | A11y metadata for host review and smoke tests | DOM may expose reviewable output; host owns final a11y policy. | `packages/core/src/rich-text-a11y-review.ts`, `tests/a11y/playground-a11y.spec.ts` |
| Text measurement and font selection | Measurement source, font policy, fallback fonts, shaping, line breaking | Text measurement policy metadata and fallback text | Do not implement a browser text engine replacement, bidi shaping, hyphenation, or font fallback engine. | `packages/core/src/host-rich-text-policy.ts` |
| Fallback UI | Host fallback route, fallback renderer availability, user-facing policy | Fallback diagnostics and example fallback renderer fixture | LudoWeave can report missing fallback; Sinan owns real fallback UI. | `examples/sinan-runtime-ui/src/fallback-policy.ts` |
| DOM renderer | Browser rendering of resolved metadata | Consumer of `ResolvedUiFrame`, action target metadata, smoke output | DOM is not a layout, input, scroll, a11y review, text measurement, or dispatch source of truth. | [ADR-0004](../adr/0004-dom-renderer-consumes-core-layout.md) |
| Canvas2D renderer | Production renderer policy and native side effects remain out of scope | Experimental trace of geometry, metadata, visible items, and action target ids | Canvas2D must not dispatch or mutate text, selection, scroll, a11y, or input state. | [Canvas2D Renderer Spike](../runtime-ui/canvas2d-renderer-spike.md) |
| Core dependencies | Renderer-free, platform-free contract layer | JSON-only types and deterministic helpers | Core must stay free of React, Three, Pixi, WebGPU, Sinan, DOM, Canvas, Ajv, schema runtime, HTML parser, and Markdown parser dependencies. | `package.json`, `packages/core/package.json`, `tooling/boundary-check/check-import-boundaries.mjs` |

## Review Outcome

Sinan can mark a row ready only when its owner is acceptable and the LudoWeave side remains limited to review artifacts, metadata, diagnostics, fixtures, and validation evidence. Any request to move source-of-truth ownership into LudoWeave must become a separate architecture decision before implementation.

## Round 5 Self-Check

- Debug: if the boundary scan fails, inspect whether a forbidden ownership term moved into a source contract or whether this document omitted a required owner.
- Architecture: every stateful area names Sinan or host as owner before naming LudoWeave review output.
- Scope: this checklist does not add real Sinan import, project JSON mutation, adapter package, source dependencies, DOM measurement, native input reads, datasource reads, or production Canvas2D.
