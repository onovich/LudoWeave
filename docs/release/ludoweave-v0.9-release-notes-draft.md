# LudoWeave v0.9 Release Notes Draft

Date: 2026-06-23

Status: Draft release notes for the Bounded Sinan Handoff Checklist track.

## Summary

v0.9 packages the accepted v0.4 through v0.8 Runtime UI contracts into a Sinan-reviewable handoff. It adds documentation artifacts for coverage, fixtures, boundaries, host capabilities, ActionRef routing, fallback policy, renderer conformance, DOM/a11y smoke, Canvas2D traces, gaps, and review decisions.

## Added

- Sinan handoff overview.
- Contract coverage matrix across v0.4-v0.8.
- Fixture manifest with owners, source-of-truth boundaries, expected results, and validation commands.
- Boundary checklist and host capability checklist.
- ActionRef registry, fallback policy, renderer conformance, DOM/a11y smoke, and Canvas2D trace review packs.
- Gap and decision ledger, final handoff checklist, and Sinan review matrix.

## Validation

Round 12 validation is required before this draft can be considered final:

- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`
- `cmd /c pnpm.cmd validate`
- `cmd /c pnpm.cmd test:e2e`
- `cmd /c pnpm.cmd test:a11y`
- `cmd /c pnpm.cmd format`
- `git diff --check`

Round 16 final validation must rerun the full guide matrix and record final evidence.

## Non-Goals

v0.9 does not import Sinan, mutate project JSON, replace Sinan React Editor, create a real adapter package, publish packages, add datasource loading, add production Canvas2D, add Pixi/WebGPU, parse HTML/Markdown, own rich text editing, own localization, or move Sinan host source-of-truth responsibilities into LudoWeave.
