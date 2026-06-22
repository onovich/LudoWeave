# Role Routing

```yaml
workspace: D:\LabProjects\Engine\LudoWeave
created_at: 2026-06-22 16:32:09 +08:00
updated_at: 2026-06-23 00:33:07 +08:00

planner:
  thread_id: 019ee4c2-4a41-7530-86fe-5de7de2e3150
  role: strategist / architect / planner / checker
  evidence: Same-workspace active thread titled "strategic"; it contains the project planning, acceptance, and CheckAndGoal flow.

executor:
  thread_id: 019ee57b-589c-7153-9a74-308df8bb8281
  role: main programmer / executor / donextgoal runner
  evidence: Same-workspace idle thread titled "main programmer"; initial prompt assigns main programmer role and invokes $donextgoal.

routing_notes:
  check_failed: planner -> executor repair request
  fix_done: executor -> planner re-check request
  check_passed: planner runs GoalNext, GoalNext dispatches DoNextGoal
```
