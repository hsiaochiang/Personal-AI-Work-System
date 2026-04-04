## Context

目前 `/api/memory` 只回傳各個 memory markdown 檔案的原始內容，`/memory` 頁面再由前端自行 parse 分組與來源 badge。這個模型對 V1–V3 足夠，但到了 V4，health scoring 需要一個可重用且可驗證的計算邏輯，若仍分散在頁面端，會讓後續治理功能難以共享。

現況限制如下：

- memory markdown 並沒有統一的欄位化 schema，日期多半來自 heading（例如 `## 2026-03-12` 或 `## 提取於 2026-04-03`）。
- 新條目可能帶有 `<!-- source: ... -->` metadata，但大量 legacy 條目沒有來源資訊。
- 專案仍採 Node.js `http` server + vanilla JS，不能引入新的 dependency 或 build step。
- V4 brief 的本 change 只要求 health scoring 與 `/memory` 顯示，不包含 dedup、scheduler 或自動清理。

## Goals / Non-Goals

**Goals:**
- 在 server 端建立可重跑的 memory health scoring，讓 `/api/memory` 直接輸出每條記憶的 health metadata 與整體摘要。
- 以最小安全修改定義第一版 scoring model：新鮮度 + 來源權重，輸出 `healthy`、`review`、`stale` 三態。
- 在 `/memory` 頁面新增健康度概覽與每條記憶的健康 badge，讓使用者能快速看到過期比例與建議清理數量。
- 保持既有 `/extract`、search 與 memory writeback 的 API contract 相容，既有消費者仍可讀 `files[].content`。
- 提供 targeted verify，覆蓋 scoring 邏輯、API payload 形狀與 UI 契約。

**Non-Goals:**
- 不在這一輪引入實際「使用頻率」追蹤；目前 repo 沒有穩定 telemetry，先不發明假的 usage 資料。
- 不更改 memory markdown 檔案格式，不將 health score 回寫到 markdown。
- 不把 `/memory` 擴大成可編輯治理工作台，也不新增 merge / delete action。
- 不觸碰 `/decisions`、`/shared`、`web/governance.json` 等後續 V4 scope。

## Decisions

### Decision 1: 由 `/api/memory` 輸出 enriched payload，而不是只在 `/memory` 前端計分

- 決策：保留 `files[].content`，但在同一個 API response 加上 `files[].groups[*].items[*].health` 與 top-level `summary`。
- 理由：health scoring 屬於治理邏輯，之後 dedup、scheduler 或其他頁面也可能重用；放在 server 端更容易共享與驗證。
- 替代方案：
  - 方案 A：維持 API 純回 raw markdown，僅在 `memory.js` 裡重新解析與評分。
  - 未採用原因：會讓 scoring 無法被 verify script 或未來其他入口共用，也把治理邏輯綁死在單一頁面。

### Decision 2: 第一版 score 只使用 freshness 與 source weight，保留 frequency 為後續治理維度

- 決策：health score 使用 `freshnessScore * sourceWeight`，並依閾值對應到 `healthy / review / stale`。
- 理由：V4 change 備註已明示這輪聚焦「新鮮度 × 來源權重」，而 repo 目前沒有可靠的使用頻率訊號；先落地可解釋的基線，比引入脆弱 proxy 更安全。
- 替代方案：
  - 方案 A：用重複出現次數或搜尋次數硬湊 frequency。
  - 未採用原因：這會把 dedup 與 usage telemetry 混為一談，容易誤把重複記錄當成高健康度。

### Decision 3: 日期來源以 group heading 為主，沒有日期的 legacy 條目一律標為 `review`

- 決策：從 `## 2026-03-12`、`## 提取於 2026-04-03` 之類 heading 擷取日期；若 group 沒有日期，freshness 採中性值，最終傾向落在 `review`。
- 理由：現有 markdown 結構裡，heading 是最穩定且最少誤判的時間訊號；未知日期不應直接當成過期，也不應假設健康。
- 替代方案：
  - 方案 A：改掃每條 bullet 內文找日期。
  - 未採用原因：現有 memory 內文常含多種日期語意，誤判風險高，且會讓 scoring 解釋性變差。

### Decision 4: health status 與 score explanation 由 utility module 統一定義

- 決策：新增可同時被 Node 與 browser 使用的 utility，集中處理分數、badge、reason 與 summary 計算。
- 理由：這和既有 `memory-source-utils.js` 的模式一致，能讓 server、front-end 與 verify script 共用同一套規則。
- 替代方案：
  - 方案 A：server 與 front-end 各自實作一份 scoring。
  - 未採用原因：邏輯會漂移，verify 也難保證 API 與 UI 顯示一致。

### Decision 5: `/memory` UI 以「健康摘要 + 條目 badge」呈現，不新增治理操作按鈕

- 決策：在頁首 KPI 區增加過期比例 / 建議清理數，在列表卡片 header 顯示健康 badge 與簡短 reason。
- 理由：這符合本 change 的核心使用者故事，也避免過早把 `/memory` 變成操作面板。
- 替代方案：
  - 方案 A：直接新增「清理」或「更新」按鈕。
  - 未採用原因：會提前跨入 dedup / scheduler / writeback scope，超出本 change 邊界。

## Risks / Trade-offs

- [Risk] 大量 legacy 條目沒有日期與來源，若分數過低會讓摘要看起來過度悲觀
  → Mitigation：未知日期採中性 freshness，未知來源採中性 source weight，預設落在 `review` 而非 `stale`。
- [Risk] heading 日期解析規則過窄，導致部分條目沒有抓到日期
  → Mitigation：支援 `YYYY-MM-DD` 與 `YYYY/M/D` 類型，verify 覆蓋常見 heading 範例。
- [Risk] `/api/memory` payload 擴充後影響既有 search / extract 消費者
  → Mitigation：保留既有 `filename` / `content` 欄位，不移除任何現有欄位；前端逐步採用新欄位。
- [Risk] score 看起來過於絕對，讓使用者誤以為系統已理解「是否正確」
  → Mitigation：UI 文案使用「健康度 / 待確認 / 過期風險」而非真偽判定，並顯示 reason 來源。

## Migration Plan

1. 建立 change artifacts，明確定義 scoring model、UI scope 與 verify 邊界。
2. 新增 shared memory health utility，集中處理 group date 解析、item scoring 與 summary aggregation。
3. 更新 `web/server.js` 的 `/api/memory`，在原 payload 上附加 groups / summary / health metadata。
4. 更新 `/memory` HTML / JS / CSS，顯示健康度概覽與每條記憶的 health badge / reason。
5. 新增 targeted verify，重跑相關 smoke，並同步 handoff / brief / manual / runlog。

## Open Questions

- 後續 change 若要納入真正的 usage frequency，應由治理排程輸出獨立 evidence 檔，還是直接在 `/memory` API 暫存最近掃描結果？本 change 先不決定。
- 若未來需要跨專案 shared knowledge 的 health summary，是否應把 project-level summary 抽成獨立 endpoint？本 change 先不拆。
