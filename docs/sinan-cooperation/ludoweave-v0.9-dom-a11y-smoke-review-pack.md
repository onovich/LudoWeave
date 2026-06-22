# LudoWeave v0.9 DOM And A11y Smoke Review Pack

Date: 2026-06-23

Status: Round 10 DOM and accessibility smoke review pack.

Related artifacts:

- [Renderer Conformance Review Pack](ludoweave-v0.9-renderer-conformance-review-pack.md)
- [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md)
- [Fixture Manifest](ludoweave-v0.9-fixture-manifest.md)

## Review Scope

This pack summarizes the DOM playground and accessibility smoke evidence. The playground is a review surface for resolved Runtime UI metadata. It is not a Sinan editor replacement, not the source of truth for layout, input, accessibility review, text measurement, scroll state, selection state, datasource state, platform policy, fallback UI, or native side effects.

## Smoke Coverage

| Surface | Test Evidence | What Reviewers Should See |
| --- | --- | --- |
| v0.3 base runtime UI | `tests/e2e/playground.spec.ts` | Prompt, Subtitle, Objective, Pause dialog, action log, theme resolution, and Gate Demo status render from resolved metadata. |
| v0.4 Sinan-like Gate Demo | `tests/e2e/playground.spec.ts` | Prompt, Subtitle, Objective, Pause, editable overlay candidate, and Gate Demo status are visible without importing Sinan. |
| v0.5 navigation metadata | `tests/e2e/playground.spec.ts` | Focus graph, host intents, and ActionRef outputs are shown as metadata. |
| v0.6 scroll metadata | `tests/e2e/playground.spec.ts` | Scroll container id, offset, host intents, diagnostics, and restoration evidence are shown without DOM scroll ownership. |
| v0.7 virtual list metadata | `tests/e2e/playground.spec.ts` | Window id, realized range, selection snapshot, host collection intents, and diagnostics are shown without datasource ownership. |
| v0.8 rich text metadata | `tests/e2e/playground.spec.ts` | Rich text block id, plain text fallback, run/span metadata, host policy, token usage, a11y diagnostics, and rich text diagnostics are shown without `innerHTML`. |
| Accessibility smoke | `tests/a11y/playground-a11y.spec.ts` | Axe reports no critical or serious blocking violations for the review surface. |

## DOM Boundary Evidence

| Boundary | Evidence | Expected Result |
| --- | --- | --- |
| No `innerHTML` rich text path | E2E asserts `locator("unsafe")` count is `0` while fallback text includes `<unsafe>`. DOM renderer uses `textContent`. | Rich text remains JSON metadata and plain text fallback, not HTML parsing. |
| DOM consumes resolved boxes | E2E asserts visible elements have `position: absolute`; DOM renderer applies boxes from `ResolvedUiFrame`. | DOM is not a layout source of truth. |
| ActionRef smoke only | Playground click handlers record `ActionRef`s into an inspector for review. | Real registry routing and command dispatch remain host-owned. |
| A11y smoke only | Playwright + axe confirms no serious/critical smoke violations. | Sinan still owns final accessibility review and platform side effects. |
| Runtime-only Gate Demo | Gate Demo renders from example envelope fixture. | No Sinan import, project JSON mutation, or React Editor replacement. |

## Sinan Reviewer Smoke Checklist

Reviewers can use this checklist when running the playground:

| Step | Expected Signal |
| --- | --- |
| Open the playground and inspect Prompt, Subtitle, Objective, and Pause. | Elements are visible and semantically labeled. |
| Trigger Prompt, Objective, and Pause actions. | Action log records serializable action types and supports filter/export/clear. |
| Inspect Gate Demo status. | Status is `PASS`; visible nodes match the Sinan-like fixture. |
| Inspect navigation panel. | Focus graph, host intents, and action outputs are metadata rows. |
| Inspect scroll panel. | Scroll offset and diagnostics appear without needing browser scroll state. |
| Inspect virtual list panel. | Window id, realized range, selection, intents, and diagnostics appear without datasource loading. |
| Inspect rich text panel. | Fallback text, run/span ids, host policy, token usage, and diagnostics appear as text metadata. |
| Run a11y smoke. | No critical or serious axe violations. |

## Limitations

- The playground does not prove production Sinan integration.
- The smoke app can wire browser clicks or keydown for local demo interaction; core and renderer packages remain free of native input reads.
- Axe smoke does not replace Sinan accessibility review, localization review, platform policy, or native a11y side-effect validation.
- DOM smoke does not validate production fallback UI, project JSON, datasource loading, or command/save/undo behavior.

## Validation Evidence

Required Round 10 validation:

- `cmd /c pnpm.cmd test:e2e`
- `cmd /c pnpm.cmd test:a11y`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`

## Round 10 Self-Check

- Debug: if smoke fails, inspect the playground server, Playwright port, DOM selectors, a11y impact filter, or stale fixture text.
- Architecture: DOM/playground remains a consumer and review surface; host/Sinan owns registry, command dispatch, input, focus, scroll, selection, text, a11y, platform, fallback, and side effects.
- Scope: this pack does not add real Sinan integration, `innerHTML`, browser text measurement ownership, datasource loading, production Canvas2D, or editor replacement.
