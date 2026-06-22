# LudoWeave v0.9 Canvas2D Trace Review Pack

Date: 2026-06-23

Status: Round 11 Canvas2D trace review pack.

Related artifacts:

- [Renderer Conformance Review Pack](ludoweave-v0.9-renderer-conformance-review-pack.md)
- [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md)
- [Fallback Policy Review Pack](ludoweave-v0.9-fallback-policy-review-pack.md)

## Review Scope

Canvas2D in v0.9 is an experimental trace surface. It can paint simple resolved commands and emit deterministic trace records for geometry, metadata, and action target review. It is not a production renderer, ActionRef dispatcher, input owner, focus owner, scroll owner, selection owner, text owner, accessibility owner, text shaping engine, text measurement engine, or Sinan integration route.

## Trace Surfaces

| Trace | Path | Fields For Review | Boundary |
| --- | --- | --- | --- |
| Render trace | `createCanvas2DRenderer` in `packages/renderer-canvas2d/src/index.ts` | `clear`, `box`, `text`, paint id, node id, box, fill/stroke/radius/text/font hints | Consumes resolved paint commands only. |
| Action hit-test trace | `traceCanvas2DActionHitTest` | frame id, point, result, action target id, node id, box, `ActionRef`, disabled flag, label | Does not dispatch `ActionRef` or read native input. |
| Focus graph trace | `traceCanvas2DFocusGraph` | frame id, scope id, focus id, node id, box, action target id, disabled reason | Does not move focus, read keyboard/gamepad, or own a11y focus. |
| Scroll metadata trace | `traceCanvas2DScrollMetadata` | container id, node id, content rect, viewport rect, visible content box, offset, max offset, action target ids, diagnostics | Does not read DOM scroll state or mutate offsets. |
| Virtual window trace | `traceCanvas2DVirtualWindow` | window id, node id, total count, realized/overscan ranges, selection snapshot, realized item geometry, action target ids, diagnostics | Does not own datasource, selection, pagination, or recycling. |
| Rich text trace | `traceCanvas2DRichTextMetadata` | block id, node id, locale hint, plain text fallback, action target ids, run ids, span ids, token refs, renderer hints, diagnostics | Does not parse HTML/Markdown, shape text, measure text, or own sanitization. |
| Text overlay coordination trace | `traceCanvas2DTextInputOverlayCoordination` | overlay id, node id, box, value, selection, semantic label, commit/cancel ActionRefs, diagnostics | Coordinates a host request only; host opens, focuses, snapshots, closes, and dispatches. |

## Supported Metadata

Canvas2D may trace:

- Resolved node geometry and paint command geometry.
- Action target ids, action payloads, labels, and disabled flags.
- Focusable geometry and scope ids from host-approved focus metadata.
- Scroll candidate geometry, normalized visible content, offsets, max offsets, and scroll diagnostics.
- Virtual list window geometry, realized item geometry, selection snapshots, and diagnostics.
- Rich text block ids, run ids, span ids, fallback text, theme token refs, renderer hints, and diagnostics.

## Explicit Non-Dispatch Boundary

Canvas2D must not:

- Dispatch `ActionRef`s.
- Mutate focus, scroll, selection, text, datasource, or platform state.
- Read keyboard, gamepad, touch, wheel, browser scroll, DOM measurement, native input, datasource, or platform state.
- Own accessibility review or native accessibility side effects.
- Shape text, measure text, implement bidi/hyphenation/font fallback, or parse HTML/Markdown.
- Become a production renderer or Sinan adapter.

## Sinan Review Questions

| Question | Required Decision |
| --- | --- |
| Are Canvas2D traces useful for handoff review before production renderer ownership is decided? | Sinan renderer review policy. |
| Which trace fields should be included in future audit exports? | Sinan audit and diagnostics policy. |
| Which Canvas2D trace diagnostics should block real integration? | Sinan release gate policy. |
| If production Canvas2D becomes a future goal, who owns input, a11y, text measurement, and fallback policy? | Sinan platform and renderer ownership policy. |

## Validation Evidence

Required Round 11 validation:

- `cmd /c pnpm.cmd test -- packages/renderer-canvas2d/test/canvas2d-renderer.test.ts packages/renderer-canvas2d/test/gate-demo-trace.test.ts packages/renderer-headless/test/renderer-conformance.test.ts`
- `cmd /c pnpm.cmd validate`

## Round 11 Self-Check

- Debug: if validation fails, localize to trace field shape, normalized metadata, action target lookup, rich text diagnostics, virtual item geometry, or text overlay request validation.
- Architecture: Canvas2D remains a consumer and trace surface only.
- Scope: this pack does not add production Canvas2D, dispatch, native input reads, DOM measurement, datasource loading, text engine work, Pixi/WebGPU, or real Sinan integration.
