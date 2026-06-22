# LudoWeave v0.9 Sinan Review Matrix

Date: 2026-06-23

Status: Round 12 review matrix.

## Review Matrix

| Review Area | Reviewer | Evidence | Pass Criteria | Open Decision |
| --- | --- | --- | --- | --- |
| Runtime UI scope | Sinan architecture | [Handoff Overview](ludoweave-v0.9-sinan-handoff-overview.md), [ADR-0001](../adr/0001-runtime-ui-only.md) | Runtime-only handoff is acceptable; editor replacement is out of scope. | Editor entry point remains Sinan-owned. |
| Contract coverage | Sinan RuntimeUISystem | [Contract Coverage Matrix](ludoweave-v0.9-contract-coverage-matrix.md) | Each v0.4-v0.8 topic is ready, decision-needed, or deferred. | Registry and fallback route decisions. |
| Fixture review | Sinan QA | [Fixture Manifest](ludoweave-v0.9-fixture-manifest.md) | Every fixture has path, owner, source-of-truth, expected result, and command. | Which fixtures become official Sinan contract fixtures. |
| Boundary ownership | Sinan + LudoWeave maintainers | [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md) | Every stateful area has a single owner. | Project JSON, registry, fallback, localization, a11y. |
| Host capabilities | Sinan RuntimeUISystem | [Host Capability Checklist](ludoweave-v0.9-host-capability-checklist.md) | Minimum viable handoff capabilities have owners and review routes. | Real adapter route and package ownership. |
| ActionRef routing | Sinan registry owner | [ActionRef Registry Review Pack](ludoweave-v0.9-actionref-registry-review-pack.md) | Outcomes and audit payload are sufficient for review. | Namespace and stale-frame policy. |
| Fallback policy | Sinan UX/platform owner | [Fallback Policy Review Pack](ludoweave-v0.9-fallback-policy-review-pack.md) | Failure paths are visible and host-owned. | Severity, localization, fallback UI route. |
| Renderer conformance | Sinan renderer owner | [Renderer Conformance Review Pack](ludoweave-v0.9-renderer-conformance-review-pack.md) | Renderers consume `ResolvedUiFrame` and metadata sidecars only. | Future production renderer policy. |
| DOM/a11y smoke | Sinan accessibility reviewer | [DOM And A11y Smoke Review Pack](ludoweave-v0.9-dom-a11y-smoke-review-pack.md) | E2E and a11y smoke pass; no `innerHTML` rich text path. | Final host a11y review route. |
| Canvas2D trace | Sinan renderer reviewer | [Canvas2D Trace Review Pack](ludoweave-v0.9-canvas2d-trace-review-pack.md) | Trace fields are useful and non-mutating. | Whether traces feed future audit exports. |
| Gap disposition | Planner/checker + Sinan | [Gap And Decision Ledger](ludoweave-v0.9-gap-ledger.md) | Every gap has an owner, evidence, and implementation gate. | All blocked rows remain blocked until Sinan decision. |

## Review Outcome Template

| Outcome | Meaning |
| --- | --- |
| Accept v0.9 handoff | The documentation and evidence package is sufficient for Sinan review planning. |
| Accept with decisions pending | The package is acceptable, but specific `GAP-*` rows must be resolved before implementation. |
| Request repair | A document, fixture reference, validation command, or boundary statement is missing or incorrect. |
| Reject integration start | Sinan does not approve real adapter, project JSON, registry, fallback, editor, or platform ownership yet. |
