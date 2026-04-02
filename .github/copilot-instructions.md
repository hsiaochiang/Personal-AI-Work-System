# GitHub Copilot 工作規範（自動載入）

> 本檔案在每次 Copilot 對話時自動載入。跨 agent 共用入口請先看 `AGENTS.md`；詳細規範請參閱 `.github/copilot/rules/` 與 `.github/copilot/skills/`。

## 基本輸出規則（強制）
- 回覆與說明：**一律使用正體中文**
- 可上網查適合的工具或套件（請附來源連結）
- 對使用者提供的文件：以中文為主；若必須用英文，請在備註區用中文說明

## 治理與留痕（強制）
- 討論結論必須寫入文件（`docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/` / `docs/uiux/` / `docs/bugs/` / `docs/qa/`）
- 維持 `docs/roadmap.md` 最新（回答「目前在哪個階段」）
- 任務交接採事件驅動更新：`docs/handoff/current-task.md` / `docs/handoff/blockers.md`
- 每次 Implement 後：add/commit/push，commit log 使用**繁體中文**（含 What / Why / Impact / Evidence）

## 多 Agent 協作（Copilot / Codex / Gemini）
- 先讀 `AGENTS.md`，再讀 `docs/agents/project-context.md` 與 `docs/agents/commands.md`
- 長期證據沿用 `docs/roadmap.md` / `docs/decision-log.md` / `docs/runlog/`
- 短期交接使用 `docs/handoff/current-task.md` 與 `docs/handoff/blockers.md`
- 不要求每次 prompt 更新 handoff；只在任務開始、子任務完成、遇到 blocker、切換 agent、session 收尾時更新
- agent 可更新進度與驗證狀態，但不可自行默默決定 scope 變更、架構重寫、重大 dependency、新的 release 決策

## Smallest Safe Change（最小安全修改）
- 僅做必要修改；可共用的要共用化
- 沒有證據不得宣稱「已修好」或「已符合」

## 品質門檻（Done Gate）
- UI 修改 → 必須更新 `docs/uiux/<date>_ui-review.md`
- UX 流程修改 → 必須更新 `docs/uiux/<date>_ux-review.md`
- Bug 修復 → 必須產出 `docs/bugs/<date>_<slug>.md` + `docs/qa/<date>_smoke.md`
- 未通過門檻不得宣稱 Done

## 使用者驗證 Checklist（每個 Change 完成時）
每個 change 在宣告完成前，使用者應確認：
- [ ] **Smoke 文件存在**：`docs/qa/<date>_<change-name>-smoke.md` 已產出，且全部項目通過
- [ ] **純邏輯 change**：若 design.md 不含 UI 關鍵字，ui-review / ux-review 欄位顯示 `—`（不適用）
- [ ] **UI/UX change**：若 design.md 含 UI 關鍵字，ui-review 與 ux-review 文件已產出
- [ ] **Tasks 全打勾**：`tasks.md` 所有 `- [ ]` 已改為 `- [x]`
- [ ] **已 commit + push**：`git log` 可看到對應 commit
- [ ] **已歸檔**：`openspec/changes/archive/<date>-<name>/` 目錄存在
- [ ] **Brief 狀態更新**：`docs/planning/v{N}-brief.md` 的 Changes 表中該 change 狀態已更新為「已完成」

> 驗證方法：呼叫 `@WOS` → 輸入 `#progress`，確認進度表中該 change 的 smoke 欄為 ✅、狀態為「已歸檔」

## 範圍護欄
- 一次改動超過 5 個檔案 → 先記錄決策（`docs/decisions/`）
- 需要改動 Style Contract → 先記錄決策
- 同一問題第 3 次未收斂 → 換策略

## 流程導航與自動執行（Agents）
- 呼叫 `@WOS` 可自動偵測目前狀態並建議下一步
- 呼叫 `OpenSpec Planner` 可先整理 change name / scope / acceptance criteria
- 呼叫 `OpenSpec Executor` 可依已確認的 change 定義自動接續執行 Change Lifecycle
- 呼叫 `Review Gate` 可在收尾前做最終 Gate Review
- WOS 會檢查：roadmap 階段、Change 狀態、git 狀態、今日 runlog
- 不確定該執行什麼時，優先呼叫 `@WOS`
- 要開始新 Change 時，優先先用 `OpenSpec Planner`
- 已有明確 change 定義時，再交給 `OpenSpec Executor`

## 開工流程（每次新任務）
0. 先閱讀 `AGENTS.md`，確認本次是否需要沿用 handoff
1. 呼叫 `@WOS`、`OpenSpec Planner`、`OpenSpec Executor` 或執行 `#session-start`
2. 閱讀 `.github/copilot/rules/` 下所有規範
3. 確認目前階段（`docs/roadmap.md`）
4. 確認當前版本 brief（`docs/planning/v{N}-brief.md`），掌握這一版的 scope 與完成條件
   - 4a. 確認 brief 的「使用者確認」區段已填寫（確認日期不為空）—— 若未確認，不可開新 change
   - 4b. 確認 brief 的 Changes 表各項都有狀態欄位（未開始 / 進行中 / 已歸檔）
5. 初始化當日 runlog（`docs/runlog/<date>_README.md`）
6. 檢查 Style Guide 狀態（PENDING/FROZEN）
7. 若是接手中的任務，先同步檢查 `docs/handoff/current-task.md` / `docs/handoff/blockers.md`
8. 回報啟用證據：已讀規範清單、本次使用的角色、產出的證據位置

## 任務觸發（依任務類型讀取對應文件）
| 任務 | Prompt 觸發 | 必讀規範 | 使用角色 | 產出 |
|------|------------|---------|---------|------|
| 開工 | `#session-start` | 全部 rules | — | runlog 初始化 |
| Change 規劃 | `OpenSpec Planner` | `rules/36-scope-guard.md` + `rules/70-openspec-workflow.md` | `openspec-conductor.md` | change 定義摘要 |
| 完整流程自動執行 | `OpenSpec Executor` / `#openspec-execute` | `rules/35-quality-gate.md` + `rules/70-openspec-workflow.md` | `openspec-conductor.md` + `code-reviewer.md` + `git-steward.md` | 依狀態自動推進 Change |
| 最終 Gate | `Review Gate` | `rules/35-quality-gate.md` + `rules/70-openspec-workflow.md` | `code-reviewer.md` | commit/sync/archive 建議 |
| UI 調整 | `#ui-review` | `rules/10-style-guide.md` | `skills/ui-designer.md` | `docs/uiux/<date>_ui-review.md` |
| UX 流程 | `#ux-review` | `rules/20-ux-flow.md` | `skills/ux-fullstack-engineer.md` | `docs/uiux/<date>_ux-review.md` |
| 修 Bug | — | `rules/30-debug-contract.md` | `skills/debug-sheriff.md` + `skills/smoke-tester.md` | `docs/bugs/` + `docs/qa/` |
| 新功能實作 | `#opsx-new` → `#opsx-ff` → `#opsx-apply` | `rules/50-tech-stack.md` + `rules/70-openspec-workflow.md` | `skills/openspec-conductor.md` | spec + runlog + smoke |
| 驗證 | `#opsx-verify` | `rules/35-quality-gate.md` | — | 驗證報告 |
| Code Review | `#code-review` | `rules/50-tech-stack.md` + `rules/60-testing.md` | `skills/code-reviewer.md` | review 記錄 |
| 冒煙測試 | `#smoke-test` | — | `skills/smoke-tester.md` | `docs/qa/<date>_smoke.md` |
| 提交推送 | `#commit-push` | — | `skills/git-steward.md` + `skills/code-reviewer.md` | commit + push |
| 狀態更新 | `#status` | — | — | roadmap + runlog 更新 |
| 記錄決策 | `#log-decision` | — | — | `docs/decision-log.md` + `docs/decisions/` |
| 歸檔 | `#opsx-archive` | — | — | change 歸檔 |
| Agent/Skill/Rule 撰寫 | — | `rules/85-agent-skill-authoring.md` | — | `.agent.md` / `skills/*.md` / `rules/*.md` |
| Session 結束 | `#session-close` | — | `skills/scribe.md` | `experience/<YYYY-MM>/slides_<date>.md` |

## 證據結構
```
docs/
├─ roadmap.md              # 階段追蹤
├─ system-manual.md        # 系統操作手冊（面向使用者）
├─ decision-log.md         # 決策留痕
├─ decisions/<date>_*.md   # 決策詳情
├─ planning/v{N}-brief.md  # 版本確認書（含需求確認）
├─ agents/*.md             # 跨 agent 共用背景與命令
├─ handoff/*.md            # 任務交接（current-task / blockers）
├─ runlog/<date>_*.md      # 每日進度
├─ uiux/<date>_*.md        # UI/UX 審查
├─ bugs/<date>_*.md        # Bug 修復
└─ qa/<date>_*.md          # Smoke 測試
```

## 啟用證據（每次回覆強制包含）
- 已讀入的規範清單
- 本次使用的角色
- 產出的證據位置（文件路徑）
