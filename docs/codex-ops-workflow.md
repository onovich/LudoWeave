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

## Known Workflow Gap

The machine config is initialized, but the operation command arrays in `.codex/project-ops-workflow.json` are still empty. As of v0.1 acceptance on 2026-06-21, `Validate.cmd` reports no configured validation commands and does not run the real project checks.

For v0.1, final acceptance used the real `package.json` scripts directly:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm api-check`
- `pnpm structure-check`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm validate`

Next workflow cleanup should wire these commands into `.codex/project-ops-workflow.json` so future Codex agents can rely on the ops wrappers without accidentally treating a no-op as validation.

## Dev Server

Start command: ``
Health URL: ``
Ready text: ``
Timeout seconds: 30

## Safety Policy

Do not run destructive clean/reset/deploy commands unless the user explicitly asks.
