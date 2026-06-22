# Focus Navigation Contract

Status: v0.5 contract note.

This note documents the Richer Gamepad Navigation bounded track. It describes how LudoWeave exposes serializable focus metadata and host input intent results while keeping physical input, focus state, rebinding, and platform policy owned by the host or Sinan RuntimeUISystem.

## Source Of Truth

The host owns:

- Physical keyboard, gamepad, controller, touch, and platform input events.
- Focus state, focus restoration, input scopes, rebinding, repeat policy, and platform-specific navigation rules.
- Command routing, registry decisions, save/undo implications, and gameplay state updates.
- Accessibility focus and native focus side effects.

LudoWeave may describe:

- `FocusGraph` metadata with focusable ids, resolved rectangles, scopes, directional neighbor hints, priority, disabled reason, and stable diagnostics.
- `HostInputIntent` values after the host has already interpreted physical input.
- Deterministic directional resolver results for tests and host coordination.
- Modal focus scope metadata for Dialog/Pause surfaces.
- ActionRef-only confirm, cancel, and navigation outputs for host dispatch.

## Contract Surfaces

| Surface | Owner | Notes |
| --- | --- | --- |
| Focus graph metadata | LudoWeave describes, host consumes | JSON-only metadata in `@ludoweave/core`; no DOM node, native event, Gamepad object, React component, or closure. |
| Host input intent | Host creates, LudoWeave can normalize | `confirm`, `cancel`, `navigate` directions, `next`, `previous`, `pause`, and `menu`; no platform event reads. |
| Directional resolver | LudoWeave deterministic helper | Uses explicit neighbors first, then nearest target fallback with stable tie-breakers. |
| Modal scope navigation | LudoWeave component helper | Dialog/Pause metadata can describe containFocus and restoreFocus; host still moves focus. |
| ActionRef output | Host dispatches | Confirm/cancel outputs are serializable ActionRefs; navigation move results are host intent results. |
| DOM smoke | LudoWeave playground | Shows metadata and ActionRef outputs without taking over keyboard/gamepad handling. |
| Canvas2D trace | Renderer trace only | Traces focusable geometry/action target ids; does not read input, move focus, dispatch ActionRefs, or own a11y. |
| Sinan-like Gate Demo | Example fixture | Provides a deterministic gamepad navigation sequence and registry mock results without importing Sinan. |

## Diagnostics

Stable focus navigation diagnostics include:

- `LW_FOCUS_DISABLED_TARGET`
- `LW_FOCUS_EMPTY_GRAPH`
- `LW_FOCUS_MISSING_HOST_CAPABILITY`
- `LW_FOCUS_MISSING_TARGET`
- `LW_FOCUS_STALE_KEY`

The Sinan-like validation hook also localizes navigation issues to:

- Navigation mapping failure.
- Navigation registry routing failure.
- Navigation renderer trace failure.

## Non-Goals

v0.5 does not:

- Read browser `Gamepad` API, keyboard events, native input events, or platform input state from core or renderer packages.
- Implement input rebinding UI.
- Implement analog stick dead-zone handling or low-level device polling.
- Own native focus, accessibility focus, or modal trap side effects.
- Dispatch ActionRefs from Canvas2D or DOM renderer internals.
- Import real Sinan editor/runtime source or mutate Sinan project JSON.
- Replace the Sinan React Editor.
- Implement scroll, virtual list, rich text, nested responsive layout, full DevTools, Pixi/WebGPU, or production Canvas2D.

## Fixtures And Validation

Review surfaces:

- Core focus metadata and resolver: `packages/core/src/focus-graph.ts`, `host-input-intent.ts`, `directional-navigation.ts`, and `focus-navigation-diagnostics.ts`.
- Modal scope helper: `packages/components/src/modal-focus-navigation.ts`.
- Playground smoke: `apps/playground/src/main.ts` and `tests/e2e/playground.spec.ts`.
- Canvas2D trace: `packages/renderer-canvas2d/src/index.ts`.
- Sinan-like navigation sequence: `examples/sinan-runtime-ui/src/gate-demo-navigation.ts`.
- Validation hook layer: `examples/sinan-runtime-ui/src/validation-hook.ts`.

Required v0.5 validation includes `Validate.cmd`, `Smoke.cmd`, `pnpm validate`, `pnpm test:e2e`, `pnpm test:a11y`, and `pnpm format`.

## Recommended v0.6 Entry

Preferred v0.6 entry is a bounded scroll metadata track only if a focused goal guide keeps host-owned scroll state, renderer conformance, and fallback policy explicit. If real Sinan integration becomes available first, use the v0.4/v0.5 contracts as a handoff checklist before writing integration code.
