# LudoWeave v0.9 Goal 模式执行指南

日期：2026-06-23  
状态：给执行者使用的 v0.9 开发指令文档  
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.9 Goal。

已接受基线：
- v0.1 到 v0.8 均已 PASS，并已推送到 origin/main。
- v0.4 到 v0.8 已形成 Sinan-like Runtime UI envelope、focus navigation、scroll metadata、virtual list metadata、rich text metadata、fallback policy、validation hook layer、renderer conformance、DOM smoke、Canvas2D trace 和 JSON-only audit export。
- 当前 main 已同步 origin/main。

v0.9 目标：在 16 轮内完成 Bounded Sinan Handoff Checklist track。当前 workspace 仍没有真实 Sinan 仓库，因此本阶段不做真实 Sinan import、不读取或修改 Sinan project JSON、不替换 Sinan React Editor。目标是把 v0.4-v0.8 的合同、fixtures、validation、audit payload 和 known gaps 整理成 Sinan 方可审阅、可签收、可决定下一步真实接入入口的 handoff package。

必须遵守：
- Host / Sinan RuntimeUISystem 仍拥有 RuntimeUIViewModel semantics、Director/Timeline/Event/gameplay state、command routing、registry、save/undo、project JSON、input/focus/scroll/selection/text state、localized content、sanitization、a11y review、text measurement、platform policy 和 fallback UI。
- LudoWeave 只输出 review artifacts、contract checklist、compatibility matrix、fixture manifest、validation evidence、risk/gap ledger、handoff decision record 和 JSON-only audit examples。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer、Canvas renderer、Ajv、schema runtime、HTML/Markdown parser 或 Sinan types。
- 不做真实 Sinan adapter package，不做 npm publish，不做 package rename，不改 public contract 为 Sinan-specific shape。
- 不实现 datasource loading、production Canvas2D、full DevTools、Pixi/WebGPU、rich text editing、HTML/Markdown import、real localization pipeline 或 broad editor integration。
- DOM/Canvas2D 仍只消费 ResolvedUiFrame 和 metadata；不得新增 renderer side effects。

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
- `Role.md`
- `docs/README.md`
- `docs/release/ludoweave-v0.8-final-report.md`
- `docs/release/ludoweave-v0.8-final-validation-log.md`
- `docs/runtime-ui/rich-text-metadata-contract.md`
- `docs/runtime-ui/virtual-list-metadata-contract.md`
- `docs/runtime-ui/scroll-metadata-contract.md`
- `docs/runtime-ui/focus-navigation-contract.md`
- `docs/sinan-cooperation/rfc-003-sinan-runtime-ui-viewmodel.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`
- `docs/sinan-cooperation/ludoweave-response-and-rd-plan-2026-06-20.md`
- `docs/sinan-cooperation/ludoweave-v0.3-sinan-host-integration-readiness.md`
- `docs/sinan-cooperation/ludoweave-v0.4-sinan-contract-spike-notes.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.8 PASS 证据：
- `Validate.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `pnpm validate`: PASS.
- `pnpm test:e2e`: PASS.
- `pnpm test:a11y`: PASS.
- `pnpm format`: PASS.
- `git diff --check`: PASS.
- `git status --short --branch`: clean, `main...origin/main`.
- Remote `main`: `227c5606fdf940e156601504bab44b681b3fcfa9`.
- Final test count: 70 test files, 261 tests passed.

v0.9 选择说明：
- v0.8 final report 推荐首选入口是 bounded real-Sinan handoff checklist。
- 当前 workspace 仍没有真实 Sinan repo，因此 v0.9 不做真实 integration，只做可审阅 handoff package。
- v0.9 的价值是降低真实接入前的沟通成本：哪些合同已准备好、哪些 fixture 可以作为验收样本、哪些边界绝不能破、哪些事项需要 Sinan 方决策。

## 2. 本阶段要完成什么

v0.9 要完成：

- Sinan handoff overview，说明 LudoWeave 当前定位、已完成合同、适合 Sinan review 的入口和非入口。
- Contract coverage matrix，把 v0.4-v0.8 的 Runtime UI envelope、ActionRef、fallback、focus、scroll、virtual list、rich text、renderer conformance、DOM smoke、Canvas2D trace、audit export 映射到 Sinan RFC 的验收点。
- Fixture manifest，列出 examples、testing fixtures、playground smoke、renderer tests、audit exports、validation hooks，以及每个 fixture 的 owner、source-of-truth、review question、expected result。
- Boundary checklist，明确 real Sinan import、project JSON mutation、React Editor replacement、Director/Timeline/Event ownership、command/save/undo ownership、input/platform ownership、localized content/sanitization/a11y ownership都不进入 LudoWeave。
- Host capability checklist，整理 Sinan 真实接入前需要暴露或确认的 RuntimeUIViewModel envelope、UIActionRef registry、fallback renderer route、viewport/safe area/DPR、focus/scroll/selection/text policy、validation hook、audit log route。
- ActionRef registry review pack，汇总已支持的 action refs、routing outcomes、diagnostics、audit payload 和 rejected/stale/unavailable/no-op policy。
- Fallback policy review pack，汇总 unsupported renderer、missing capability、missing fallback、invalid token、stale selection、removed item、host policy missing 等 fallback/diagnostic 路径。
- Renderer conformance review pack，证明 headless / DOM / Canvas2D 都消费同一 `ResolvedUiFrame` 和 metadata sidecars，不成为事实源。
- DOM and a11y smoke review pack，整理 Playground smoke 的可视检查、a11y evidence、no-innerHTML evidence 和 limitations。
- Canvas2D trace review pack，整理 trace 字段、非 dispatch 边界、非 production limitation 和下一步需要 Sinan 决策的事项。
- Gap and decision ledger，明确哪些决策需要 Sinan 方回答：adapter 放在 Sinan repo 还是外部 package、真实 RuntimeUIViewModel schema 版本、registry route、fallback renderer priority、audit log storage、release compatibility policy。
- Handoff final package docs：`docs/sinan-cooperation/ludoweave-v0.9-sinan-handoff-checklist.md`、`docs/sinan-cooperation/ludoweave-v0.9-sinan-review-matrix.md`、`docs/roadmap/ludoweave-v0.9-integration-status.md`、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.9 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不创建真实 `@ludoweave/sinan` adapter package。
- 不发布 npm 包，不改 package 名，不改 monorepo 发布策略。
- 不把 Sinan Timeline、Director、Event、command、save、undo、registry、editor store、project JSON、asset store 或 gameplay state 放进 core API。
- 不让 LudoWeave 直接拥有 runtime UI semantics、localized text content、markup policy、sanitization、a11y side effects、text measurement、input policy、platform policy、fallback UI 或 native side effects。
- 不引入 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer、Ajv、schema runtime、HTML/Markdown parser 到 core。
- 不实现 datasource loading、pagination、async loading、cache invalidation、production Canvas2D、full DevTools、Pixi/WebGPU、rich text editor、HTML/Markdown import、real localization pipeline 或 broad editor integration。
- 不扩大 v0.4-v0.8 已接受的 bounded metadata 边界。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：
- 当前改动能否用最小 review artifact、fixture 或 Sinan handoff workflow 解释？
- 如果失败，能否定位到 docs link、contract matrix、fixture manifest、validation hook、audit payload、boundary statement、renderer evidence 或 release docs 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在 review checklist 中覆盖？
- 如果新增检查脚本或 fixture manifest，是否有稳定输出和测试？
- 如果只是 docs 改动，是否仍运行 whitespace、format、link/keyword checks？

架构自检：
- Host / Sinan RuntimeUISystem 是否仍是 runtime semantics、registry、command routing、state、input、fallback、localized content、sanitization、a11y、text measurement 和 project JSON 的 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer、Ajv、schema runtime、HTML/Markdown parser 依赖？
- v0.9 是否只是 handoff package，而不是真实 adapter、真实 integration 或 package publishing？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D 是否仍只消费 resolved frame 与 metadata，不新增 side effects？
- 是否避免把 v1 / real integration / production renderer 范围拉入 v0.9？
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

### Round 1: v0.9 Handoff Baseline

目标：
- 建立 v0.9 integration status 文档。
- 明确本阶段是 Bounded Sinan Handoff Checklist track。
- 记录本阶段不做真实 Sinan integration、adapter package、project JSON mutation 或 React Editor replacement。

验证：
- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Handoff Overview

目标：
- 创建 Sinan handoff overview。
- 总结 LudoWeave 当前定位、v0.4-v0.8 artifacts、适合 Sinan review 的入口和非入口。
- 明确下一步真实接入必须由 Sinan 提供真实 host surface 或授权。

验证：
- docs keyword/link check。
- `git diff --check`
- `pnpm format`

### Round 3: Contract Coverage Matrix

目标：
- 建立 RFC-to-LudoWeave contract coverage matrix。
- 映射 RuntimeUIViewModel、UIActionRef、fallback renderer、Prompt/Subtitle/Objective/Pause、focus、scroll、virtual list、rich text、validation hook 和 audit export。
- 标出 ready / needs Sinan decision / deferred。

验证：
- matrix consistency tests or docs check。
- `git diff --check`
- `pnpm format`

### Round 4: Fixture Manifest

目标：
- 列出 examples、testing fixtures、playground smoke、renderer tests、audit exports、validation hooks。
- 每条 fixture 记录 owner、source-of-truth、review question、expected result、command。
- 保持 manifest 可人工审阅且 JSON/Markdown 表格稳定。

验证：
- fixture path existence check。
- `git diff --check`
- `pnpm format`

### Round 5: Boundary Checklist

目标：
- 输出 Sinan/LudoWeave boundary checklist。
- 覆盖 project JSON、React Editor、Director/Timeline/Event、registry、command/save/undo、input/platform、localized content/sanitization/a11y/text measurement/fallback ownership。
- 明确每项 owner、LudoWeave allowed artifact、forbidden action。

验证：
- boundary keyword scan。
- `pnpm structure-check`
- `git diff --check`

### Round 6: Host Capability Checklist

目标：
- 整理真实接入前 Sinan 需要提供或确认的 host capabilities。
- 覆盖 envelope versioning、registry route、fallback renderer route、viewport/safe area/DPR、focus/scroll/selection/text policy、validation hook、audit log route。
- 标出 minimum viable handoff、nice-to-have、blocked until Sinan decision。

验证：
- docs check。
- `pnpm format`
- `Validate.cmd`

### Round 7: ActionRef Registry Review Pack

目标：
- 汇总 action refs、routing outcomes、diagnostics、audit payload。
- 覆盖 accepted、rejected、stale、unavailable、disabled、unknown、no-op。
- 明确 LudoWeave 只产出 serializable ActionRef，不做 host command dispatch。

验证：
- action audit tests。
- `pnpm validate`

### Round 8: Fallback Policy Review Pack

目标：
- 汇总 unsupported renderer、missing capability、missing fallback、invalid token、stale selection、removed item、host policy missing 等 fallback/diagnostic 路径。
- 明确 fallback UI 由 Sinan/host 拥有。
- 输出 review questions for Sinan fallback priority。

验证：
- fallback policy tests。
- `pnpm validate`

### Round 9: Renderer Conformance Review Pack

目标：
- 汇总 headless / DOM / Canvas2D conformance evidence。
- 证明 renderers 消费同一 `ResolvedUiFrame` 和 metadata sidecars。
- 明确 renderer 不拥有 layout source-of-truth、input、dispatch、a11y side effects、text measurement 或 datasource。

验证：
- renderer conformance tests。
- `pnpm structure-check`
- `pnpm api-check`

### Round 10: DOM And A11y Smoke Review Pack

目标：
- 汇总 Playground DOM smoke、a11y evidence、no-innerHTML evidence、known limitations。
- 输出 Sinan reviewer 可执行的 smoke checklist。
- 不新增 browser-owned source-of-truth。

验证：
- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 11: Canvas2D Trace Review Pack

目标：
- 汇总 Canvas2D trace 字段、supported metadata、non-dispatch boundary、non-production limitation。
- 标出真实 Sinan 接入前需要 Sinan 决策的 renderer priority 和 fallback behavior。
- 不实现 production Canvas2D。

验证：
- Canvas2D trace tests。
- `pnpm validate`

### Round 12: Gap Ledger And Final Handoff Docs

目标：
- 输出 gap and decision ledger。
- 完成 `docs/sinan-cooperation/ludoweave-v0.9-sinan-handoff-checklist.md` 和 `docs/sinan-cooperation/ludoweave-v0.9-sinan-review-matrix.md`。
- 更新 docs index、integration status、release notes draft。

验证：
- `Validate.cmd`
- `Smoke.cmd`
- `pnpm validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm format`
- `git diff --check`

### Round 13: Buffer 1 - Docs/Matrix Fixes

目标：
- 修复 handoff checklist、review matrix、fixture manifest、links 或 formatting 问题。

验证：
- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 14: Buffer 2 - Validation/Audit Fixes

目标：
- 修复 action audit、fallback policy、renderer conformance、smoke checklist 或 validation drift。

验证：
- targeted tests。
- `pnpm validate`
- `Smoke.cmd`

### Round 15: Buffer 3 - Boundary/Handoff Fixes

目标：
- 修复 boundary checklist、gap ledger、Sinan review questions 或 release docs。

验证：
- boundary scan。
- `git diff --check`
- `Validate.cmd`

### Round 16: Final Validation And Handoff

目标：
- 全量验证 v0.9 PASS。
- 输出 final report、validation log、recommended v1.0 entry。
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
| Smoke wrapper | `Smoke.cmd` | Round 10 |
| Lint | `pnpm lint` | Round 1 |
| TypeScript | `pnpm typecheck` | Round 1 |
| Unit / contract tests | `pnpm test` | Round 1 |
| Package build | `pnpm build` | Round 1 |
| API report | `pnpm api-check` | Round 9 |
| Boundary check | `pnpm structure-check` | Round 1 |
| Aggregated validation | `pnpm validate` | Round 1 |
| E2E smoke | `pnpm test:e2e` | Round 10 |
| A11y smoke | `pnpm test:a11y` | Round 10 |
| Formatting | `pnpm format` | Every docs/UI round |
| Docs whitespace | `git diff --check` | Every docs round |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.9 PASS 需要全部满足：

- v0.1 到 v0.8 PASS 标准没有回退。
- Handoff overview 说明 LudoWeave 当前定位、v0.4-v0.8 artifacts、review 入口和非入口。
- Contract coverage matrix 映射 Sinan RFC 验收点到 LudoWeave artifacts，并区分 ready / needs Sinan decision / deferred。
- Fixture manifest 覆盖 examples、testing fixtures、playground smoke、renderer tests、audit exports、validation hooks。
- Boundary checklist 明确 Sinan/host 与 LudoWeave 的 source-of-truth 分工和 forbidden actions。
- Host capability checklist 列出真实接入前 Sinan 需要提供或确认的最小能力。
- ActionRef registry review pack 覆盖 routing outcomes 和 JSON-only audit payload。
- Fallback policy review pack 覆盖主要 unsupported/missing/stale/invalid 诊断路径。
- Renderer conformance review pack 证明 headless / DOM / Canvas2D 消费同一 frame 和 metadata sidecars。
- DOM/a11y smoke review pack 可被 Sinan reviewer 复跑，并证明 no-innerHTML path。
- Canvas2D trace review pack 明确 trace-only、non-dispatch、non-production 边界。
- Gap and decision ledger 列出 adapter placement、schema version、registry route、fallback priority、audit storage、compatibility policy 等需 Sinan 决策事项。
- `docs/sinan-cooperation/ludoweave-v0.9-sinan-handoff-checklist.md` 和 `docs/sinan-cooperation/ludoweave-v0.9-sinan-review-matrix.md` 已完成并从 docs index 链接。
- 没有真实 Sinan import、project JSON mutation、React Editor replacement、adapter package publishing 或 Sinan-specific core API creep。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.9 Final Report

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
- Sinan source-of-truth:
- Handoff-only boundary:
- No real Sinan import / project JSON mutation:
- No adapter package publishing:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D trace isolation:
- Core dependency boundary:

## Known Limitations

- ...

## Recommended v1.0 Entry

- ...
```
