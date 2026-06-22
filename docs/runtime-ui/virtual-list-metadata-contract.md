# Virtual List Metadata Contract

Status: v0.7 contract note.

This note documents the Bounded Virtual List Metadata track. It describes how LudoWeave exposes serializable virtual window metadata, host-owned collection intents, deterministic range fixtures, diagnostics, renderer conformance, and Sinan-like review artifacts while keeping collection data, item identity, selection state, scroll state, data loading, and native side effects owned by the host or Sinan RuntimeUISystem.

## Source Of Truth

The host owns:

- Collection data, item identity source-of-truth, data loading, pagination, cache invalidation, and item diffing.
- Selection state, focus/selection restoration, route changes, persistence, scroll state, input policy, and platform policy.
- Native DOM, platform widget, accessibility, and scroll side effects.
- Command routing, registry decisions, save/undo implications, Director/Timeline/Event state, and gameplay state updates.

LudoWeave may describe:

- `VirtualWindowMetadata` with list id, node id, item key namespace, total count snapshot, realized range, overscan range, estimated item size, viewport or scroll container reference, selection snapshot, host capability, and diagnostics.
- `HostCollectionIntent` values after the host has already interpreted datasource, selection, and input policy.
- Deterministic fixed-size range calculation from host-provided numeric metadata.
- Stable virtual window diagnostics for duplicate keys, missing keys, stale selection, removed items, invalid ranges, and missing host capability.
- Realized item fixtures where virtualized items are ordinary resolved nodes selected by the host for the current frame.
- DOM playground smoke and Canvas2D traces that consume resolved metadata without owning collection data, selection state, scroll state, input, accessibility, or dispatch.

## Contract Surfaces

| Surface | Owner | Notes |
| --- | --- | --- |
| Virtual window metadata | LudoWeave describes, host consumes | JSON-only metadata in `@ludoweave/core`; no DOM node, observer, native event, datasource object, Promise, React component, or closure. |
| Host collection intent | Host creates, LudoWeave can normalize | Select item, activate item, move selection, request window, and restore selection ActionRefs after host policy has resolved intent. |
| Fixed-size range calculation | LudoWeave deterministic helper | Uses host-provided total count, item extent, viewport extent, scroll offset, and overscan only; no DOM measurement or datasource reads. |
| Renderer conformance | Shared fixture | Headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus virtual window metadata sidecar. |
| DOM smoke | LudoWeave playground | Shows window metadata, realized range, selection snapshot, host intents, and diagnostics without DOM recycling or loading data. |
| Canvas2D trace | Renderer trace only | Traces realized item geometry, range metadata, selection markers, action target ids, and diagnostics; does not dispatch, mutate selection, mutate scroll state, read input, or own a11y. |
| Sinan-like Gate Demo | Example fixture | Provides a host-owned virtual list sequence, registry mock results, fallback policy, validation hook layer, and JSON-only audit export without importing Sinan. |

## Diagnostics

Stable virtual window diagnostics include:

- `LW_VIRTUAL_WINDOW_DUPLICATE_KEY`
- `LW_VIRTUAL_WINDOW_INVALID_RANGE`
- `LW_VIRTUAL_WINDOW_MISSING_HOST_CAPABILITY`
- `LW_VIRTUAL_WINDOW_MISSING_ITEM_KEY`
- `LW_VIRTUAL_WINDOW_REMOVED_ITEM`
- `LW_VIRTUAL_WINDOW_STALE_SELECTION`

The Sinan-like validation hook also localizes virtual list issues to:

- Virtual list mapping failure.
- Virtual list registry routing failure.
- Virtual list renderer trace failure.

## Non-Goals

v0.7 does not:

- Read DOM measurement, `IntersectionObserver`, `ResizeObserver`, browser scroll state, wheel/touch/keyboard/gamepad/native input events, datasource state, or platform input state from core or renderer packages.
- Implement datasource access, pagination, async loading, cache invalidation, item diffing, infinite scrolling, or host collection mutation.
- Implement a renderer recycling pool public contract or a virtualized DOM pool.
- Mutate selection or scroll state from DOM or Canvas2D renderer internals.
- Dispatch ActionRefs from Canvas2D virtual window traces.
- Import real Sinan editor/runtime source, mutate Sinan project JSON, or replace the Sinan React Editor.
- Implement rich text, production Canvas2D, full DevTools, Pixi/WebGPU, or real Sinan integration.

## Fixtures And Validation

Review surfaces:

- Core virtual window metadata, range, diagnostics, and host collection intent contracts: `packages/core/src/virtual-window-metadata.ts`, `virtual-window-range.ts`, `virtual-window-diagnostics.ts`, and `host-collection-intent.ts`.
- Realized item fixture: `packages/testing/src/virtual-list-fixture.ts`.
- Renderer conformance sidecar: `packages/testing/src/renderer-conformance.ts`.
- Playground smoke: `apps/playground/src/main.ts` and `tests/e2e/playground.spec.ts`.
- Canvas2D virtual window trace: `packages/renderer-canvas2d/src/index.ts`.
- Sinan-like virtual list sequence: `examples/sinan-runtime-ui/src/gate-demo-virtual-list.ts`.
- Virtual list fallback and audit export: `examples/sinan-runtime-ui/src/fallback-policy.ts` and `action-audit-export.ts`.
- Validation hook layer: `examples/sinan-runtime-ui/src/validation-hook.ts`.

Required v0.7 validation includes `Validate.cmd`, `Smoke.cmd`, `pnpm validate`, `pnpm test:e2e`, `pnpm test:a11y`, and `pnpm format`.

## Recommended v0.8 Entry

Preferred v0.8 entry is either a bounded real Sinan handoff checklist using the v0.4-v0.7 contracts, or a narrow rich text metadata track if the guide keeps host-owned sanitization, content, and accessibility review explicit. Do not combine rich text, production Canvas2D, full DevTools, Pixi/WebGPU, datasource loading, or real Sinan integration into the virtual list metadata contract without a new goal guide.
