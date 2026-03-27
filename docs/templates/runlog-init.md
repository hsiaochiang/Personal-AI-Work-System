# Runlog 初始化模板

> **用途**：每日工作開始時，複製本文件到 `docs/runlog/<YYYY-MM-DD>_README.md`，填入後作為當日進度記錄。
> **命名規則**：`docs/runlog/<YYYY-MM-DD>_README.md`（單一主檔，不加時間）。
> **更新時機**：每個工作段落完成後即時追加；不得回溯修改已完成段落。

---

# Runlog：[REQUIRED] `<YYYY-MM-DD>`

> 日期：[REQUIRED] `<YYYY-MM-DD>`
> Active Change：`<當前 OpenSpec change name 或「無」>`
> 負責 Agent：`<GitHub Copilot / Codex / 人工>`

---

## 摘要

[REQUIRED] `<用 1–3 句話描述今日主要完成了什麼、整體進展>`

---

## 完成項目

<!-- 每個已完成的工作，以 bullet 格式列出並附上產出路徑 -->

- `<完成事項 1>`
  - 產出：`<檔案路徑或命令結果>`
  - 驗證：`<PASS / 已目視確認 / N/A>`

- `<完成事項 2>`
  - 產出：`<檔案路徑>`
  - 驗證：`<狀態>`

---

## In Progress

<!-- 今日尚未完成，下個 session 繼續的項目 -->

- `<進行中事項 1>`：`<目前狀態說明>`

---

## Next Step

- [REQUIRED] `<下個 session 開始時第一步要做什麼，具體到可執行粒度>`

---

## 備忘 / 決策紀錄

<!-- 今日出現的重要決策、發現的問題、臨時判斷等，不適合寫入 decision-log 但值得留存 -->

- `<備忘 1>`

---

## 填寫範例

```markdown
# Runlog：2026-03-27

> 日期：2026-03-27
> Active Change：phase10-v2.5-multi-project-shared-capability-mvp
> 負責 Agent：GitHub Copilot

## 摘要
Phase 4（V2.5）tasks 1.x–6.x 全部執行完成，strict validate PASS，smoke PASS。
等待 Review Gate → archive。

## 完成項目

- Task 1.1 + 1.2：個人層/專案層邊界定義文件
  - 產出：`docs/workflows/v2-5-personal-project-boundary-v1.md`
  - 驗證：PASS（≥5 individual、≥5 per-project，≥3 原則）

- Task 3.1–3.4：跨專案模板集建立
  - 產出：`docs/templates/handoff-init.md`、`runlog-init.md`、`roadmap-init.md`、`decision-log-init.md`
  - 驗證：PASS（目視確認各模板含必填欄位）

- Task 6.1：strict validate
  - 產出：exit 0
  - 驗證：PASS

## In Progress
- 無（本 session 已完成所有 Phase 4 任務）

## Next Step
- 執行 Review Gate：呼叫 `/review-gate`
- 若 PASS，執行 `/opsx-archive phase10-v2.5-multi-project-shared-capability-mvp`
```
