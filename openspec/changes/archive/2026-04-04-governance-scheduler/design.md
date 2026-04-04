## Context

目前 repo 已有這些治理基線：

- `/api/memory` 會回傳 health summary、dedup summary 與 shared knowledge summary。
- `/decisions` 透過 `rule-conflict-utils.js` 在前端偵測規則衝突，但 server 端尚未整理任何 governance summary。
- Overview 頁目前只顯示 roadmap KPI 與 phase table，沒有治理待辦卡，也沒有 empty state / 提醒語意。
- repo 尚無 `web/governance.json`，server 啟動時也不會做任何治理 due-check。

Planner 已明確收斂本 change 的邊界：

- config-driven
- server startup due-check
- suggestion-only todo snapshot
- Overview 顯示待辦與人工確認語意
- 不自動寫回 memory / rules / shared docs

## Goals / Non-Goals

**Goals:**
- 建立 `web/governance.json` 最小設定契約，讓治理排程可用靜態檔設定是否啟用、頻率與 due-check 門檻。
- 在 server startup 時對已知 project 做 governance due-check，整理出每個 project 的 read-only governance snapshot。
- 讓 `/api/governance` 對目前 projectId 回傳 summary、todos、config path 與 suggestion-only 說明。
- 在 Overview 顯示治理待辦 overview、per-todo card、disabled state 與 empty state。
- 提供 targeted verify，覆蓋 config parsing、due-check 判斷、API contract 與 Overview 靜態 wiring。

**Non-Goals:**
- 不建立背景排程器、interval timer、cron job 或 server 常駐 worker。
- 不在 `/api/governance` 提供 accept / snooze / complete action。
- 不把現有治理能力重新實作成 server-side writeback workflow。
- 不新增 `/governance` 專頁或多步驟審核流程。

## Decisions

### Decision 1: `web/governance.json` 是 app-level config，不是 per-project config

- 決策：治理排程設定放在 dashboard repo 的 `web/governance.json`，套用到所有已知 project，由 startup snapshot 依 projectId 計算各自的 todo。
- 理由：這個系統是同一個工作台管理多專案，治理節奏屬工作台層級；若改成每個 project root 都要有 config，像 `temp-mock/` 這類測試專案就會缺檔，反而增加維護成本。
- 替代方案：
  - 方案 A：每個 project root 都要放自己的 `web/governance.json`。
  - 未採用原因：會讓多專案切換與 mock fixture 維護變複雜，也不符合本 repo 目前「工作台集中治理」的設計。

### Decision 2: scheduler 只做 startup snapshot，不做 request-time background scan

- 決策：server 啟動時就讀取 config、對已知 project 建立 governance snapshot，之後 `/api/governance` 只讀取這份 snapshot。
- 理由：這符合 planner 指定的 startup due-check 邊界，也避免每次頁面載入都重新掃描多專案資料。由於本 change 不做自動寫回，startup snapshot 已足夠支撐 read-only 提醒。
- 替代方案：
  - 方案 A：每次打 `/api/governance` 時即時計算。
  - 未採用原因：雖然可行，但會模糊「startup due-check」邊界，也會讓多專案掃描成本跟著每次請求重複發生。

### Decision 3: todo 來源直接重用現有治理 summary，而不是重新做一套掃描器

- 決策：governance todo 直接吃既有的 memory health、dedup、shared knowledge summary 與 rules conflict summary；scheduler 只判斷「是否到期」與「如何敘述」，不重做新的治理 heuristic。
- 理由：這樣風險最小，且能確保 Overview 上的待辦數據與 `/memory`、`/decisions` 一致。
- 替代方案：
  - 方案 A：另外寫一套 server-side 治理掃描邏輯。
  - 未採用原因：容易和既有 utility 漂移，還會讓 verify 成本增加。

### Decision 4: due todo 即使目前 signal 為 0，也應保留巡檢提醒，但 severity 要下降

- 決策：只要 check 到期就顯示 todo；若目前 signal 為 0，todo 顯示為低風險的 routine review，而不是完全消失。
- 理由：scheduler 的目的是建立治理節奏，不只是列警報。若完全依 signal > 0 才顯示，使用者反而無法知道「本週已完成或尚未完成例行巡檢」。
- 替代方案：
  - 方案 A：只有 signal 超過門檻時才顯示 todo。
  - 未採用原因：會把 scheduler 退化成單純告警器，不符合 V4 brief 的定期治理意圖。

### Decision 5: Overview 只顯示 route / summary / manual note，不提供 action button

- 決策：todo card 只顯示導向頁面、到期資訊、目前 signal 與「確認後請手動更新 config」說明，不提供完成按鈕。
- 理由：本 change 嚴格維持 suggestion-only。若出現「標記完成」按鈕，使用者會合理預期系統會改寫 `lastReviewedOn`，那就跨進 writeback 邊界了。
- 替代方案：
  - 方案 A：提供「標記已確認」並直接改寫 config。
  - 未採用原因：違反 planner 與 brief 對人工確認 / 不自動寫檔的限制。

## Risks / Trade-offs

- [Risk] startup snapshot 會隨時間變舊，server 長時間不重啟時到期資訊不會自動更新
  → Mitigation：本 change 明確把判斷邊界定義為 startup due-check；Overview 會顯示 `checkedAt`，讓使用者知道這是啟動時的快照。
- [Risk] rule conflict summary 目前原本只存在前端，server 端需重建最小 parse
  → Mitigation：server 只做與 existing `/decisions` 相同的 deterministic parse + utility reuse，不新增另一套 heuristic。
- [Risk] 治理 config 若填錯日期或頻率，可能讓全部 todo 消失或全部過期
  → Mitigation：utility 對未知 frequency / 非法日期給出安全 fallback，並在 payload 裡標出 config warning。
- [Risk] Overview 一次放太多治理卡會壓過 roadmap 主體
  → Mitigation：只顯示到期項目，並把 card 設計成摘要型，保留 phase table 為主內容。

## Migration Plan

1. 建立 `governance-scheduler` 的 proposal / design / spec / tasks，固定 config-driven + startup due-check 邊界。
2. 新增 `web/governance.json` 與 governance scheduler utility，定義 check contract、frequency 判斷與 todo summary builder。
3. 更新 `web/server.js`，在 startup 建立 governance snapshot，並新增 `/api/governance` endpoint。
4. 更新 Overview 頁與樣式，顯示治理待辦卡、empty state 與 suggestion-only 語意。
5. 新增 targeted verify，並補 local API smoke、UI / UX / QA evidence。
6. 同步 brief / roadmap / handoff / system-manual / runlog 到 executor verify 狀態。

## Open Questions

- 未來若要讓使用者從 UI 更新 `lastReviewedOn`，應直接改 `web/governance.json`，還是建立 draft-only writeback 層？本 change 先不決定。
- 若後續要做背景排程，是否仍保留 startup snapshot 作為 fallback？本 change 先只記錄此限制。
