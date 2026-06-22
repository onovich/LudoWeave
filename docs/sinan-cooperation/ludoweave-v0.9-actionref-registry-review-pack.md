# LudoWeave v0.9 ActionRef Registry Review Pack

Date: 2026-06-23

Status: Round 7 ActionRef registry review pack.

Related artifacts:

- [Contract Coverage Matrix](ludoweave-v0.9-contract-coverage-matrix.md)
- [Fixture Manifest](ludoweave-v0.9-fixture-manifest.md)
- [Boundary Checklist](ludoweave-v0.9-boundary-checklist.md)

## Review Scope

This pack summarizes how LudoWeave represents host-routed UI actions for Sinan review. `ActionRef` is a serializable output record with a stable `type` and optional JSON payload. It is not a callback, command object, save transaction, undo operation, registry entry, or Sinan command implementation.

Sinan or the host owns the real registry, command routing, permission checks, stale-frame policy, disabled reason policy, save/undo implications, gameplay state mutation, and side effects.

## Contract Summary

| Surface | Path | Review Signal |
| --- | --- | --- |
| Core `ActionRef` contract | `packages/core/src/action-ref.ts` | `ActionRef` normalizes string/object input into `{ type, payload? }` and rejects non-JSON payloads. |
| Action log | `packages/core/src/action-log.ts` | UI action records are snapshot-friendly and source-labeled. |
| Example action mapping | `examples/sinan-runtime-ui/src/action-mapping.ts` | Gate Demo actions map to host-owned runtime namespaces. |
| Example registry mock | `examples/sinan-runtime-ui/src/action-registry.ts` | Registry outcomes are reviewable without Sinan source. |
| Action bridge | `examples/sinan-runtime-ui/src/action-bridge.ts` | Bridge records fallback decisions and registry outcomes. |
| Audit export | `examples/sinan-runtime-ui/src/action-audit-export.ts` | JSON-only export records frame id, source, action type, payload, routing result, and diagnostics. |

## Routing Outcomes

| Outcome | Meaning In v0.9 Fixture | Owner Of Real Policy | Diagnostic |
| --- | --- | --- | --- |
| `accepted` | The action type matches an accepted namespace and the frame is current. | Sinan registry | None expected. |
| `rejected` | The registry explicitly rejects the action type. | Sinan registry and permission policy | `LW_EXAMPLE_ACTION_REGISTRY_REJECTED` |
| `stale` | The source frame id does not match current registry state or is configured stale. | Sinan frame lifecycle policy | `LW_EXAMPLE_ACTION_REGISTRY_STALE` |
| `unavailable` | The registry is unavailable or the action type is unavailable. | Host capability and registry route | `LW_EXAMPLE_ACTION_REGISTRY_UNAVAILABLE` |
| `disabled` | The action is known but disabled by host policy. | Sinan UI/command policy | `LW_EXAMPLE_ACTION_REGISTRY_DISABLED` |
| `unknown` | The action type does not match an accepted namespace. | Sinan registry namespace policy | `LW_EXAMPLE_ACTION_REGISTRY_UNKNOWN` |
| `no-op` | The action is intentionally inert and should remain auditable. | Sinan registry and UX policy | `LW_EXAMPLE_ACTION_REGISTRY_NO_OP` |

## Audit Payload Requirements

The JSON-only audit payload should preserve:

- `version`: the audit schema version such as `ludoweave.sinan-action-audit.v0.4`.
- `sequence`: stable action ordering.
- `frameId`: frame context for stale/current review.
- `actionType`: serializable host action namespace.
- `payload`: optional JSON object only.
- `routingResult`: one of the review outcomes above.
- `source`: action target id, node id, and label when present.
- `diagnostics`: structured review diagnostics.

The payload must not include callbacks, DOM nodes, React components, command instances, project JSON handles, save/undo transactions, native events, or mutable runtime objects.

## Sinan Review Questions

| Question | Required Decision |
| --- | --- |
| Which namespaces are valid for first-party runtime UI actions? | Sinan registry namespace policy. |
| How should stale frame ids be detected in a real runtime route? | Sinan frame lifecycle policy. |
| Which routing outcomes should block user interaction versus only emit diagnostics? | Sinan UX and command policy. |
| Where should JSON audit exports be stored and reviewed? | Sinan audit retention and reviewer route. |
| Are disabled reasons localizable and host-owned? | Sinan localization and accessibility policy. |
| Should no-op actions appear in release diagnostics? | Sinan diagnostic severity policy. |

## Validation Evidence

Targeted tests:

- `examples/sinan-runtime-ui/test/action-registry.test.ts`
- `examples/sinan-runtime-ui/test/action-bridge-fallback.test.ts`
- `examples/sinan-runtime-ui/test/action-audit-export.test.ts`
- `packages/core/test/action-ref.test.ts`
- `packages/core/test/action-log.test.ts`

Required Round 7 validation:

- `cmd /c pnpm.cmd test -- examples/sinan-runtime-ui/test/action-registry.test.ts examples/sinan-runtime-ui/test/action-bridge-fallback.test.ts examples/sinan-runtime-ui/test/action-audit-export.test.ts packages/core/test/action-ref.test.ts packages/core/test/action-log.test.ts`
- `cmd /c pnpm.cmd validate`

## Round 7 Self-Check

- Debug: if validation fails, localize to ActionRef normalization, registry outcome mapping, fallback bridge behavior, or audit export shape.
- Architecture: registry policy, command execution, save/undo, gameplay state, and side effects stay Sinan-owned.
- Scope: this pack does not create a real registry adapter, dispatch commands, mutate project JSON, or add callbacks to `ActionRef`.
