# LudoWeave v0.1 技术设计与架构设计

日期：2026-06-20
状态：v0.1 研发基线
依据：LudoWeave v2.0 架构说明、Sinan RFC-003、Sinan 技术顾问建议、Sinan 商务合作函

## 1. 项目定位

LudoWeave 是 TypeScript-first、code-first、engine-agnostic 的声明式游戏 Runtime UI。它不是 Web 页面组件库，也不是某个游戏引擎的节点封装。v0.1 的目标不是证明 LudoWeave 能做所有 UI，而是证明同一份纯数据 UI 可以：

- 被 headless runtime 稳定测试。
- 被 DOM renderer 渲染。
- 被 Sinan Runtime UI POC 消费。
- 所有交互都通过 ActionRef 回到宿主。

v0.1 技术主线：

```txt
Headless first.
ActionRef first.
ResolvedUiFrame first.
One real renderer second.
Sinan Prompt/Subtitle POC third.
```

## 2. 系统边界

### 2.1 LudoWeave 拥有

- UI 表达模型：`UiNode`。
- 组件纯函数与基础 runtime UI primitives。
- Reconcile、瞬态状态、行为分发和 action target。
- v0.1 layout subset。
- `ResolvedUiFrame`。
- Headless renderer。
- DOM renderer。
- Renderer conformance fixture。
- Snapshot、action log、diagnostics 和测试工具。

### 2.2 宿主拥有

- 业务状态、游戏世界、Director、Timeline、Event、command、save、undo。
- Runtime UI source-of-truth。
- Action registry 和 action routing。
- Asset catalog、input policy、viewport、safe area、font metrics 等 host capabilities。

### 2.3 Sinan 合作边界

Sinan 当前对外定位为 Sinan Engine。原 Scene Director 是 Sinan Engine 内部的一等 Director System，而不是合作方整体名称。

Sinan 保留：

- RuntimeUIViewModel 定义。
- Director/Timeline/Event 到 Runtime UI 的事实路径。
- UIActionRef registry。
- Editor command/save/undo。
- React editor shell。

LudoWeave 不做：

- 不替换 Sinan React Editor。
- 不读取或修改 Sinan project JSON。
- 不接管 Timeline/Director source-of-truth。
- 不 import Sinan editor store。
- 不 import Three runtime。
- 不让 Sinan 类型进入 core API。

## 3. 架构分层

```txt
Host Model / RuntimeUIViewModel
  owns source-of-truth, update, command, save, undo
  |
  v
Pure View Functions
  map model to UiNode
  |
  v
Core Runtime
  reconcile, transient state, behavior, focus, style resolve
  |
  v
Layout And Resolve
  layout nodes, paint list, semantic tree, diagnostics
  |
  v
ResolvedUiFrame
  stable renderer boundary and snapshot surface
  |
  v
Renderer Adapters
  headless, DOM, later Canvas2D/Pixi/WebGPU
```

v0.1 只承诺 Headless 和 DOM。Canvas2D 是第二真实 renderer 的准备项，不进入 v0.1 hard scope。

## 4. 核心数据流

### 4.1 渲染数据流

```txt
Host ViewModel
  -> view(model)
  -> UiNode
  -> reconcile(previous tree, next tree)
  -> resolve styles and behavior
  -> layout
  -> ResolvedUiFrame
  -> renderer.render(frame)
```

### 4.2 交互数据流

```txt
Input event
  -> hit test / focus / behavior
  -> ActionRef
  -> Action log
  -> host dispatch
  -> host update
  -> next ViewModel
```

组件不直接修改宿主状态。renderer 不保存 source-of-truth。ActionRef 是唯一跨出 LudoWeave runtime 的交互结果。

## 5. v0.1 包结构

v0.1 只实现这些边界：

```txt
@ludoweave/core
@ludoweave/components
@ludoweave/renderer-headless
@ludoweave/testing
@ludoweave/renderer-dom
```

建议仓库结构：

```txt
packages/
  core/
  components/
  renderer-headless/
  renderer-dom/
  testing/
apps/
  playground/
examples/
  sinan-runtime-ui/
docs/
  adr/
  architecture/
  roadmap/
  sinan-cooperation/
tooling/
  boundary-check/
```

后置包：

- `@ludoweave/renderer-canvas2d`
- `@ludoweave/renderer-pixi`
- `@ludoweave/react`
- `@ludoweave/schema`
- WebGPU adapter
- DevTools / inspector

## 6. 核心契约草案

### 6.1 JsonValue

```ts
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };
```

### 6.2 ActionRef

```ts
export interface ActionRef {
  readonly type: string;
  readonly payload?: Readonly<Record<string, JsonValue>>;
}
```

规则：

- `type` 是稳定 action namespace，例如 `runtime.gameplay.interact`。
- `payload` 必须可序列化。
- core 不接受 arbitrary callback。
- 字符串 shorthand 只能作为 authoring convenience，进入 frame/action log 前必须规范化。

### 6.3 UiNode

```ts
export interface UiNode {
  readonly type: string;
  readonly key?: string;
  readonly props?: Readonly<Record<string, JsonValue>>;
  readonly style?: UiStyle;
  readonly action?: ActionRef;
  readonly children?: readonly UiNode[];
}
```

规则：

- `UiNode` 不包含 DOM node、Three object、React component 或任意闭包。
- `key` 用于 stable identity。
- `style` 使用 LudoWeave layout/style subset，不复制完整 CSS。

### 6.4 ResolvedUiFrame

```ts
export interface ResolvedUiFrame {
  readonly frameId: number;
  readonly viewport: ResolvedViewport;
  readonly nodes: readonly ResolvedNode[];
  readonly paint: readonly RenderCommand[];
  readonly semantics: readonly SemanticNode[];
  readonly actions: readonly ResolvedActionTarget[];
  readonly diagnostics: readonly UiDiagnostic[];
}
```

v0.1 采用完整 frame snapshot，不做增量 patch。全量 frame 更利于测试、diff、AI review 和 renderer conformance。

### 6.5 RendererAdapter

```ts
export interface RendererAdapter {
  readonly id: string;
  readonly capabilities: RendererCapabilities;
  render(frame: ResolvedUiFrame): void;
  dispose(): void;
}
```

renderer 消费 `ResolvedUiFrame`，不重算主布局，不拥有事实源。

### 6.6 HostCapabilities

```ts
export interface HostCapabilities {
  readonly viewport: ViewportProvider;
  readonly textMeasurer: TextMeasurer;
  readonly clock: Clock;
  readonly input: InputProvider;
  readonly assetResolver?: AssetResolver;
  readonly editableText?: EditableTextHost;
}
```

规则：

- 可编辑文本输入是 host capability，不是 Canvas/GPU renderer feature。
- v0.1 DOM renderer 使用浏览器原生输入能力。
- Canvas/GPU DOM overlay 后置设计。

## 7. Layout v0.1

只实现：

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

不实现：

- grid
- virtual list
- scroll / nested scroll
- complex responsive rules
- rich text
- browser CSS compatibility layer

布局验收：

- 固定 viewport、DPR、text metrics 下 snapshot 稳定。
- diagnostics code 稳定。
- DOM renderer 使用 core box，不让 CSS flex/grid 再算主布局。

## 8. Components v0.1

v0.1 组件面向 runtime UI 小切片：

- `Prompt`
- `Subtitle`
- `Button`
- `Pressable`
- `Dialog`

Pause modal 可以作为 v0.1 stretch 或 v0.2 early。Objective / delivery hint 放入 v0.2。

组件规则：

- 组件是纯函数，输入 props/theme/action，输出 `UiNode`。
- 不持有宿主业务状态。
- 不 import Sinan 类型。
- 不通过 callback 直接触发宿主行为。

## 9. Renderer v0.1

### 9.1 Headless Renderer

Headless 是第一公民。它输出：

- frame snapshot。
- action target snapshot。
- diagnostics snapshot。
- optional action log。

验收：

- Prompt fixture 可输出 deterministic frame。
- Subtitle fixture 可输出 deterministic text frame。
- Semantics 与 paint 同源。

### 9.2 DOM Renderer

DOM 是第一个真实 renderer。

规则：

- 使用 core layout box。
- 可用 absolute layout 或受控 style 应用 box。
- CSS 不作为主布局事实源。
- 不使用 `innerHTML`。
- 不依赖 React。
- 原生 button/input semantics 可用。
- 通过 axe smoke 和 Playwright smoke。

## 10. Sinan Runtime UI POC

POC 路径：

```txt
Sinan Runtime / Director / Gameplay state
  -> RuntimeUIViewModel
  -> LudoWeave adapter mapping
  -> UiNode
  -> ResolvedUiFrame
  -> Headless/DOM renderer
  -> UIActionRef
  -> Sinan registry / command routing
```

v0.1 hard scope：

- Prompt mapping。
- Subtitle mapping。
- ActionRef bridge fixture。
- standalone playground 可运行。

v0.1 stretch：

- Pause modal draft。

v0.2：

- Objective / delivery hint。
- Canvas2D renderer。
- InputFlow / Indirection integration。

## 11. 工程质量门禁

v0.1 基线应包含：

- pnpm workspace。
- TypeScript ESM-first。
- `tsc --build`。
- Vitest snapshot tests。
- API Extractor report。
- import boundary check。
- Playwright smoke。
- axe smoke。
- no arbitrary callback check。
- renderer conformance fixture。

核心依赖边界：

- `@ludoweave/core` 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer。
- `@ludoweave/components` 可依赖 core，不依赖 renderer。
- `@ludoweave/renderer-dom` 可依赖 core，不依赖 components 的宿主专用逻辑。
- `@ludoweave/testing` 可依赖 core、headless 和测试工具。
- Sinan adapter 只能存在于 adapter 包、example 或 fixture。

## 12. v0.1 Definition of Done

v0.1 完成条件：

- core 无 React、Three、Pixi、WebGPU、Sinan 依赖。
- UiNode -> ResolvedUiFrame 可 headless snapshot。
- ActionRef 无 arbitrary callback。
- layout subset 可稳定测试。
- Prompt、Subtitle、Button、Dialog 基础组件可用。
- DOM renderer 使用 core box。
- diagnostics 有 stable code。
- public API 有 API report。
- standalone playground 可运行。
- Sinan Prompt/Subtitle POC 可运行。
- 不替换 Sinan React Editor。
- 不接管 Timeline/Director source-of-truth。
