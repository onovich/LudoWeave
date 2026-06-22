# LudoWeave v0.6 Goal 模式执行指南

日期：2026-06-22  
状态：给执行者使用的 v0.6 开发指令文档  
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.6 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.2 已 PASS，并在 2026-06-22 验收通过。
- v0.3 已 PASS，并在 2026-06-22 验收通过。
- v0.4 已 PASS，并在 2026-06-22 验收通过。
- v0.5 已 PASS，并在 2026-06-22 验收通过。
- 当前 main 已同步 origin/main。
- v0.5 已完成 Richer Gamepad Navigation bounded track，包括 focus graph metadata、host input intent、directional resolver、modal scope navigation、ActionRef-only navigation output、DOM smoke、Canvas2D focus trace 和 Sinan-like Gate Demo navigation sequence。

v0.6 目标：
在 16 轮内完成 Bounded Scroll Metadata track。当前 workspace 没有真实 Sinan 仓库，因此本阶段不做真实 Sinan integration；目标是在 LudoWeave 内把 v0.3 future-track 里的 Scroll Track 变成可验证的 host-owned scroll metadata 和 renderer coordination contract：scroll container metadata、host-owned offset snapshot、scroll intent ActionRef、missing/stale/removed/disabled diagnostics、DOM playground coordination smoke、Canvas2D scroll trace、renderer conformance fixture、Sinan-like Gate Demo scroll fixture 和 fallback/audit coverage。

必须遵守：
- Host / Sinan RuntimeUISystem 仍拥有 scroll intent、route changes、persistence、input policy、restoration、physical input、native scroll side effects 和 source-of-truth state。
- LudoWeave 只描述 scroll container metadata、visible content box、offset snapshot、ActionRef outputs、diagnostics 和 renderer trace。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- core 和 renderer 不直接读取 browser scroll state、wheel/touch/keyboard/gamepad/native input events、DOM node scrollTop/scrollLeft 或 platform input state。
- DOM 和 Canvas2D renderer 只消费 ResolvedUiFrame 与 scroll metadata，不成为 scroll state、layout、input、a11y 或 dispatch 的事实源。
- Canvas2D 只能 trace scroll candidates / visible content / action target ids，不 dispatch、不 mutate scroll state。
- v0.6 不做 CSS overflow model、nested scroll physics、momentum/inertial scrolling、touch gesture engine、scrollbar rendering in core、virtual list、rich text、real Sinan import、project JSON mutation、Sinan React Editor replacement、full DevTools、Pixi/WebGPU 或 production Canvas2D。

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
- `docs/release/ludoweave-v0.5-final-report.md`
- `docs/release/ludoweave-v0.5-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.5-integration-status.md`
- `docs/runtime-ui/focus-navigation-contract.md`
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md`
- `docs/runtime-ui/dom-input-overlay-design.md`
- `docs/runtime-ui/canvas2d-renderer-spike.md`
- `docs/sinan-cooperation/ludoweave-v0.4-sinan-contract-spike-notes.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.5 PASS 证据：

- `Validate.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `pnpm validate`: PASS.
- `pnpm test:e2e`: PASS.
- `pnpm test:a11y`: PASS.
- `pnpm format`: PASS.
- `git status --short --branch`: clean, `main...origin/main`.
- Remote `main`: `fae754770ed8710f9ec5eaf6e937c3ccd6dc1735`.

v0.6 选择说明：

- v0.5 final report 推荐下一个入口是 bounded scroll metadata track。
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md` 已提前定义 Scroll Track 的 source-of-truth、non-goals、fixtures 和 entry criteria。
- 本阶段只选择 Scroll Track，不同时推进 virtual list、rich text、real Sinan integration 或 production renderer。

## 2. 本阶段要完成什么

v0.6 要完成：

- Scroll container metadata draft，包含 container id、content rect、viewport rect、axis、scroll offset snapshot、extent、disabled reason、host capability 和 diagnostics。
- Host-owned scroll intent contract，包含 line/page/edge/restore 等抽象 intent，以及 ActionRef-only output，不读取 native input。
- Scroll offset normalization 和 diagnostics，覆盖 missing host capability、stale container key、removed container restoration、out-of-range offset、disabled scroll、empty container。
- Clipped content / visible content box fixture，证明 LudoWeave 描述可见区域，但不实现 virtual list 或 browser CSS overflow model。
- Renderer conformance fixture，证明 headless / DOM / Canvas2D 消费同一个 resolved scroll metadata，不重新计算布局事实。
- DOM playground scroll coordination smoke，展示 scroll metadata、host offset snapshot、available intents 和 diagnostics，不让 core/renderer 拥有 browser scroll state。
- Canvas2D scroll trace fixture，trace scroll container geometry、visible content、offset snapshot 和 action target ids，不读 input、不 dispatch。
- Sinan-like Gate Demo scroll fixture，包含 host-owned scroll sequence、registry mock results、fallback policy 和 validation hook layer。
- Scroll audit export，输出 JSON-only scroll intent / registry / diagnostics review payload。
- Docs：v0.6 integration status、runtime UI scroll metadata contract、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.6 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不接管 Director、Timeline、Event、command、save、undo、route persistence 或 gameplay state。
- 不读取 browser `wheel`、`touch`、`keyboard`、`Gamepad`、native input event 或 DOM `scrollTop` / `scrollLeft`。
- 不实现 browser-compatible CSS overflow model。
- 不实现 nested scroll physics。
- 不实现 momentum / inertial scrolling。
- 不实现 touch gesture engine。
- 不在 core 中渲染 scrollbar。
- 不实现 virtual list、infinite scrolling、data source、pagination、recycling pool、rich text、nested responsive layout。
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
- 如果失败，能否定位到 tooling、runtime、layout、scroll metadata、host scroll intent、adapter、registry、renderer、browser smoke 或 docs 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 scroll，是否覆盖 disabled scroll、stale container、removed container、missing host capability、out-of-range offset、empty container 和 renderer trace？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 scroll state 和 scroll side effects 的 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- core/renderer 是否没有直接读取 DOM scroll state、wheel/touch/keyboard/gamepad/native input events？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否只消费 resolved metadata/geometry？
- Sinan-like adapter 是否仍在 example/fixture scope，不进入 core？
- Scroll intent contract 是否没有泄漏 DOM node、native event、Gamepad object、React component 或 closure？
- 本轮是否避免把 v0.7/v1 范围拉入 v0.6？
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

### Round 1: v0.6 Contract Baseline

目标：

- 建立 v0.6 integration status 文档。
- 明确本阶段是 Bounded Scroll Metadata track。
- 记录本阶段不做 virtual list、rich text、real Sinan、CSS overflow model、nested scroll physics。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Scroll Metadata Contract

目标：

- 定义 JSON-only scroll container metadata。
- 包含 container id、content rect、viewport rect、axis、offset snapshot、extent、disabled reason、host capability。
- 保持 renderer-free 和 Sinan-free。

验证：

- core tests。
- `pnpm typecheck`
- `pnpm api-check`

### Round 3: Host Scroll Intent Contract

目标：

- 定义 host-owned scroll intent contract。
- 支持 line/page/edge/restore intent 和 ActionRef-only output。
- 不读取 wheel/touch/keyboard/gamepad/native input event。

验证：

- scroll intent tests。
- no callback / serializability tests。
- boundary check。

### Round 4: Offset Normalization And Diagnostics

目标：

- 实现 deterministic offset normalization fixture。
- 覆盖 missing capability、stale container、removed container、out-of-range offset、disabled scroll、empty container。
- diagnostics code 稳定。

验证：

- diagnostics tests。
- snapshot tests。
- `pnpm validate`

### Round 5: Clipped Content Fixture

目标：

- 建立 single scroll container + clipped child content fixture。
- 证明 visible content box 和 offset snapshot 可被描述。
- 明确这不是 virtual list 或 CSS overflow engine。

验证：

- layout/metadata tests。
- headless snapshot tests。
- `pnpm typecheck`

### Round 6: Renderer Conformance Frame

目标：

- 将 scroll metadata 加入 shared renderer conformance fixture。
- headless / DOM / Canvas2D 消费同一 `ResolvedUiFrame`。
- 防止 renderer 重新计算 layout 或 scroll fact。

验证：

- renderer conformance tests。
- `pnpm structure-check`
- `pnpm api-check`

### Round 7: DOM Playground Scroll Coordination Smoke

目标：

- Playground 展示 v0.6 scroll metadata、offset snapshot、visible area、available host intents 和 diagnostics。
- DOM smoke 不读取或拥有 browser scroll state。
- 保持 a11y 无阻断问题。

验证：

- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 8: Canvas2D Scroll Trace

目标：

- Canvas2D trace scroll container geometry、visible content、offset snapshot、action target ids。
- 不读取 input，不 dispatch，不 mutate scroll state。
- 覆盖 no container / disabled / stale / missing host capability trace。

验证：

- Canvas2D trace tests。
- renderer conformance subset。
- `pnpm validate`

### Round 9: Sinan-like Gate Demo Scroll Fixture

目标：

- 扩展 Gate Demo fixture，加入 host-owned scroll panel sequence。
- Registry mock 返回 deterministic routing results。
- Validation hook 能区分 scroll mapping、registry、renderer trace failure。

验证：

- Sinan example contract tests。
- validation hook tests。

### Round 10: Fallback Policy And Audit Export

目标：

- 增加 scroll-specific fallback policy。
- 输出 JSON-only scroll intent / registry / diagnostics audit payload。
- 覆盖 unsupported renderer、missing host scroll capability、disabled scroll。

验证：

- fallback policy tests。
- audit export tests。
- no non-serializable object tests。

### Round 11: Scroll Metadata Contract Docs

目标：

- 输出 `docs/runtime-ui/scroll-metadata-contract.md`。
- 记录 source-of-truth、host responsibilities、non-goals、fixtures、v0.7 entry。

验证：

- `git diff --check`
- `pnpm format`

### Round 12: v0.6 Integration Pass

目标：

- 整合 scroll metadata、host scroll intent、diagnostics、conformance、DOM/Canvas/Gate Demo paths。
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

### Round 14: Buffer 2 - Runtime/Renderer Fixes

目标：

- 修复 scroll metadata、intent、diagnostics、conformance、DOM/Canvas drift。

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

- 全量验证 v0.6 PASS。
- 输出 final report、validation log、recommended v0.7 entry。
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

v0.6 PASS 需要全部满足：

- v0.1、v0.2、v0.3、v0.4 和 v0.5 PASS 标准没有回退。
- Scroll container metadata 覆盖 container id、content rect、viewport rect、axis、offset snapshot、extent、disabled reason、host capability。
- Host scroll intent contract 覆盖 line/page/edge/restore，并且不读取 platform input。
- Offset normalization 覆盖 missing capability、stale container、removed container、out-of-range offset、disabled scroll、empty container。
- Clipped content fixture 证明可见区域 metadata 可被消费，但没有引入 virtual list 或 CSS overflow engine。
- Renderer conformance 证明 headless / DOM / Canvas2D 消费同一个 resolved scroll metadata。
- DOM playground scroll smoke 通过 E2E/a11y。
- Canvas2D scroll trace 不读取 input、不 dispatch ActionRef、不 mutate scroll state。
- Sinan-like Gate Demo fixture 包含 host-owned scroll sequence 和 registry mock results。
- Scroll audit export 是 JSON-only 且无 callback/native object。
- `docs/runtime-ui/scroll-metadata-contract.md` 已完成。
- 没有真实 Sinan import、project JSON mutation、React Editor replacement。
- 没有 virtual list、rich text、nested scroll physics、momentum/touch gesture engine、scrollbar rendering in core、production Canvas2D。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.6 Final Report

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
- Host scroll source-of-truth:
- No platform scroll/input reads:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D trace isolation:
- No virtual list/rich text scope creep:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.7 Entry

- ...
```
