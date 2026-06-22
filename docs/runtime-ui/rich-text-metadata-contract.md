# Rich Text Metadata Contract

Status: v0.8 contract note.

This note documents the Bounded Rich Text Metadata track. It describes how LudoWeave exposes JSON-only rich text metadata, host policy snapshots, diagnostics, renderer traces, and Sinan-like review artifacts while keeping localized content, markup policy, sanitization, narrative state, accessibility review, text measurement policy, font policy, platform policy, input state, and side effects owned by the host or Sinan RuntimeUISystem.

## Source Of Truth

The host owns:

- Localized text content, narrative state, markup policy, sanitization, accessibility review, pronunciation review, font selection policy, text measurement policy/source, platform policy, and all side effects.
- Rich text editor state, IME, editing selection, clipboard, copy/paste, content composition, scroll state, collection data, input policy, and route persistence.
- Any real Sinan registry, command routing, project JSON, Director, Timeline, Event, save, undo, or gameplay state.

LudoWeave may describe:

- `RichTextMetadata` with block id, node id, locale hint, plain text fallback, inline runs, semantic spans, renderer hints, theme token references, host policy flags, accessibility metadata, and diagnostics.
- `HostRichTextPolicySnapshot` values that identify which host policy lanes are available, pending, missing, or rejected.
- `HostRichTextIntent` values that serialize review, span activation, fallback, or diagnostic dismissal handoffs as ActionRefs.
- Diagnostics for unsupported span type, missing fallback text, invalid token reference, missing host sanitization, non-serializable payload, empty run, and nested span overflow.
- Renderer conformance sidecars and Canvas2D traces that consume metadata without parsing HTML, parsing Markdown, measuring text, dispatching actions, or mutating state.

## Contract Surfaces

| Surface | Owner | Notes |
| --- | --- | --- |
| Rich text metadata | LudoWeave describes, host supplies | JSON-only metadata in `@ludoweave/core`; no DOM node, parser object, Promise, callback, React component, or schema runtime dependency. |
| Host policy snapshot | Host-owned policy state | Localized content, markup policy, sanitization, narrative state, accessibility review, text measurement, font selection, and platform policy stay outside renderers. |
| Host rich text intent | Host creates, LudoWeave normalizes | ActionRef-only handoff for review, activation, fallback, and diagnostic dismissal. |
| Plain text fallback | Host-reviewed fallback | Renderers may display or trace fallback text without reconciling runs or repairing markup. |
| Theme token refs | Metadata only | Rich text references token ids; it does not emit renderer-specific style objects. |
| Accessibility metadata | Host-reviewable data | Labels, descriptions, live region policy, pronunciation hints, and review status are metadata, not platform side effects. |
| DOM smoke | Playground | Uses safe text nodes and attributes only; no `innerHTML` path. |
| Canvas2D trace | Renderer trace only | Traces run boxes, span metadata, fallback text, theme token ids, action target ids, and diagnostics; does not shape text or dispatch. |
| Sinan-like Gate Demo | Example fixture | Provides localized text records, registry mock results, fallback policy, validation hook layer, and JSON-only audit export without importing Sinan. |

## Diagnostics

Stable rich text diagnostics include:

- `LW_RICH_TEXT_EMPTY_RUN`
- `LW_RICH_TEXT_HOST_SANITIZATION_MISSING`
- `LW_RICH_TEXT_INVALID_TOKEN_REFERENCE`
- `LW_RICH_TEXT_MISSING_FALLBACK_TEXT`
- `LW_RICH_TEXT_NESTED_SPAN_OVERFLOW`
- `LW_RICH_TEXT_NON_SERIALIZABLE_PAYLOAD`
- `LW_RICH_TEXT_UNSUPPORTED_SPAN`

Accessibility review diagnostics include:

- `LW_RICH_TEXT_A11Y_FALLBACK_LABEL`
- `LW_RICH_TEXT_A11Y_MISSING_HOST_REVIEW`
- `LW_RICH_TEXT_A11Y_UNSUPPORTED_LIVE_POLICY`

The Sinan-like validation hook localizes rich text issues to mapping, registry route, and renderer trace layers.

## Non-Goals

v0.8 does not:

- Import real Sinan source, read or mutate Sinan project JSON, or replace the Sinan React Editor.
- Parse HTML, use `innerHTML`, add a Markdown parser, or implement a browser text engine replacement.
- Implement rich text editing, IME, editing selection, clipboard, copy/paste, contenteditable, or text input composition.
- Implement bidi shaping, hyphenation, font fallback, line breaking, text measurement, virtualized rich text DOM pooling, production Canvas2D, Pixi/WebGPU, full DevTools, or real localization pipeline.
- Read DOM measurement, browser scroll state, observers, wheel/touch/keyboard/gamepad/native input events, datasource state, or platform input state from core or renderer packages.
- Dispatch ActionRefs, mutate text/selection/scroll/accessibility state, or perform native side effects from DOM or Canvas2D rich text consumers.

## Fixtures And Validation

Review surfaces:

- Core metadata, policy, diagnostics, token, and a11y contracts: `packages/core/src/rich-text-*.ts` and `host-rich-text-policy.ts`.
- Inline run and fallback fixtures: `packages/testing/src/rich-text-inline-run-fixture.ts` and `rich-text-fallback-fixture.ts`.
- Renderer conformance sidecar: `packages/testing/src/renderer-conformance.ts`.
- DOM no-innerHTML smoke: `apps/playground/src/main.ts` and `tests/e2e/playground.spec.ts`.
- Canvas2D rich text trace: `packages/renderer-canvas2d/src/index.ts`.
- Sinan-like rich text sequence, audit export, and validation hook: `examples/sinan-runtime-ui/src/gate-demo-rich-text.ts`, `action-audit-export.ts`, and `validation-hook.ts`.

Required v0.8 final validation includes `Validate.cmd`, `Smoke.cmd`, `pnpm validate`, `pnpm test:e2e`, `pnpm test:a11y`, `pnpm format`, and remote alignment checks.

## Recommended v0.9 Entry

The next safe entry is a bounded rich text handoff checklist for real Sinan review, still without importing Sinan source or mutating project JSON. Keep HTML/Markdown import, rich text editing, production Canvas2D, datasource loading, full DevTools, and real integration out of the next step unless a new guide explicitly narrows them.
