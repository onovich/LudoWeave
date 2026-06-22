# Scroll Metadata Contract

Status: v0.6 contract note.

This note documents the Bounded Scroll Metadata track. It describes how LudoWeave exposes serializable scroll container metadata, host-owned offset snapshots, scroll intent ActionRefs, diagnostics, and renderer traces while keeping scroll state and native side effects owned by the host or Sinan RuntimeUISystem.

## Source Of Truth

The host owns:

- Physical wheel, touch, keyboard, gamepad, and platform input events.
- Scroll intent interpretation, repeat policy, route changes, persistence, restoration, and platform policy.
- Native scroll side effects such as DOM `scrollTop` / `scrollLeft`, platform scroll widgets, accessibility scroll behavior, and focus restoration after route changes.
- Command routing, registry decisions, save/undo implications, and gameplay state updates.

LudoWeave may describe:

- `ScrollContainerMetadata` with container id, node id, content rect, viewport rect, axis, offset snapshot, extent, disabled reason, host capability, and stable diagnostics.
- `HostScrollIntent` values after the host has already interpreted physical input.
- Deterministic offset normalization and restoration diagnostics for tests and host coordination.
- Visible content box metadata for renderer conformance.
- ActionRef-only scroll intent output for host dispatch.
- DOM playground smoke and Canvas2D scroll traces that consume resolved metadata without owning browser or native scroll state.

## Contract Surfaces

| Surface | Owner | Notes |
| --- | --- | --- |
| Scroll container metadata | LudoWeave describes, host consumes | JSON-only metadata in `@ludoweave/core`; no DOM node, native event, Gamepad object, React component, or closure. |
| Host scroll intent | Host creates, LudoWeave can normalize | `line`, `page`, `edge`, and `restore` intents; no wheel, touch, keyboard, gamepad, native input, or DOM scroll reads. |
| Offset normalization | LudoWeave deterministic helper | Clamps requested snapshots to container extent and emits diagnostics; host still owns source-of-truth offset. |
| Renderer conformance | Shared fixture | Headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus scroll metadata sidecar. |
| DOM smoke | LudoWeave playground | Shows scroll metadata, host offset snapshots, available intents, and diagnostics without using browser scroll position as truth. |
| Canvas2D trace | Renderer trace only | Traces scroll container geometry, visible content, normalized offset, max offset, diagnostics, and action target ids; does not read input, dispatch ActionRefs, mutate scroll state, or own a11y. |
| Sinan-like Gate Demo | Example fixture | Provides a host-owned scroll sequence, registry mock results, fallback policy, validation hook layer, and JSON-only audit export without importing Sinan. |

## Diagnostics

Stable scroll diagnostics include:

- `LW_SCROLL_DISABLED`
- `LW_SCROLL_EMPTY_CONTAINER`
- `LW_SCROLL_MISSING_HOST_CAPABILITY`
- `LW_SCROLL_OUT_OF_RANGE_OFFSET`
- `LW_SCROLL_REMOVED_CONTAINER`
- `LW_SCROLL_STALE_CONTAINER`

The Sinan-like validation hook also localizes scroll issues to:

- Scroll mapping failure.
- Scroll registry routing failure.
- Scroll renderer trace failure.

## Non-Goals

v0.6 does not:

- Read browser `wheel`, `touch`, keyboard, Gamepad, native input events, DOM `scrollTop` / `scrollLeft`, or platform input state from core or renderer packages.
- Implement a browser-compatible CSS overflow model.
- Implement nested scroll physics.
- Implement momentum, inertial scrolling, or touch gesture handling.
- Render scrollbars in core.
- Implement virtual list, infinite scrolling, pagination, recycling pools, rich text, or nested responsive layout.
- Mutate scroll state from Canvas2D or DOM renderer internals.
- Dispatch ActionRefs from Canvas2D scroll traces.
- Import real Sinan editor/runtime source, mutate Sinan project JSON, or replace the Sinan React Editor.
- Implement full DevTools, Pixi/WebGPU, or production Canvas2D.

## Fixtures And Validation

Review surfaces:

- Core scroll metadata and offset contracts: `packages/core/src/scroll-metadata.ts`, `host-scroll-intent.ts`, `scroll-diagnostics.ts`, and `scroll-offset-normalization.ts`.
- Clipped content fixture: `packages/testing/src/scroll-metadata-fixture.ts`.
- Renderer conformance sidecar: `packages/testing/src/renderer-conformance.ts`.
- Playground smoke: `apps/playground/src/main.ts` and `tests/e2e/playground.spec.ts`.
- Canvas2D scroll trace: `packages/renderer-canvas2d/src/index.ts`.
- Sinan-like scroll sequence: `examples/sinan-runtime-ui/src/gate-demo-scroll.ts`.
- Scroll fallback and audit export: `examples/sinan-runtime-ui/src/fallback-policy.ts` and `action-audit-export.ts`.
- Validation hook layer: `examples/sinan-runtime-ui/src/validation-hook.ts`.

Required v0.6 validation includes `Validate.cmd`, `Smoke.cmd`, `pnpm validate`, `pnpm test:e2e`, `pnpm test:a11y`, and `pnpm format`.

## Recommended v0.7 Entry

Preferred v0.7 entry is either a bounded virtual list metadata track or a real Sinan handoff only if a guide keeps host-owned scroll state and renderer conformance explicit. Do not combine virtual list, rich text, production Canvas2D, full DevTools, Pixi/WebGPU, or real Sinan integration into the scroll metadata contract without a new goal guide.
