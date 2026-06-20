# ADR-0003: ActionRef 禁止退化为 arbitrary callback

日期：2026-06-20
状态：Accepted

## Context

Sinan RFC 和 LudoWeave 架构都要求 UI runtime 只发出 action ref，由宿主 registry 或 command routing 解释。若 core 允许任意 callback，LudoWeave 会失去可序列化、可测试、可回放和跨宿主能力。

## Decision

`@ludoweave/core` 不接受 arbitrary callback 进入关键路径。v0.1 最小 action 格式为：

```ts
export interface ActionRef {
  readonly type: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}
```

字符串 shorthand 可以作为 authoring convenience，但进入 `ResolvedUiFrame`、action target 和 action log 前必须规范化为 `ActionRef` 对象。

## Consequences

- Button、Pressable、Dialog、Prompt 等组件只发 ActionRef。
- Callback wrapper 只能存在于非可序列化 adapter 层。
- Sinan action namespace 由 Sinan registry 解释。
- Testing 可以稳定记录和断言 action log。
