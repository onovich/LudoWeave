# Sinan Engine 给 LudoWeave 的合作沟通函

日期：2026-06-20
发件方：Sinan Engine 商务与生态合作评估
收件方：LudoWeave 项目负责人 / 维护者
关联 RFC：`rfc-003-sinan-runtime-ui-viewmodel.md`

## 1. 来信目的

我们已将 Sinan 本地决策者批准的 `RFC-003：Sinan Runtime UI ViewModel` 放入本目录。该 RFC 定义了 Sinan 对 Runtime UI、RuntimeUIViewModel、UIActionRef、RendererAdapter 和 LudoWeave POC 的当前边界。

这封信是商务侧补充说明：Sinan 希望邀请 LudoWeave 成为 Runtime UI 方向的 first-party design partner，但第一阶段只谈 Runtime UI，不谈替换 Sinan Editor。

## 2. Sinan 当前定位升级

LudoWeave 文档中仍以 `Sinan Scene Director` 描述我们。这里同步最新定位：

Sinan 已经升级为 **Sinan Engine**，即 AI-native、data-first、Web 原生 3D 游戏引擎与编辑器。原 Scene Director 能力现在是引擎内部的一等 Director System，和 runtime、assets、input、UI、physics、editor、data toolchain 一起组成运行闭环。

这次升级对 UI 方向很关键：Sinan 不再只需要 editor panels，也需要 runtime HUD、prompt、subtitle、objective、pause menu、dialogue 和 gameplay overlays。

## 3. 我们为什么看重 LudoWeave

Sinan 当前的 UI 主要是 React editor。短期继续写 React overlay 很容易，但长期会让 Editor UI 和 Runtime UI 混在一起。

LudoWeave 的设计方向正好补上 Runtime UI 这一层：

- Headless first，便于 snapshot 和 AI 自动验证。
- DOM / Canvas / future GPU adapter，适合多后端。
- ActionRef 而不是 arbitrary callback。
- focus、gamepad navigation、accessibility、renderer conformance 都是第一等关注。
- core 不依赖 React、Three、Sinan store 或具体引擎。

## 4. 合作方式

第一阶段建议只做 Gate Demo Runtime UI 小切片：

1. Prompt
2. Subtitle
3. Objective
4. Pause menu

POC 路径：

```txt
Sinan Runtime / Director / Gameplay state
  -> RuntimeUIViewModel
  -> LudoWeave renderer
  -> UIActionRef
  -> Sinan registry / command routing
```

暂时不做：

- 替换 React Editor。
- 重写 docking、Inspector、Timeline、AssetPanel。
- 接管 Director/Timeline source-of-truth。
- 让 LudoWeave 直接修改 Sinan editor store。
- 在 POC 未通过前进入 hard dependency。

## 5. Sinan 与 LudoWeave 的职责边界

Sinan 保留：

- Runtime UI source-of-truth。
- Director/Timeline/Event 到 UI 的事实路径。
- RuntimeUIViewModel 定义。
- UIActionRef registry。
- Editor command/save/undo。
- React editor shell。

LudoWeave 可提供：

- headless renderer。
- DOM/Canvas renderer。
- focus and navigation runtime。
- UI component primitives。
- renderer conformance tests。
- standalone playground。

LudoWeave 不应直接：

- 读取或修改 Sinan project JSON。
- 接管 Timeline/Director 状态。
- 读取 Three objects。
- 把 React hooks 或 Sinan editor store 变成 core API。

## 6. 生态协同提示

Sinan 同期也在和几个 Web game infrastructure 项目对齐：

- Indirection：资源 catalog 和 asset reference。
- InputFlow：confirm/cancel、pause、modal focus、gamepad navigation 输入。
- ViewRig：camera rig / pose solver。

LudoWeave 的 Runtime UI 会自然消费 InputFlow 的 action intent，也可能通过 Indirection 解析 UI asset refs。我们希望这些项目保持独立 core，同时围绕 Sinan 的 Gate Demo 和 Showcase Mode 形成可验证生态。

## 7. 希望 LudoWeave 回复的问题

请优先评估：

1. 是否接受第一阶段只做 Runtime UI，不触碰 Sinan React Editor？
2. Prompt / Subtitle / Objective / Pause 是否适合作为 LudoWeave 的 first-party Sinan POC？
3. `RuntimeUIViewModel` 是每帧完整生成更适合，还是增量 patch 更适合 LudoWeave？
4. LudoWeave 是否能保证同一组件在 standalone playground 和 Sinan Gate Demo 中运行？
5. UIActionRef 最小格式应由 Sinan 定义，还是双方共同定义一个可移植 superset？

## 8. 商务边界

本函不是收购、合并或排他合作要约。当前阶段我们希望建立 first-party design partner 关系：

```txt
Sinan owns Runtime UI semantics.
LudoWeave owns specialized UI runtime implementation.
POCs prove value.
Validation protects boundaries.
```

如果 POC 稳定、接口连续兼容、维护责任清晰，我们再讨论官方 adapter、兼容矩阵、Sinan Engine Infrastructure Kit 或更深层合作。
