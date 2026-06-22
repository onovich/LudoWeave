# Role Routing

```yaml
workspace: D:\LabProjects\Engine\LudoWeave
created_at: 2026-06-22 16:32:09 +08:00
updated_at: 2026-06-22 23:59:00 +08:00

planner:
  thread_id: 019ee4c2-4a41-7530-86fe-5de7de2e3150
  role: strategist / architect / planner / checker
  evidence: Same-workspace active thread titled "strategic"; it contains the project planning, acceptance, and CheckAndGoal flow.

executor:
  thread_id: 019ee57b-589c-7153-9a74-308df8bb8281
  role: main programmer / executor / donextgoal runner
  evidence: Same-workspace idle thread titled "main programmer"; initial prompt assigns main programmer role and invokes $donextgoal.

active_goal_phase: v0.8 Bounded Rich Text Metadata
active_goal_guide: docs/goal-mode/ludoweave-v0.8-goal-mode-execution-guide.md

last_check_status: PASS
last_planner_dispatch: 2026-06-22 22:45:37 +08:00
last_planner_dispatch_status: sent
last_planner_dispatch_guide: docs/goal-mode/ludoweave-v0.8-goal-mode-execution-guide.md
last_planner_dispatch_commit: abb5251
last_executor_report_commit: 76b64f4
last_executor_report_status: PASS
last_executor_report_at: 2026-06-22
last_executor_report_guide: docs/goal-mode/ludoweave-v0.8-goal-mode-execution-guide.md
last_executor_report_notification: sent
last_executor_report_thread: 019ee4c2-4a41-7530-86fe-5de7de2e3150
last_executor_report_final_commit: fd97f0d

routing_notes:
  check_failed: planner -> executor repair request
  fix_done: executor -> planner re-check request
  check_passed: planner runs GoalNext, GoalNext dispatches DoNextGoal
```
