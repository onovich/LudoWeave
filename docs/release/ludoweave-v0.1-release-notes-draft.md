# LudoWeave v0.1 Release Notes Draft

日期：2026-06-20
状态：Draft after Round 38；Round 39 全量验证与 Round 40 最终报告后定稿

## Summary

LudoWeave v0.1 建立了最小可信 Runtime UI 闭环：

```txt
Sinan-like ViewModel / local fixture
  -> pure LudoWeave component
  -> UiNode
  -> ResolvedUiFrame
  -> headless snapshot
  -> DOM renderer
  -> ActionRef
```

本版本刻意保持窄范围：只证明 Runtime UI 的数据边界、layout subset、renderer consumption、snapshot 和 ActionRef 交互路径，不替换 Sinan React Editor。

## Completed Scope

- pnpm workspace 和 TypeScript ESM 工程基线。
- `@ludoweave/core`：`JsonValue`、`ActionRef`、`UiNode`、diagnostics、tree normalization、layout subset、text measure、pixel snapping、`ResolvedUiFrame`。
- `@ludoweave/components`：`Pressable`、`Button`、`Prompt`、`Subtitle`、`Dialog`、focus/action-log draft。
- `@ludoweave/renderer-headless`：完整 frame snapshot serializer 和 deterministic renderer。
- `@ludoweave/renderer-dom`：full-frame mount、core layout box application、native button/dialog semantics、safe text rendering。
- `@ludoweave/testing`：shared renderer conformance fixture。
- `apps/playground`：Prompt + Subtitle standalone playground。
- `examples/sinan-runtime-ui`：Sinan-like ViewModel fixture、adapter、fallback renderer、ActionRef bridge mock、runtime loop contract。
- Playwright smoke 和 axe smoke。

## Validation Baseline

Round 39 final validation 已通过，记录见 [v0.1 Final Validation Log](ludoweave-v0.1-final-validation-log.md)：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm api-check`
- `pnpm structure-check`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm validate`

## API And Boundary Notes

- Core public API report: `packages/core/etc/ludoweave-core.api.md`。
- Core 仍禁止 React、Three、Pixi、WebGPU、Sinan 和 DOM renderer 依赖。
- Components 仍依赖 core，不依赖 renderer。
- Headless renderer 仍不依赖 DOM。
- DOM renderer 消费 `ResolvedUiFrame` 和 core layout box，不成为第二布局事实源。
- Sinan adapter 只存在于 example scope。

## Known Limitations

- 不替换 Sinan React Editor，不接管 docking、Inspector、Timeline、AssetPanel、save/undo。
- 不读取或修改 Sinan project JSON。
- 不提供 Canvas2D、Pixi 或 WebGPU renderer。
- 不提供 DevTools / Inspector。
- 不实现 grid、scroll、virtual list、rich text、nested responsive layout。
- 不实现增量 frame patch；v0.1 使用完整 frame snapshot。
- DOM renderer 是最小 full-frame renderer，主要验证 layout box、text safety 和 semantics；更复杂 DOM hierarchy、input overlay 和 renderer lifecycle 进入后续版本。
- Pause modal 仅有 Dialog/focus draft，完整产品形态进入 v0.2。
- Objective / delivery hint 不进入 v0.1。

## Recommended v0.2 Entry

- 完整 Pause modal 和 gamepad/keyboard focus behavior。
- Objective / delivery hint component set。
- Canvas2D renderer design spike。
- DOM input overlay design for non-DOM renderers。
- Theme token package。
- Action log inspector / lightweight DevTools。
- Scroll、virtual list、rich text。
