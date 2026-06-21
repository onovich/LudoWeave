# DOM Input Overlay Design

Status: v0.2 design note. No core runtime type is introduced in this round.

This note describes how a non-DOM renderer, such as the Canvas2D spike, should support editable text without owning DOM input behavior. The design keeps renderer paint deterministic while letting the host provide native text input, IME, focus, selection, and accessibility.

## Problem

Canvas2D can paint text, boxes, and cursors, but it should not reimplement browser or platform text input. Editable text needs platform behaviors that are hard to reproduce correctly:

- IME composition and candidate windows.
- Clipboard, selection, caret movement, and undo.
- Screen reader exposure.
- Focus restoration and modal containment.
- Mobile virtual keyboard behavior.

## Host Capability

A host that supports editable text over a non-DOM renderer should expose an input overlay capability with these minimum operations:

- `openTextInputOverlay(request)`: create or reuse a native input element aligned to a resolved UI box.
- `updateTextInputOverlay(request)`: move, resize, restyle, or update value/selection as layout changes.
- `closeTextInputOverlay(reason)`: remove or hide the input when the node unmounts, loses focus, or commits.
- `focusTextInputOverlay(id)`: request native focus for an overlay.
- `snapshotTextInputOverlay(id)`: read value, selection, and composition state for host dispatch.

The host owns DOM nodes, platform widgets, focus, keyboard routing, IME, and accessibility attributes. It also owns conversion from native input events into ActionRef-compatible host events.

## Renderer Responsibility

A non-DOM renderer should stay paint-focused:

- Consume `ResolvedUiFrame` for layout, paint, semantics, and action targets.
- Draw non-editing text through normal paint commands.
- Detect, or be told by the host, when an editable text node requires an overlay.
- Provide the resolved box, node id, semantic label, and visual hints to the host overlay capability.
- Avoid dispatching text input events directly.

Canvas2D rendering should continue when an overlay is active. The overlay sits above the canvas and handles native input. The renderer may suppress duplicate painted caret or text for the focused editable node if the host requests it.

## Overlay Request Shape

Future type drafts can model a request with these fields:

- `overlayId`: stable host-owned overlay id.
- `nodeId`: resolved node id that owns the editable text.
- `box`: resolved CSS pixel box.
- `value`: current text value.
- `selection`: optional `{ start, end, direction }`.
- `placeholder`: optional placeholder text.
- `inputMode`: optional platform input hint such as `text`, `numeric`, or `search`.
- `multiline`: boolean.
- `ariaLabel`: semantic label for accessibility.
- `themeToken`: optional theme token for host styling.
- `commitAction` and `cancelAction`: optional ActionRefs emitted by the host.

This request is deliberately a host bridge contract, not a core layout primitive.

## Lifecycle

1. Renderer consumes a frame containing an editable text node or a host-selected editable target.
2. Host opens an overlay positioned from the target `ResolvedRect`.
3. Native input events update host state and may emit ActionRef log entries.
4. On every new frame, host updates overlay position from the latest resolved box.
5. Commit, cancel, blur, route change, or node removal closes the overlay.
6. Host restores focus according to the active focus scope contract.

## Fallback Policy

- If the host lacks native input overlays, editable text should be disabled or redirected to a host-provided modal input flow.
- If only paint is available, Canvas2D may display read-only text and expose a diagnostic that input overlay capability is missing.
- Accessibility must come from the host overlay, not from painted text alone.
- ActionRef dispatch remains host-owned; the renderer can trace targets but must not invent text callbacks.

## Non Goals

- Full DevTools protocol.
- Rich text editing.
- Reimplementing IME or selection in Canvas2D.
- Adding a schema runtime dependency to core.
