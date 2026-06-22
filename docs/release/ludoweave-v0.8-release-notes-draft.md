# LudoWeave v0.8 Release Notes Draft

Status: draft pending final validation.

## Summary

v0.8 adds Bounded Rich Text Metadata. The track gives LudoWeave a JSON-only way to describe host-reviewed inline text runs, semantic spans, plain text fallback, theme token references, accessibility review metadata, host policy flags, diagnostics, renderer conformance sidecars, DOM smoke, Canvas2D traces, and Sinan-like review artifacts.

## Added

- Core rich text metadata, host policy, diagnostics, theme token reference, accessibility review, and ActionRef intent contracts.
- Testing fixtures for inline runs, nested spans, unsupported span fallback, and plain text fallback review.
- Renderer conformance sidecar proving headless, DOM, and Canvas2D can consume the same resolved frame plus rich text metadata.
- Playground v0.8 rich text smoke that renders metadata through safe text nodes and attributes, including a literal `<unsafe>` text check.
- Canvas2D rich text trace for run boxes, span metadata, fallback text, theme token ids, action target ids, and diagnostics.
- Sinan-like Gate Demo rich text sequence, registry mock routing, fallback policy, validation hook layer, and JSON-only audit export.
- Runtime UI rich text metadata contract note.

## Boundaries

v0.8 remains metadata-only. It does not parse HTML or Markdown, use `innerHTML`, implement a rich text editor, own IME/editing/clipboard/contenteditable, shape text, measure text, replace browser text layout, read DOM/native input/platform state, import real Sinan, read or mutate Sinan project JSON, or replace the Sinan React Editor.

## Validation Plan

Final validation must run:

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm structure-check`
- `pnpm api-check`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`
- `git status --short --branch`
- `git ls-remote origin refs/heads/main`
