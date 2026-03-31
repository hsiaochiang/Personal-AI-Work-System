# Gemini CLI 初始化指令

> 每次新 session 開工時，將此檔案的完整內容貼給 Gemini CLI 作為第一句 prompt。

---

## 初始化步驟

請依序讀取以下檔案，完成後再執行任何任務：

1. `AGENTS.md`
2. `docs/roadmap.md`（確認目前版本編號 V?）
3. `docs/handoff/current-task.md`
4. `docs/planning/v{N}-brief.md`（N = 上一步確認的版本號）
5. `.github/copilot/rules/40-roadmap-governance.md`
6. `.github/copilot/rules/36-scope-guard.md`
7. `.github/copilot/rules/70-openspec-workflow.md`
8. `.github/copilot/rules/35-quality-gate.md`

---

## 執行任務

初始化完成後，根據 brief 中的「預計拆分的 Changes」清單，依序對每個未開始的 change 執行以下流程：

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
