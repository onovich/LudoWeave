# LudoWeave v0.9 Host Capability Checklist

Date: 2026-06-23

Status: Round 6 host capability checklist.

Related boundary checklist: [ludoweave-v0.9-boundary-checklist.md](ludoweave-v0.9-boundary-checklist.md)

## Purpose

This checklist names the host and Sinan RuntimeUISystem capabilities that must exist or be confirmed before any real integration can begin. LudoWeave v0.9 can document expected routes and review fixtures, but it must not create a real Sinan adapter, mutate Sinan project JSON, own registry policy, or replace Sinan fallback UI.

## Capability Tiers

| Tier | Meaning |
| --- | --- |
| Minimum viable handoff | Required before the v0.9 package can be used as an implementation planning input. |
| Nice to have | Useful for a smoother integration, but not required to review current contracts. |
| Blocked until Sinan decision | Cannot be implemented by LudoWeave without Sinan-owned semantics or policy. |

## Checklist

| Capability | Tier | Sinan / Host Confirmation Needed | LudoWeave Evidence | Integration Risk If Missing |
| --- | --- | --- | --- | --- |
| Envelope versioning | Minimum viable handoff | Confirm version field, compatibility policy, downgrade behavior, and unsupported version diagnostics. | `examples/sinan-runtime-ui/src/envelope.ts`, `examples/sinan-runtime-ui/test/envelope.test.ts` | Real integration cannot distinguish compatible and stale Runtime UI payloads. |
| Runtime UI frame route | Minimum viable handoff | Confirm where Sinan emits runtime-only view model frames and how frame ids map to host lifecycle. | `examples/sinan-runtime-ui/src/adapter.ts`, `examples/sinan-runtime-ui/src/resolved-frame-adapter.ts` | LudoWeave could receive incomplete or incorrectly scoped frame data. |
| Registry route | Minimum viable handoff | Confirm action registry lookup, permission checks, stale frame handling, disabled reason policy, and no-op behavior. | `examples/sinan-runtime-ui/src/action-registry.ts`, `examples/sinan-runtime-ui/src/action-bridge.ts` | `ActionRef` outputs may be routable in tests but ambiguous in production. |
| Fallback renderer route | Minimum viable handoff | Confirm the host route for unsupported renderer, missing capability, missing fallback, and policy failures. | `examples/sinan-runtime-ui/src/fallback-policy.ts`, `examples/sinan-runtime-ui/src/fallback-renderer.ts` | Users may see inconsistent or missing fallback UI during integration failures. |
| Viewport, safe area, and DPR | Minimum viable handoff | Confirm source for viewport size, safe area, device pixel ratio, and resize lifecycle. | `examples/sinan-runtime-ui/src/host-capabilities.ts`, layout and renderer tests | Renderer review may not match real host display constraints. |
| Focus policy | Minimum viable handoff | Confirm focus state ownership, restore policy, input scopes, disabled target policy, and native a11y focus side effects. | [Focus Navigation Contract](../runtime-ui/focus-navigation-contract.md), `examples/sinan-runtime-ui/src/gate-demo-navigation.ts` | Focus metadata could be misread as host focus state ownership. |
| Scroll policy | Minimum viable handoff | Confirm scroll intent route, offset persistence, route restoration, nested scroll policy, and native scroll side effects. | [Scroll Metadata Contract](../runtime-ui/scroll-metadata-contract.md), `examples/sinan-runtime-ui/src/gate-demo-scroll.ts` | Scroll metadata could drift from host-owned scroll state. |
| Selection and collection policy | Minimum viable handoff | Confirm datasource ownership, item identity, selection state, loading, pagination, and cache invalidation. | [Virtual List Metadata Contract](../runtime-ui/virtual-list-metadata-contract.md), `examples/sinan-runtime-ui/src/gate-demo-virtual-list.ts` | Virtual window metadata could be mistaken for datasource or selection truth. |
| Text policy | Minimum viable handoff | Confirm localized content source, sanitization, semantic span policy, a11y review, text measurement, font selection, and platform policy. | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md), `examples/sinan-runtime-ui/src/gate-demo-rich-text.ts` | JSON-only rich text metadata could be misused as an HTML/Markdown/text engine. |
| Validation hook route | Minimum viable handoff | Confirm where mapping, renderer, capability, registry, focus, scroll, virtual list, and rich text validation reports should be surfaced. | `examples/sinan-runtime-ui/src/validation-hook.ts`, `examples/sinan-runtime-ui/test/validation-hook.test.ts` | Failures may be detectable but not actionable in Sinan review flow. |
| Audit log route | Minimum viable handoff | Confirm audit retention, reviewer access, privacy boundary, and mapping from routing outcomes to Sinan diagnostics. | `examples/sinan-runtime-ui/src/action-audit-export.ts` | Action routing evidence may not reach the reviewer who needs it. |
| Host capability discovery | Nice to have | Confirm whether Sinan exposes capability snapshots or feature flags before frame rendering. | `examples/sinan-runtime-ui/src/host-capabilities.ts` | LudoWeave may rely on example capability snapshots only. |
| Review dashboard aggregation | Nice to have | Confirm if validation, audit, fallback, and renderer conformance evidence can be shown in one host review surface. | v0.9 review packs and final handoff docs | Review may require manual cross-document navigation. |
| Structured diagnostic code mapping | Nice to have | Confirm Sinan diagnostic code namespace, severity model, and reviewer copy policy. | `packages/core/src/diagnostics.ts`, rich text/focus/scroll/virtual diagnostics | Diagnostics may be technically correct but not aligned with Sinan UX. |
| Real adapter package ownership | Blocked until Sinan decision | Confirm package name, ownership, release channel, versioning, source location, and dependency policy. | None by design | LudoWeave must not create `@ludoweave/sinan` in v0.9. |
| Project JSON mutation route | Blocked until Sinan decision | Confirm project schema, mutation authority, save/undo implications, migration policy, and test data ownership. | None by design | Any implementation would violate v0.9 boundaries. |
| React Editor integration route | Blocked until Sinan decision | Confirm whether Runtime UI review enters Sinan editor, preview, runtime, or dedicated host panel. | Runtime-only docs and fixtures | LudoWeave must not replace or broaden Sinan React Editor behavior. |
| Production Canvas2D route | Blocked until Sinan decision | Confirm renderer ownership, performance budget, text policy, input policy, accessibility path, and dispatch restrictions. | Canvas2D trace tests only | Experimental trace could be mistaken for production renderer readiness. |

## Minimum Handoff Gate

The v0.9 package can be considered ready for Sinan review if every minimum viable handoff item has an owner and at least one review route. Actual implementation remains blocked until Sinan confirms registry route, fallback route, project ownership, package ownership, editor entry point, and runtime policy outside this repository.

## Round 6 Self-Check

- Debug: if this checklist fails validation, inspect stale paths, missing tiers, or missing required capability terms.
- Architecture: every required host capability is framed as Sinan-owned confirmation, not LudoWeave implementation.
- Scope: this document does not create adapter packages, read project JSON, mutate project data, or add runtime behavior.
