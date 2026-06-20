# ADR-0004: DOM renderer 消费 core layout，不成为第二布局事实源

日期：2026-06-20
状态：Accepted

## Context

如果 DOM renderer 让 CSS flex/grid 重新决定主布局，Headless、DOM、Canvas 和后续 GPU renderer 会出现不可解释的漂移。LudoWeave 需要 renderer conformance，因此主布局必须由 core 决定。

## Decision

DOM renderer 必须消费 `ResolvedUiFrame` 中的 core layout box。DOM 可以使用 absolute layout 或受控 style 应用 box，但不得用 CSS flex/grid 作为主布局事实源。

CSS 只用于：

- 字体渲染。
- 原生控件内部行为。
- 局部视觉样式。
- 非主布局的装饰性样式。

## Consequences

- DOM visual smoke 不能替代 headless snapshot。
- DOM renderer conformance 以 `ResolvedUiFrame` 为准。
- DOM renderer 不依赖 React。
- Canvas2D 等第二 renderer 可以复用同一 frame contract。
