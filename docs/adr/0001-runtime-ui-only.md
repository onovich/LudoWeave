# ADR-0001: v0.1 只进入 Runtime UI，不替换 Sinan Editor

日期：2026-06-20
状态：Accepted

## Context

Sinan RFC-003 明确把 UI 分为 Editor UI 和 Runtime UI。Editor UI 继续由 React editor shell、panels、Inspector、Timeline、AssetPanel、command/save/undo 拥有。Runtime UI 通过 `RuntimeUIViewModel`、`UIActionRef` 和 renderer adapter 接入外部 runtime。

LudoWeave 原架构也要求 core 与具体宿主解耦，但早期表述容易被理解为可能进入 Sinan editor replacement。

## Decision

LudoWeave v0.1 只进入 Runtime UI：

- Prompt
- Subtitle
- Pause modal draft
- 后续 Objective / gameplay overlays

LudoWeave v0.1 不替换 Sinan React Editor，不重写 docking、Inspector、Timeline、AssetPanel，不接管 editor command/save/undo。

## Consequences

- Sinan adapter 只消费 `RuntimeUIViewModel`。
- LudoWeave 不 import Sinan editor store。
- LudoWeave 不 import Three runtime。
- POC 验收集中在 runtime UI snapshot、ActionRef、DOM overlay 和 Gate Demo smoke。
- 任何 Editor UI 需求都必须后置或进入独立 RFC。
