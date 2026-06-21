<!-- codex-project-ops-workflow: initialized -->
<!-- initialized-at: 2026-06-20 19:24:38 +08:00 -->

# Codex Ops Workflow

Initialization status: initialized
Project: LudoWeave
Repository root: D:/LabProjects/Engine/LudoWeave
Machine config: `.codex\project-ops-workflow.json`
Skill: project-ops-workflow

Treat this document and .codex/project-ops-workflow.json as the source of truth for mechanical project operations.

## Global Wrappers

```
powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\EnvCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\RestoreDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\InstallDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Build.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Test.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Lint.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Format.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Typecheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StructureCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Codegen.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\DocsCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Package.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

## Validate Sequence

lint, typecheck, build, test, structureCheck, docsCheck

## Configured Commands

As of v0.2 Round 1, `.codex/project-ops-workflow.json` is wired to real project commands. `Validate.cmd` runs the validate sequence above through the configured operations:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm structure-check`
- `pnpm api-check`

`Smoke.cmd` runs the browser smoke commands:

- `pnpm test:e2e`
- `pnpm test:a11y`

`RestoreDeps.cmd` and `InstallDeps.cmd` both run `pnpm install`. `Format.cmd` runs `pnpm format`.

## Dev Server

Start command: ``
Health URL: ``
Ready text: ``
Timeout seconds: 30

## Safety Policy

Do not run destructive clean/reset/deploy commands unless the user explicitly asks.
