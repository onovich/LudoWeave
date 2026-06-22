# LudoWeave v0.7 Release Notes Draft

Date: 2026-06-22

Status: Draft after Round 12 integration pass.

## Summary

LudoWeave v0.7 completes the main implementation path for the Bounded Virtual List Metadata track. The phase adds JSON-only virtual window metadata, host-owned collection intents, deterministic range calculation, stable diagnostics, realized item fixtures, renderer conformance sidecars, DOM smoke, Canvas2D virtual window traces, and Sinan-like Gate Demo virtual list review artifacts while preserving the accepted Runtime UI boundary.

## Added

- Core `VirtualWindowMetadata` with list id, node id, item key namespace, total count snapshot, realized range, overscan range, estimated item size, viewport or scroll reference, selection snapshot, host capability, and diagnostics.
- Host collection/window intent contract for select item, activate item, move selection, request window, and restore selection with ActionRef-only output.
- Deterministic fixed-size range calculation for empty, short, overscan, clamped, and out-of-range offset cases.
- Stable virtual window diagnostics for duplicate keys, missing item keys, stale selection, removed items, invalid ranges, and missing host capability.
- Realized virtual list fixture proving virtualized items are ordinary resolved nodes selected by the host for the current frame.
- Renderer conformance sidecar proving headless, DOM, and Canvas2D consume the same `ResolvedUiFrame` plus virtual window metadata.
- Playground v0.7 virtual list smoke exposing metadata, realized range, selection snapshot, host intents, and diagnostics without DOM recycling or datasource loading.
- Canvas2D virtual window trace output for realized item geometry, range metadata, selection markers, action target ids, and diagnostics.
- Sinan-like Gate Demo virtual list sequence with deterministic registry mock routing results and validation hook layer.
- Virtual list fallback policy and JSON-only audit export for Sinan review.
- Runtime UI virtual list metadata contract note.

## Preserved Boundaries

- Host and Sinan RuntimeUISystem remain source-of-truth for collection data, item identity, data loading, selection state, scroll state, route changes, persistence, input policy, platform policy, and native side effects.
- Core and renderer packages do not read DOM measurement, observers, browser scroll state, wheel/touch/keyboard/gamepad/native input events, datasource state, or platform input state.
- ActionRef remains callback-free and serializable.
- DOM and Canvas2D consume `ResolvedUiFrame`, scroll metadata, and virtual window metadata; they do not become collection data, scroll state, layout, input, accessibility, or dispatch sources of truth.
- Canvas2D virtual window trace is trace-only and does not dispatch or mutate selection/scroll state.
- No real Sinan import, project JSON mutation, or Sinan React Editor replacement is added.

## Validation Snapshot

Round 12 validation should include:

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`

The final validation matrix is recorded in the v0.7 final validation log during Round 16.
