# LudoWeave v0.3 Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 v0.3 开发指令文档
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.3 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.2 已 PASS，并在 2026-06-22 验收通过。
- 当前 main 已同步 origin/main。
- v0.2 已完成真实 ops wrapper、Pause/focus 行为、Objective、theme token metadata、ActionRef inspector lite、Canvas2D renderer spike 和 DOM input overlay design。

v0.3 目标：
在 16 轮内把 v0.2 的设计边界推进到可验证的 host bridge 和 renderer coordination：将 DOM input overlay design 变成 typed host bridge draft，扩展 Canvas2D hit-test / overlay coordination conformance，加入具体 theme resolution fixture，硬化 ActionRef inspector 的 filtering/export workflow，并为 scroll、virtual list、rich text、真实 Sinan host spike 做 bounded planning，而不把这些长期能力直接纳入本阶段实现。

必须遵守：
- Runtime UI only，不替换 Sinan React Editor。
- Host / Sinan RuntimeUISystem 仍拥有 source-of-truth。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- ActionRef 仍禁止 arbitrary callback。
- DOM 和 Canvas2D renderer 都消费 ResolvedUiFrame，不成为布局事实源。
- Editable text input 是 host bridge capability，不是 Canvas2D renderer feature。
- v0.3 不做真实 Sinan host integration，只做 readiness plan 和 contract hardening。
- v0.3 不做 Pixi/WebGPU、完整 DevTools、完整 scroll/virtual list/rich text。

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
- `docs/release/ludoweave-v0.2-final-report.md`
- `docs/release/ludoweave-v0.2-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.2-integration-status.md`
- `docs/runtime-ui/dom-input-overlay-design.md`
- `docs/runtime-ui/canvas2d-renderer-spike.md`
- `docs/runtime-ui/pause-modal-behavior-contract.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`
- `docs/sinan-cooperation/ludoweave-response-and-rd-plan-2026-06-20.md`

v0.2 PASS 证据：

- `Validate.cmd`: PASS，且不再是 no-op。
- `Smoke.cmd`: PASS。
- `pnpm validate`: PASS。
- `pnpm test:e2e`: PASS。
- `pnpm test:a11y`: PASS。
- `pnpm format`: PASS。
- `git status --short --branch`: clean, `main...origin/main`。

下一阶段候选来自 v0.2 final report 的 Recommended v0.3 Entry：

- Turn DOM input overlay design into a typed host bridge draft.
- Expand Canvas2D conformance with explicit hit-test and overlay coordination tests.
- Add concrete theme resolution in a renderer or playground fixture.
- Harden ActionRef inspector filtering and export workflows without becoming full DevTools.
- Explore scroll, virtual list, rich text, and richer gamepad navigation as separate bounded tracks.
- Plan a real Sinan host integration spike only after the host bridge boundaries are accepted.

## 2. 本阶段要完成什么

v0.3 要完成：

- Typed host bridge draft for editable text overlays，包含 request、snapshot、lifecycle reason、capability status 和 diagnostic paths。
- Canvas2D hit-test / overlay coordination conformance，证明 Canvas2D 仍只消费 frame，不拥有 focus/input/a11y/dispatch。
- Canvas2D renderer 支持可测试的 action target trace 或 hit-test trace，但不直接 dispatch ActionRef。
- Concrete theme resolution fixture，用于 playground 或 renderer-level test，验证 theme token metadata 可以解析成稳定 visual hints。
- ActionRef inspector filtering/export workflow，支持筛选 action type、导出 JSON、清空历史，并保持 lightweight。
- Playground v0.3 UI state，展示 theme resolution、inspector filtering/export、overlay bridge demo state。
- Bounded planning docs for scroll、virtual list、rich text、richer gamepad navigation，作为 v0.4+ tracks，不进入 v0.3 runtime implementation。
- Sinan host integration readiness plan，明确需要 Sinan 提供的 host bridge、input overlay、action registry 和 validation hooks。
- 更新 release notes、integration status、final validation log 和 final report。

## 3. 本阶段不做什么

v0.3 不做：

- 不替换 Sinan React Editor。
- 不读取或修改 Sinan project JSON。
- 不接管 Director/Timeline/Event source-of-truth。
- 不做真实 Sinan host integration。
- 不实现 Pixi/WebGPU renderer。
- 不实现完整 DevTools / Inspector。
- 不实现 production Canvas2D renderer。
- 不实现完整 text editor、IME、selection 或 clipboard。
- 不实现 scroll、virtual list、rich text、nested responsive layout。
- 不引入 React bridge。
- 不把 Ajv/schema runtime 作为 core runtime 依赖。
- 不改变 `ResolvedUiFrame` 的完整 snapshot 边界。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：

- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、runtime、layout、renderer、host bridge、adapter、browser 或 UI 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 overlay 或 Canvas2D，是否覆盖 missing host capability、stale node、removed node、disabled input 和 unsupported renderer states？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否都消费 core layout box？
- Canvas2D 是否没有拥有 focus、input、a11y 或 ActionRef dispatch？
- Host bridge contract 是否没有把 DOM node、Canvas context 或 platform object 泄漏进 core model？
- 本轮是否避免把 v0.4/v1 范围拉入 v0.3？
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

### Round 1: v0.3 Contract Baseline

目标：

- 建立 v0.3 integration status 文档。
- 明确 host bridge、Canvas2D coordination、theme resolution、ActionRef inspector 的本阶段边界。
- 如需新增 ADR，只记录边界，不改变 v0.1/v0.2 的 accepted ADR。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Typed Text Overlay Host Bridge

目标：

- 将 `docs/runtime-ui/dom-input-overlay-design.md` 的 request shape 转成 typed host bridge draft。
- 定义 overlay request、selection、input mode、commit/cancel ActionRef、lifecycle reason、capability status。
- 保持类型 JSON-serializable，不包含 DOM node 或 platform object。

验证：

- `pnpm typecheck`
- `pnpm test`
- `pnpm api-check`

### Round 3: Overlay Bridge Fixtures

目标：

- 增加 overlay open/update/close/focus/snapshot fixture。
- 覆盖 missing capability、stale node、removed node、disabled editable state。
- 将 diagnostics 与 host capability boundary 串起来。

验证：

- overlay fixture tests。
- `pnpm validate`

### Round 4: Canvas2D Hit-Test Trace

目标：

- 为 Canvas2D spike 增加基于 `ResolvedUiFrame.actions` 的 hit-test trace。
- 只记录 target，不 dispatch ActionRef。
- 覆盖 disabled、overlap、outside viewport、no target。

验证：

- `pnpm --filter @ludoweave/renderer-canvas2d test`
- renderer conformance subset。
- boundary check。

### Round 5: Canvas2D Overlay Coordination Tests

目标：

- 增加 Canvas2D 与 host overlay coordination fixture。
- 验证 editable target 的 box、semantic label、theme token、commit/cancel ActionRef 能交给 host bridge。
- Canvas2D 不拥有 input lifecycle。

验证：

- Canvas2D coordination tests。
- overlay bridge tests。
- `pnpm validate`

### Round 6: Concrete Theme Resolution Fixture

目标：

- 实现 renderer 或 playground 级 theme resolution fixture。
- 将 theme token metadata 解析为稳定 visual hints。
- 不把 schema runtime 或 Ajv 加入 core runtime。

验证：

- theme resolution tests。
- `pnpm api-check`
- `pnpm validate`

### Round 7: Theme Resolution In Playground

目标：

- Playground 展示至少两组 theme states。
- 验证 Prompt、Subtitle、Dialog、Objective 的 theme resolution 不破坏 a11y。

验证：

- `pnpm --filter @ludoweave/playground build`
- `pnpm test:e2e`
- `pnpm test:a11y`

### Round 8: ActionRef Inspector Filtering

目标：

- ActionRef inspector 支持按 action type 或 namespace filtering。
- 增加 empty、no match、multiple namespace、stale history cases。

验证：

- inspector unit tests。
- playground smoke。
- `pnpm validate`

### Round 9: ActionRef Inspector Export

目标：

- ActionRef inspector 支持 JSON export 和 clear history workflow。
- 导出内容保持 serializable，不包含 DOM/event/native objects。
- 不扩展为完整 DevTools。

验证：

- inspector export tests。
- E2E smoke。
- a11y smoke。

### Round 10: Bounded Future Tracks

目标：

- 输出 scroll、virtual list、rich text、richer gamepad navigation 的 bounded planning docs。
- 每个 track 必须列出 source-of-truth、non-goals、required fixtures 和 v0.4 entry criteria。
- 不实现这些 runtime features。

验证：

- `git diff --check`
- `pnpm format`

### Round 11: Sinan Host Integration Readiness

目标：

- 输出真实 Sinan host integration readiness plan。
- 明确 Sinan 需提供：RuntimeUIViewModel versioning、ActionRef registry contract、host bridge capability、overlay support、Gate Demo validation hook。
- 不 import Sinan，不做真实集成。

验证：

- docs check。
- boundary check。

### Round 12: v0.3 Integration Pass

目标：

- 整合 host bridge、Canvas2D coordination、theme resolution、inspector filtering/export 和 docs。
- 更新 docs index、release notes draft、integration status。

验证：

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`

### Round 13: Buffer 1 - Tooling/API Fixes

目标：

- 修复 API report、package exports、workspace scripts、wrapper 或 format 问题。

验证：

- `Validate.cmd`
- `pnpm api-check`
- `pnpm format`

### Round 14: Buffer 2 - Runtime/Renderer Fixes

目标：

- 修复 overlay、theme、Canvas2D hit-test/coordination、DOM/playground drift。

验证：

- targeted tests。
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`

### Round 15: Buffer 3 - Docs/Sinan Readiness Fixes

目标：

- 修复 readiness plan、future tracks、release notes、handoff docs。

验证：

- `git diff --check`
- `pnpm format`
- `Smoke.cmd`

### Round 16: Final Validation And Handoff

目标：

- 全量验证 v0.3 PASS。
- 输出 final report、validation log、recommended v0.4 entry。
- 确认所有内容已提交并推送。

验证：

- `Validate.cmd`
- `Smoke.cmd`
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
| Real wrapper validation | `Validate.cmd` | Round 1 |
| Smoke wrapper | `Smoke.cmd` | Round 7 |
| Lint | `pnpm lint` | Round 1 |
| TypeScript | `pnpm typecheck` | Round 1 |
| Unit / contract tests | `pnpm test` | Round 1 |
| Package build | `pnpm build` | Round 1 |
| API report | `pnpm api-check` | Round 2 |
| Boundary check | `pnpm structure-check` | Round 1 |
| Aggregated validation | `pnpm validate` | Round 1 |
| E2E smoke | `pnpm test:e2e` | Round 7 |
| A11y smoke | `pnpm test:a11y` | Round 7 |
| Formatting | `pnpm format` | Every docs/UI round |
| Docs whitespace | `git diff --check` | Every docs round |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.3 PASS 需要全部满足：

- v0.1 和 v0.2 PASS 标准没有回退。
- Typed host bridge draft 覆盖 editable text overlay request、snapshot、lifecycle 和 missing capability states。
- Host bridge 类型不包含 DOM node、Canvas context、native event 或不可序列化对象。
- Canvas2D hit-test trace 可验证 action target，但不 dispatch ActionRef。
- Canvas2D overlay coordination fixture 能把 resolved box、semantic label、theme token、commit/cancel ActionRef 交给 host bridge。
- Concrete theme resolution fixture 可用于 playground 或 renderer-level tests。
- ActionRef inspector 支持 filtering、JSON export、clear history，并保持 lightweight。
- Playground 展示 v0.3 runtime UI state，并通过 E2E/a11y smoke。
- Scroll、virtual list、rich text、richer gamepad navigation 有 bounded planning docs，但没有偷偷进入 runtime scope。
- Real Sinan host integration readiness plan 已完成，但没有真实导入或修改 Sinan。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.3 Final Report

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
| Smoke.cmd | PASS/FAIL | |
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
- Host bridge serializability:
- Canvas2D dispatch isolation:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.4 Entry

- ...
```
