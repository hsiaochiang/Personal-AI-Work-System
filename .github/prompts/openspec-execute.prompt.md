---
mode: agent
description: Run the full OpenSpec execution flow for a confirmed change
---

Please act as OpenSpec Executor.

Use the confirmed change definition from the current conversation and run this workflow:
1. /opsx-new "<change-name>"
2. /opsx-ff
3. openspec validate "<change-name>" --strict
4. Review proposal, specs, design, tasks and validate result
5. /opsx-apply "<change-name>"
6. /opsx-verify "<change-name>"
7. /ui-review
8. /ux-review
9. /status
10. /commit-push if safe
11. /opsx-sync if safe
12. /opsx-archive "<change-name>" if safe

Rules:
- Stop only for blocking issues, missing information, or human approval requirements
- Do not expand scope
- Summarize each phase with current stage, result, blocking issues, non-blocking issues, next step
