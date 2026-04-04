## Why

V4 前四個治理 change 已經讓 `/memory` 與 `/decisions` 能看見健康度、疑似重複、規則衝突與跨專案共用知識候選，但這些能力仍然是「你要自己想到才會去看」。目前工作台沒有任何機制提醒你「這週該做一次治理巡檢了」，導致治理能力雖然存在，卻還沒形成可持續的節奏。

這個 change 以最小安全修改，先建立 read-only 的治理排程：使用 `web/governance.json` 定義哪些治理檢查啟用、多久檢一次、上次人工確認日期為何；server 啟動時依設定做 due-check，將到期的治理項目整理成 suggestion-only todo snapshot，並在 Overview 頁顯示。系統只提醒、不自動寫檔，讓使用者看到「現在該檢查什麼」後再自行決定是否處理。

## What Changes

- 新增 `web/governance.json`，定義治理排程的最小設定契約，包括全域啟用開關、每個 check 的頻率、上次人工確認日期與 due-check 門檻。
- 新增可重用的 governance scheduler utility，根據現有 `/api/memory`、shared knowledge 與規則衝突 summary 建立 startup governance snapshot，不引入 background daemon 或 cron。
- 更新 `web/server.js`，在 server 啟動時對已知專案做 governance due-check，並新增 `/api/governance` endpoint 回傳目前專案的治理待辦與 summary。
- 更新 Overview 頁（`web/public/index.html` + `web/public/js/overview.js` + `web/public/css/style.css`），顯示治理待辦卡、empty state 與「需人工確認 / 手動更新設定」語意。
- 新增 targeted verify、local API smoke 與 UI / UX / QA evidence，覆蓋 config contract、startup due-check、API payload 與 Overview 靜態契約。

## Capabilities

### New Capabilities
- `governance-scheduler`: 為工作台提供 suggestion-only 的治理排程設定、startup due-check 與 Overview 治理待辦摘要。

### Modified Capabilities
- 無。

## Non-goals

- 不建立背景 daemon、cron、排程服務或任何長駐自動執行流程。
- 不自動更新 `web/governance.json` 的 `lastReviewedOn`，也不自動寫回任何 `docs/memory/*.md`、rules 或 shared docs。
- 不新增治理 action button、bulk apply、auto-fix 或 writeback API。
- 不處理 template verify blocker，也不把本 change 擴大成新的 `/governance` 獨立頁面。
- 不引入新的 runtime dependency、前端框架、build step、LLM 或 embeddings。

## Impact

- Affected code: `web/governance.json`、`web/server.js`、`web/public/index.html`、`web/public/js/overview.js`、`web/public/css/style.css`、新的 governance scheduler utility 與 verify script。
- Affected docs: `docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 啟動 V4 Change 5，讓工作台第一次具備「治理事項到期提醒」能力；仍維持 suggestion-only，真正的自動治理 writeback 留待未來版本。
