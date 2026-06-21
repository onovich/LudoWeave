# Canvas2D Renderer Spike

Status: v0.2 experimental spike.

The `@ludoweave/renderer-canvas2d` package consumes `ResolvedUiFrame` snapshots and draws the renderer-owned paint subset into a Canvas2D-like context. It does not change core contracts and does not own input, focus, accessibility, or host dispatch.

## Supported Conformance Subset

- `frame.clear`: clears the full viewport before paint commands.
- `paint.box.fill`: draws filled box paint with `fillRect`.
- `paint.box.stroke`: draws stroked box paint when the context exposes `strokeRect`.
- `paint.text.fill`: draws text paint with upstream resolved text, box, color, and font size.
- `resolved-frame.consume`: returns the consumed frame and a deterministic trace for tests.

## Unsupported In The Spike

- DOM semantics and accessibility roles.
- Native focus, focus containment, and focus restoration.
- Input hit testing and ActionRef dispatch.
- Exact rounded-rect path fidelity.
- Text measurement, wrapping, bidi shaping, and font fallback.

## Fallback Policy

- Hosts should pair Canvas2D paint with a DOM or platform input overlay for focus, actions, editable text, and accessibility.
- Core-owned layout and text measurement stay upstream of Canvas2D rendering.
- Box radius is preserved in the trace; the v0.2 spike may render it as a rectangular fill or stroke until a path renderer lands.
- Action targets remain in `ResolvedUiFrame.actions`; Canvas2D rendering does not dispatch them.
