# LudoWeave v0.3 Bounded Future Tracks

Date: 2026-06-22

Status: v0.3 planning artifact for v0.4+ entry. No runtime implementation is added by this document.

## Scope

This document bounds four future tracks that should not be pulled into v0.3 implementation:

- Scroll.
- Virtual list.
- Rich text.
- Richer gamepad navigation.

Each track must preserve the accepted LudoWeave boundaries:

- Host and Sinan RuntimeUISystem own source-of-truth state.
- `@ludoweave/core` stays renderer-agnostic and Sinan-free.
- Renderers consume `ResolvedUiFrame` snapshots.
- ActionRef stays serializable and host-owned.
- Canvas2D does not own focus, native input, accessibility, or dispatch.

## Scroll Track

Source-of-truth:

- Host owns scroll intent, route changes, persistence, input policy, and restoration.
- LudoWeave may describe scroll container metadata, visible content box, scroll offset snapshot, and diagnostics.
- Renderers consume resolved scroll metadata and may expose host coordination traces.

Non-goals:

- No browser-compatible CSS overflow model.
- No nested scroll physics.
- No momentum, inertial scrolling, touch gesture engine, or scrollbar rendering in core.
- No scroll state mutation inside Canvas2D.
- No Sinan Timeline, Director, or project JSON integration.

Required fixtures:

- Stable frame with one scroll container and clipped child content.
- Host-owned offset snapshot fixture.
- Keyboard/gamepad scroll intent fixture that emits ActionRefs only.
- Missing host scroll capability diagnostic.
- Removed scroll container restoration fixture.
- DOM renderer conformance fixture proving layout boxes still come from core.

v0.4 entry criteria:

- Accepted scroll metadata type draft.
- Host capability fallback policy for unsupported renderers.
- Snapshot tests for offset, clipping, disabled scroll, and removed node cases.
- E2E smoke for DOM scroll coordination without core owning browser scroll state.
- Boundary check showing Canvas2D only traces scroll candidates and does not dispatch input.

## Virtual List Track

Source-of-truth:

- Host owns collection data, item identity, data loading, and selection state.
- LudoWeave may describe virtual window metadata, stable item keys, estimated item size, and realized item range.
- Renderers consume resolved items already selected for the current frame.

Non-goals:

- No data source, pagination, async loading, cache invalidation, or item diff engine in core.
- No infinite scrolling implementation.
- No host collection mutation.
- No replacing Sinan editor lists or Inspector panels.
- No renderer-specific recycling pool as public contract.

Required fixtures:

- Fixed-size item virtual window fixture.
- Stable key and item range snapshot.
- Empty list and short list fixture.
- Overscan metadata fixture.
- Removed item and stale selection diagnostic.
- Renderer conformance fixture proving realized items are ordinary resolved nodes.

v0.4 entry criteria:

- Accepted `VirtualWindow` metadata draft with JSON-only fields.
- Deterministic range calculation fixture independent from DOM measurement.
- Host-owned selection/action fixture.
- Performance budget note for large lists without committing to incremental patches.
- Clear non-goal statement that virtual list does not imply full scroll implementation.

## Rich Text Track

Source-of-truth:

- Host owns localized text content, markup policy, sanitization, and narrative state.
- LudoWeave may describe serializable inline text runs, semantic spans, and renderer hints.
- Text measurement remains host/test supplied.

Non-goals:

- No HTML parsing or `innerHTML`.
- No Markdown parser in core.
- No IME, editing, selection, clipboard, or rich text editor.
- No bidi shaping, hyphenation, font fallback, or browser text engine replacement.
- No schema runtime dependency in core.

Required fixtures:

- Inline run snapshot with emphasis, speaker, and tone metadata.
- Plain text fallback fixture.
- Unsupported rich text feature diagnostic.
- Theme token integration fixture for rich text spans.
- Accessibility label fixture that remains host-reviewable.
- DOM renderer smoke proving no `innerHTML` path is used.

v0.4 entry criteria:

- Accepted serializable inline run contract.
- Sanitization ownership documented as host responsibility.
- Snapshot coverage for nested spans, unsupported span types, and plain fallback.
- Renderer conformance policy for DOM and Canvas2D fallback behavior.
- No dependency on Markdown, HTML parser, Ajv, React, or Sinan types in core.

## Richer Gamepad Navigation Track

Source-of-truth:

- Host owns physical input devices, focus state, input scopes, rebinding, and platform policy.
- LudoWeave may describe focus graph metadata, directional intent hints, and ActionRefs for confirm/cancel/navigation intents.
- Renderers expose focusable geometry and diagnostics but do not read gamepad state directly.

Non-goals:

- No direct `Gamepad` API reads in core or renderer packages.
- No input rebinding UI.
- No analog stick dead-zone implementation.
- No modal focus trap enforcement inside Canvas2D.
- No Sinan InputFlow integration until host bridge boundaries are accepted.

Required fixtures:

- Directional focus graph fixture with up/down/left/right candidates.
- Multiple namespace ActionRef fixture for confirm, cancel, and navigate intents.
- Missing focus target diagnostic.
- Disabled target and stale focus key fixture.
- Modal focus scope fixture connected to the pause behavior contract.
- E2E smoke proving DOM keyboard/gamepad metadata does not break accessibility.

v0.4 entry criteria:

- Accepted focus graph metadata draft.
- Host capability contract for input source and focus restoration.
- Snapshot tests for directional resolution, disabled targets, stale keys, and modal scope.
- Clear adapter plan for Sinan InputFlow without importing Sinan editor/runtime objects.
- Boundary check proving no core or renderer package directly reads platform input state.

## v0.3 Guardrail

These tracks are planning outputs only for v0.3. Any implementation work must wait for a later goal guide unless it is limited to documentation, fixture definitions, or tests that do not change runtime behavior.
