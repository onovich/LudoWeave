# Pause Modal Behavior Contract

日期：2026-06-21
状态：v0.2 Round 2 contract

## Scope

Pause modal behavior is Runtime UI metadata. LudoWeave components describe focus, actions, and input shielding intent; the host remains the source of truth for game state, input policy, and command dispatch.

## Contract

- `Dialog` emits serializable focus metadata: `focusScopeId`, `containFocus`, `restoreFocus`, `initialFocusKey`, and optional `restoreFocusKey`.
- Confirm and cancel controls emit `ActionRef` values. Default actions remain `runtime.ui.confirm` and `runtime.ui.cancel`; callers may override them with host-owned action namespaces.
- Modal input shielding is metadata, not host input ownership. `inputShieldEnabled`, `inputShieldBlockedScopes`, and `inputShieldHandoff: "host"` tell the host which input scopes should be shielded while the modal is active.
- The default shield blocks the `gameplay` scope.

## Non-Goals

- LudoWeave does not read keyboard/gamepad state directly in this contract.
- LudoWeave does not mutate Sinan Director, Timeline, Event, or RuntimeUISystem state.
- This contract does not implement full InputFlow integration.
