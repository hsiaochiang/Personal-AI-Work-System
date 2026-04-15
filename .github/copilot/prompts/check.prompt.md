---
name: check
description: "Use when: Codex CLI 執行完一個 change，要驗收產出品質。Does: 從 code、文件、test 三個角度外部驗證品質，不信任 agent 自報。Returns: 品質報告（通過/失敗/待修）+ 必要的修正建議。"
agent: agent
---

請以外部驗證者角色執行 Change 驗收。不信任 agent 自報的結果，從實際產出反向確認。

## 驗收三層

### Layer 1：Code Review
- 使用 `code-reviewer` skill 審查本次 change 涉及的檔案
- 重點：邏輯正確性、邊界條件、安全性（OWASP Top 10）
- 輸出：通過 / 有疑慮（列出具體問題）

### Layer 2：Smoke Test
- 使用 `smoke-tester` skill 對新功能執行冒煙測試
- 重點：黃金路徑是否可走通，不追求完整覆蓋
- 輸出：通過 / 失敗（列出失敗步驟）

### Layer 3：文件同步掃描
- 確認下列文件是否已反映本次 change：
  - [ ] `docs/system-manual.md` — 功能描述是否更新
  - [ ] `docs/roadmap.md` — Change 狀態是否標記為完成
  - [ ] `docs/handoff/current-task.md` — 是否已更新到下一個任務
  - [ ] `openspec/changes/<change-name>/` — proposal.md 是否有完成記錄
- 輸出：已同步 / 有缺漏（列出缺漏的文件）

## 最終判定

| 層次 | 結果 |
|------|------|
| Code Review | — |
| Smoke Test | — |
| 文件同步 | — |
| **整體判定** | **通過 / 待修 / 阻塞** |

若整體判定為「待修」或「阻塞」，列出：
1. 必須修正的問題（blocking）
2. 建議修正的問題（non-blocking）
3. 可接受的已知限制（waived）
