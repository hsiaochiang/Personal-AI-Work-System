## Context

目前 repo 已具備這些基線：

- `web/projects.json` 已定義多專案，`/projects` 可切換資料源。
- `/api/memory` 會回傳單一專案的 raw memory content、health summary 與 dedup suggestion。
- `/memory` 已有健康度與 dedup overview，但所有資訊都只來自目前 projectId。
- repo 尚無 `docs/shared/`、shared snapshot generator，或任何跨專案 suggestion payload。

本 change 的 planner scope 已明確收斂為：

- suggestion-only
- 不自動搬移 memory
- 不新增 writeback action
- 不處理 scheduler / governance automation
- 以既有 `/memory` 頁面承接 read-only shared knowledge 呈現

## Goals / Non-Goals

**Goals:**
- 建立可被 server、verify 與 snapshot generator 共用的 shared knowledge utility。
- 在相同 memory 類別（同一 `filename`）中，偵測不同專案間重複或高度相似的條目，輸出 cross-project suggestion groups。
- 讓 `/api/memory` 對目前專案附帶 `sharedKnowledge` summary / groups，保持既有 health / dedup consumer 相容。
- 在 `/memory` 顯示 read-only shared knowledge overview，讓使用者直接看到「哪些內容值得整理成共用知識」。
- 建立 `docs/shared/` snapshot，讓 shared layer 有可閱讀、可追蹤的 markdown 起點。

**Non-Goals:**
- 不建立 shared writeback API、accept / reject action 或自動引用機制。
- 不把不同 memory 類別混在一起推論，例如 `preference-rules.md` 直接對 `task-patterns.md`。
- 不新增獨立 `/shared` 頁面、全域搜尋整合或側欄導覽重構。
- 不要求現有專案 memory 回填新 metadata schema。

## Decisions

### Decision 1: 用 shared utility 在 server 端產生 cross-project suggestion，而不是把邏輯塞進 `/memory` 前端

- 決策：新增 `shared-knowledge-utils.js`，採 UMD 形式同時支援 Node 與 browser/static verify。
- 理由：cross-project 掃描必須讀取多個 project root；把 grouping 放在 server 端可避免前端自行打多次 API、重複實作 similarity heuristic，也能讓 snapshot generator 重用同一套規則。
- 替代方案：
  - 方案 A：前端先打 `/api/projects` 再逐一抓每個 `/api/memory`，在 browser 端比對。
  - 未採用原因：流程變複雜、payload 更大，也讓 verify 難以重用。

### Decision 2: 第一版只比較「不同專案 + 相同 memory filename」的條目

- 決策：shared candidate 必須同時滿足「來自至少兩個 projectId」與「位於同一 `filename`」。
- 理由：這與 `memory-dedup-suggestions` 的 same-file guard 一致，可大幅降低誤報；例如偏好規則與任務模式雖可能談同一主題，但語境不同，不應在第一版直接合併。
- 替代方案：
  - 方案 A：所有 memory 檔案一起做全域相似度比對。
  - 未採用原因：噪音太高，且會把 `decision-log.md` 這類專案決策誤判成 shared preference。

### Decision 3: 仍沿用 `/api/memory` enriched payload，而不另開 `/api/shared`

- 決策：在 `/api/memory` response 新增 top-level `sharedKnowledge`，內容只包含與當前 projectId 相關的 suggestion groups。
- 理由：`/memory` 頁面本來就只打一支 API；延續 V4 Change 1/2 的 enriched payload 模式，變更最小，也能把 shared knowledge 視為記憶治理的一部分。
- 替代方案：
  - 方案 A：新增 `/api/shared-knowledge`。
  - 未採用原因：需要多一條前端資料流、更多錯誤處理與更多驗證面。

### Decision 4: `docs/shared/` 由 generator 產生 snapshot，不在 web request 中自動寫檔

- 決策：新增 `tools/generate_shared_knowledge_report.js`，用 shared utility 產出 `docs/shared/shared-knowledge-candidates.md`。
- 理由：shared snapshot 屬證據與人工整理起點，不應由一般瀏覽請求偷偷寫入；用顯式工具生成可保留 suggestion-only / human-confirm 邊界。
- 替代方案：
  - 方案 A：每次 `/api/memory` 請求都同步改寫 `docs/shared/`。
  - 未採用原因：會讓 read-only UI 變成隱性 writeback，違反本 change 的邊界。

### Decision 5: `/memory` 只呈現「候選群組」，不在現有 memory card 上標示「已來自 shared」

- 決策：在 `/memory` 新增獨立的 shared overview card，顯示候選群組、參與專案與建議保留版本；不修改既有 per-item memory 卡片語意。
- 理由：目前 repo 還沒有正式 shared library 引用機制，若直接在 memory item 上加「來自共用庫」標記，會暗示已完成整合。第一版只能誠實呈現 suggestion。
- 替代方案：
  - 方案 A：直接在 memory item 上加 shared badge。
  - 未採用原因：會混淆「候選」與「已整合」兩種狀態。

## Risks / Trade-offs

- [Risk] 專案資料太少時，shared suggestion 可能沒有任何結果
  → Mitigation：補最小 mock fixture，並提供 empty-state 文案而不是顯示錯誤。
- [Risk] 相似度 heuristic 太鬆，跨專案但其實不該共享的條目被列為候選
  → Mitigation：維持 same-filename guard、至少兩個 projectId、保守 threshold，並明確標為 suggestion-only。
- [Risk] `docs/shared/` snapshot 可能與最新資料漂移
  → Mitigation：在 snapshot 中標示 generated date / projects，並用 generator 重跑而不是人工維護。
- [Risk] `/api/memory` payload 增胖影響既有 consumer
  → Mitigation：保留既有 `files` / `summary` / `dedup` shape，只新增獨立 `sharedKnowledge` 欄位。

## Migration Plan

1. 建立 `cross-project-shared-knowledge` 的 proposal / design / spec / tasks，固定第一版邊界。
2. 新增 shared knowledge utility 與 report generator，定義 cross-project grouping、summary 與 markdown snapshot output。
3. 更新 `web/server.js` 的 `/api/memory`，在既有 payload 上附帶目前專案 relevant 的 `sharedKnowledge`。
4. 更新 `/memory` 頁面與樣式，顯示 read-only shared knowledge overview。
5. 補 targeted verify、local smoke、UI / UX evidence，並同步 handoff / roadmap / manual / runlog。

## Open Questions

- 後續若要真的建立 shared library 引用，應該先做人工 accept action，還是先只提供 copy-to-shared workflow？本 change 先不決定。
- `docs/shared/` 未來是否要拆成 `preferences.md` / `patterns.md` 多檔，而不是單一 snapshot？本 change 先維持單一候選報告。
