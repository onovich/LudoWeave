# LudoWeave v0.6 Release Notes Draft

Date: 2026-06-22

Status: Draft for the v0.6 Bounded Scroll Metadata track.

## Summary

LudoWeave v0.6 adds bounded scroll metadata contracts while preserving the accepted Runtime UI boundary. The phase keeps scroll state, route restoration, input interpretation, native scroll side effects, and platform policy host-owned while adding serializable scroll container metadata, host scroll intent ActionRefs, deterministic diagnostics, clipped content fixtures, renderer conformance sidecars, DOM smoke coverage, Canvas2D scroll traces, and Sinan-like Gate Demo scroll validation.

## Highlights

- Scroll container metadata in `@ludoweave/core` with container id, node id, content rect, viewport rect, axis, host-owned offset snapshot, extent, disabled reason, and host capability status.
- Host scroll intent contract for `line`, `page`, `edge`, and `restore` intents with `runtime.scroll.intent` ActionRef-only output.
- Offset normalization and restoration diagnostics for missing host capability, stale container, removed container, out-of-range offset, disabled scroll, and empty container cases.
- Clipped content fixture that describes visible content metadata without implementing CSS overflow, virtual list, pagination, or recycling behavior.
- Renderer conformance sidecar proving headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus scroll metadata.
- Playground v0.6 scroll coordination smoke with e2e/a11y coverage.
- Canvas2D scroll metadata trace for geometry, visible content, normalized offset, max offset, action target ids, and diagnostics.
- Sinan-like Gate Demo scroll sequence with deterministic registry mock results, fallback policy, validation hook layer, and JSON-only audit export.
- Runtime UI scroll metadata contract documentation.

## Boundary Notes

- Host and Sinan RuntimeUISystem remain source-of-truth for scroll intent, offset persistence, route changes, physical input, native scroll side effects, accessibility behavior, and runtime state.
- Core and renderer packages do not read browser scroll state, DOM `scrollTop` / `scrollLeft`, wheel/touch/keyboard/gamepad/native input events, or platform input state.
- ActionRef remains callback-free and serializable.
- DOM and Canvas2D consume resolved frame/scroll metadata and do not become scroll state, layout, input, accessibility, or dispatch sources of truth.
- Canvas2D remains trace-only for scroll metadata and action target ids.
- No real Sinan import, project JSON mutation, or Sinan React Editor replacement was added.

## Deferred Scope

- Browser-compatible CSS overflow model.
- Nested scroll physics.
- Momentum/inertial scrolling.
- Touch gesture engine.
- Core scrollbar rendering.
- Virtual list, infinite scrolling, pagination, recycling pools, and rich text.
- Production Canvas2D, Pixi/WebGPU, and full DevTools.
- Real Sinan integration.

## Validation Snapshot

Round 12 integration validation must include:

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`
