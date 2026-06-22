# LudoWeave v0.4 Goal 模式执行指南

日期：2026-06-22  
状态：给执行者使用的 v0.4 开发指令文档  
总预算：16 轮会话  

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.4 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.2 已 PASS，并在 2026-06-22 验收通过。
- v0.3 已 PASS，并在 2026-06-22 验收通过。
- 当前 main 已同步 origin/main。
- v0.3 已完成 typed text overlay host bridge、Canvas2D hit-test/overlay coordination、theme resolution fixture、ActionRef inspector filtering/export、future tracks planning 和 Sinan host integration readiness docs。

v0.4 目标：
在 16 轮内完成 Sinan Gate Demo Contract Spike。当前 workspace 没有真实 Sinan 仓库，因此本阶段不做真实 Sinan 集成；目标是在 LudoWeave 仓库内建立可验证的 Sinan Gate Demo 合约夹具：versioned RuntimeUIViewModel envelope、host capability snapshot、UIActionRef registry mock、Gate Demo fixture、validation hook、DOM/Canvas2D/fallback 路径和 layer-specific PASS/FAIL reporter。

必须遵守：
- Runtime UI only，不替换 Sinan React Editor。
- 不读取或修改 Sinan project JSON。
- 不 import Sinan editor/runtime source。
- Host / Sinan RuntimeUISystem 仍拥有 source-of-truth。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- ActionRef 仍禁止 arbitrary callback。
- DOM 和 Canvas2D renderer 都消费 ResolvedUiFrame，不成为布局事实源。
- Canvas2D 可以 trace action target 和 overlay coordination，但不得 dispatch ActionRef、拥有 focus/input/a11y 或修改 host state。
- v0.4 不做 scroll、virtual list、rich text、Pixi/WebGPU、full DevTools 或 production Canvas2D。

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
- `docs/release/ludoweave-v0.3-final-report.md`
- `docs/release/ludoweave-v0.3-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.3-integration-status.md`
- `docs/sinan-cooperation/ludoweave-v0.3-sinan-host-integration-readiness.md`
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md`
- `docs/runtime-ui/dom-input-overlay-design.md`
- `docs/runtime-ui/canvas2d-renderer-spike.md`
- `docs/runtime-ui/pause-modal-behavior-contract.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.3 PASS 证据：

- `Validate.cmd`: PASS。
- `Smoke.cmd`: PASS。
- `pnpm validate`: PASS。
- `pnpm test:e2e`: PASS。
- `pnpm test:a11y`: PASS。
- `pnpm format`: PASS。
- `git status --short --branch`: clean, `main...origin/main`。

v0.4 选择说明：

- v0.3 final report 的推荐入口是 “run a narrow Sinan Gate Demo host integration spike using the v0.3 readiness plan”。
- 当前 workspace roots 只有 LudoWeave 和其它非 Sinan 项目，没有真实 Sinan 仓库。
- 因此 v0.4 选择最安全的窄入口：在 LudoWeave 内做 **Sinan Gate Demo Contract Spike**，用 versioned Sinan-like fixtures 和 host validation hook 验证边界，为后续真实 Sinan 集成做准备。

## 2. 本阶段要完成什么

v0.4 要完成：

- Versioned `RuntimeUIViewModel` envelope fixture，包含 version、frameId、surface、capabilities、fallbackPolicy 和 unknown-field diagnostics。
- Host capability snapshot fixture，覆盖 DOM、Canvas2D、fallback renderer、text input overlay、action registry、validation hook、safe area、viewport、DPR、text measurement source。
- UIActionRef registry mock，覆盖 accepted、rejected、stale、unavailable、disabled、unknown 和 no-op routing results。
- Gate Demo fixture，覆盖 Prompt、Subtitle、Objective、Pause 和 one editable overlay candidate。
- Adapter mapping：versioned envelope -> LudoWeave components -> `UiNode` -> `ResolvedUiFrame`。
- Validation hook：能够按 mapping、renderer、host capability、action registry、overlay coordination 层报告 PASS/FAIL。
- DOM runtime UI smoke path，用 Gate Demo fixture 渲染 Prompt/Subtitle/Objective/Pause。
- Canvas2D trace path，验证 action target hit-test 和 editable overlay coordination，不 dispatch。
- Fallback renderer path，验证 Sinan-owned fallback policy 可替代 LudoWeave renderer。
- ActionRef inspector export review，生成可给 Sinan 审查的 JSON action log。
- Docs：v0.4 integration status、Sinan contract spike notes、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.4 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不接管 Director、Timeline、Event、command、save、undo。
- 不做真实 Gate Demo 产品集成。
- 不实现 Pixi/WebGPU renderer。
- 不实现 production Canvas2D renderer。
- 不实现 full DevTools。
- 不实现 scroll、virtual list、rich text、nested responsive layout。
- 不实现完整 text editor、IME、selection 或 clipboard。
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
- 如果失败，能否定位到 tooling、runtime、layout、renderer、host bridge、adapter、registry、validation hook、browser 或 UI 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 Sinan-like contract，是否覆盖 unsupported version、unknown field、missing capability、unknown ActionRef、stale frame 和 fallback route？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否都消费 core layout box？
- Canvas2D 是否没有拥有 focus、input、a11y 或 ActionRef dispatch？
- Sinan-like adapter 是否仍在 example/fixture scope，不进入 core？
- Host bridge contract 是否没有把 DOM node、Canvas context、native event、React component 或 closure 泄漏进 core model？
- 本轮是否避免把 v0.5/v1 范围拉入 v0.4？
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

### Round 1: v0.4 Contract Baseline

目标：

- 建立 v0.4 integration status 文档。
- 明确本阶段是 Sinan Gate Demo Contract Spike，不是真实 Sinan integration。
- 定义 package/example/docs 放置位置。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Versioned RuntimeUIViewModel Envelope

目标：

- 定义 versioned envelope fixture。
- 支持 version、frameId、surface、capabilities、fallbackPolicy。
- 增加 unsupported version、unknown field 和 missing required field diagnostics。

验证：

- Sinan example tests。
- `pnpm typecheck`
- `pnpm test`

### Round 3: Host Capability Snapshot

目标：

- 定义 host capability snapshot fixture。
- 覆盖 DOM、Canvas2D、fallback renderer、text input overlay、action registry、validation hook、safe area、viewport、DPR、text measurement source。
- 将 capability status 与 overlay bridge diagnostics 对齐。

验证：

- capability fixture tests。
- `pnpm validate`

### Round 4: UIActionRef Registry Mock

目标：

- 实现 Sinan-like ActionRef registry mock。
- 支持 accepted、rejected、stale、unavailable、disabled、unknown、no-op routing results。
- 输出 deterministic audit log。

验证：

- registry mock tests。
- ActionRef inspector export tests。
- boundary check。

### Round 5: Gate Demo Fixture

目标：

- 建立 Gate Demo fixture，包含 Prompt、Subtitle、Objective、Pause 和 one editable overlay candidate。
- 不读取真实 Sinan data。
- 覆盖 missing capability fallback path。

验证：

- Gate Demo fixture tests。
- headless snapshot tests。

### Round 6: Adapter Mapping To ResolvedUiFrame

目标：

- Versioned envelope -> component props -> `UiNode` -> `ResolvedUiFrame`。
- Mapping diagnostics 能区分 version、schema、capability 和 unsupported element。

验证：

- adapter contract tests。
- `pnpm api-check`
- `pnpm validate`

### Round 7: Validation Hook And Layer Reporter

目标：

- 实现 validation hook。
- 按 mapping、renderer、host capability、action registry、overlay coordination 层报告 PASS/FAIL。
- 输出 machine-readable result。

验证：

- validation hook tests。
- failure localization tests。

### Round 8: DOM Gate Demo Smoke

目标：

- 增加 DOM Gate Demo smoke path。
- Playground 或 example route 能展示 Gate Demo runtime UI states。
- 保持 a11y 无阻断问题。

验证：

- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 9: Canvas2D Gate Demo Trace

目标：

- 用 Gate Demo fixture 验证 Canvas2D action target hit-test trace。
- 验证 editable overlay coordination trace。
- Canvas2D 不 dispatch ActionRef。

验证：

- Canvas2D trace tests。
- renderer conformance subset。
- `pnpm validate`

### Round 10: Fallback Renderer Policy

目标：

- 实现或扩展 fallback renderer fixture。
- 验证 Sinan-owned fallback policy 可在 missing capability / unsupported renderer 时替代 LudoWeave renderer。

验证：

- fallback fixture tests。
- validation hook failure/pass tests。

### Round 11: ActionRef Audit Export For Sinan Review

目标：

- 生成可给 Sinan 审查的 ActionRef audit export。
- 包含 action type、payload、routing result、frameId、source node、diagnostics。
- 保持 JSON-only。

验证：

- export tests。
- inspector tests。
- no non-serializable object tests。

### Round 12: v0.4 Integration Pass

目标：

- 整合 envelope、capabilities、registry、Gate Demo fixture、DOM/Canvas/fallback paths、validation hook。
- 更新 docs index、integration status、release notes draft。

验证：

- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`

### Round 13: Buffer 1 - Tooling/API Fixes

目标：

- 修复 API report、workspace scripts、wrapper、format 或 package exports 问题。

验证：

- `Validate.cmd`
- `pnpm api-check`
- `pnpm format`

### Round 14: Buffer 2 - Contract/Runtime Fixes

目标：

- 修复 envelope、capability、registry、adapter、validation hook、DOM/Canvas/fallback drift。

验证：

- targeted tests。
- `pnpm validate`
- `Smoke.cmd`

### Round 15: Buffer 3 - Docs/Sinan Review Fixes

目标：

- 修复 Sinan contract spike docs、integration notes、release notes、handoff docs。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 16: Final Validation And Handoff

目标：

- 全量验证 v0.4 PASS。
- 输出 final report、validation log、recommended v0.5 entry。
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
| Smoke wrapper | `Smoke.cmd` | Round 8 |
| Lint | `pnpm lint` | Round 1 |
| TypeScript | `pnpm typecheck` | Round 1 |
| Unit / contract tests | `pnpm test` | Round 1 |
| Package build | `pnpm build` | Round 1 |
| API report | `pnpm api-check` | Round 6 |
| Boundary check | `pnpm structure-check` | Round 1 |
| Aggregated validation | `pnpm validate` | Round 1 |
| E2E smoke | `pnpm test:e2e` | Round 8 |
| A11y smoke | `pnpm test:a11y` | Round 8 |
| Formatting | `pnpm format` | Every docs/UI round |
| Docs whitespace | `git diff --check` | Every docs round |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.4 PASS 需要全部满足：

- v0.1、v0.2 和 v0.3 PASS 标准没有回退。
- Versioned RuntimeUIViewModel envelope fixture 覆盖 supported、unsupported、unknown field、missing required field states。
- Host capability snapshot 覆盖 renderer、overlay、registry、viewport、safe area、DPR、text measurement 和 validation hook。
- UIActionRef registry mock 覆盖 accepted、rejected、stale、unavailable、disabled、unknown、no-op routing results。
- Gate Demo fixture 覆盖 Prompt、Subtitle、Objective、Pause 和 editable overlay candidate。
- Adapter 能从 versioned envelope 生成 `UiNode` 和 `ResolvedUiFrame`，并报告 deterministic diagnostics。
- Validation hook 能按 mapping、renderer、host capability、action registry、overlay coordination 层报告 PASS/FAIL。
- DOM smoke 展示 Gate Demo runtime UI states，并通过 a11y。
- Canvas2D trace 验证 action hit-test 和 overlay coordination，但不 dispatch ActionRef。
- Fallback renderer policy 可验证。
- ActionRef audit export JSON-only，可用于 Sinan review。
- 没有真实 Sinan import、project JSON mutation 或 React Editor replacement。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.4 Final Report

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
- No real Sinan import:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D dispatch isolation:
- Fallback policy:
- Validation hook layer isolation:

## Known Limitations

- ...

## Recommended v0.5 Entry

- ...
```

