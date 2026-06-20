# LudoWeave v0.1 开发计划

日期：2026-06-20
状态：执行计划草案

## 1. 目标

v0.1 目标是跑通最小可信闭环：

```txt
Sinan-like ViewModel / local fixture
  -> pure LudoWeave component
  -> UiNode
  -> ResolvedUiFrame
  -> headless snapshot
  -> DOM renderer
  -> ActionRef
```

v0.1 不追求完整 UI 框架，不做 Canvas2D、Pixi/WebGPU、DevTools、复杂布局或完整 Sinan Editor 集成。

## 2. Milestone 0: Repo And Policy Scaffold

目标：把共识变成工程约束。

任务：

- 初始化 pnpm workspace。
- 建立 package skeleton：core、components、renderer-headless、renderer-dom、testing。
- 建立 TypeScript ESM 基线。
- 配置 Vitest。
- 配置 API Extractor。
- 配置 import boundary check。
- 写入 ADR 索引和 docs index。

验收：

- `pnpm install` 可完成。
- `pnpm typecheck` 可运行。
- `pnpm test` 可运行。
- core boundary check 能阻止 React、Three、Pixi、WebGPU、Sinan 进入 core。

## 3. Milestone 1: Core IR

目标：定义最小可运行 UI IR 和 action 边界。

任务：

- 实现 `JsonValue`。
- 实现 `ActionRef`。
- 实现 `UiNode`。
- 实现 stable node key 规则。
- 实现 `DiagnosticSink`。
- 实现基础 tree normalize。
- 建立 action target resolve 草案。

验收：

- ActionRef 不接受 function payload。
- UiNode fixture 可序列化。
- snapshot 中 key order 稳定。
- API report 覆盖 core public entry。

## 4. Milestone 2: Resolved Frame And Headless Renderer

目标：跑通第一条 headless 纵切。

任务：

- 定义 `ResolvedUiFrame`。
- 定义 `ResolvedNode`。
- 定义 `RenderCommand`。
- 定义 `SemanticNode`。
- 定义 `ResolvedActionTarget`。
- 实现 headless renderer。
- 实现 snapshot serializer。
- 新增 Prompt fixture。
- 新增 Subtitle fixture。

验收：

- Prompt fixture 生成 deterministic frame snapshot。
- Subtitle fixture 生成 deterministic text snapshot。
- snapshot 包含 layout rect、paint command、semantic node、action target、diagnostics。
- headless renderer 不依赖 DOM。

## 5. Milestone 3: Layout Subset

目标：实现 Prompt、Subtitle、Pause shell 所需布局能力。

任务：

- row / column stack。
- gap。
- align / justify。
- fixed size。
- percent size。
- min / max。
- absolute anchor。
- safe area。
- basic text measure interface。
- pixel snapping policy。

不做：

- grid。
- scroll。
- virtual list。
- rich text。
- nested responsive rules。

验收：

- 固定 viewport 下 snapshot 稳定。
- DPR 和 snapping policy 有测试。
- text measure 可注入 fixture。
- layout diagnostics 有 stable code。

## 6. Milestone 4: Components And Behaviors

目标：形成最小 runtime UI component set。

任务：

- `Pressable`
- `Button`
- `Prompt`
- `Subtitle`
- `Dialog`
- confirm / cancel behavior。
- focus scope draft。
- action log test helper。

验收：

- Button / Pressable 只发 ActionRef。
- Prompt 可发 `runtime.gameplay.interact` fixture。
- Subtitle 不持有 Timeline source-of-truth。
- Dialog focus scope 可在 headless fixture 中断言。

## 7. Milestone 5: DOM Renderer And Playground

目标：提供第一个真实 renderer。

任务：

- 实现 `@ludoweave/renderer-dom`。
- 将 core layout box 应用到 DOM。
- 原生 button semantics。
- no `innerHTML`。
- native text input path draft。
- 建立 `apps/playground`。
- Playwright smoke。
- axe smoke。

验收：

- Prompt + Subtitle 在 playground 可见。
- DOM renderer 不用 CSS flex/grid 重算主布局。
- Playwright 能看到至少一个 runtime UI 状态。
- axe smoke 无阻断级问题。

## 8. Milestone 6: Sinan Runtime UI POC

目标：证明 LudoWeave 可以消费 Sinan-like RuntimeUIViewModel。

任务：

- 建立 `examples/sinan-runtime-ui`。
- 定义 Sinan-like `RuntimeUIViewModel` fixture。
- 实现 Prompt mapping。
- 实现 Subtitle mapping。
- 实现 ActionRef bridge mock。
- 实现 fallback renderer fixture。
- 编写 contract tests。

验收：

- 同一 Prompt / Subtitle 组件可在 standalone playground 和 Sinan-like fixture 中使用。
- Adapter 不 import Sinan editor store。
- Adapter 不 import Three runtime。
- UIActionRef 可交给 registry mock。
- fallback renderer 可用同一 ViewModel 替代 LudoWeave。

## 9. Milestone 7: v0.1 Hardening

目标：把 v0.1 从 POC 变成可维护基线。

任务：

- Renderer conformance fixture。
- API report review。
- Docs update。
- Boundary check hardening。
- Snapshot fixture cleanup。
- Release notes draft。

验收：

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm api-check` 全部通过。
- v0.1 Definition of Done 全部满足。
- Canvas2D design note 已准备，但未进入 hard scope。

## 10. Backlog For v0.2

候选：

- Pause modal completion。
- Objective / delivery hint。
- Canvas2D renderer。
- DOM input overlay design for non-DOM renderers。
- InputFlow integration。
- Indirection asset ref integration。
- Theme token package。
- Action log inspector。
- Scroll / virtual list。
- Richer gamepad navigation。

进入条件：

- v0.1 Prompt + Subtitle + Headless + DOM + ActionRef 闭环稳定。
- Sinan POC 边界未破。
- Public API diff 可解释。
