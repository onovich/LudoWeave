# LudoWeave v0.2 Final Validation Log

Date: 2026-06-21

Source validation HEAD: `6ae321e fix(example): export objective action mapping`

## Result

PASS.

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `Validate.cmd` | PASS | Ran configured ops wrapper: lint, typecheck, build, test, structure-check, api-check. |
| `pnpm lint` | PASS | ESLint completed without findings. |
| `pnpm typecheck` | PASS | 8 of 9 workspace projects typechecked. |
| `pnpm test` | PASS | 31 test files, 88 tests passed. |
| `pnpm build` | PASS | 8 workspace project builds passed; playground Vite build passed. |
| `pnpm structure-check` | PASS | 5 import boundary rules passed. |
| `pnpm api-check` | PASS | API Extractor completed successfully. |
| `pnpm validate` | PASS | Full validation pipeline passed. |
| `pnpm test:e2e` | PASS | 1 Playwright Chrome test passed. |
| `pnpm test:a11y` | PASS | 1 Playwright Chrome axe test passed. |
| `pnpm format` | PASS | All matched files use Prettier style. |
| `git diff --check` | PASS | No whitespace errors. |
| `git status --short --branch` | PASS | `## main...origin/main` before final report files. |
| `git ls-remote origin refs/heads/main` | PASS | Remote main at `6ae321eaaadaffda85aafe6c5ab60384e5eb9a80`. |

## Notes

- The final report and this validation log are documentation-only artifacts created after the source validation matrix.
- The ops workflow wrapper is real and runs the configured `pnpm` commands.
- Playwright e2e and a11y smoke commands were run sequentially to avoid dev-server port contention.
