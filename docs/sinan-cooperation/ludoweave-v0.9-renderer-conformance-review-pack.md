# LudoWeave v0.9 Renderer Conformance Review Pack

Date: 2026-06-23

Status: Round 9 renderer conformance review pack.

Related artifacts:

- [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md)
- [Fixture Manifest](ludoweave-v0.9-fixture-manifest.md)
- [DOM and A11y Smoke Review Pack](ludoweave-v0.9-dom-a11y-smoke-review-pack.md)
- Canvas2D trace review pack planned for Round 11.

## Review Scope

This pack summarizes renderer conformance evidence for headless, DOM, and Canvas2D review paths. The shared rule is simple: renderers consume `ResolvedUiFrame` and optional metadata sidecars; they do not become the source of truth for layout, input, focus, scroll state, selection state, datasource state, text content, text measurement, accessibility review, ActionRef dispatch, platform policy, or side effects.

## Shared Fixture

| Fixture | Path | Contents |
| --- | --- | --- |
| Runtime overlay conformance fixture | `packages/testing/src/renderer-conformance.ts` | Complete `ResolvedUiFrame`, scroll metadata, normalized scroll offset, virtual window metadata, realized virtual item ids, rich text metadata, expected DOM nodes, semantics, and action targets. |

The fixture includes Prompt, Subtitle, Pause dialog, virtual list items, scroll metadata, rich text metadata, semantic labels, and `ActionRef` targets. It is the common evidence source for renderer review.

## Renderer Evidence

| Renderer | Path | Evidence | Boundary |
| --- | --- | --- | --- |
| Headless | `packages/renderer-headless/test/renderer-conformance.test.ts` | Serializes the shared frame and verifies scroll, virtual list, and rich text metadata remain snapshot-friendly. | No DOM, `scrollTop`, datasource, `innerHTML`, or Markdown ownership. |
| DOM | `packages/renderer-dom/src/index.ts`, `packages/renderer-dom/test/dom-renderer.test.ts` | Mounts elements from resolved nodes, applies boxes, semantics, labels, disabled state, and text via `textContent`. | DOM consumes layout boxes; it does not calculate layout, dispatch actions, read input, use `innerHTML`, own a11y review, or own text measurement. |
| Canvas2D | `packages/renderer-canvas2d/src/index.ts`, `packages/renderer-canvas2d/test/canvas2d-renderer.test.ts`, `packages/renderer-canvas2d/test/gate-demo-trace.test.ts` | Paints resolved commands and emits trace-only action, focus, scroll, virtual window, rich text, and text overlay coordination metadata. | Canvas2D does not dispatch, mutate selection/scroll/text, read native input, own accessibility, shape text, or become production renderer policy. |

## Metadata Sidecar Consumption

| Sidecar | Consumer Evidence | Expected Review Result |
| --- | --- | --- |
| Scroll metadata | `traceCanvas2DScrollMetadata`, renderer conformance fixture, scroll metadata tests | Renderers can trace visible content and action ids without reading browser scroll state. |
| Virtual window metadata | `traceCanvas2DVirtualWindow`, shared fixture, virtual list fixture tests | Renderers can identify realized geometry without owning datasource, selection, pagination, or item identity. |
| Rich text metadata | `traceCanvas2DRichTextMetadata`, DOM/playground smoke, rich text fixture tests | Renderers consume plain text fallback, run ids, span ids, token refs, and diagnostics without parsing HTML/Markdown or measuring text. |
| Focus metadata | `traceCanvas2DFocusGraph`, focus navigation tests | Renderers can trace focusable geometry without reading gamepad/keyboard/native input or moving focus. |
| Action targets | DOM element attributes, Canvas2D hit-test trace, action registry tests | Renderers expose reviewable target metadata; host owns dispatch. |

## Forbidden Drift Checks

Reviewers should treat these as failures:

- DOM renderer starts using `innerHTML`, native input reads, browser scroll state, DOM measurement, `IntersectionObserver`, `ResizeObserver`, or datasource state.
- Canvas2D starts dispatching `ActionRef`, mutating scroll/selection/text state, reading keyboard/gamepad/touch/native input, owning accessibility, shaping text, measuring text, or acting as production renderer policy.
- Core imports React, DOM, Canvas, Sinan, Three, Pixi, WebGPU, Ajv, schema runtime, HTML parser, or Markdown parser dependencies.
- Renderer conformance depends on platform state instead of explicit `ResolvedUiFrame` and metadata sidecars.

## Validation Evidence

Required Round 9 validation:

- `cmd /c pnpm.cmd test -- packages/renderer-headless/test/renderer-conformance.test.ts packages/renderer-dom/test/dom-renderer.test.ts packages/renderer-canvas2d/test/canvas2d-renderer.test.ts packages/renderer-canvas2d/test/gate-demo-trace.test.ts packages/testing/test/scroll-metadata-fixture.test.ts packages/testing/test/virtual-list-fixture.test.ts packages/testing/test/rich-text-fallback-fixture.test.ts`
- `cmd /c pnpm.cmd structure-check`
- `cmd /c pnpm.cmd api-check`

## Round 9 Self-Check

- Debug: if validation fails, localize to shared fixture shape, renderer output expectations, Canvas2D trace fields, import boundary rules, or API surface drift.
- Architecture: `ResolvedUiFrame` remains the frame boundary and metadata sidecars remain explicit consumer inputs.
- Scope: this pack does not add production Canvas2D, DOM-owned layout, renderer-owned input, datasource loading, a11y ownership, text measurement ownership, or real Sinan integration.
