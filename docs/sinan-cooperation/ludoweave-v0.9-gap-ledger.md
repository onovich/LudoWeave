# LudoWeave v0.9 Gap And Decision Ledger

Date: 2026-06-23

Status: Round 12 gap and decision ledger.

## Purpose

This ledger records the decisions still required before any real Sinan integration can begin. v0.9 provides review artifacts and validation evidence only; unresolved rows must not be implemented inside LudoWeave without Sinan-owned approval.

## Decision Ledger

| ID | Area | Status | Decision Needed | Owner | v0.9 Evidence | Implementation Gate |
| --- | --- | --- | --- | --- | --- | --- |
| GAP-001 | Real adapter package | Blocked until Sinan decision | Package name, source location, ownership, release channel, versioning, and dependency policy. | Sinan + LudoWeave maintainers | [Host Capability Checklist](ludoweave-v0.9-host-capability-checklist.md) | Do not create `@ludoweave/sinan` in v0.9. |
| GAP-002 | Project JSON | Blocked until Sinan decision | Read/write authority, schema ownership, save/undo implications, migration, and test data policy. | Sinan | [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md) | No project JSON read/write/mutation. |
| GAP-003 | Registry route | Needs Sinan decision | Accepted namespaces, permission policy, stale frame handling, disabled reason policy, no-op treatment. | Sinan RuntimeUISystem | [ActionRef Registry Review Pack](ludoweave-v0.9-actionref-registry-review-pack.md) | Real routing cannot start until Sinan confirms registry semantics. |
| GAP-004 | Fallback UI route | Needs Sinan decision | Unsupported renderer, missing capability, unavailable fallback, policy failure, and user-facing fallback behavior. | Sinan RuntimeUISystem | [Fallback Policy Review Pack](ludoweave-v0.9-fallback-policy-review-pack.md) | LudoWeave may emit diagnostics only. |
| GAP-005 | Editor entry point | Blocked until Sinan decision | Whether runtime UI review enters editor preview, runtime host, a dedicated review panel, or another route. | Sinan | [Handoff Overview](ludoweave-v0.9-sinan-handoff-overview.md) | Do not replace Sinan React Editor. |
| GAP-006 | Localization and sanitization | Needs Sinan decision | Localized content source, markup policy, sanitization status, and reviewer workflow. | Sinan content pipeline | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md) | No HTML/Markdown parsing or `innerHTML`. |
| GAP-007 | Accessibility review | Needs Sinan decision | Label, description, live region, pronunciation, review status, and native a11y side-effect policy. | Sinan a11y policy | [DOM And A11y Smoke Review Pack](ludoweave-v0.9-dom-a11y-smoke-review-pack.md) | Axe smoke does not replace host review. |
| GAP-008 | Text measurement and fonts | Needs Sinan decision | Measurement source, font selection, fallback font policy, shaping, line breaking, bidi, and hyphenation. | Sinan platform policy | [Rich Text Metadata Contract](../runtime-ui/rich-text-metadata-contract.md) | LudoWeave remains metadata-only. |
| GAP-009 | Datasource and selection | Needs Sinan decision | Collection data ownership, loading, pagination, cache invalidation, selection repair, and item identity. | Sinan RuntimeUISystem | [Contract Coverage Matrix](ludoweave-v0.9-contract-coverage-matrix.md) | No datasource loading in renderers/core. |
| GAP-010 | Production Canvas2D | Deferred | Renderer ownership, input/a11y/text/fallback policies, performance budget, and dispatch restrictions. | Sinan renderer roadmap | [Canvas2D Trace Review Pack](ludoweave-v0.9-canvas2d-trace-review-pack.md) | Trace-only in v0.9. |

## Round 12 Self-Check

- Debug: every gap has an owner, evidence link, and implementation gate.
- Architecture: unresolved decisions remain outside LudoWeave implementation scope.
- Scope: this ledger does not authorize real Sinan import, project JSON mutation, package creation, editor replacement, datasource loading, production Canvas2D, or command dispatch.
