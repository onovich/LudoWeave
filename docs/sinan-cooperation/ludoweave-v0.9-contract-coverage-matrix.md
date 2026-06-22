# LudoWeave v0.9 Contract Coverage Matrix

Date: 2026-06-23

Status: Round 3 contract coverage matrix.

Related overview: [ludoweave-v0.9-sinan-handoff-overview.md](ludoweave-v0.9-sinan-handoff-overview.md)

## Status Legend

| Status | Meaning |
| --- | --- |
| Ready | LudoWeave has a bounded contract, fixture, or validation surface that Sinan can review now. |
| Needs Sinan decision | LudoWeave has a proposed boundary, but real integration needs Sinan-owned semantics, registry behavior, policy, or route confirmation. |
| Deferred | The topic is intentionally outside v0.9 and must not be implemented as part of this handoff package. |

## RFC-003 To LudoWeave Coverage

| RFC / Handoff Topic | LudoWeave Artifact | Status | Sinan Review Question |
| --- | --- | --- | --- |
| `RuntimeUIViewModel` envelope boundary | [v0.4 contract spike notes](ludoweave-v0.4-sinan-contract-spike-notes.md), `examples/sinan-runtime-ui/src/envelope.ts`, `examples/sinan-runtime-ui/src/view-model.ts` | Ready | Does the Sinan-owned view model envelope carry enough versioning, surface, capability, fallback, and payload context for a real host route? |
| Prompt, Subtitle, Objective, Pause surfaces | `examples/sinan-runtime-ui/src/fixture.ts`, `packages/components/src/`, renderer fixture tests | Ready | Are these surfaces the right first review set for runtime-only UI handoff? |
| `UIActionRef` / `ActionRef` callback-free contract | [ADR-0003](../adr/0003-actionref-no-arbitrary-callback.md), `packages/core/src/action-ref.ts`, `examples/sinan-runtime-ui/src/action-mapping.ts` | Ready | Are action type, payload, source node, and diagnostics sufficient for Sinan registry routing without callbacks? |
| Registry routing outcomes | `examples/sinan-runtime-ui/src/action-registry.ts`, `examples/sinan-runtime-ui/src/action-bridge.ts`, `examples/sinan-runtime-ui/test/action-registry.test.ts` | Needs Sinan decision | Which accepted, rejected, stale, unavailable, disabled, unknown, and no-op states map to Sinan registry policy? |
| Fallback renderer route | `examples/sinan-runtime-ui/src/fallback-policy.ts`, `examples/sinan-runtime-ui/src/fallback-renderer.ts`, fallback tests | Needs Sinan decision | Which fallback UI and diagnostics are Sinan-owned when a capability or renderer is unavailable? |
| Validation hook layers | `examples/sinan-runtime-ui/src/validation-hook.ts`, `examples/sinan-runtime-ui/test/validation-hook.test.ts` | Ready | Are mapping, renderer, host capability, registry, focus, scroll, virtual list, and rich text layers sufficient for pre-integration review? |
| Audit export | `examples/sinan-runtime-ui/src/action-audit-export.ts`, `examples/sinan-runtime-ui/test/action-audit-export.test.ts` | Ready | Does the JSON-only audit payload include enough evidence without leaking callbacks or runtime objects? |
| Focus metadata and host input intent | [Focus Navigation Contract](../runtime-ui/focus-navigation-contract.md), `packages/core/src/focus-graph.ts`, `packages/core/src/host-input-intent.ts`, `examples/sinan-runtime-ui/src/gate-demo-navigation.ts` | Ready | Does Sinan agree that physical input, focus state, rebinding, native focus, and platform policy remain host-owned? |
| Scroll metadata | [Scroll Metadata Contract](../runtime-ui/scroll-metadata-contract.md), `packages/core/src/scroll-metadata.ts`, `packages/core/src/host-scroll-intent.ts`, `examples/sinan-runtime-ui/src/gate-demo-scroll.ts` | Ready | Does Sinan agree that scroll intent, offset persistence, route restoration, and native scroll side effects stay host-owned? |
| Virtual list metadata | [Virtual List Metadata Contract](../runtime-ui/virtual-list-metadata-contract.md), `packages/core/src/virtual-window-metadata.ts`, `packages/core/src/host-collection-intent.ts`, `examples/sinan-runtime-ui/src/gate-demo-virtual-list.ts` | Ready | Does Sinan agree that collection data, item identity, datasource loading, selection state, and pagination stay host-owned? |
| Rich text metadata | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md), `packages/core/src/rich-text-metadata.ts`, `packages/core/src/host-rich-text-policy.ts`, `examples/sinan-runtime-ui/src/gate-demo-rich-text.ts` | Ready | Does Sinan agree that localized content, sanitization, a11y review, text measurement, and markup policy stay host-owned? |
| DOM renderer review path | [ADR-0004](../adr/0004-dom-renderer-consumes-core-layout.md), `packages/renderer-dom/src/index.ts`, `tests/e2e/playground.spec.ts`, `tests/a11y/playground-a11y.spec.ts` | Ready | Does the DOM smoke surface demonstrate metadata consumption without becoming a host state owner? |
| Canvas2D trace review path | [Canvas2D Renderer Spike](../runtime-ui/canvas2d-renderer-spike.md), `packages/renderer-canvas2d/src/index.ts`, `packages/renderer-canvas2d/test/gate-demo-trace.test.ts` | Ready | Is trace-only Canvas2D evidence useful even though production Canvas2D remains deferred? |
| Real Sinan adapter package | None by design | Deferred | Should only begin after Sinan approves host routes, registry semantics, fallback policy, and package ownership. |
| Sinan project JSON mutation | None by design | Deferred | Must remain outside LudoWeave until Sinan defines project ownership and mutation policy. |
| Sinan React Editor replacement | None by design | Deferred | Explicitly out of scope; v0.9 remains runtime UI only. |
| Timeline, Director, Event, save, undo, editor store, asset store, gameplay state | None by design | Deferred | These remain Sinan-owned and must not enter LudoWeave core API. |

## Coverage Summary

| Bucket | Count | Items |
| --- | --- | --- |
| Ready | 11 | Envelope boundary, first UI surfaces, ActionRef contract, validation hooks, audit export, focus, scroll, virtual list, rich text, DOM review path, and Canvas2D trace path. |
| Needs Sinan decision | 2 | Registry routing outcomes and fallback renderer route. |
| Deferred | 4 | Real adapter package, project JSON mutation, React Editor replacement, and broad Sinan editor/runtime ownership domains. |

## Round 3 Self-Check

- Debug: if this matrix fails review, the likely issue is an incorrect status bucket, stale path, or missing Sinan review question.
- Architecture: no matrix entry promotes LudoWeave to source of truth for Sinan project data, registry policy, command routing, runtime state, physical input, scroll state, selection state, localized text, sanitization, text measurement, accessibility review, fallback UI, or native side effects.
- Scope: this is a handoff artifact only. It adds no adapter package, no source contract change, no project JSON path, and no renderer behavior.
