# LudoWeave v0.2 Release Notes Draft

Date: 2026-06-21

Status: Draft after Round 12 integration pass.

## Summary

LudoWeave v0.2 expands the v0.1 Runtime UI loop with interaction polish, objective hints, theme token metadata, a lightweight ActionRef inspector, and a first isolated Canvas2D renderer spike. The release keeps the original architectural boundary: core owns serializable contracts and layout outputs, while renderers and hosts consume those contracts without becoming new sources of layout or behavior truth.

## Added

- Real ops validation wrapper wiring for lint, typecheck, build, test, structure check, API check, and smoke commands.
- Pause modal behavior contract with focus restoration, host input shielding, and keyboard/gamepad focus navigation draft metadata.
- `Objective` component for active/completed/failed delivery hints with optional ActionRef.
- Sinan-like runtime UI example support for Objective mapping and fallback rendering.
- Runtime UI theme token contract and component defaults for Prompt, Subtitle, Dialog, and Objective.
- Playground v0.2 state showing Prompt, Subtitle, Objective, Pause dialog draft, and ActionRef history.
- Lightweight ActionRef log inspector module and tests.
- DOM renderer theme token data attributes and non-native button semantics.
- Experimental `@ludoweave/renderer-canvas2d` package with clear, box, and text paint support.
- Canvas2D conformance policy and DOM input overlay design notes.

## Validation

The current v0.2 draft should pass:

- `pnpm format`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `Validate.cmd`
- `Smoke.cmd`

## Known Limitations

- Canvas2D is an experimental spike, not a production renderer.
- Canvas2D does not own focus, semantics, hit testing, editable text, or ActionRef dispatch.
- DOM input overlay is documented as a design note; no core type draft is introduced yet.
- Theme tokens are serializable metadata; concrete theme resolution remains host/renderer-owned.
- ActionRef inspector is intentionally lightweight and not a full DevTools surface.
- Sinan integration remains a local example and does not import or modify Sinan editor internals.

## Recommended Next Steps

- Use buffer rounds to tighten docs, snapshots, and workflow ergonomics.
- Produce a final v0.2 report with commit hashes and validation outputs.
- Decide whether DOM input overlay requests should become a typed host bridge contract.
- Extend Canvas2D conformance only after input/focus fallback boundaries remain stable.
