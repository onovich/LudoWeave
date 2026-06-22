# LudoWeave v0.8 Goal 模式执行指南

日期：2026-06-22  
状态：给执行者使用的 v0.8 开发指令文档  
总预算：16 轮会话

## 0. 直接给执行者的 Goal Prompt

```text
你正在 D:\LabProjects\Engine\LudoWeave 执行 LudoWeave v0.8 Goal。

已接受基线：
- v0.1 到 v0.7 均已 PASS，并已推送到 origin/main。
- v0.7 完成 Bounded Virtual List Metadata track，包括 VirtualWindow metadata、stable item keys、realized/overscan ranges、host-owned collection intents、diagnostics、renderer conformance、DOM smoke、Canvas2D trace、Sinan-like Gate Demo fixture 和 JSON-only audit export。
- 当前 main 已同步 origin/main。

v0.8 目标：在 16 轮内完成 Bounded Rich Text Metadata track。当前 workspace 没有真实 Sinan 仓库，因此本阶段不做真实 Sinan integration；目标是在 LudoWeave 内把 v0.3 future-track 里的 Rich Text Track 落为可验证的 host-owned rich text metadata contract：serializable inline text runs、semantic span metadata、plain text fallback、host-owned sanitization policy、theme token integration、accessibility label/review metadata、unsupported feature diagnostics、renderer conformance fixture、DOM no-innerHTML smoke、Canvas2D rich text trace、Sinan-like Gate Demo rich text fixture 和 JSON-only audit export。

必须遵守：
- Host / Sinan RuntimeUISystem 仍拥有 localized text content、markup policy、sanitization、narrative state、accessibility review、text measurement policy、text measurement source、font selection policy 和 platform policy。
- LudoWeave 只描述 JSON-only inline text runs、semantic spans、renderer hints、theme token references、plain text fallback、a11y labels、diagnostics、ActionRef outputs 和 renderer trace。
- core 不依赖 React、Three、Pixi、WebGPU、Sinan、DOM renderer、Canvas renderer、Markdown parser、HTML parser、Ajv 或 schema runtime dependency。
- core 和 renderer 不解析 HTML，不使用 innerHTML，不内置 Markdown parser，不实现 rich text editor，不处理 IME、editing、selection、clipboard、bidi shaping、hyphenation、font fallback 或 browser text engine replacement。
- core 和 renderer 不直接读取 DOM measurement、IntersectionObserver、ResizeObserver、browser scroll state、wheel/touch/keyboard/gamepad/native input events、collection datasource 或 platform input state。
- DOM 和 Canvas2D renderer 只消费 ResolvedUiFrame、rich text metadata 和既有 frame metadata；不成为 text content、sanitization、layout measurement、a11y review、input 或 dispatch 的事实源。
- Canvas2D 只能 trace rich text run geometry / span metadata / fallback text / action target ids；不 dispatch，不 mutate selection、scroll、text content 或 accessibility state。
- v0.8 不做真实 Sinan import、project JSON mutation、Sinan React Editor replacement、production Canvas2D、full DevTools、Pixi/WebGPU、virtual list datasource、rich text editor、HTML/Markdown import pipeline 或 runtime text shaping engine。

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
- `docs/release/ludoweave-v0.7-final-report.md`
- `docs/release/ludoweave-v0.7-final-validation-log.md`
- `docs/roadmap/ludoweave-v0.7-integration-status.md`
- `docs/runtime-ui/virtual-list-metadata-contract.md`
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md`
- `docs/runtime-ui/scroll-metadata-contract.md`
- `docs/runtime-ui/focus-navigation-contract.md`
- `docs/sinan-cooperation/ludoweave-v0.4-sinan-contract-spike-notes.md`
- `docs/architecture/ludoweave-v0.1-technical-architecture.md`
- `docs/adr/0001-runtime-ui-only.md`
- `docs/adr/0002-headless-first-and-full-frame-snapshot.md`
- `docs/adr/0003-actionref-no-arbitrary-callback.md`
- `docs/adr/0004-dom-renderer-consumes-core-layout.md`

v0.7 PASS 证据：
- `Validate.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `pnpm validate`: PASS.
- `pnpm test:e2e`: PASS.
- `pnpm test:a11y`: PASS.
- `pnpm format`: PASS.
- `git diff --check`: PASS.
- `git status --short --branch`: clean, `main...origin/main`.
- Remote `main`: `2fc76bffa7fbd60868123c04f77919b31cecfa87`.
- Final test count: 61 test files, 231 tests passed.

v0.8 选择说明：
- v0.7 final report 推荐下一步在 bounded Runtime UI metadata track 或真实 Sinan handoff checklist 中择一推进。
- 当前 workspace 没有真实 Sinan repo 或真实 Sinan Editor surface，因此本轮不做真实集成。
- `docs/roadmap/ludoweave-v0.3-bounded-future-tracks.md` 已定义 Rich Text Track 的 source-of-truth、non-goals、fixtures 和 entry criteria。
- 本阶段只选择 Rich Text Metadata，不同时推进 real Sinan integration、production Canvas2D、full DevTools、HTML/Markdown parser 或 editor capability。

## 2. 本阶段要完成什么

v0.8 要完成：

- Rich text metadata contract，包含 text block id、locale hint、plain text fallback、inline text runs、semantic span ids、renderer hints、theme token references、a11y label/review metadata、host policy flags 和 diagnostics。
- Host-owned rich text policy contract，明确 localized content、markup policy、sanitization、narrative state、text measurement、font policy 和 a11y review 全部由 host 提供。
- Serializable inline run fixtures，覆盖 emphasis、speaker、tone、choice hint、disabled/locked reason、theme token reference、nested span flattening 和 unsupported span fallback。
- Plain text fallback fixture，证明 renderer 可以在不解析 rich markup 的情况下输出稳定可审阅文本。
- Unsupported rich text feature diagnostics，覆盖 unsupported span type、missing fallback text、invalid token reference、host sanitization missing、non-serializable payload、empty run 和 nested span overflow。
- Theme token integration fixture，证明 rich text spans 只引用 token，不内置 renderer-specific style object。
- Accessibility label fixture，保留 host-reviewable label、description、live region policy 和 pronunciation hint 元数据，但不生成平台 a11y side effects。
- Renderer conformance fixture，证明 headless / DOM / Canvas2D 消费同一个 `ResolvedUiFrame` 和 rich text metadata，不重新解析 markup 或测量文本。
- DOM playground smoke，证明不使用 `innerHTML`，只以 text nodes / safe attributes / metadata sidecar 展示 rich text metadata。
- Canvas2D rich text trace，trace run geometry、span metadata、fallback text、theme token ids 和 action target ids，不实现 text shaping engine。
- Sinan-like Gate Demo rich text fixture，包含 host-owned localized text sequence、registry mock results、fallback policy 和 validation hook layer。
- Rich text audit export，输出 JSON-only text / span / fallback / a11y / registry / diagnostics review payload。
- Docs：v0.8 integration status、runtime UI rich text metadata contract、release notes draft、final validation log、final report。

## 3. 本阶段不做什么

v0.8 不做：

- 不做真实 Sinan import。
- 不读取或修改 Sinan project JSON。
- 不替换 Sinan React Editor。
- 不接管 Director、Timeline、Event、command、save、undo、route persistence、collection datasource、data loading、selection state、scroll state、gameplay state、localized content source、sanitization 或 a11y side effects。
- 不解析 HTML，不使用 `innerHTML`，不在 core 内置 Markdown parser。
- 不实现 rich text editor、IME、editing selection、clipboard、copy/paste、text input composition 或 contenteditable。
- 不实现 bidi shaping、hyphenation、font fallback、line breaking engine、browser text engine replacement 或 text measurement engine。
- 不读取 DOM `scrollTop` / `scrollLeft`、DOM measurement、IntersectionObserver、ResizeObserver、native input events 或 datasource state。
- 不引入 schema runtime dependency、Ajv、React types、Sinan types、DOM renderer dependency 或 Canvas renderer dependency 到 core。
- 不实现 production Canvas2D、Pixi/WebGPU、full DevTools、real localization pipeline、real HTML/Markdown import pipeline 或 virtualized rich text DOM pool。
- 不扩大 v0.7 virtual list metadata 边界。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本轮相关文档和上一轮总结。
3. 确认没有无关未提交文件会被误纳入本轮。
4. 只处理本轮范围内的最小可验证增量。

Debug 自检：
- 当前改动能否用最小 fixture 或用户 workflow 解释？
- 如果失败，能否定位到 tooling、runtime、rich text metadata、host policy、diagnostics、adapter、registry、renderer、browser smoke 或 docs 层？
- 成功、失败、空输入、过期输入、不兼容输入是否在相关位置覆盖？
- 如果 UI 改动，是否有可重复的 smoke、snapshot 或 conformance 验证？
- 如果 state/protocol 改动，是否覆盖 mapping、usage/audit、validate 或 migration 边界？
- 如果涉及 rich text，是否覆盖 plain fallback、unsupported span、invalid token、host sanitization missing、a11y review metadata 和 no-innerHTML path？

架构自检：
- Host / Sinan RuntimeUISystem 是否仍是 localized content、markup policy、sanitization、narrative state、a11y review 和 text measurement 的 source-of-truth？
- core 是否仍无 React、Three、Pixi、WebGPU、Sinan、DOM/Canvas renderer、Markdown parser、HTML parser、Ajv 依赖？
- core/renderer 是否没有直接读取 DOM measurement、browser scroll state、native input events、datasource state 或 platform input？
- ActionRef 是否仍无 arbitrary callback？
- `ResolvedUiFrame` 是否仍是 renderer 边界？
- DOM 和 Canvas2D renderer 是否只消费 resolved nodes 和 rich text metadata？
- Sinan-like adapter 是否仍在 example/fixture scope，不进入 core？
- Rich text metadata 是否没有泄露 DOM node、native event、Gamepad object、React component、Promise、closure、HTML string parser state 或 datasource object？
- 本轮是否避免把 v0.9/v1 范围拉入 v0.8？
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

### Round 1: v0.8 Contract Baseline

目标：
- 建立 v0.8 integration status 文档。
- 明确本阶段是 Bounded Rich Text Metadata track。
- 记录本阶段不做真实 Sinan、HTML/Markdown parser、rich text editor、text shaping engine 或 production Canvas2D。

验证：
- `git diff --check`
- `pnpm format`
- `Validate.cmd`

### Round 2: Rich Text Metadata Contract

目标：
- 定义 JSON-only rich text metadata。
- 包含 text block id、locale hint、plain text fallback、inline runs、semantic span ids、renderer hints、theme token refs、a11y review metadata、host policy flags 和 diagnostics。
- 保持 renderer-free、Sinan-free、parser-free。

验证：
- core contract tests。
- `pnpm typecheck`
- `pnpm api-check`

### Round 3: Host Rich Text Policy Contract

目标：
- 定义 host-owned rich text policy contract。
- 明确 localized content、markup policy、sanitization、narrative state、text measurement、font policy、a11y review 全部由 host 提供。
- LudoWeave 只接收已审阅 metadata 和 ActionRef-only output。

验证：
- host policy tests。
- no callback / serializability tests。
- boundary check。

### Round 4: Inline Run Fixture

目标：
- 建立 serializable inline run fixture。
- 覆盖 emphasis、speaker、tone、choice hint、disabled/locked reason、nested span flattening 和 deterministic ordering。
- 不引入 HTML/Markdown parser。

验证：
- fixture tests。
- snapshot tests。
- `pnpm validate`

### Round 5: Plain Text Fallback Fixture

目标：
- 建立 plain text fallback fixture。
- 证明 renderer 可在不解析 rich markup 的情况下输出稳定可审阅文本。
- 覆盖 empty text、missing fallback、fallback/run mismatch 和 locale hint。

验证：
- fallback tests。
- headless snapshot tests。
- `pnpm validate`

### Round 6: Rich Text Diagnostics

目标：
- 覆盖 unsupported span type、missing fallback text、invalid token reference、host sanitization missing、non-serializable payload、empty run 和 nested span overflow。
- diagnostics code 稳定并可用于 audit export。

验证：
- diagnostics tests。
- snapshot tests。
- `pnpm validate`

### Round 7: Theme Token Integration

目标：
- Rich text spans 只引用 theme token，不内置 renderer-specific style object。
- 覆盖 missing token、unsupported token scope、disabled state token 和 selected/focused token context。
- 保持 core 不依赖 DOM/CSS/Canvas style 类型。

验证：
- token integration tests。
- `pnpm structure-check`
- `pnpm api-check`

### Round 8: Accessibility Review Metadata

目标：
- 增加 host-reviewable label、description、live region policy 和 pronunciation hint metadata。
- 不生成平台 a11y side effects，不读取 DOM accessibility tree。
- 覆盖 missing host review、unsupported live policy 和 fallback label。

验证：
- a11y metadata tests。
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 9: Renderer Conformance Frame

目标：
- 将 rich text metadata 加入 shared renderer conformance fixture。
- headless / DOM / Canvas2D 消费同一 `ResolvedUiFrame` 和 metadata sidecar。
- 防止 renderer 重新解析 markup、测量文本或接管 sanitization。

验证：
- renderer conformance tests。
- `pnpm structure-check`
- `pnpm api-check`

### Round 10: DOM No-innerHTML Smoke

目标：
- Playground 展示 rich text metadata、plain fallback、a11y metadata、diagnostics 和 host policy flags。
- DOM path 只使用 safe text nodes / attributes / metadata sidecar，不使用 `innerHTML`。
- 保持 a11y smoke 通过。

验证：
- DOM renderer tests。
- `pnpm test:e2e`
- `pnpm test:a11y`
- `Smoke.cmd`

### Round 11: Canvas2D Rich Text Trace

目标：
- Canvas2D trace run geometry、span metadata、fallback text、theme token ids 和 action target ids。
- 不实现 text shaping engine，不读取 input，不 dispatch，不 mutate text/selection/scroll state。
- 覆盖 unsupported span、missing fallback 和 invalid token trace。

验证：
- Canvas2D trace tests。
- renderer conformance subset。
- `pnpm validate`

### Round 12: Sinan-like Fixture, Audit Export, Docs

目标：
- 扩展 Gate Demo fixture，加入 host-owned localized text sequence、registry mock results、fallback policy 和 validation hook layer。
- 输出 JSON-only text / span / fallback / a11y / registry / diagnostics audit payload。
- 输出 `docs/runtime-ui/rich-text-metadata-contract.md`，更新 docs index、integration status、release notes draft。

验证：
- Gate Demo contract tests。
- audit export tests。
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
- 修复 rich text metadata、host policy、diagnostics、conformance、DOM/Canvas drift。

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
- 全量验证 v0.8 PASS。
- 输出 final report、validation log、recommended v0.9 entry。
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
| E2E smoke | `pnpm test:e2e` | Round 10 |
| A11y smoke | `pnpm test:a11y` | Round 8 |
| Formatting | `pnpm format` | Every docs/UI round |
| Docs whitespace | `git diff --check` | Every docs round |
| Remote push | git wrapper or `git push` | Every completed round |

## 8. PASS 标准

v0.8 PASS 需要全部满足：

- v0.1 到 v0.7 PASS 标准没有回退。
- Rich text metadata 覆盖 text block id、locale hint、plain text fallback、inline runs、semantic span ids、renderer hints、theme token refs、a11y review metadata、host policy flags 和 diagnostics。
- Host rich text policy contract 明确 localized content、markup policy、sanitization、narrative state、text measurement、font policy、a11y review 全部由 host 提供。
- Inline run fixtures 覆盖 emphasis、speaker、tone、choice hint、disabled/locked reason、theme token reference、nested span flattening 和 unsupported span fallback。
- Plain text fallback 在 headless / DOM / Canvas2D 路径均可审阅。
- Diagnostics 覆盖 unsupported span type、missing fallback text、invalid token reference、host sanitization missing、non-serializable payload、empty run 和 nested span overflow。
- Theme token integration 只引用 token，不内置 renderer-specific style object。
- Accessibility metadata 是 host-reviewable，不生成平台 a11y side effects。
- Renderer conformance 证明 headless / DOM / Canvas2D 消费同一 resolved frame 和 rich text metadata。
- DOM playground rich text smoke 不使用 `innerHTML`。
- Canvas2D rich text trace 不读取 input、不 dispatch ActionRef、不 mutate text/selection/scroll state。
- Sinan-like Gate Demo fixture 包含 host-owned localized text sequence 和 registry mock results。
- Rich text audit export 是 JSON-only 且无 callback/native/parser/datasource object。
- `docs/runtime-ui/rich-text-metadata-contract.md` 已完成。
- 没有真实 Sinan import、project JSON mutation、React Editor replacement。
- 没有 HTML/Markdown parser、rich text editor、IME/editing/clipboard、text shaping engine、font fallback engine、production Canvas2D。
- `Validate.cmd`、`Smoke.cmd`、`pnpm validate`、`pnpm test:e2e`、`pnpm test:a11y`、`pnpm format` 全部通过。
- Final report 和 validation log 已提交并推送。

## 9. 最终报告模板

```markdown
# LudoWeave v0.8 Final Report

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
- Host rich text source-of-truth:
- Host sanitization source-of-truth:
- Host text measurement source-of-truth:
- No HTML/Markdown parser or innerHTML:
- ActionRef no callback:
- Renderer consumes ResolvedUiFrame:
- Canvas2D trace isolation:
- No real Sinan scope creep:
- Sinan boundary:

## Known Limitations

- ...

## Recommended v0.9 Entry

- ...
```
