# LudoWeave v0.3 Sinan Host Integration Readiness

Date: 2026-06-22

Status: v0.3 readiness plan. This is not a real Sinan integration and does not import, read, or modify Sinan source or project JSON.

## Purpose

v0.3 hardens the contracts needed before a real Sinan host spike. The next real integration should begin only after Sinan and LudoWeave accept the host bridge boundaries, ActionRef registry responsibilities, overlay capability expectations, and validation hooks described here.

## Accepted Boundary

LudoWeave remains a Runtime UI backend candidate, not a Sinan Editor replacement.

Sinan owns:

- RuntimeUIViewModel source-of-truth.
- Director, Timeline, Event, command, save, and undo state.
- UIActionRef registry and command routing.
- Host input policy, focus state, accessibility policy, and fallback UI.
- Gate Demo scenario data and pass/fail criteria.

LudoWeave owns:

- Serializable UI contracts and fixtures.
- `UiNode` to `ResolvedUiFrame` resolution.
- Renderer conformance surfaces.
- ActionRef logging and lightweight inspection.
- Host bridge draft data shapes for editable text overlays.

## Sinan Required Contracts

### RuntimeUIViewModel Versioning

Sinan should expose a versioned RuntimeUIViewModel envelope before integration:

- `version`: stable model contract version.
- `frameId` or equivalent monotonic update identity.
- `runtimeUiSurface`: prompt, subtitle, objective, pause, dialogue, or custom overlay category.
- `capabilities`: host-supported features such as DOM renderer, Canvas2D renderer, text input overlay, action registry, and validation hooks.
- `fallbackPolicy`: Sinan-owned fallback renderer or native UI route when LudoWeave cannot consume a feature.

Entry requirement:

- LudoWeave fixtures can map one versioned envelope to `UiNode` without importing Sinan types into core.
- Unsupported or future fields are ignored or reported as diagnostics without crashing.

### UIActionRef Registry Contract

Sinan should define how LudoWeave ActionRefs enter the host registry:

- Accepted namespace list, for example `runtime.gameplay.*`, `runtime.objective.*`, `runtime.pause.*`, and `dialogue.*`.
- Payload serializability rules.
- Unknown action policy.
- Disabled action policy.
- Audit/logging payload expected by Sinan debugging tools.
- Command routing result states: accepted, rejected, stale, unavailable, or no-op.

Entry requirement:

- A registry mock can accept LudoWeave ActionRefs and return deterministic results.
- No arbitrary callback or DOM/native event object crosses the boundary.
- The ActionRef inspector export can be reviewed by Sinan without requiring DevTools integration.

### Host Bridge Capability Contract

Sinan should expose a host capability snapshot before renderer coordination:

- Renderer capability: DOM, Canvas2D, fallback renderer, or mixed renderer mode.
- Text input overlay availability.
- Focus restoration support.
- Accessibility ownership and labeling policy.
- Safe area, viewport, DPR, and text measurement source.
- Diagnostic sink or review path.

Entry requirement:

- LudoWeave can decide whether to render, request a host overlay, or emit a missing-capability diagnostic from serializable capability data.
- Canvas2D remains trace-only for hit testing and overlay coordination.

### Editable Text Overlay Support

If Sinan wants editable text over Canvas2D or future GPU renderers, Sinan should provide host-owned overlay operations:

- Open overlay from a resolved node box, semantic label, theme token, and commit/cancel ActionRefs.
- Update overlay when `ResolvedUiFrame` layout changes.
- Focus overlay through host input policy.
- Snapshot value, selection, and composition state.
- Close overlay for commit, cancel, blur, route change, node removal, or host disposal.

Entry requirement:

- Overlay requests are JSON-serializable and contain no DOM node, Canvas context, native event, React component, or closure.
- Missing capability, stale node, removed node, and disabled editable states have deterministic diagnostics.
- Host remains responsible for IME, selection, clipboard, accessibility, virtual keyboard, and ActionRef dispatch.

### Gate Demo Validation Hook

Sinan should provide a validation hook for the first real spike:

- Deterministic RuntimeUIViewModel fixture for Prompt, Subtitle, Objective, Pause, and one editable overlay candidate.
- Expected ActionRef sequence for interaction smoke.
- Expected diagnostics for unsupported capabilities.
- Browser or host smoke entry point.
- Optional screenshot or frame snapshot review artifact.

Entry requirement:

- The hook can run without modifying Sinan editor state.
- Pass/fail criteria distinguish mapping failure, renderer failure, host capability failure, and action registry failure.

## LudoWeave Readiness Checklist

Before a real Sinan spike, LudoWeave should provide:

- Mapping fixture from Sinan-like ViewModel to Prompt, Subtitle, Objective, Pause, and editable overlay candidate.
- Host bridge type draft for text input overlays.
- Canvas2D hit-test trace and overlay coordination fixture.
- Theme resolution fixture or playground state.
- ActionRef inspector filtering, export, and clear workflow.
- Docs describing future scroll, virtual list, rich text, and gamepad navigation tracks.
- Validation matrix covering `Validate.cmd`, `Smoke.cmd`, `pnpm validate`, E2E, and a11y.

## Non-Goals For The Readiness Plan

- No real Sinan import.
- No Sinan project JSON read/write.
- No replacement of Sinan React Editor.
- No Director, Timeline, Event, command, save, or undo mutation.
- No Pixi/WebGPU renderer.
- No full DevTools protocol.
- No production editable text editor.
- No scroll, virtual list, rich text, or richer gamepad navigation implementation.

## First Spike Proposal

The first real spike should be a narrow Gate Demo runtime UI adapter:

1. Sinan emits a versioned RuntimeUIViewModel fixture.
2. A LudoWeave adapter maps Prompt, Subtitle, Objective, Pause, and one editable overlay candidate into `UiNode`.
3. LudoWeave resolves a full `ResolvedUiFrame`.
4. DOM renderer smoke verifies visible Runtime UI.
5. Canvas2D trace verifies action target and overlay coordination without dispatch.
6. Sinan registry mock records ActionRefs and returns deterministic routing results.
7. Gate Demo validation hook reports pass/fail by boundary layer.

The spike should stop at contract validation. Product integration should wait for an accepted follow-up goal guide.
