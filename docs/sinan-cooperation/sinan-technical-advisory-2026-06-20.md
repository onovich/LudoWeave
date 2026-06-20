# Sinan 技术顾问建议：LudoWeave

> 日期：2026-06-20
> 角色：Sinan Engine 领头技术顾问视角
> 阅读对象：LudoWeave 项目负责人、架构负责人、后续 Sinan adapter 负责人
> 依据文档：`docs/LudoWeave_游织_完整架构与技术设计说明书_v2.0.docx`、`docs/sinan-cooperation/rfc-003-sinan-runtime-ui-viewmodel.md`

## 1. 总体判断

LudoWeave 的设计野心最大，也最需要收窄。它试图解决 game runtime UI 的表达、布局、输入、焦点、动画、语义、渲染后端和 conformance，这些确实是 Sinan 长期需要的能力。但 UI runtime 是极容易失控的领域：只要第一版试图同时做 DOM、Canvas、Pixi/WebGL、WebGPU、完整布局、可访问性、复杂文本、DevTools 和 Sinan adapter，就会在任何一个方向上都无法形成稳定产品。

建议把 LudoWeave 的第一阶段目标定义得更窄：

```txt
Headless first.
ActionRef first.
ResolvedUiFrame first.
One real renderer second.
Sinan Prompt/Subtitle POC third.
```

LudoWeave 对 Sinan 的合作价值不是替换 React Editor，而是成为 Runtime UI backend。Sinan 保留 `RuntimeUIViewModel`、Timeline/Director source-of-truth、command/save/undo；LudoWeave 消费 ViewModel，渲染 HUD/Prompt/Subtitle/Pause，并发出 ActionRef。

## 2. 架构建议

### 2.1 把 Headless Renderer 作为第一公民

LudoWeave 的核心承诺是可测试、可回放、可由 AI 安全修改。这个承诺不应该等 DOM 或 Canvas renderer 完成后才验证。

建议第一条纵切：

```txt
Model
  -> pure view function
  -> UiNode
  -> reconcile
  -> layout subset
  -> ResolvedUiFrame
  -> headless snapshot
  -> ActionRef log
```

如果 Headless 不能稳定输出 frame snapshot，多个 renderer 只会把问题放大。

### 2.2 Layout 子集必须强约束

设计文档里的布局范围已经很克制，但仍然不少。建议 v0.1 只实现：

- row / column stack。
- gap。
- align / justify。
- fixed size。
- percent size。
- min / max。
- absolute anchor。
- safe area。
- basic text measure。

Grid、virtual list、scroll、复杂 responsive、rich text、nested scroll 可以后置。游戏 UI 最先需要的是 Prompt、Subtitle、Objective、Pause Menu，这些不需要完整 CSS。

### 2.3 ResolvedUiFrame 是正确边界，但要保持可 diff

建议 `ResolvedUiFrame` 设计时优先满足：

- deterministic key order。
- stable node id。
- layout rect 可 snapshot。
- paint command 可 snapshot。
- semantics 可 snapshot。
- action target 可 snapshot。
- diagnostics 可 snapshot。

不要过早优化成复杂增量 patch。全量 frame snapshot 更利于 v0.1 的测试、AI review 和 renderer conformance。

### 2.4 ActionRef 不能退化成 callback

ActionRef 是 LudoWeave 最重要的边界之一。建议 core 中完全禁止 arbitrary callback 进入关键路径。

可接受：

```txt
{ type: "runtime.gameplay.interact" }
{ type: "ui.pause.resume" }
{ type: "dialogue.next" }
```

不建议：

```txt
onPress: () => world.openDoor(...)
onClick: () => editorStore.set(...)
```

如果为了 authoring 便利提供 callback wrapper，也必须放在非可序列化 adapter 层，不能成为 core model。

### 2.5 DOM renderer 不要形成第二布局事实源

DOM renderer 应消费 core layout box，而不是让 CSS flex/grid 再算一遍主布局。否则 DOM、Canvas、Headless 之间会产生不可解释的漂移。

建议原则：

- core 决定 box。
- DOM 使用 absolute layout 或受控 style 应用 box。
- CSS 只做字体渲染、原生控件内部行为、局部视觉样式。
- conformance 以 core frame 为准。

### 2.6 文本输入坚定使用 DOM overlay

Canvas/GPU 中自己实现 IME、selection、clipboard、mobile keyboard 是非常重的坑。设计文档中建议 DOM input overlay 是正确方向。建议把它写成硬规则：

```txt
editable text input is a Host capability, not a Canvas renderer feature.
```

## 3. 技术栈建议

### 3.1 MVP 包拆分建议

设计文档中包较多。建议 MVP 只发布或实现这些边界：

```txt
@ludoweave/core
@ludoweave/components
@ludoweave/renderer-headless
@ludoweave/testing
@ludoweave/renderer-dom
```

`renderer-canvas2d` 可以作为第二真实 renderer，但不要和 core 同时抢第一阶段资源。`renderer-pixi`、WebGPU、React bridge、schema 包都后置。

### 3.2 Ajv / JSON Schema 不要进 core

LudoWeave 是 code-first。JSON Schema 适合 theme、action log、DevTools protocol、external manifest，但不应该成为 core runtime 依赖。

建议：

- core 公共 API 用 TypeScript 类型。
- protocol fixtures 可生成 JSON。
- schema package 可选。
- runtime 不依赖 Ajv。

### 3.3 API Extractor 可以早上，但 API freeze 不要过早

UI runtime 的 public API 很容易频繁调整。建议早期使用 API Extractor 做 API report，但 v0.x 允许快速变更。进入 v1 前再冻结：

- `UiNode`
- `ActionRef`
- `ResolvedUiFrame`
- `RendererAdapter`
- `TextMeasurer`
- `AssetResolver`
- `DiagnosticSink`

### 3.4 Pixi/WebGPU 后置是正确选择

不要把 Pixi 或 WebGPU 作为早期 core 决策。UI 框架的核心瓶颈首先是模型、布局、焦点、Action、renderer conformance，而不是 GPU backend。WebGPU 只能作为 capability-driven enhancement，不能成为 v1 基线。

## 4. 与 Sinan 的合作建议

### 4.1 Sinan 不会替换 React Editor

这是必须反复确认的边界：

- Inspector、Timeline、AssetPanel、editor command/save/undo 继续由 Sinan React editor 拥有。
- LudoWeave 只进入 Runtime UI。
- Runtime UI 也必须通过 Sinan `RuntimeUIViewModel` 和 `UIActionRef` 接入。

合作的正确姿势：

```txt
Sinan RuntimeUISystem builds RuntimeUIViewModel
  -> LudoWeave adapter maps to UiNode
  -> LudoWeave renderer displays UI
  -> UI emits ActionRef
  -> Sinan maps ActionRef to command/event/runtime state
```

### 4.2 Sinan POC 建议

第一阶段 POC 不要做完整菜单系统。建议：

1. **Headless Prompt Snapshot**
   - 输入一个 Sinan-like ViewModel。
   - 输出 `Prompt` UiNode 和 ResolvedUiFrame snapshot。
   - ActionRef 为 `runtime.gameplay.interact`。

2. **Subtitle Snapshot**
   - 输入 subtitle line。
   - 输出稳定 text layout。
   - 不持有 Timeline source-of-truth。

3. **DOM Runtime Overlay**
   - 在 standalone playground 里渲染 Prompt + Subtitle。
   - 同一组件可被 Sinan adapter 消费。

4. **Pause Modal**
   - focus trap。
   - confirm/cancel ActionRef。
   - 与 InputFlow/Sinan context 协调。

Objective、route marker、Canvas renderer 都可以后置。

### 4.3 Sinan 最关心的验收

LudoWeave adapter 进入 Sinan 主线前至少要满足：

- 不 import Sinan editor store。
- 不 import Three runtime。
- 不替换 React Editor。
- 不接管 Timeline/Director source-of-truth。
- ViewModel 可 snapshot。
- UIActionRef 可测试。
- Prompt/Subtitle 可在 standalone playground 运行。
- Sinan fallback renderer 可替代 LudoWeave。
- Playwright 能看到至少一个 runtime UI 状态。

## 5. 实现优先级

### Stage A：Core IR

- UiNode。
- key/reconcile。
- ActionRef。
- DiagnosticSink。
- Headless renderer。
- snapshot tests。

### Stage B：Layout Subset

- stack row/column。
- absolute anchor。
- text measure interface。
- safe area。
- pixel snapping policy。

### Stage C：Focus And Input Behavior

- Pressable。
- Button。
- Dialog focus scope。
- confirm/cancel。
- gamepad directional navigation 可以先只做 draft。

### Stage D：DOM Renderer

- core box 应用到 DOM。
- native button/input semantics。
- no `innerHTML`。
- axe smoke。

### Stage E：Sinan Runtime UI POC

- Prompt。
- Subtitle。
- Pause modal。
- ActionRef bridge。
- standalone + Sinan contract tests。

## 6. 最大风险

### 风险一：范围过大

LudoWeave 同时碰 UI 框架、布局引擎、renderer、a11y、input、animation、DevTools。建议所有新能力必须先回答：Prompt/Subtitle/Pause 是否需要它？如果不需要，先后置。

### 风险二：Renderer 漂移

多个 renderer 的最大问题不是画得慢，而是语义不一致。conformance suite 必须在第二个 renderer 前建立。

### 风险三：Sinan 过拟合

如果 core API 出现 Sinan timeline、Sinan command、Sinan entity，就说明边界破了。Sinan 逻辑只能存在于 adapter 或 fixtures。

### 风险四：无障碍成为补丁

如果语义树不是从 UiNode 同源生成，后续 Canvas/GPU renderer 会很难补。建议 v0.1 起就让 semantics 进入 frame snapshot。

## 7. 建议的 v0.1 Definition of Done

LudoWeave v0.1 建议满足：

- core 无 React、Three、Pixi、WebGPU、Sinan 依赖。
- UiNode -> ResolvedUiFrame 可 headless snapshot。
- ActionRef 无 arbitrary callback。
- layout subset 可稳定测试。
- Button/Dialog/Prompt/Subtitle 基础组件可用。
- DOM renderer 通过 conformance fixture。
- diagnostics 有 stable code。
- public API 有 API report。
- standalone playground 可运行。
- Sinan Prompt/Subtitle POC 可运行，但不替换 React Editor。

## 8. 给项目方的一句话建议

LudoWeave 的第一版不要证明“我能做所有 UI”，而要证明“同一份纯数据 UI 可以被 headless 测试、被 DOM 渲染、被 Sinan runtime 消费，并且所有交互都通过 ActionRef 回到宿主”。这个闭环跑通后，再扩 renderer、layout 和 DevTools 才稳。
