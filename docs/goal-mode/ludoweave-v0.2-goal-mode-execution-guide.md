# LudoWeave v0.2 Goal 模式执行指南

日期：2026-06-21
状态：给执行者使用的 v0.2 开发指令文档
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.2 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.1 最小闭环已完成：Sinan-like ViewModel / local fixture -> pure LudoWeave component -> UiNode -> ResolvedUiFrame -> headless snapshot -> DOM renderer -> ActionRef。
- 当前 main 已同步 origin/main。

v0.2 目标：
在 16 轮内完成 v0.2 的第一批扩展：修复 ops workflow no-op 风险，完成 Pause/focus 行为硬化，加入 Objective / delivery hint，做 Canvas2D renderer spike，设计非 DOM renderer 的 DOM input overlay，加入基础 theme token 和 ActionRef log inspector 的最小版本。

必须遵守：
- Runtime UI only，不替换 Sinan React Editor。
- Host / Sinan RuntimeUISystem 仍拥有 source-of-truth。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- ActionRef 仍禁止 arbitrary callback。
- DOM renderer 仍消费 core layout box。
- Canvas2D 只作为 v0.2 spike，不得反向污染 core contract。
- Scroll、virtual list、rich text、完整 DevTools、Pixi/WebGPU 仍不进入本阶段。

每轮必须：
1. 阅读本指南和相关阶段文档。
2. 完成本轮最小可验证增量。
3. 执行 Debug 自检、架构自检和本轮验证命令。
4. 验证通过后提交并推送。
5. 报告 commit hash、push 结果、是否消耗缓冲轮。

如果验证失败、提交失败或推送失败，不得进入下一轮。
```
## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/README.md`
- `docs/release/ludoweave-v0.1-final-report.md`
- `docs/release/ludoweave-v0.1-final-validation-log.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/roadmap/ludoweave-v0.1-development-plan.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`
- `docs/sinan-cooperation/ludoweave-response-and-rd-plan-2026-06-20.md`

v0.1 PASS 证据：

- `pnpm validate`: PASS。
- `pnpm test:e2e`: PASS。
- `pnpm test:a11y`: PASS。
- `pnpm format`: PASS。
- `git status --short --branch`: clean, `main...origin/main`。

已知流程问题：

- `.codex/project-ops-workflow.json` 已初始化，但 operation commands 仍为空。
- `Validate.cmd` 当前是 no-op；v0.2 第一轮必须把 ops wrapper 接到真实 `pnpm` 验证命令。

## 2. 本阶段要完成什么

v0.2 要完成：

- 修复 ops workflow no-op：让 Codex wrapper 能真实执行 `pnpm validate`、E2E 和 a11y smoke。
- 完成 Pause modal 行为硬化：focus trap draft、confirm/cancel、input shielding fixture。
- 加入 Objective / delivery hint component 和 Sinan-like mapping。
- 增加 Canvas2D renderer spike，验证它消费 `ResolvedUiFrame` 且不改变 core contract。
- 输出非 DOM renderer 文本输入 overlay design，并加入最小 host capability contract。
- 加入基础 theme token package 或 core-adjacent theme contract，支持 Prompt/Subtitle/Dialog/Objective 的稳定样式输入。
- 加入 ActionRef log inspector 的轻量版本，用于 playground 或 testing fixture。
- 更新 docs、release notes draft 和 v0.2 handoff。

## 3. 本阶段不做什么

v0.2 不做：

- 不替换 Sinan React Editor。
- 不读取或修改 Sinan project JSON。
- 不接管 Director/Timeline/Event source-of-truth。
- 不实现 Pixi/WebGPU renderer。
- 不实现完整 DevTools / Inspector。
- 不实现 scroll、virtual list、rich text、nested responsive layout。
- 不把 Canvas2D renderer 作为 v1 baseline。
- 不引入 React bridge。
- 不把 theme/schema/Ajv 放入 core runtime 硬依赖。
- 不做增量 frame patch，除非作为文档化设计草案，不进入 runtime contract。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：

- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、runtime、layout、renderer、adapter、browser 或 UI 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas renderer 是否都消费 core layout box？
- Canvas2D spike 是否没有把 renderer lifecycle、Canvas API 或 texture 概念泄漏进 core？
- 本轮是否避免把 v0.3/v1 范围拉入 v0.2？
- 是否留下 unrelated files、generated outputs 或用户改动？

每轮回复必须包含：

- 本轮目标。
- 本轮完成内容。
- Debug 自检。
- 架构自检。
- 已运行验证命令与结果。
- commit hash 和 push 结果。
- 下一轮目标。
- 是否消耗缓冲轮。

## 5. 每轮通过后的提交推送工作流

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

## 6. 分轮安排

总计 16 轮：

- 主实现：第 1-12 轮。
- 缓冲修复：第 13-15 轮。
- 最终验证与交付：第 16 轮。

### Round 1: Ops Workflow Real Validation

目标：

- 将 `.codex/project-ops-workflow.json` 的 no-op operations 接到真实命令。
- `Validate.cmd` 必须能运行真实验证，不再只打印 no-op。
- 明确 E2E/a11y smoke 的 wrapper 或 docs 使用方式。

验证：

- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`

### Round 2: Pause Modal Behavior Contract

目标：

- 明确 Pause modal 的 runtime 行为 contract。
- 加强 Dialog/focus draft：confirm/cancel、focus containment、restore focus metadata。
- 增加 input shielding fixture，不接管宿主 input source-of-truth。

验证：

- `pnpm --filter @ludoweave/components test`
- `pnpm test`
- `pnpm validate`

### Round 3: Keyboard/Gamepad Focus Hardening

目标：

- 扩展 focus metadata 和 navigation fixture。
- 让 keyboard/gamepad confirm/cancel 能映射到 ActionRef。
- 不引入完整 InputFlow 依赖，只保留 host capability / action intent 边界。

验证：

- components focus tests。
- action log tests。
- boundary check。

### Round 4: Objective / Delivery Hint Component

目标：

- 增加 `Objective` 或 `DeliveryHint` component。
- 支持 title、body、status、optional action。
- headless snapshot 覆盖。

验证：

- components tests。
- headless snapshot tests。
- API report。

### Round 5: Objective Sinan-like Mapping

目标：

- 扩展 `examples/sinan-runtime-ui` ViewModel fixture。
- 增加 Objective / delivery hint mapping。
- fallback renderer 支持新元素。

验证：

- Sinan example contract tests。
- runtime loop tests。
- boundary check。

### Round 6: Theme Token Contract

目标：

- 设计并实现最小 theme token contract。
- 支持 Prompt、Subtitle、Dialog、Objective。
- 不引入 Ajv 或 schema runtime 依赖到 core。

验证：

- core/components typecheck。
- theme fixture tests。
- API report。

### Round 7: Playground v0.2 UI States

目标：

- Playground 展示 Prompt、Subtitle、Pause draft、Objective。
- ActionRef log 可见或可测试。
- 保持 UI smoke 简洁稳定。

验证：

- `pnpm --filter @ludoweave/playground build`
- `pnpm test:e2e`
- `pnpm test:a11y`

### Round 8: ActionRef Log Inspector Lite

目标：

- 增加 lightweight ActionRef log inspector。
- 可在 testing fixture 或 playground 展示 action history。
- 不做完整 DevTools。

验证：

- action log tests。
- playground smoke。
- a11y smoke。

### Round 9: Canvas2D Renderer Spike Skeleton

目标：

- 建立 Canvas2D renderer spike package 或 experimental folder。
- 消费 `ResolvedUiFrame`。
- 支持 clear、rect/text paint 的最小路径。
- 不修改 core contract。

验证：

- Canvas spike tests。
- boundary check。
- renderer conformance subset。

### Round 10: Canvas2D Conformance Fixture

目标：

- 让 Canvas2D spike 跑过 renderer conformance 的可适用子集。
- 记录不支持的能力和 fallback policy。

验证：

- conformance tests。
- `pnpm validate`

### Round 11: DOM Input Overlay Design

目标：

- 输出非 DOM renderer editable text input overlay 设计文档。
- 定义 host capability 和 renderer responsibility。
- 可加入最小 type draft，但不要求完整实现。

验证：

- docs check via `git diff --check`。
- typecheck 若有 type draft。

### Round 12: v0.2 Integration Pass

目标：

- 整合 Pause、Objective、theme、inspector、Canvas spike。
- 更新 docs、roadmap、release notes draft。

验证：

- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`

### Round 13: Buffer 1 - Workflow/Tooling Fixes

目标：

- 修复 wrapper、validation、workspace、API report、format 等问题。

验证：

- `Validate.cmd`
- `pnpm validate`

### Round 14: Buffer 2 - Runtime/Renderer Fixes

目标：

- 修复 focus、layout、DOM/Canvas renderer drift、conformance 问题。

验证：

- renderer tests。
- conformance tests。
- E2E/a11y smoke。

### Round 15: Buffer 3 - Sinan/Docs/API Fixes

目标：

- 修复 Sinan mapping、fallback fixture、docs、API report。

验证：

- example contract tests。
- `pnpm api-check`
- `git diff --check`

### Round 16: Final Validation And Handoff

目标：

- 全量验证 v0.2 PASS。
- 输出 final report、validation log、recommended v0.3 entry。
- 确认所有内容已提交并推送。

验证：

- `Validate.cmd`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm structure-check`
- `pnpm api-check`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`
- `git status --short --branch`
- `git ls-remote origin refs/heads/main`

## 7. 验证矩阵

| Area | Required Command | First Required |
| --- | --- | --- |
| Git hygiene | `git status --short --branch` | Every round |
| Docs whitespace | `git diff --check` | Every docs round |
| Real wrapper validation | `Validate.cmd` | Round 1 |
| Lint | `pnpm lint` | Round 1 |
| TypeScript | `pnpm typecheck` | Round 1 |
| Unit / contract tests | `pnpm test` | Round 1 |
| Package build | `pnpm build` | Round 1 |
| API report | `pnpm api-check` | Round 4 |
| Boundary check | `pnpm structure-check` | Round 1 |
| Aggregated validation | `pnpm validate` | Round 1 |
| E2E smoke | `pnpm test:e2e` | Round 1 |
| A11y smoke | `pnpm test:a11y` | Round 1 |
| Formatting | `pnpm format` | Round 12 |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.2 PASS 需要全部满足：

- ops workflow wrapper 不再是 no-op，`Validate.cmd` 能运行真实验证。
- v0.1 PASS 标准没有回退。
- Pause modal 行为 contract 有测试覆盖。
- Keyboard/gamepad focus draft 比 v0.1 更完整，且仍通过 ActionRef 回宿主。
- Objective / delivery hint component 可 headless snapshot，并可被 Sinan-like ViewModel mapping 消费。
- Theme token contract 可用于 v0.2 组件，但不把 Ajv/schema runtime 依赖带入 core。
- ActionRef log inspector lite 可验证，不扩成完整 DevTools。
- Canvas2D renderer spike 消费 `ResolvedUiFrame`，不污染 core contract。
- DOM input overlay design 已文档化。
- Playground 展示 v0.2 runtime UI 状态，并通过 E2E/a11y smoke。
- `pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.2 Final Report

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
| Validate.cmd | PASS/FAIL | |
| pnpm lint | PASS/FAIL | |
| pnpm typecheck | PASS/FAIL | |
| pnpm test | PASS/FAIL | |
| pnpm build | PASS/FAIL | |
| pnpm api-check | PASS/FAIL | |
| pnpm structure-check | PASS/FAIL | |
| pnpm validate | PASS/FAIL | |
| pnpm test:e2e | PASS/FAIL | |
| pnpm test:a11y | PASS/FAIL | |
| pnpm format | PASS/FAIL | |

## Architecture Checks

- Runtime UI only:
- Host source-of-truth:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D spike isolation:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.3 Entry

- ...
```
