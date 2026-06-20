# ADR-0002: Headless-first 与完整 ResolvedUiFrame snapshot

日期：2026-06-20
状态：Accepted

## Context

LudoWeave 的核心承诺是可测试、可回放、可由 AI 安全修改。多个 renderer 只有在 core frame 稳定时才有意义。技术顾问建议第一阶段采用：

```txt
Headless first.
ActionRef first.
ResolvedUiFrame first.
One real renderer second.
```

## Decision

v0.1 以 Headless renderer 作为第一公民。`ResolvedUiFrame` 在 v0.1 使用完整 frame snapshot，而不是增量 patch。

完整 frame 包含：

- viewport
- resolved nodes
- paint commands
- semantic nodes
- action targets
- diagnostics

## Consequences

- Snapshot tests 成为第一验收门。
- Renderer conformance 以 frame snapshot 为准。
- 增量 patch、dirty regions 和性能优化后置。
- DOM renderer 必须消费 core frame，不能用自己的布局结果替代 frame。
