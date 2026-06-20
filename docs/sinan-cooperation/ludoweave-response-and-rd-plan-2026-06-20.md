# LudoWeave 对 Sinan RFC 的判断与研发计划重排

日期：2026-06-20
状态：项目侧评估稿 / 可作为对 Sinan 的回复基础

## 1. 结论

Sinan 方 RFC、技术顾问建议和商务合作函整体合理，且对 LudoWeave 是正向约束。我们应接受第一阶段只做 Runtime UI，不触碰 Sinan React Editor；同时收窄 LudoWeave v0.1 范围，把“可测试的 runtime UI 闭环”作为第一目标，而不是证明可以一次性覆盖所有 renderer、布局、DevTools 和复杂编辑体验。

新的项目判断：

- 合作方向成立：Sinan 提供真实 runtime UI 场景，能验证 LudoWeave 是否真的 engine-agnostic。
- 边界必须更硬：Sinan owns Runtime UI semantics；LudoWeave owns UI runtime implementation。
- v0.1 必须 Headless-first：先证明 UiNode 到 ResolvedUiFrame、snapshot、ActionRef log、diagnostics 都稳定。
- DOM 是第一个真实 renderer；Canvas2D、Pixi/WebGL、WebGPU 后置。
- Sinan POC 应按 Prompt / Subtitle -> Pause -> Objective 的顺序推进，而不是一次性做完整 runtime UI 系统。

## 2. 对 Sinan 材料的合理性判断

### 2.1 RFC-003 合理

RFC 把 Editor UI 和 Runtime UI 分开是正确的。Sinan React Editor 继续拥有 docking、Inspector、Timeline、AssetPanel、command/save/undo；Runtime UI 通过 `RuntimeUIViewModel` 和 `UIActionRef` 接入外部 runtime。这与 LudoWeave 原架构中的宿主状态边界、ActionRef、adapter 分层一致。

最关键的合理点：

- `RuntimeUIViewModel` 不包含闭包、Three object、DOM node 或 React component。
- `UIActionRef` 进入 Sinan registry 或 command routing，而不是直接修改 World/Event/Director。
- Subtitle、dialogue、prompt cue 的事实源仍属于 Sinan Director/Timeline/Event。
- LudoWeave 不是 Sinan hard dependency，Sinan fallback renderer 必须存在。

### 2.2 技术顾问建议应采纳

技术建议对原 v2.0 架构做了必要收窄。原文档把 Headless、DOM、Canvas2D、components、testing、Sinan POC 都列为 MVP，这在方向上合理，但执行上容易过宽。技术顾问提出的顺序更适合当前阶段：

```txt
Headless first.
ActionRef first.
ResolvedUiFrame first.
One real renderer second.
Sinan Prompt/Subtitle POC third.
```

这应成为 v0.1 的研发主线。

### 2.3 商务函合理但需要技术拆期

商务函提出 Prompt、Subtitle、Objective、Pause menu 作为 Gate Demo Runtime UI 小切片。方向合理，但研发上不应把四者视为同一批次的硬交付。

建议拆法：

- v0.1 hard scope：Prompt、Subtitle。
- v0.1 stretch 或 v0.2 early：Pause modal。
- v0.2：Objective / delivery hint。

这样既回应 Sinan 的业务目标，也避免第一阶段被 focus、modal、gameplay input shielding、objective data model 等问题拖散。

## 3. LudoWeave 需要调整的项目基线

### 3.1 更新 Sinan 定位

文档中 `Sinan Scene Director` 应更新为 `Sinan Engine`。原 Scene Director 作为 Sinan Engine 内部的一等 Director System 被引用，而不是合作方整体名称。

调整原则：

- 对外称呼：Sinan Engine。
- 技术子系统：Director System / Timeline / Event / RuntimeUISystem。
- 合作对象：Sinan Runtime UI，不是 Sinan Editor UI。

### 3.2 v0.1 MVP 收窄

原 MVP 包边界应从“Headless + DOM + Canvas2D + Sinan POC”收窄为：

```txt
@ludoweave/core
@ludoweave/components
@ludoweave/renderer-headless
@ludoweave/testing
@ludoweave/renderer-dom
```

后置：

- `@ludoweave/renderer-canvas2d`
- `@ludoweave/renderer-pixi`
- WebGPU
- `@ludoweave/react`
- `@ludoweave/schema`
- DevTools / Inspector
- virtual list、scroll、grid、rich text、nested responsive layout

### 3.3 把 Headless 和 snapshot 设为第一验收门

v0.1 先实现这条纵切：

```txt
Model fixture
  -> pure view function
  -> UiNode
  -> reconcile
  -> layout subset
  -> ResolvedUiFrame
  -> headless snapshot
  -> ActionRef log
```

任何 renderer、adapter、component 都必须能回到这个 headless contract 验证。

### 3.4 Layout 子集冻结

v0.1 layout 只做：

- row / column stack
- gap
- align / justify
- fixed size
- percent size
- min / max
- absolute anchor
- safe area
- basic text measure
- pixel snapping policy

不做：

- grid
- virtual list
- scroll / nested scroll
- complex responsive rules
- rich text
- browser CSS 兼容层

### 3.5 ActionRef 作为硬边界

core 不允许 arbitrary callback 进入关键路径。推荐 v0.1 最小格式：

```ts
export interface ActionRef {
  readonly type: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}
```

字符串 shorthand 可作为 authoring convenience，但进入 core frame 和 action log 前必须规范化为对象。

Sinan 可以拥有 `runtime.gameplay.interact`、`runtime.pause.resume`、`dialogue.next` 等 namespace；LudoWeave 只保证序列化、记录、分发和测试。

### 3.6 DOM renderer 不能成为第二布局事实源

DOM renderer 必须消费 core 计算出的 box。CSS 只处理字体渲染、原生控件内部行为和局部视觉样式，不用 CSS flex/grid 重新决定主布局。

验收规则：

- conformance 以 `ResolvedUiFrame` 为准。
- DOM visual smoke 不能替代 frame snapshot。
- DOM renderer 不得引入 React 作为依赖。

### 3.7 文本输入使用 Host capability

可编辑文本输入不应是 Canvas/GPU renderer 的能力，而应是 Host capability：

```txt
editable text input is a Host capability, not a Canvas renderer feature.
```

v0.1 只在 DOM renderer 中保留原生输入路径；Canvas/GPU 的 DOM overlay 设计后置。

## 4. 对 Sinan 五个问题的建议回复

### Q1：是否接受第一阶段只做 Runtime UI，不触碰 Sinan React Editor？

接受。LudoWeave 第一阶段只进入 Runtime UI，不替换 React Editor，不接管 docking、Inspector、Timeline、AssetPanel、editor command/save/undo。

### Q2：Prompt / Subtitle / Objective / Pause 是否适合作为 first-party Sinan POC？

适合，但需要拆期。Prompt + Subtitle 最适合 v0.1，因为它们能验证 ViewModel、layout、text、ActionRef 和 DOM renderer。Pause modal 适合作为 focus/input 行为的下一步。Objective 适合放在 v0.2，因为它更接近 data presentation 和 gameplay state aggregation。

### Q3：RuntimeUIViewModel 每帧完整生成还是增量 patch？

v0.1 使用每帧完整 frame / full snapshot。原因是可测试、可 diff、可回放、适合 AI review，也能降低 adapter 复杂度。增量 patch 只作为后续性能优化，不进入第一版 contract。

### Q4：是否能保证同一组件在 standalone playground 和 Sinan Gate Demo 中运行？

可以，但前提是组件只依赖 LudoWeave props、theme token、ActionRef 和 Host capability，不 import Sinan 类型。Sinan adapter 负责把 `RuntimeUIViewModel` 映射成 LudoWeave component props。

### Q5：UIActionRef 最小格式由 Sinan 定义，还是双方定义可移植 superset？

建议双方共同定义一个可移植最小 superset，Sinan 拥有自己的 action namespace 和 registry 解释权。LudoWeave core 只关心 action ref 的可序列化、可记录、可测试和可转发。

## 5. 重排后的研发计划

### Phase 0：Alignment And Repo Scaffold

目标：把战略边界固化为工程约束。

交付：

- 更新架构文档中的 Sinan 命名：`Sinan Scene Director` -> `Sinan Engine`，保留 Director System 作为子系统。
- 新增 ADR：Runtime UI only，不替换 Sinan React Editor。
- 新增 ADR：ActionRef no arbitrary callback。
- 新增 ADR：Headless-first v0.1。
- 初始化 pnpm workspace、TypeScript、ESM、API Extractor、Vitest。
- 建立 import boundary check：core 不得依赖 React、Three、Pixi、WebGPU、Sinan。

验收：

- `pnpm typecheck`、`pnpm test` 可运行。
- package public entry 和 API report 初步建立。
- import boundary test 失败时能阻止合并。

### Phase 1：Core IR And Headless Frame

目标：跑通 UiNode 到 ResolvedUiFrame 的最短闭环。

交付：

- `UiNode`
- stable key / reconcile
- `ActionRef`
- `DiagnosticSink`
- `ResolvedUiFrame`
- `ResolvedNode`
- `RenderCommand`
- `SemanticNode`
- `@ludoweave/renderer-headless`
- snapshot serializer
- ActionRef log fixture

验收：

- Prompt fixture 可输出 deterministic frame snapshot。
- Subtitle fixture 可输出 deterministic text node snapshot。
- snapshot 包含 layout rect、paint command、semantic node、action target、diagnostics。
- core 无 renderer、DOM、React、Sinan 依赖。

### Phase 2：Layout Subset

目标：实现足够支撑 Prompt、Subtitle、Pause shell 的确定性布局。

交付：

- stack row / column
- gap
- align / justify
- fixed / percent size
- min / max
- absolute anchor
- safe area
- text measure interface
- pixel snapping policy

验收：

- 同一 fixture 在固定 viewport、DPR、text metrics 下 snapshot 稳定。
- layout diagnostics 有 stable code。
- 不实现 grid、scroll、virtual list、rich text。

### Phase 3：Components And Input Behavior

目标：建立基础 runtime UI 组件和 ActionRef 行为。

交付：

- `Prompt`
- `Subtitle`
- `Button`
- `Dialog`
- `Pressable`
- confirm / cancel behavior
- focus scope draft
- gamepad directional navigation draft

验收：

- Button / Pressable 只发 ActionRef。
- Dialog focus scope 在 headless fixture 中可验证。
- Prompt + Subtitle 可由同一纯函数组件生成 frame snapshot。

### Phase 4：DOM Renderer And Playground

目标：提供第一个真实 renderer，但不让 DOM 重新决定主布局。

交付：

- `@ludoweave/renderer-dom`
- absolute / controlled box application
- native button semantics
- native text input path draft
- no `innerHTML`
- standalone playground
- axe smoke
- DOM renderer conformance fixture

验收：

- Prompt + Subtitle 在 playground 中可见。
- DOM 输出与 headless frame contract 对齐。
- Playwright smoke 能看到至少一个 runtime UI 状态。
- axe smoke 无阻断级问题。

### Phase 5：Sinan Runtime UI POC

目标：用 Sinan-like ViewModel 证明 LudoWeave 可作为 Runtime UI backend。

交付：

- `RuntimeUIViewModel` fixture。
- `@ludoweave/sinan` adapter draft，或 repo 内 adapter fixture。
- Prompt mapping。
- Subtitle mapping。
- Pause modal draft。
- ActionRef bridge fixture。
- standalone + Sinan contract tests。

验收：

- LudoWeave 不 import Sinan editor store。
- LudoWeave 不 import Three runtime。
- UIActionRef 可被记录并交给 Sinan registry mock。
- Sinan fallback renderer 可用同一 ViewModel 替代 LudoWeave。
- Gate Demo smoke 至少看到 Prompt 或 Subtitle 状态。

### Phase 6：Second Renderer Preparation

目标：在加入 Canvas2D 前先锁住 conformance。

交付：

- renderer conformance suite。
- Canvas2D renderer design note。
- text input Host capability design。
- accessibility overlay design。
- dirty regions / performance budget draft。

验收：

- DOM renderer 通过 conformance suite。
- 新 renderer 接入前必须先通过 headless contract fixture。
- Canvas2D 不进入 v0.1 hard scope。

### Phase 7：v0.2 Expansion

候选能力：

- Objective / delivery hint。
- Canvas2D renderer。
- basic theme token package。
- action log inspector。
- InputFlow integration。
- Indirection asset ref integration。
- scroll / virtual list。
- richer gamepad navigation。

进入条件：

- v0.1 Prompt + Subtitle + DOM + Headless + ActionRef 闭环稳定。
- Sinan POC 边界未破。
- public API diff 可解释。

## 6. v0.1 Definition of Done

v0.1 完成标准：

- core 无 React、Three、Pixi、WebGPU、Sinan 依赖。
- UiNode -> ResolvedUiFrame 可 headless snapshot。
- ActionRef 不支持 arbitrary callback。
- layout subset 可稳定测试。
- Prompt、Subtitle、Button、Dialog 基础组件可用。
- DOM renderer 使用 core box，不以 CSS 作为主布局事实源。
- diagnostics 有 stable code。
- public API 有 API report。
- standalone playground 可运行。
- Sinan Prompt/Subtitle POC 可运行。
- 不替换 Sinan React Editor，不接管 Timeline/Director source-of-truth。

## 7. 当前最应立即执行的调整

1. 把原架构文档中的 Sinan 叙述更新为 Sinan Engine。
2. 将 MVP 路线从 “Headless + DOM + Canvas2D + Sinan POC” 改为 “Headless + DOM + Prompt/Subtitle POC”。
3. 新增 ADR 和 import boundary check，把 Runtime UI only、ActionRef、Headless-first 固化为规则。
4. 先搭 repo 与测试基础设施，再写 renderer。
5. 向 Sinan 回复：接受合作方向，但建议 v0.1 以 Prompt + Subtitle 为 hard scope，Pause / Objective 拆期进入。
