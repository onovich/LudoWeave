# LudoWeave v0.3 Release Notes Draft

Date: 2026-06-22

Status: Draft after Round 12 integration pass.

## Summary

LudoWeave v0.3 turns the v0.2 renderer and overlay design notes into verifiable host bridge and renderer coordination contracts. It adds typed editable text overlay data, shared lifecycle/failure fixtures, Canvas2D action hit-test and overlay coordination traces, concrete theme resolution fixtures, and a stronger Playground ActionRef inspector while preserving the Runtime UI only boundary.

## Added

- Typed text input overlay bridge draft in `@ludoweave/core`, covering request, selection, input mode, lifecycle reason, capability status, snapshot, and commit/cancel ActionRefs.
- Shared text input overlay bridge fixtures in `@ludoweave/testing` for open, update, focus, snapshot, close, missing capability, stale node, removed node, and disabled editable target states.
- Canvas2D action hit-test trace that reports targets, disabled targets, no target, and outside viewport without dispatching ActionRefs.
- Canvas2D text input overlay coordination trace that hands resolved box, semantic label, theme token, and commit/cancel ActionRefs to the host bridge request.
- Concrete runtime UI theme resolution fixture with default and high-contrast visual hints for Prompt, Subtitle, Dialog, and Objective tokens.
- Playground v0.3 theme resolution state panel.
- ActionRef inspector filtering by namespace or exact action type.
- ActionRef inspector JSON export and clear-history workflow.
- Bounded planning docs for scroll, virtual list, rich text, and richer gamepad navigation as v0.4+ tracks.
- Sinan host integration readiness plan for RuntimeUIViewModel versioning, UIActionRef registry, host bridge capabilities, editable text overlay support, and Gate Demo validation hooks.

## Validation

Round 12 integration should pass:

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`

## Known Limitations

- The editable text overlay bridge is a typed draft and fixture set, not a production host implementation.
- Canvas2D remains an experimental renderer spike; it traces hit tests and overlay coordination but does not own focus, input, accessibility, or dispatch.
- Theme resolution remains a renderer/playground fixture, not a core schema runtime.
- ActionRef inspector remains lightweight and is not a full DevTools protocol.
- Scroll, virtual list, rich text, and richer gamepad navigation are planning tracks only.
- Sinan integration remains a readiness plan; no Sinan source or project JSON is imported, read, or modified.

## Recommended Next Steps

- Use buffer rounds only if validation, docs, API reports, or smoke tests drift.
- Keep final v0.3 validation focused on the complete wrapper/e2e/a11y matrix.
- After v0.3 acceptance, start v0.4 with either a real Sinan host spike or one bounded future track, not both at once.
