# LudoWeave v0.9 Fallback Policy Review Pack

Date: 2026-06-23

Status: Round 8 fallback policy review pack.

Related artifacts:

- [Host Capability Checklist](ludoweave-v0.9-host-capability-checklist.md)
- [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md)
- [Fixture Manifest](ludoweave-v0.9-fixture-manifest.md)

## Review Scope

This pack summarizes fallback and failure-path evidence for Sinan review. LudoWeave can detect missing capabilities, unsupported renderer requests, stale metadata, removed items, invalid token references, missing host review, and missing fallback routes. Sinan or the host still owns the real fallback UI, recovery UX, policy severity, localization, command routing, and side effects.

## Fallback Surfaces

| Surface | Path | Review Signal |
| --- | --- | --- |
| Base fallback policy | `examples/sinan-runtime-ui/src/fallback-policy.ts` | Selects Sinan-owned fallback for missing text overlay capability, unsupported renderer, requested fallback, or unavailable fallback route. |
| Fallback renderer fixture | `examples/sinan-runtime-ui/src/fallback-renderer.ts` | Produces a stable review snapshot from host-owned view model data. |
| Scroll fallback policy | `examples/sinan-runtime-ui/src/fallback-policy.ts` | Selects Sinan-owned fallback for disabled, missing, or unsupported host scroll capability. |
| Virtual list fallback policy | `examples/sinan-runtime-ui/src/fallback-policy.ts` | Selects Sinan-owned fallback for missing collection capability, stale selection, removed item, or unsupported renderer. |
| Rich text fallback metadata | `packages/testing/src/rich-text-fallback-fixture.ts`, `examples/sinan-runtime-ui/src/gate-demo-rich-text.ts` | Keeps unsupported spans and missing fallback text reviewable without parsing HTML or Markdown. |
| Theme token fallback | `packages/testing/src/theme-resolution-fixture.ts`, `packages/core/src/rich-text-theme-token.ts` | Reports missing and unsupported token scopes as metadata/diagnostics rather than renderer policy. |
| Validation hook fallback layers | `examples/sinan-runtime-ui/src/validation-hook.ts` | Localizes fallback gaps to mapping, host capability, overlay coordination, renderer, or rich text layers. |

## Failure Path Matrix

| Failure Path | Current Evidence | Owner Of Real Policy | Expected v0.9 Behavior |
| --- | --- | --- | --- |
| Unsupported renderer (`pixi`, `webgpu`) | `resolveGateDemoFallbackPolicy`, `resolveGateDemoScrollFallbackPolicy`, `resolveGateDemoVirtualListFallbackPolicy` | Sinan fallback route and renderer policy | Select `sinan-fallback-renderer` or emit unavailable fallback diagnostic; do not add Pixi/WebGPU. |
| Missing text input overlay capability | `createGateDemoMissingTextInputOverlayHostCapabilitySnapshot`, fallback policy tests | Host capability policy | Preserve fallback action and diagnostic without taking over native input. |
| Missing fallback renderer route | fallback policy unavailable branch | Sinan fallback UI ownership | Emit error diagnostic; do not synthesize production fallback UI in core. |
| Disabled or missing scroll capability | scroll fallback policy tests | Host scroll policy | Select Sinan-owned scroll fallback; do not read DOM scroll state. |
| Missing collection capability | virtual list fallback policy tests | Host collection/datasource policy | Select Sinan-owned virtual list fallback; do not load datasource. |
| Stale selection | virtual list fallback policy tests, virtual window diagnostics | Host selection state | Report stale selection and route to Sinan fallback; do not mutate selection. |
| Removed item | virtual list fallback policy tests, virtual window diagnostics | Host collection and selection state | Report removed item and route to Sinan fallback; do not infer replacement item. |
| Unsupported rich text span | rich text diagnostics and Gate Demo rich text fixture | Host markup policy and localized content policy | Use plain text fallback metadata and diagnostics; do not parse HTML/Markdown. |
| Missing rich text fallback | rich text fallback fixture and diagnostics | Host text content policy | Emit missing fallback diagnostic; do not invent localized text. |
| Invalid or missing theme token | theme token fixture and rich text token diagnostics | Host theme and token policy | Emit token diagnostics or deterministic fallback token metadata; do not embed renderer-specific styles. |
| Missing host sanitization policy | rich text diagnostics | Host sanitization policy | Emit missing host review diagnostic; do not sanitize on behalf of Sinan. |
| Missing host accessibility review | rich text a11y review diagnostics and a11y smoke | Host a11y review policy | Expose review metadata and fallback labels; do not own native accessibility side effects. |
| Missing editable fallback action | validation hook overlay coordination | Host overlay/fallback route | Localize to validation hook; do not dispatch fallback from renderer internals. |

## Sinan Review Questions

| Question | Required Decision |
| --- | --- |
| Which fallback reasons should block integration versus degrade to Sinan fallback UI? | Sinan severity and release policy. |
| Where does the real fallback renderer route live? | Sinan RuntimeUISystem host capability route. |
| How should fallback diagnostics be localized for reviewers and players? | Sinan localization and UX policy. |
| Which unsupported renderer requests should remain permanently deferred? | Sinan rendering roadmap. |
| How should stale selection and removed items be repaired? | Sinan collection and selection policy. |
| Who approves rich text sanitization, token references, and accessibility review before runtime? | Sinan content and accessibility review policy. |

## Validation Evidence

Targeted tests:

- `examples/sinan-runtime-ui/test/fallback-policy.test.ts`
- `examples/sinan-runtime-ui/test/action-bridge-fallback.test.ts`
- `examples/sinan-runtime-ui/test/validation-hook.test.ts`
- `packages/testing/test/rich-text-fallback-fixture.test.ts`
- `packages/testing/test/theme-resolution-fixture.test.ts`
- `packages/core/test/rich-text-diagnostics.test.ts`
- `packages/core/test/rich-text-a11y-review.test.ts`
- `packages/core/test/virtual-window-diagnostics.test.ts`

Required Round 8 validation:

- `cmd /c pnpm.cmd test -- examples/sinan-runtime-ui/test/fallback-policy.test.ts examples/sinan-runtime-ui/test/action-bridge-fallback.test.ts examples/sinan-runtime-ui/test/validation-hook.test.ts packages/testing/test/rich-text-fallback-fixture.test.ts packages/testing/test/theme-resolution-fixture.test.ts packages/core/test/rich-text-diagnostics.test.ts packages/core/test/rich-text-a11y-review.test.ts packages/core/test/virtual-window-diagnostics.test.ts`
- `cmd /c pnpm.cmd validate`

## Round 8 Self-Check

- Debug: if validation fails, localize to fallback reason selection, host capability status, rich text fallback diagnostics, theme token diagnostics, or validation hook layer routing.
- Architecture: fallback UI, localized copy, recovery behavior, a11y review, sanitization, scroll state, selection state, datasource, and renderer roadmap remain Sinan/host-owned.
- Scope: this pack does not add Pixi/WebGPU, production Canvas2D, HTML/Markdown import, datasource loading, native input reads, or real Sinan integration.
