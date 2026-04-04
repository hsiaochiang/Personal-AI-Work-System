## Context

目前 `/api/memory` 已會透過 `memory-health-utils` 回傳 enriched groups 與 top-level summary，`/memory` 則直接依 API payload 顯示 health overview 與每條記憶卡片。這代表 dedup suggestion 最自然的落點仍是 `/api/memory` 與 `/memory` 這條既有路徑，而不是另開新的治理頁面。

現況限制如下：

- `docs/memory/*.md` 仍是以 heading + bullet list 為主的 markdown，沒有正式欄位化 schema。
- 現有 writeback API 只有整檔 overwrite（`/api/memory/write`），沒有針對單一 memory item 的 merge / delete action。
- memory parser 目前只會取出群組標題與 bullet item，沒有保留 line index 或 rewrite 所需的位置資訊。
- V4 brief 要求 dedup suggestion + merge/delete，但不允許跨入 LLM / embeddings / 完全自動化。
- 專案仍採 Node.js `http` server + vanilla JS，不能引入新的 dependency 或 build step。

## Goals / Non-Goals

**Goals:**
- 在 server 端建立可重跑的 dedup heuristic，為同一 memory 檔中的疑似重複條目產生 suggestion groups。
- 讓 `/api/memory` 在既有 health payload 上附帶 dedup summary / groups，供 `/memory` 直接渲染。
- 提供安全的 merge / delete action，所有改寫都先 backup，再限制在 whitelist 內的 memory 檔案。
- 在 `/memory` 顯示 dedup suggestion groups，並提供「合併為一條」與「刪除其中一條」操作。
- 提供 targeted verify，覆蓋 heuristic、rewrite、API 契約與 UI wiring。

**Non-Goals:**
- 不做跨檔案或跨專案 dedup；第一版只處理同一 `filename` 內的重複條目。
- 不直接改變 `/extract` 的 dedupe key、candidate review 或 writeback 流程。
- 不做自動 merge；server 不會在沒有 UI action 的情況下主動改寫 markdown。
- 不嘗試保留多來源 provenance merge；一個合併後條目仍維持單一 source metadata。

## Decisions

### Decision 1: dedup suggestion 只在同一 memory 檔內比對，不做跨檔案 merge

- 決策：heuristic 只比較相同 `filename` 的 memory items，允許跨不同日期 group，但不跨 `preference-rules.md` / `task-patterns.md` 之類不同檔案。
- 理由：同檔案內的條目語意最接近，rewrite 也只需改一個檔案；這是最小安全邊界。
- 替代方案：
  - 方案 A：所有 memory items 全域比對。
  - 未採用原因：容易把不同分類但句子相似的內容誤判為重複，也會讓 merge action 跨到多檔案 rewrite。

### Decision 2: heuristic 採 normalized text + token/bigram overlap，而不是語意模型

- 決策：先把內容正規化，再用關鍵 token 與字元 bigram overlap 算 similarity，超過閾值才進 suggestion group。
- 理由：repo 現有資料量不大，且多數 memory 條目是單行短句，輕量 heuristic 已足夠做第一輪人工建議。
- 替代方案：
  - 方案 A：導入 embeddings 或外部 NLP library。
  - 未採用原因：超出 V4 本 change scope，也違反不新增 dependency / 外部服務的約束。

### Decision 3: 推薦保留項目用 health score + 內容完整度做 tie-breaker

- 決策：duplicate group 先選 health score 較高的 item 為 primary；若分數相同，再選內容較長、來源較完整者。
- 理由：V4 Change 1 已提供 health metadata，可自然重用；較健康、較完整的條目更適合作為 merge 後保留版本。
- 替代方案：
  - 方案 A：永遠保留最早或最新一條。
  - 未採用原因：時間單一維度不一定代表品質；有些較新的重複條目其實更短、更模糊。

### Decision 4: merge action 等於「保留 primary 一條並刪除其餘重複項」，不嘗試文字融合

- 決策：第一版 merge 不做 AI 或規則式文字整併；server 只保留一條推薦 primary，必要時用較完整版本覆寫 primary line，並刪除其餘 item。
- 理由：這已滿足「合併為一條」的使用者故事，同時避免自動改寫內容造成語意漂移。
- 替代方案：
  - 方案 A：把多條內容拼接成新 bullet。
  - 未採用原因：容易生成冗長或失真的條目，超出最小安全修改。

### Decision 5: rewrite 以 line-index 精準改寫 markdown，保留檔案其他內容不動

- 決策：新增 detailed parser，記錄 item 的 `lineIndex`、群組標題與穩定 itemId；merge/delete 只改寫對應 bullet line，其他 markdown 原樣保留。
- 理由：既有 memory 檔案包含導言、非 list 段落與不同 heading 層級，不能用結構化資料整檔重建。
- 替代方案：
  - 方案 A：parse 成 groups 後重組整個 markdown。
  - 未採用原因：會丟失原始格式與非 bullet 內容，風險過高。

### Decision 6: `/api/memory` 同一 payload 直接附帶 dedup summary / suggestion groups

- 決策：延續 `memory-health-scoring` 的做法，仍由 `/api/memory` 回傳既有 raw content + health + dedup。
- 理由：`/memory` 已依賴此 API，新增 dedup 區塊不需要再引入第二個 fetch 路徑；verify 也可一次覆蓋。
- 替代方案：
  - 方案 A：新增 `/api/memory/dedup` 專門取 suggestion。
  - 未採用原因：雖可分離責任，但會增加前端狀態同步與請求面。

## Risks / Trade-offs

- [Risk] heuristic 太鬆，導致相近但不該合併的條目被建議
  → Mitigation：提高 similarity threshold，並只提供人工確認 suggestion，不做自動改寫。
- [Risk] rewrite line index 與 API itemId 漂移，造成 action 對錯條目
  → Mitigation：action 後立即重新 fetch `/api/memory`；server 也重新 parse 當前檔案並驗證 itemId 存在才改寫。
- [Risk] merge 後保留單一 source，可能丟失被刪除條目的 provenance
  → Mitigation：第一版將 merge 定義為「保留較佳現有條目」；multi-source provenance 留給後續 change。
- [Risk] 某些條目只有微小差異，使用 longest-content primary 可能讓使用者覺得 merge 不夠聰明
  → Mitigation：UI 顯示每組 duplicate 的 similarity 與推薦保留原因，使用者仍可選擇只刪除其中一條。

## Migration Plan

1. 建立 change artifacts，固定 dedup scope、heuristic 邊界與 rewrite 安全規則。
2. 新增 shared memory dedup utility，集中處理 normalized comparison、group suggestion 與 markdown line-level rewrite。
3. 更新 `web/server.js` 的 `/api/memory`，在既有 health payload 上附加 dedup summary / groups；新增 dedup action API。
4. 更新 `/memory` HTML / JS / CSS，顯示疑似重複群組與 merge/delete action。
5. 新增 targeted verify，涵蓋 heuristic、rewrite、API payload 與 UI contract；重跑既有 memory health / source attribution regression。
6. 更新 brief / handoff / manual / runlog / QA / UI / UX evidence，回寫本 change 的 executor / verify 狀態。

## Open Questions

- 未來若要跨檔案或跨專案 dedup，應先顯示 suggestion-only 還是直接導向 shared knowledge？本 change 先不決定。
- 若後續需要保留 merge provenance，是否要讓 markdown item 支援多個 source comment？本 change 先維持單一 source。
