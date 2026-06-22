# LudoWeave v0.7 Goal 模式执行指南

日期：2026-06-22  
状态：给执行者使用的 v0.7 开发指令文档  
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.7 Goal。

已接受基线：
- v0.1 已 PASS，并在 2026-06-21 验收通过。
- v0.2 已 PASS，并在 2026-06-22 验收通过。
- v0.3 已 PASS，并在 2026-06-22 验收通过。
- v0.4 已 PASS，并在 2026-06-22 验收通过。
- v0.5 已 PASS，并在 2026-06-22 验收通过。
- v0.6 已 PASS，并在 2026-06-22 验收通过。
- 当前 main 已同步 origin/main。
- v0.6 已完成 Bounded Scroll Metadata track，包括 scroll container metadata、host scroll intent ActionRefs、offset diagnostics、clipped content fixtures、renderer conformance sidecars、DOM smoke、Canvas2D scroll traces 和 Sinan-like Gate Demo scroll validation。

v0.7 目标：
在 16 轮内完成 Bounded Virtual List Metadata track。当前 workspace 没有真实 Sinan 仓库，因此本阶段不做真实 Sinan integration；目标是在 LudoWeave 内把 v0.3 future-track 里的 Virtual List Track 变成可验证的 host-owned collection/window metadata 和 renderer coordination contract：VirtualWindow metadata、stable item keys、realized item range、overscan metadata、host-owned selection/action outputs、empty/short/removed/stale diagnostics、renderer conformance fixture、DOM playground smoke、Canvas2D virtual-window trace、Sinan-like Gate Demo list fixture 和 JSON-only audit export。

必须遵守：
- Host / Sinan RuntimeUISystem 仍拥有 collection data、item identity source-of-truth、data loading、selection state、scroll state、route changes、persistence、input policy 和 platform policy。
- LudoWeave 只描述 virtual window metadata、stable item keys、estimated item size、realized item range、overscan metadata、diagnostics、ActionRef outputs 和 renderer trace。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer 或 Canvas renderer。
- core 和 renderer 不直接读取 DOM measurement、IntersectionObserver、ResizeObserver、browser scroll state、wheel/touch/keyboard/gamepad/native input events、collection datasource 或 platform input state。
- DOM 和 Canvas2D renderer 只消费 ResolvedUiFrame、scroll metadata 和 virtual window metadata，不成为 collection data、scroll state、layout、input、a11y 或 dispatch 的事实源。
- Canvas2D 只能 trace realized item geometry / window metadata / action target ids，不 dispatch、不 mutate selection 或 scroll state。
- v0.7 不做真实 data source、pagination、async loading、cache invalidation、item diff engine、infinite scrolling、renderer recycling pool public contract、virtualized DOM pool、rich text、real Sinan import、project JSON mutation、Sinan React Editor replacement、full DevTools、Pixi/WebGPU 或 production Canvas2D。

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
- `docs/release/ludoweave-v0.6-final-report.md`
- `docs/release/ludoweave-v0.6-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.6-integration-status.md`
- `docs/runtime-ui/scroll-metadata-contract.md`
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md`
- `docs/runtime-ui/focus-navigation-contract.md`
- `docs/sinan-cooperation/ludoweave-v0.4-sinan-contract-spike-notes.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.6 PASS 证据：

- `Validate.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `pnpm validate`: PASS.
- `pnpm test:e2e`: PASS.
- `pnpm test:a11y`: PASS.
- `pnpm format`: PASS.
- `git diff --check`: PASS.
- `git status --short --branch`: clean, `main...origin/main`.
- Remote `main`: `cb6739d7a81608c99962cf61f9bc4844ea77d8a6`.
- Final test count: 54 test files, 203 tests passed.

v0.7 选择说明：

- v0.6 final report 推荐下一个入口是 bounded virtual list metadata track。
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md` 已提前定义 Virtual List Track 的 source-of-truth、non-goals、fixtures 和 entry criteria。
- v0.6 已提供 host-owned scroll metadata；v0.7 可以复用它描述 window 与 realized range，但不得把 virtual list 变成 scroll implementation。
- 本阶段只选择 Virtual List Track，不同时推进 rich text、real Sinan integration、production Canvas2D 或 full DevTools。

## 2. 本阶段要完成什么

v0.7 要完成：

- `VirtualWindow` metadata draft，包含 list id、item key namespace、total count snapshot、realized range、overscan range、estimated item size、viewport/scroll container reference、selection snapshot、host capability 和 diagnostics。
- Host-owned collection/window intent contract，包含 select item、activate item、move selection、request window、restore selection 等抽象 intent，以及 ActionRef-only output，不读取 native input 或 datasource。
- Deterministic range calculation fixture，覆盖 fixed-size item window、short list、empty list、overscan、clamped range、stale window 和 removed item。
- Stable item key and item range diagnostics，覆盖 duplicate key、missing item key、stale selection、removed item、invalid range、missing host capability。
- Realized item fixture，证明 virtualized items 是普通 resolved nodes，renderer 消费 host 已选择的 realized items，不拥有 collection data。
- Renderer conformance fixture，证明 headless / DOM / Canvas2D 消费同一个 `ResolvedUiFrame` 加 virtual window metadata，不重新计算 layout、range 或 datasource。
- DOM playground virtual window smoke，展示 virtual window metadata、realized range、selection snapshot、available host intents 和 diagnostics，不实现真实 DOM recycling。
- Canvas2D virtual window trace，trace realized item geometry、range metadata、selection markers 和 action target ids，不读 input、不 dispatch、不 mutate selection/scroll。
- Sinan-like Gate Demo virtual list fixture，包含 host-owned list window sequence、registry mock results、fallback policy 和 validation hook layer。
- Virtual list audit export，输出 JSON-only window / selection / registry / diagnostics review payload。
- Docs：v0.7 integration status、runtime UI virtual list metadata contract、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.7 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不接管 Director、Timeline、Event、command、save、undo、route persistence、collection datasource、data loading、selection state、scroll state 或 gameplay state。
- 不读取 browser `wheel`、`touch`、`keyboard`、`Gamepad`、native input event、DOM `scrollTop` / `scrollLeft`、DOM measurement、IntersectionObserver、ResizeObserver 或 datasource state。
- 不实现 data source、pagination、async loading、cache invalidation、item diff engine。
- 不实现 infinite scrolling。
- 不实现 renderer-specific recycling pool 作为 public contract。
- 不实现 virtualized DOM pool。
- 不实现 rich text、nested responsive layout、production Canvas2D、Pixi/WebGPU 或 full DevTools。
- 不把 v0.6 scroll metadata 改造成 full scroll engine。
- 不改变 `ResolvedUiFrame` 完整 snapshot 边界。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：

- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、runtime、layout、virtual window metadata、range calculation、host collection intent、adapter、registry、renderer、browser smoke 或 docs 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 virtual list，是否覆盖 empty list、short list、duplicate key、stale selection、removed item、invalid range、overscan 和 missing host capability？

架构自检：

- Host / Sinan RuntimeUISystem 是否仍是 collection data、item identity、selection state、scroll state 和 native side effects 的 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer 依赖？
- core/renderer 是否没有直接读取 DOM measurement、browser scroll state、native input events 或 datasource state？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否只消费 resolved nodes、scroll metadata 和 virtual window metadata？
- Sinan-like adapter 是否仍在 example/fixture scope，不进入 core？
- Virtual list metadata 是否没有泄漏 DOM node、native event、Gamepad object、React component、datasource object、Promise 或 closure？
- 本轮是否避免把 v0.8/v1 范围拉入 v0.7？
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

### Round 1: v0.7 Contract Baseline

目标：

- 建立 v0.7 integration status 文档。
- 明确本阶段是 Bounded Virtual List Metadata track。
- 记录本阶段不做 datasource、pagination、infinite scrolling、rich text、real Sinan、DOM recycling pool。

验证：

- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Virtual Window Metadata Contract

目标：

- 定义 JSON-only `VirtualWindow` metadata。
- 包含 list id、item key namespace、total count snapshot、realized range、overscan range、estimated item size、viewport/scroll reference、selection snapshot、host capability。
- 保持 renderer-free 和 Sinan-free。

验证：

- core tests。
- `pnpm typecheck`
- `pnpm api-check`

### Round 3: Host Collection Intent Contract

目标：

- 定义 host-owned collection/window intent contract。
- 支持 select item、activate item、move selection、request window、restore selection。
- 输出 ActionRef-only intent，不读取 datasource、DOM 或 platform input。

验证：

- collection intent tests。
- no callback / serializability tests。
- boundary check。

### Round 4: Deterministic Range Calculation Fixture

目标：

- 实现 deterministic range calculation fixture。
- 覆盖 fixed-size item window、short list、empty list、overscan、clamped range。
- 计算只依赖 host-provided metadata，不依赖 DOM measurement。

验证：

- range calculation tests。
- snapshot tests。
- `pnpm validate`

### Round 5: Item Key And Selection Diagnostics

目标：

- 覆盖 duplicate key、missing item key、stale selection、removed item、invalid range、missing host capability。
- diagnostics code 稳定。

验证：

- diagnostics tests。
- snapshot tests。
- `pnpm validate`

### Round 6: Realized Item Fixture

目标：

- 建立 realized item fixture，证明 virtualized items 是普通 resolved nodes。
- 保持 renderer 消费 host 已选择的 realized items，不拥有 collection data。
- 明确这不是 DOM recycling pool 或 infinite scrolling。

验证：

- testing fixture tests。
- headless snapshot tests。
- `pnpm typecheck`

### Round 7: Renderer Conformance Frame

目标：

- 将 virtual window metadata 加入 shared renderer conformance fixture。
- headless / DOM / Canvas2D 消费同一 `ResolvedUiFrame` 和 metadata sidecar。
- 防止 renderer 重新计算 layout、range 或 datasource。

验证：

- renderer conformance tests。
- `pnpm structure-check`
- `pnpm api-check`

### Round 8: DOM Playground Virtual Window Smoke

目标：

- Playground 展示 v0.7 virtual window metadata、realized range、selection snapshot、available host intents 和 diagnostics。
- DOM smoke 不实现真实 DOM recycling 或 datasource loading。
- 保持 a11y 无阻断问题。

验证：

- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 9: Canvas2D Virtual Window Trace

目标：

- Canvas2D trace realized item geometry、range metadata、selection markers、action target ids。
- 不读取 input，不 dispatch，不 mutate selection 或 scroll state。
- 覆盖 empty list / stale selection / removed item trace。

验证：

- Canvas2D trace tests。
- renderer conformance subset。
- `pnpm validate`

### Round 10: Sinan-like Gate Demo Virtual List Fixture

目标：

- 扩展 Gate Demo fixture，加入 host-owned list window sequence。
- Registry mock 返回 deterministic routing results。
- Validation hook 能区分 virtual list mapping、registry、renderer trace failure。

验证：

- Sinan example contract tests。
- validation hook tests。

### Round 11: Fallback Policy And Audit Export

目标：

- 增加 virtual-list-specific fallback policy。
- 输出 JSON-only window / selection / registry / diagnostics audit payload。
- 覆盖 unsupported renderer、missing host collection capability、stale selection、removed item。

验证：

- fallback policy tests。
- audit export tests。
- no non-serializable object tests。

### Round 12: v0.7 Integration Pass And Docs

目标：

- 整合 virtual window metadata、host collection intent、diagnostics、conformance、DOM/Canvas/Gate Demo paths。
- 输出 `docs/runtime-ui/virtual-list-metadata-contract.md`。
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

- 修复 virtual window metadata、intent、diagnostics、conformance、DOM/Canvas drift。

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

- 全量验证 v0.7 PASS。
- 输出 final report、validation log、recommended v0.8 entry。
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

v0.7 PASS 需要全部满足：

- v0.1、v0.2、v0.3、v0.4、v0.5 和 v0.6 PASS 标准没有回退。
- Virtual window metadata 覆盖 list id、item key namespace、total count snapshot、realized range、overscan range、estimated item size、viewport/scroll reference、selection snapshot、host capability。
- Host collection intent contract 覆盖 select item、activate item、move selection、request window、restore selection，并且不读取 datasource、DOM 或 platform input。
- Range calculation 覆盖 fixed-size item window、short list、empty list、overscan、clamped range。
- Diagnostics 覆盖 duplicate key、missing item key、stale selection、removed item、invalid range、missing host capability。
- Realized item fixture 证明 renderer 消费普通 resolved nodes，不拥有 collection data。
- Renderer conformance 证明 headless / DOM / Canvas2D 消费同一个 resolved frame 和 virtual window metadata。
- DOM playground virtual window smoke 通过 E2E/a11y。
- Canvas2D virtual window trace 不读取 input、不 dispatch ActionRef、不 mutate selection 或 scroll state。
- Sinan-like Gate Demo fixture 包含 host-owned list window sequence 和 registry mock results。
- Virtual list audit export 是 JSON-only 且无 callback/native/datasource object。
- `docs/runtime-ui/virtual-list-metadata-contract.md` 已完成。
- 没有真实 Sinan import、project JSON mutation、React Editor replacement。
- 没有 data source、pagination、async loading、cache invalidation、item diff engine、infinite scrolling、DOM recycling pool public contract、rich text、production Canvas2D。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.7 Final Report

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
- Host collection source-of-truth:
- Host scroll source-of-truth:
- No datasource/DOM/platform reads:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D trace isolation:
- No rich text / real Sinan scope creep:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.8 Entry

- ...
```
