# Codex CLI 初始化指令

> 每次新 session 開工時，將此檔案內容貼給 Codex 作為第一句 prompt。
> 或直接使用 `docs/agents/codex-prompts/v{N}/` 下已備好的三角色提示詞。

---

## 初始化步驟

請依序讀取以下檔案，完成後再執行任何任務：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/handoff/blockers.md`
4. `docs/roadmap.md`（確認目前版本編號 V?）
5. `docs/planning/v{N}-brief.md`（N = 上一步確認的版本號）
6. `docs/system-manual.md`
7. `docs/agents/project-context.md`
8. `docs/agents/commands.md`
9. `docs/agents/agent-entrypoints.md`
10. `.github/copilot/rules/40-roadmap-governance.md`
11. `.github/copilot/rules/36-scope-guard.md`
12. `.github/copilot/rules/70-openspec-workflow.md`
13. `.github/copilot/rules/35-quality-gate.md`
14. `TEMPLATE-FILES.md`（確認 managed / protected / init-only 邊界）

初始化 Gate：

- 若找不到當前版本的 `docs/planning/v{N}-brief.md`，請停下回報。
- 若 `docs/handoff/blockers.md` 有 blocking issue 且無 workaround，請停下回報。

---

## Codex CLI 特有注意事項

- **`.github/agents/*.agent.md` 是角色規格書（role specs），不是 Codex 原生 agent。**
  請用 `read_file` 工具讀取，再依角色行動，不要期望 `@planner` 等原生語法。
- **角色切換時開新 session**，不要 resume。每個 session 只扮演一個角色。
- 啟動命令：`codex -C <repo-path>`；同角色續接：`codex resume --last -C <repo-path>`

---

## 三角色執行流程

### Step 1：規劃（Planner）

讀取 `.github/agents/openspec-planner.agent.md`，依照其中的角色定義、前置檢查與工作原則，
依照 brief 的 spec + acceptance criteria 產出：

- change name
- scope / non-scope
- acceptance criteria（直接從 brief 轉化，不自行增減）
- 主要風險

產出後等待確認，確認無誤再繼續。

### Step 2：執行（Executor）

讀取 `.github/agents/openspec-executor.agent.md`，依照其中的角色定義與前置檢查執行：

```
/opsx-new "<change-name>"
/opsx-ff
/opsx-apply "<change-name>"
/opsx-verify "<change-name>"
```

### Step 3：把關（Review Gate）

讀取 `.github/agents/review-gate.agent.md`，依照其中的角色定義做最終把關。
確認通過後執行 `/commit-push`。

---

## 執行原則

- 遇到 blocking issue 請**停下回報**
- 無 blocking issue 請**連續推進**，不需每步等待確認
- 嚴格依 brief 的 In Scope 執行，不可自行擴大需求
- 每個階段簡短回報：當前階段、執行摘要、blocking issues、下一步
- 若需修改 managed files，先明確說明風險並取得確認；可自訂內容優先落在 protected / project-owned 區域

## 每個 Change 完成後的強制收尾（缺一不可）

1. 更新 `docs/handoff/current-task.md`
   - Done：新增本 change（含日期與 commit hash）
   - In Progress / Next Step：切換到下一個 change
   - Files Touched / Validation Status：更新為本次實際結果

2. 依情境更新治理文件
   - 若影響版本規劃或下一步安排：更新 `docs/roadmap.md`
   - 若有 scope / non-scope 或重要決策改變：更新 `docs/decision-log.md` 與對應 decision 檔
   - 若出現新阻塞：更新 `docs/handoff/blockers.md`

3. 完成驗證再提交
   - 最低要求：`opsx-verify` / smoke / 必要測試為 PASS（或記錄可接受風險）

4. `git add -A && git commit && git push`
   - 若無 blocking，應推送到遠端分支，不只停在本地 commit
   - 若因權限或環境限制無法 push，需明確回報「未 push 原因 + 本地 commit hash」
