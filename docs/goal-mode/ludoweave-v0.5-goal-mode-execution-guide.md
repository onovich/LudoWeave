# LudoWeave v0.5 Goal 模式执行指南

日期：2026-06-22  
状态：给执行者使用的 v0.5 开发指令文档  
总预算：16 轮会话  

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.5 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.2 已 PASS，并在 2026-06-22 验收通过。
- v0.3 已 PASS，并在 2026-06-22 验收通过。
- v0.4 已 PASS，并在 2026-06-22 验收通过。
- 当前 main 已同步 origin/main。
- v0.4 已完成 Sinan Gate Demo Contract Spike，包括 versioned RuntimeUIViewModel envelope、host capability snapshot、ActionRef registry mock、Gate Demo fixture、validation hook、DOM/Canvas2D/fallback paths 和 JSON-only audit export。

v0.5 目标：
在 16 轮内完成 Richer Gamepad Navigation bounded track。当前 workspace 没有真实 Sinan 仓库，因此本阶段不做真实 Sinan integration；目标是在 LudoWeave 内把 v0.3/v0.4 的 focus/input planning 变成可验证的 host-owned input intent 和 focus graph contract：directional focus graph、modal scope navigation、disabled/stale/missing target diagnostics、host input intent mapping、ActionRef-only confirm/cancel/navigation outputs、DOM playground smoke 和 Sinan-like fixture coverage。

必须遵守：
- Runtime UI only，不替换 Sinan React Editor。
- Host / Sinan RuntimeUISystem 仍拥有 physical input devices、focus state、rebinding、platform policy 和 source-of-truth。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- core 和 renderer 不直接读取 Gamepad API、keyboard state 或 platform input events。
- ActionRef 仍禁止 arbitrary callback。
- DOM 和 Canvas2D renderer 都消费 ResolvedUiFrame，不成为布局事实源。
- v0.5 不做 scroll、virtual list、rich text、Pixi/WebGPU、full DevTools、production Canvas2D 或 real Sinan integration。

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
- `docs/release/ludoweave-v0.4-final-report.md`
- `docs/release/ludoweave-v0.4-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.4-integration-status.md`
- `docs/sinan-cooperation/ludoweave-v0.4-sinan-contract-spike-notes.md`
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md`
- `docs/runtime-ui/pause-modal-behavior-contract.md`
- `docs/runtime-ui/dom-input-overlay-design.md`
- `docs/runtime-ui/canvas2d-renderer-spike.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.4 PASS 证据：

- `Validate.cmd`: PASS。
- `Smoke.cmd`: PASS。
- `pnpm validate`: PASS。
- `pnpm test:e2e`: PASS。
- `pnpm test:a11y`: PASS。
- `pnpm format`: PASS。
- `git status --short --branch`: clean, `main...origin/main`。

v0.5 选择说明：

- v0.4 final report 的首选下一步是真实 Sinan handoff，但当前 workspace 没有 Sinan 仓库或 host integration surface。
- v0.4 final report 的备选是选择一个 bounded runtime track。
- 本阶段选择 **Richer Gamepad Navigation**，因为它复用已有 Pause/focus、ActionRef、host capability 和 Gate Demo fixtures，同时比 scroll、virtual list、rich text 更小、更符合 runtime UI 交互优先级。

## 2. 本阶段要完成什么

v0.5 要完成：

- Focus graph metadata draft，包含 focusable node id、rect、scope、directional neighbors、priority、disabled reason 和 diagnostics。
- Host input intent contract，包含 confirm、cancel、navigate up/down/left/right、next/previous、pause/menu intent。
- Directional navigation resolver fixture，覆盖 nearest target、explicit neighbor、disabled target、missing target、stale key、empty graph、tie-breaker。
- Modal focus scope navigation，覆盖 Pause/Dialog scope、containFocus、restoreFocus、cancel/confirm outputs。
- ActionRef-only output path，确保 navigation/confirm/cancel 不引入 callback 或 native event。
- DOM playground keyboard metadata smoke，验证 v0.5 focus graph state 不破坏 a11y。
- Canvas2D trace fixture，验证 renderer 只 trace focusable geometry/action targets，不读取 input 或 dispatch。
- Sinan-like Gate Demo fixture 扩展，包含 gamepad navigation sequence 和 registry mock results。
- Docs：v0.5 integration status、focus navigation contract note、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.5 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不接管 Director、Timeline、Event、command、save、undo。
- 不读取 browser `Gamepad` API。
- 不实现 input rebinding UI。
- 不实现 analog dead-zone 或 low-level device polling。
- 不实现 scroll、virtual list、rich text、nested responsive layout。
- 不实现 Pixi/WebGPU renderer。
- 不实现 production Canvas2D renderer。
- 不实现 full DevTools。
- 不改变 `ResolvedUiFrame` 完整 snapshot 边界。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：

- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、runtime、layout、focus resolver、host input intent、adapter、registry、renderer、browser 或 UI 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 navigation，是否覆盖 disabled target、stale focus key、empty graph、modal containment、tie-breaker 和 missing host capability？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- core/renderer 是否没有直接读取 Gamepad API、keyboard events 或 native input state？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否仍只消费 resolved metadata/geometry？
- Sinan-like adapter 是否仍在 example/fixture scope，不进入 core？
- Host input intent contract 是否没有泄漏 DOM node、native event、Gamepad object、React component 或 closure？
- 本轮是否避免把 v0.6/v1 范围拉入 v0.5？
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

### Round 1: v0.5 Contract Baseline

目标：

- 建立 v0.5 integration status 文档。
- 明确本阶段是 Richer Gamepad Navigation bounded track。
- 记录本阶段不做 scroll、virtual list、rich text、real Sinan。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Focus Graph Metadata

目标：

- 定义 focus graph metadata draft。
- 包含 focusable id、rect、scope、directional neighbors、priority、disabled reason。
- 保持 JSON-serializable。

验证：

- core/components tests。
- `pnpm typecheck`
- `pnpm api-check`

### Round 3: Host Input Intent Contract

目标：

- 定义 host-owned input intent contract。
- 支持 confirm、cancel、navigate up/down/left/right、next/previous、pause/menu。
- 不读取 platform input events。

验证：

- input intent tests。
- no callback / serializability tests。
- boundary check。

### Round 4: Directional Navigation Resolver

目标：

- 实现 deterministic directional resolver fixture。
- 支持 explicit neighbor 与 nearest target fallback。
- 覆盖 tie-breaker。

验证：

- resolver unit tests。
- snapshot tests。

### Round 5: Disabled/Stale/Missing Diagnostics

目标：

- 覆盖 disabled target、stale focus key、missing target、empty graph、missing host capability diagnostics。
- diagnostics code 稳定。

验证：

- diagnostics tests。
- `pnpm validate`

### Round 6: Modal Focus Scope Navigation

目标：

- 将 Pause/Dialog scope 与 focus graph resolver 连接。
- 验证 containFocus、restoreFocus、cancel/confirm outputs。

验证：

- components Dialog/Pause tests。
- action log tests。

### Round 7: ActionRef Output Path

目标：

- navigation/confirm/cancel outputs 只产生 ActionRef 或 host intent result。
- 不引入 callback/native event。
- ActionRef inspector 能记录 navigation sequence。

验证：

- action log inspector tests。
- no non-serializable object tests。

### Round 8: DOM Playground Navigation Smoke

目标：

- Playground 展示 v0.5 navigation state。
- DOM smoke 可看到 focus graph metadata、current focus、available intents。
- 保持 a11y 无阻断问题。

验证：

- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 9: Canvas2D Focus Trace

目标：

- Canvas2D trace focusable geometry/action targets。
- 不读取 input，不 dispatch。
- 覆盖 no target / disabled / modal scope trace。

验证：

- Canvas2D trace tests。
- renderer conformance subset。
- `pnpm validate`

### Round 10: Sinan-like Gate Demo Navigation Sequence

目标：

- 扩展 Gate Demo fixture，包含 gamepad navigation sequence。
- Registry mock 返回 deterministic routing results。
- Validation hook 能区分 navigation mapping、registry 和 renderer trace failure。

验证：

- Sinan example contract tests。
- validation hook tests。

### Round 11: Focus Navigation Contract Docs

目标：

- 输出 `docs/runtime-ui/focus-navigation-contract.md`。
- 记录 source-of-truth、host responsibilities、non-goals、fixtures、v0.6 entry。

验证：

- `git diff --check`
- `pnpm format`

### Round 12: v0.5 Integration Pass

目标：

- 整合 focus graph、input intent、resolver、modal scope、DOM/Canvas/Gate Demo paths。
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

### Round 14: Buffer 2 - Runtime/Resolver Fixes

目标：

- 修复 focus graph、input intent、resolver、modal scope、DOM/Canvas drift。

验证：

- targeted tests。
- `pnpm validate`
- `Smoke.cmd`

### Round 15: Buffer 3 - Docs/Example Fixes

目标：

- 修复 Gate Demo fixture、contract docs、release notes、handoff docs。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 16: Final Validation And Handoff

目标：

- 全量验证 v0.5 PASS。
- 输出 final report、validation log、recommended v0.6 entry。
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
| API report | `pnpm api-check` | Round 2 |
| Boundary check | `pnpm structure-check` | Round 1 |
| Aggregated validation | `pnpm validate` | Round 1 |
| E2E smoke | `pnpm test:e2e` | Round 8 |
| A11y smoke | `pnpm test:a11y` | Round 8 |
| Formatting | `pnpm format` | Every docs/UI round |
| Docs whitespace | `git diff --check` | Every docs round |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.5 PASS 需要全部满足：

- v0.1、v0.2、v0.3 和 v0.4 PASS 标准没有回退。
- Focus graph metadata 覆盖 focusable id、rect、scope、directional neighbors、priority、disabled reason。
- Host input intent contract 覆盖 confirm、cancel、navigate directions、next/previous、pause/menu，且不读取 platform input。
- Directional resolver 覆盖 explicit neighbor、nearest target、tie-breaker、disabled、stale、missing、empty graph。
- Modal focus scope navigation 覆盖 containFocus、restoreFocus、confirm/cancel outputs。
- Navigation outputs 只产生 ActionRef 或 host intent result，无 callback/native event。
- DOM playground navigation smoke 通过 E2E/a11y。
- Canvas2D focus trace 不读取 input、不 dispatch ActionRef。
- Sinan-like Gate Demo fixture 包含 gamepad navigation sequence 和 registry mock results。
- `docs/runtime-ui/focus-navigation-contract.md` 已完成。
- 没有真实 Sinan import、project JSON mutation 或 React Editor replacement。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.5 Final Report

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
- Host input source-of-truth:
- No platform input reads:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D dispatch isolation:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.6 Entry

- ...
```

