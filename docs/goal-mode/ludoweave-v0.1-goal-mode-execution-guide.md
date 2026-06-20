# LudoWeave v0.1 Goal 模式执行指南

日期：2026-06-20
状态：给执行者使用的 v0.1 大 Goal 开发指令文档
总预算：40 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.1 大 Goal。

目标：在 40 轮会话内完成 v0.1 最小可信闭环：
Sinan-like ViewModel / local fixture -> pure LudoWeave component -> UiNode -> ResolvedUiFrame -> headless snapshot -> DOM renderer -> ActionRef。

必须遵守：
- v0.1 只进入 Runtime UI，不替换 Sinan React Editor。
- Headless-first，ActionRef-first，ResolvedUiFrame-first。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan 或 DOM renderer。
- ActionRef 禁止 arbitrary callback。
- DOM renderer 消费 core layout box，不用 CSS flex/grid 作为主布局事实源。
- Canvas2D、Pixi/WebGPU、DevTools、完整 Objective、完整 Pause、复杂 layout 都不进入 v0.1 hard scope。

每轮必须：
1. 阅读本指南和相关阶段文档。
2. 完成本轮目标内最小可验证增量。
3. 执行 Debug 自检、架构自检和本轮验证命令。
4. 验证通过后提交并推送。
5. 报告 commit hash、push 结果、是否消耗缓冲轮。

如果验证失败、提交失败或推送失败，不得进入下一轮。
```

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/README.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/roadmap/ludoweave-v0.1-development-plan.md`
- `docs/sinan-cooperation/ludoweave-response-and-rd-plan-2026-06-20.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

原始材料用于查证背景：

- `docs/LudoWeave_游织_完整架构与技术设计说明书_v2.0.docx`
- `docs/sinan-cooperation/rfc-003-sinan-runtime-ui-viewmodel.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`

当前已接受基线：

- 初始 git 仓库已建立并推送到 `origin/main`。
- v0.1 架构、ADR、roadmap 已作为当前研发基线。
- 下一个候选阶段不是局部 Phase，而是整个 v0.1 大 Goal。

## 2. 本 Goal 要完成什么

v0.1 要完成：

- pnpm workspace 和 TypeScript ESM 工程基线。
- `@ludoweave/core`、`@ludoweave/components`、`@ludoweave/renderer-headless`、`@ludoweave/renderer-dom`、`@ludoweave/testing` package skeleton。
- `JsonValue`、`ActionRef`、`UiNode`、diagnostics、tree normalize。
- `ResolvedUiFrame`、`ResolvedNode`、`RenderCommand`、`SemanticNode`、`ResolvedActionTarget`。
- Headless renderer、snapshot serializer、ActionRef log fixture。
- v0.1 layout subset。
- `Pressable`、`Button`、`Prompt`、`Subtitle`、`Dialog` 基础组件。
- DOM renderer、standalone playground、Playwright smoke、axe smoke。
- Sinan-like RuntimeUIViewModel fixture、Prompt/Subtitle mapping、ActionRef bridge mock、fallback renderer fixture。
- Renderer conformance fixture。
- API report、boundary check、release notes draft。

## 3. 本 Goal 不做什么

v0.1 不做：

- 不替换 Sinan React Editor。
- 不重写 docking、Inspector、Timeline、AssetPanel。
- 不接管 Director/Timeline/Event source-of-truth。
- 不读取或修改 Sinan project JSON。
- 不让 Sinan、React、Three、Pixi、WebGPU 类型进入 core。
- 不实现 Canvas2D renderer。
- 不实现 Pixi/WebGPU renderer。
- 不实现完整 DevTools / Inspector。
- 不实现完整 Objective / delivery hint。
- 不完成复杂 Pause menu 产品形态，只允许 Pause modal draft。
- 不实现 grid、virtual list、scroll/nested scroll、rich text、复杂 responsive。
- 不做增量 frame patch，v0.1 使用完整 frame snapshot。

## 4. 架构边界

固定边界：

- Host owns source-of-truth。
- LudoWeave owns specialized UI runtime implementation。
- Runtime UI source-of-truth 留在宿主或 Sinan RuntimeUISystem。
- LudoWeave component 是纯函数，输入 props/theme/action，输出 `UiNode`。
- `ActionRef` 是跨宿主边界的唯一交互结果。
- `ResolvedUiFrame` 是 renderer 的稳定输入。
- Headless snapshot 是第一验收门。
- DOM renderer 消费 core layout box。

依赖边界：

- `@ludoweave/core` 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer。
- `@ludoweave/components` 依赖 core，不依赖 renderer。
- `@ludoweave/renderer-headless` 依赖 core，不依赖 DOM。
- `@ludoweave/renderer-dom` 依赖 core，不依赖 React。
- `@ludoweave/testing` 可依赖 core、headless 和测试工具。
- Sinan adapter 只能存在于 example、fixture 或后续 adapter 包，不得进入 core。

## 5. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

每轮结束前必须自检：

Debug 自检：

- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、parser、runtime、layout、renderer、adapter、test、CLI、browser 或 UI 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke 或 snapshot 验证？
- 如果状态或协议改动，是否覆盖 validate、import/export、mapping 或 migration 边界？

架构自检：

- source-of-truth 是否仍归宿主或 Sinan RuntimeUISystem？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM renderer 依赖？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM renderer 是否没有重新计算主布局？
- 本轮是否避免把 v0.2 范围拉进 v0.1？
- 是否留下了 unrelated files、generated outputs 或用户改动？

每轮回复必须包含：

- 本轮目标。
- 本轮完成内容。
- Debug 自检。
- 架构自检。
- 已运行验证命令与结果。
- commit hash 和 push 结果。
- 下一轮目标。
- 是否消耗缓冲轮。

## 6. 每轮通过后的提交推送工作流

优先使用项目 git workflow wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant-files>
```

如果 wrapper 不适用，使用：

```powershell
git status --short --branch
git diff --stat
git add <phase-relevant files>
git commit -m "<message>"
git push
git status --short --branch
```

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，再进入下一轮。
- 不得 stage unrelated untracked files。

## 7. 分轮安排

总计 40 轮：

- 主实现：第 1-34 轮。
- 缓冲修复：第 35-38 轮。
- 最终验证与交付：第 39-40 轮。

### Round 1: Docs Baseline And Repo Hygiene

目标：

- 确认 docs baseline 已完整进入仓库。
- 补齐 docs index、ADR index、goal guide link。
- 明确 v0.1 round budget。

验证：

- `git diff --check`
- `git status --short --branch`

提交建议：

- `docs: add v0.1 architecture and goal guide`

### Round 2: Workspace Skeleton

目标：

- 建立 pnpm workspace。
- 建立 root `package.json`、`pnpm-workspace.yaml`、`tsconfig.base.json`。
- 建立 packages/apps/examples/tooling 目录 skeleton。

验证：

- `pnpm --version`
- `pnpm install`
- `pnpm typecheck`

### Round 3: Tooling Baseline

目标：

- 配置 Vitest、ESLint/format 基线、API Extractor 初始配置。
- 配置 root scripts。
- 让空项目验证命令可运行。

验证：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm api-check`

### Round 4: Boundary Check v1

目标：

- 建立 import boundary check。
- core 禁止 React、Three、Pixi、WebGPU、Sinan、DOM renderer。
- 加入 CI/local script。

验证：

- `pnpm structure-check`
- `pnpm validate`

### Round 5: Core Public Entry

目标：

- 建立 `@ludoweave/core` package。
- 建立 public entry 和 API report。
- 实现 `JsonValue`。

验证：

- `pnpm --filter @ludoweave/core typecheck`
- `pnpm api-check`

### Round 6: ActionRef

目标：

- 实现 `ActionRef`。
- 实现 action normalize。
- 测试禁止 function payload。

验证：

- `pnpm --filter @ludoweave/core test`
- `pnpm validate`

### Round 7: UiNode

目标：

- 实现 `UiNode`、style subset placeholder、children normalize。
- 建立 serializable fixture。

验证：

- `pnpm --filter @ludoweave/core test`
- snapshot 稳定。

### Round 8: Diagnostics

目标：

- 实现 `UiDiagnostic`、`DiagnosticSink`。
- 定义 stable diagnostic code 策略。

验证：

- `pnpm --filter @ludoweave/core test`
- `pnpm api-check`

### Round 9: Tree Normalize And Identity

目标：

- 实现 stable key / path 策略。
- 实现基础 tree normalize。

验证：

- core unit tests。
- key order snapshot。

### Round 10: Resolved Frame Types

目标：

- 定义 `ResolvedUiFrame`、`ResolvedViewport`、`ResolvedNode`。
- API report 覆盖 frame types。

验证：

- `pnpm --filter @ludoweave/core typecheck`
- `pnpm api-check`

### Round 11: Paint And Semantics Types

目标：

- 定义 `RenderCommand`、`SemanticNode`。
- 定义 action target shape。

验证：

- core tests。
- API report。

### Round 12: Headless Package Skeleton

目标：

- 建立 `@ludoweave/renderer-headless`。
- 初始 render 接口消费 `ResolvedUiFrame`。

验证：

- `pnpm --filter @ludoweave/renderer-headless typecheck`
- boundary check。

### Round 13: Snapshot Serializer

目标：

- 建立 snapshot serializer。
- 输出 deterministic JSON。

验证：

- headless snapshot tests。
- repeated test stability。

### Round 14: Prompt Headless Fixture

目标：

- 建立 Prompt 最小 fixture。
- 输出 node、paint、semantics、action target。

验证：

- Prompt deterministic frame snapshot。

### Round 15: Subtitle Headless Fixture

目标：

- 建立 Subtitle fixture。
- 注入 deterministic text measure。

验证：

- Subtitle deterministic text snapshot。

### Round 16: Layout Engine Skeleton

目标：

- 建立 layout module。
- 固定 viewport、DPR、safe area 输入。

验证：

- layout unit tests。
- diagnostics tests。

### Round 17: Stack Layout

目标：

- row / column stack。
- gap。

验证：

- stack layout snapshots。

### Round 18: Align And Justify

目标：

- align / justify。
- child positioning。

验证：

- alignment snapshots。

### Round 19: Size Constraints

目标：

- fixed size。
- percent size。
- min / max。

验证：

- size fixture tests。

### Round 20: Absolute Anchor And Safe Area

目标：

- absolute anchor。
- safe area inset。

验证：

- anchored Prompt fixture。
- safe area tests。

### Round 21: Text Measure And Pixel Snapping

目标：

- text measure interface。
- pixel snapping policy。

验证：

- deterministic text layout tests。
- DPR tests。

### Round 22: Components Package Skeleton

目标：

- 建立 `@ludoweave/components`。
- 建立 pure component convention。

验证：

- components typecheck。
- boundary check。

### Round 23: Pressable And Button

目标：

- `Pressable`
- `Button`
- confirm/cancel action behavior。

验证：

- ActionRef-only tests。
- no callback tests。

### Round 24: Prompt And Subtitle Components

目标：

- `Prompt`
- `Subtitle`
- 使用 core primitives。

验证：

- headless Prompt/Subtitle snapshots。

### Round 25: Dialog And Focus Draft

目标：

- `Dialog`
- focus scope draft。
- action log helper。

验证：

- Dialog focus fixture。
- Button/Dialog action log tests。

### Round 26: DOM Renderer Skeleton

目标：

- 建立 `@ludoweave/renderer-dom`。
- mount/dispose lifecycle。
- render consumes `ResolvedUiFrame`。

验证：

- DOM package typecheck。
- boundary check。

### Round 27: DOM Box Application

目标：

- 将 core layout box 应用到 DOM。
- 不使用 CSS flex/grid 作为主布局事实源。

验证：

- DOM unit tests。
- structure check。

### Round 28: DOM Semantics And Safety

目标：

- native button semantics。
- no `innerHTML`。
- text node safe rendering。

验证：

- DOM tests。
- no innerHTML check。

### Round 29: Playground Skeleton

目标：

- 建立 `apps/playground`。
- 渲染 Prompt + Subtitle。

验证：

- `pnpm dev` 或 package-specific dev script smoke。
- build/typecheck。

### Round 30: Playwright Smoke

目标：

- 加入 Playwright smoke。
- 验证至少一个 runtime UI 状态。

验证：

- `pnpm test:e2e`

### Round 31: Axe Smoke

目标：

- 加入 axe smoke。
- 阻断级 a11y 问题为 0。

验证：

- `pnpm test:a11y` 或集成到 browser smoke。

### Round 32: Sinan Example Skeleton

目标：

- 建立 `examples/sinan-runtime-ui`。
- 定义 Sinan-like `RuntimeUIViewModel` fixture。

验证：

- example typecheck。
- no Sinan dependency in core。

### Round 33: Sinan Prompt/Subtitle Mapping

目标：

- RuntimeUIViewModel -> LudoWeave Prompt/Subtitle props。
- 同一组件用于 standalone 和 Sinan-like fixture。

验证：

- contract tests。
- snapshot tests。

### Round 34: ActionRef Bridge And Fallback Fixture

目标：

- ActionRef bridge mock。
- fallback renderer fixture。
- contract tests。

验证：

- Sinan POC contract tests。
- `pnpm validate`

### Round 35: Buffer 1 - Integration Fixes

目标：

- 修复前 34 轮暴露的 integration、typing、API report、boundary 问题。

验证：

- `pnpm validate`
- targeted failing tests。

### Round 36: Buffer 2 - Layout/Renderer Drift Fixes

目标：

- 修复 headless/DOM drift。
- 补 renderer conformance fixture。

验证：

- conformance tests。
- Playwright smoke。

### Round 37: Buffer 3 - Sinan POC Hardening

目标：

- 加固 Sinan-like adapter fixture。
- 补 fallback renderer 与 action bridge case。

验证：

- Sinan contract tests。
- boundary check。

### Round 38: Buffer 4 - Docs/API/Release Fixes

目标：

- 更新 docs、API report、release notes draft。
- 清理 TODO 和 known limitations。

验证：

- `pnpm api-check`
- `git diff --check`

### Round 39: Final Validation Pass

目标：

- 全量验证 v0.1 Definition of Done。
- 记录所有命令、结果、commit hash。

验证：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm api-check`
- `pnpm structure-check`
- `pnpm test:e2e`
- `pnpm validate`

### Round 40: Final Report And v0.1 Handoff

目标：

- 输出最终报告。
- 更新 docs index、roadmap 状态、handoff notes。
- 确认所有内容已提交并推送。

验证：

- `git status --short --branch`
- `git ls-remote origin refs/heads/main`
- `git diff --check`

提交建议：

- `docs: finalize v0.1 handoff`

## 8. 验证矩阵

| Area | Required Command | First Required |
| --- | --- | --- |
| Git hygiene | `git status --short --branch` | Every round |
| Markdown whitespace | `git diff --check` | Docs rounds |
| TypeScript | `pnpm typecheck` | Round 3 |
| Unit tests | `pnpm test` | Round 3 |
| Package build | `pnpm build` | After package skeleton |
| API report | `pnpm api-check` | Round 5 |
| Boundary check | `pnpm structure-check` | Round 4 |
| Full validation | `pnpm validate` | Round 4 |
| E2E smoke | `pnpm test:e2e` | Round 30 |
| A11y smoke | `pnpm test:a11y` or equivalent | Round 31 |
| Remote push | `git push` or wrapper | Every completed round |

如果某个命令尚未存在，本轮必须创建它或明确说明它在后续哪一轮引入。引入后不得再跳过。

## 9. PASS 标准

v0.1 PASS 需要全部满足：

- core 无 React、Three、Pixi、WebGPU、Sinan、DOM renderer 依赖。
- `UiNode -> ResolvedUiFrame` 可 headless snapshot。
- ActionRef 无 arbitrary callback。
- layout subset 可稳定测试。
- Prompt、Subtitle、Button、Dialog 基础组件可用。
- DOM renderer 使用 core box。
- diagnostics 有 stable code。
- public API 有 API report。
- standalone playground 可运行。
- Sinan Prompt/Subtitle POC 可运行。
- Sinan fallback renderer fixture 可运行。
- Playwright smoke 能看到至少一个 runtime UI 状态。
- axe smoke 无阻断级问题。
- 不替换 Sinan React Editor。
- 不接管 Timeline/Director source-of-truth。
- Round 39 全量验证通过。
- Round 40 最终报告已提交并推送。

## 10. 最终报告模板

```markdown
# LudoWeave v0.1 Final Report

## Summary

- Result: PASS / FAIL
- Final commit:
- Remote branch:
- Total rounds used:
- Buffer rounds used:

## Completed Scope

- ...

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| pnpm lint | PASS/FAIL | |
| pnpm typecheck | PASS/FAIL | |
| pnpm test | PASS/FAIL | |
| pnpm build | PASS/FAIL | |
| pnpm api-check | PASS/FAIL | |
| pnpm structure-check | PASS/FAIL | |
| pnpm test:e2e | PASS/FAIL | |
| pnpm validate | PASS/FAIL | |

## Architecture Checks

- Runtime UI only:
- Headless-first:
- ActionRef no callback:
- DOM consumes core layout:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.2 Entry

- ...
```
