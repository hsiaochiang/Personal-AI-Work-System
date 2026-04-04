# System Manual — Personal AI Work System

## 系統概述

Personal AI Work System（WOS）是一個讓使用者在多個 AI 對話 session 之間保持上下文連續性的個人工作台。透過 markdown 驅動的文件結構與輕量 web UI，支援 handoff 產生、對話知識提取、審核寫回、決策檢視與多專案管理。

## 目前版本

- **V1** — 單專案知識閉環工作台 ✅ 已完成
- **V2** — 穩定化與多專案工作台 ✅ 已完成
- **V3** — 跨工具整合層 ✅ 已完成
- **V4** — 治理、自動化、個人 AI 作業系統 ✅ 已完成

## 功能總覽

### 專案總覽（Overview）
- 能力描述：顯示 roadmap 進度、當前任務狀態與治理待辦摘要
- 操作方式：瀏覽器開啟 http://localhost:3000/
- 限制：僅讀取，不可在 UI 編輯
- 改善（V4 Change 5）：Overview 會讀取 `/api/governance` 的 startup snapshot，顯示治理待辦、空狀態或停用狀態，並提供前往 `/memory` / `/decisions` 的導向入口

### 治理排程（`web/governance.json` + `/api/governance`）
- 能力描述：用靜態設定檔定義治理巡檢頻率，server 啟動時做 due-check，將到期待辦以 suggestion-only 方式回傳給 Overview
- 操作方式：修改 `web/governance.json` → 重啟 `node web/server.js` → 開啟 http://localhost:3000/ 查看治理待辦
- 限制：第一版只在 startup 建立 snapshot；不自動更新 `lastReviewedOn`，也不執行任何 writeback action

### Handoff Builder（/handoff）
- 能力描述：選擇 handoff 類型（規劃/實作/整合），編輯欄位，產生 markdown，一鍵複製
- 操作方式：選模板 → 填寫欄位 → 預覽 → 複製
- 限制：範本結構硬編碼在前端 JS，不支援自訂範本

### 知識提取與寫回（/extract）
- 能力描述：在 `/extract` 先選擇工具來源（純文字 / ChatGPT / Gemini / VS Code Copilot），再用對應入口貼上文字、上傳 ChatGPT JSON / TXT，貼上 Gemini transcript，或載入 Copilot session；內容會先正規化為 `ConversationDoc`，再進入候選提取、審核與寫回 `docs/memory/`
- 操作方式：開啟 `/extract` → 選擇工具來源 → 依模式貼上文字、上傳 ChatGPT 檔案、貼上 Gemini transcript，或刷新並載入 Copilot session → 點「提取候選知識」→ 審核候選（可看到來源 badge）→ 點「寫回」
- 改善（V2）：寫回前自動 backup（`.backup/` 機制），不再整檔覆蓋
- 改善（V3 Change 2）：既有純文字入口已接上 `ConversationDoc` adapter 基線，為後續多來源匯入保留共同介面
- 改善（V3 Change 3）：新增 `ChatGPTAdapter`，支援分享頁 transcript 貼上與 ChatGPT conversation JSON 匯入；若內容不符合 ChatGPT 偵測條件，系統會自動退回 `PlainTextAdapter`
- 改善（V3 Change 4）：新增 Copilot 本機 session 匯入；`/extract` 可直接讀取最近的 VS Code Copilot JSONL session，並支援覆寫 session 路徑
- 改善（V3 Change 5）：寫回 memory 條目時會自動保存來源 metadata（`plain` / `chatgpt` / `copilot`），供 `/memory` 顯示來源 badge
- 改善（V3 Change 6）：`/extract` 新增工具來源 selector 與 per-source import controls；候選審核卡片與 summary 會顯示來源 badge / source summary
- 改善（V5 Change 1）：新增 `GeminiAdapter` 與 `/extract` 的 Gemini 來源選項；可直接貼上 Gemini transcript，並在候選審核與 writeback 保留 `gemini` 來源標記

### 專案記憶（/memory）
- 能力描述：讀取 `docs/memory/*.md`，以分類卡片呈現專案記憶，並顯示 health summary 與每條記憶的健康狀態
- 操作方式：瀏覽器開啟 http://localhost:3000/memory
- 改善（V3 Change 5）：若記憶條目含 `<!-- source: ... -->` metadata，頁面會顯示對應來源 badge；舊條目沒有 metadata 仍可正常顯示
- 改善（V4 Change 1）：`/api/memory` 會先計算記憶健康度摘要，`/memory` 頁面新增過期比例、建議清理數量與每條記憶的健康 badge / reason；第一版採新鮮度 × 來源權重
- 改善（V4 Change 2）：`/api/memory` 會額外提供 dedup summary 與 suggestion groups；`/memory` 頁面新增「疑似重複建議」區塊，可在人工確認後執行 merge 或 delete，且改寫前會先 backup
- 改善（V4 Change 4）：`/api/memory` 會額外提供與目前 project 相關的 `sharedKnowledge` payload；`/memory` 頁面新增「共用知識候選」區塊，顯示跨專案重複主題、參與專案與建議 shared 摘要；本輪維持 suggestion-only，不做 shared writeback

### Shared Knowledge Snapshot（`docs/shared/`）
- 能力描述：把跨專案 shared knowledge 候選輸出成 read-only markdown snapshot，作為人工整理 shared layer 的起點
- 操作方式：在 repo 根目錄執行 `node tools/generate_shared_knowledge_report.js`，再查看 `docs/shared/shared-knowledge-candidates.md`
- 限制：第一版只掃描相同 memory filename 的跨專案條目，並排除低訊號 metadata；snapshot 只寫入 `docs/shared/`，不會改動任何 `docs/memory/*.md`

### 決策與規則檢視（/decisions）
- 能力描述：瀏覽決策記錄、搜尋篩選、檢視偏好規則與可解釋的衝突提示
- 操作方式：輸入關鍵字搜尋，切換 tab 查看不同分類
- 改善（V4 Change 3）：rules tab 會顯示 conflict overview、衝突規則組數與 per-rule explanation；第一版只做 same-category、signal-based suggestion，不自動修改規則
- 限制：衝突偵測仍屬 deterministic heuristic；目前只覆蓋高可信 signal（如精簡 vs 詳細、先規劃 vs 直接實作、白話 vs 術語抽象），不做跨分類或跨專案推論

### 多專案管理（/projects）
- 能力描述：多專案卡片、選中狀態、sidebar 顯示目前專案
- 操作方式：在 `web/projects.json` 設定專案，UI 點選切換
- 改善（V2）：切換專案後 API 資料源跟著切換，各頁面顯示對應專案資料

### 全域搜尋（/search）
- 能力描述：跨所有資料來源的全文搜尋
- 操作方式：輸入關鍵字，結果按來源分組
- 限制：前端字串比對，資料量大時效能未最佳化

## 快速上手（Getting Started）

```bash
# 1. 確認 Node.js 已安裝（>= 18.x）
node --version

# 2. 啟動 dev server
cd web
npm start        # 或 node server.js

# 3. 開啟瀏覽器
# http://localhost:3000
```

## 已知限制
- ChatGPT JSON 若包含多筆 conversation，現階段僅 deterministic 選擇最近更新的一筆；尚無 picker UI
- Copilot local import 目前以單一路徑掃描 + 單筆載入為主；尚無搜尋、rich preview 或多 session merge
- `/extract` 的工具來源 selector 目前涵蓋 `plain` / `chatgpt` / `gemini` / `copilot`；尚未支援 Claude / Antigravity
- Gemini 匯入目前只支援貼上 transcript；尚未支援 API 載入、檔案上傳或多 conversation picker
- 舊有 memory 條目大多尚未回填來源 metadata，因此 `/memory` 只會對新寫回或手動補 metadata 的條目顯示來源 badge
- memory health scoring 第一版尚未納入真正的 usage frequency telemetry；沒有日期的 legacy 條目會先列為 `待確認`
- memory dedup suggestion 第一版只處理同一 memory 檔案內的重複 / 高度相似條目，不做跨檔案或跨專案合併
- cross-project shared knowledge 第一版只處理不同 projectId、相同 memory filename 的重複主題；目前沒有 `/shared` 獨立頁面，也沒有 accept / writeback action
- governance scheduler 第一版只在 server startup 建立 snapshot；若不重啟 server，到期資訊不會自動刷新
- governance scheduler 目前沒有「標記已完成」或直接更新 `web/governance.json` 的 UI

## 版本歷史摘要
| 版本 | 日期 | 主要變更 |
|------|------|---------||
| V5 Change 1 | 2026-04-04 | `GeminiAdapter`、`/extract` Gemini 來源選項、Gemini source badge 與 main spec sync / archive |
| V4 Change 5 | 2026-04-04 | `web/governance.json`、server startup due-check、`/api/governance` 與 Overview 治理待辦摘要 |
| V4 Change 4 | 2026-04-04 | `/memory` 共用知識候選、`/api/memory` sharedKnowledge payload 與 `docs/shared/` snapshot generator |
| V4 Change 3 | 2026-04-04 | `/decisions` conflict overview、signal-based rule conflict detection 與 per-rule explanation（archive complete） |
| V4 Change 2 | 2026-04-04 | `/memory` 疑似重複建議、dedup summary 與 merge/delete action（archive complete） |
| V4 Change 1 | 2026-04-04 | `/memory` 健康度概覽、過期比例 / 建議清理 KPI 與 per-item health badge |
| V3 Change 6 | 2026-04-04 | `/extract` 工具來源 selector、per-source import controls 與 candidate source badge |
| V3 Change 5 | 2026-04-03 | memory source metadata 寫回與 `/memory` 來源 badge |
| V3 Change 4 | 2026-04-03 | VS Code Copilot 本機 session JSONL 匯入、path override 與 `/extract` local import UI |
| V3 Change 3 | 2026-04-03 | ChatGPT transcript / JSON 匯入與 plain-text fallback 驗證 |
| V2 Change 4 | 2026-04-01 | flow validation 與 usability hardening |
| V2 Change 3 | 2026-04-01 | roadmap 與文件一致性校準 |
| V2 Change 2 | 2026-03-31 | 多專案資料源真切換 |
| V2 Change 1 | 2026-03-29 | writeback 寫回前自動 backup |
| V1           | 2026-03-28 | 單專案知識閉環工作台（Phase 1–5 全部完成）|
| Template 1.5 | 2026-04-02 | 升級 copilot-workspace-template v1.5.0 + Style Guide FROZEN |

## Planning Impact Log

| 日期 | 版本 | 異動摘要 | 使用者可見影響 |
|------|------|---------|---------------|
| 2026-04-04 | V5 Change 1 archive | `gemini-adapter` 已完成 implementation commit、`openspec/specs/gemini-adapter/spec.md` sync 與 `openspec archive gemini-adapter -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-04-gemini-adapter/`，下一步可切到 `claude-adapter` | 無（No user-facing change；本次為治理收尾與封存狀態更新，`/extract` 的 Gemini 能力維持不變） |
| 2026-04-04 | V5 Change 1 review gate pass | `gemini-adapter` Review Gate 已通過；補修 `docs/system-manual.md` 的已知限制文案，讓 manual 與實作、QA / UI / UX evidence、brief / roadmap / handoff 狀態一致；目前可進入 commit / sync / archive 決策，但本輪未執行不可逆操作 | 無（No user-facing change；本次僅修正治理文件與 Review Gate 狀態，不改變 `/extract` 已上線的 Gemini 能力） |
| 2026-04-04 | V5 Change 1 executor verify | 完成 `gemini-adapter` 的 apply / verify：`/extract` 現在新增 `Gemini` 來源選項、`GeminiAdapter` transcript 解析與 `Gemini` source badge；已重跑 strict validate、Gemini targeted verify 與既有來源 regression，下一步待 Review Gate 判定是否可進入 commit / sync / archive | 有（使用者現在可在 `/extract` 直接選 `Gemini` 並貼上 transcript，後續候選審核與 writeback 會保留 `gemini` 來源標記；本輪仍不支援 Gemini API 或檔案匯入） |
| 2026-04-04 | V5 Change 1 executor start | 啟動 `gemini-adapter` executor，已建立 `openspec/changes/gemini-adapter/` active change 骨架並補 proposal / design / spec / tasks 草稿；同時切換 `v5-brief`、`roadmap`、`handoff` 與 runlog 到 V5 active change 狀態 | 無（No user-facing change；本次僅建立 active change artifacts 與治理同步，`/extract` 尚未新增 Gemini 匯入能力） |
| 2026-04-04 | V4 complete | `governance-scheduler` 已完成 main spec sync 與 archive，V4 五個 planned changes 全數封存；已同步 brief / roadmap / handoff 為版本完成狀態，下一步轉向 template verify blocker 或下一版規劃 | 無（No user-facing change；本次為版本收尾與治理狀態更新，已上線功能不變） |
| 2026-04-04 | V4 Change 5 archive | `governance-scheduler` 已完成 `openspec/specs/governance-scheduler/spec.md` sync 與 `openspec archive governance-scheduler -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-04-governance-scheduler/` | 無（No user-facing change；本次為治理收尾與封存狀態更新，Overview 治理待辦功能維持不變） |
| 2026-04-04 | V4 Change 5 review gate pass | Review Gate 判定 `governance-scheduler` PASS；已重查 scope / spec / tasks / QA / UI / UX evidence，並重跑 strict validate、targeted verify 與 local API smoke；同時校正 brief 的使用者影響描述，讓 Overview 治理待辦能力與規劃文件一致 | 無（No user-facing change；本次為收尾閘門判定與治理文件對齊，Overview / `/api/governance` 的可見功能維持不變） |
| 2026-04-04 | V4 Change 5 executor verify | 完成 `governance-scheduler` 的 apply / verify：新增 `web/governance.json`、server startup due-check、`/api/governance` payload 與 Overview 治理待辦卡；已重跑 strict validate、targeted verify 與 local API smoke，下一步待 Review Gate 判定是否可進入 commit / sync / archive | 有（使用者現在可在 Overview 直接看到治理待辦、例行巡檢與停用 / 空狀態；系統仍不會自動更新治理設定或改寫任何 knowledge source） |
| 2026-04-04 | V4 Change 5 executor start | 啟動 `governance-scheduler` executor，已建立 `openspec/changes/governance-scheduler/` active change 骨架，並完成 proposal / design / spec / tasks 草稿；scope 固定為 `web/governance.json`、server startup due-check、`/api/governance` payload 與 Overview 治理待辦卡，下一步待 strict validate 與實作 | 無（No user-facing change；本次僅建立 active change artifacts 並切換 handoff / brief / manual 狀態，Overview / server 行為尚未改動） |
| 2026-04-04 | V4 Change 5 planner | 啟動 `governance-scheduler` 的 Planner scope gate，確認 V4 brief 已有人類確認、repo 無 active duplicate change，且目前基線尚無 `web/governance.json`、governance API 或 Overview 治理待辦卡；下一步待 Executor session 建立 artifacts 並實作最小 scheduler pipeline | 無（No user-facing change；本次僅完成規劃、handoff 切換與基線盤點，Overview / server 行為尚未改動） |
| 2026-04-04 | V4 Change 4 archive | `cross-project-shared-knowledge` 已完成 `openspec/specs/cross-project-shared-knowledge/spec.md` sync 與 `openspec archive cross-project-shared-knowledge -y --skip-specs`；active change 已封存至 `openspec/changes/archive/2026-04-04-cross-project-shared-knowledge/`，下一步可切到 `governance-scheduler` 或 template blocker | 無（No user-facing change；本次為治理收尾與封存狀態更新，`/memory` 與 `docs/shared/` 的可見功能不變） |
| 2026-04-04 | V4 Change 4 review gate pass | Review Gate 判定 `cross-project-shared-knowledge` PASS；已重查 strict validate、targeted verify、ephemeral local API smoke 與 shared candidate / contract 邊界，確認本輪可進入 commit / main spec sync / archive；本 session 仍未執行不可逆操作 | 無（No user-facing change；本次為收尾閘門判定與治理狀態更新，`/memory` 與 `docs/shared/` 的可見功能不變） |
| 2026-04-04 | V4 Change 4 executor verify | 完成 `cross-project-shared-knowledge` 的 apply / verify：`/api/memory` 現在會回傳目前 project 相關的 `sharedKnowledge` summary / groups，`/memory` 已顯示 read-only 的共用知識候選，並可透過 `node tools/generate_shared_knowledge_report.js` 生成 `docs/shared/shared-knowledge-candidates.md`；下一步待 Review Gate 判定是否可進入 sync / archive | 有（使用者現在可在 `/memory` 直接看到跨專案重複的偏好 / 模式候選，並到 `docs/shared/` 查看 snapshot；本輪仍無 shared writeback action） |
| 2026-04-04 | V4 Change 3 archive | `rule-conflict-detection-v2` 已完成 Review Gate、main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-rule-conflict-detection-v2/`；下一步可切到 `cross-project-shared-knowledge` 或 template blocker | 無（No user-facing change；本次為治理收尾與封存狀態更新，使用者可見能力已在 apply / verify 階段上線） |
| 2026-04-04 | V4 Change 3 review gate pass | Review Gate 判定 `rule-conflict-detection-v2` PASS；已確認 strict validate、targeted verify、local smoke 與 UI/UX evidence 全數到位，接下來可進入 main spec sync / archive | 無（No user-facing change；本次為收尾閘門判定與治理狀態更新，`/decisions` 的可見功能不變） |
| 2026-04-04 | V4 Change 4 planner | 完成 `cross-project-shared-knowledge` 的 Planner scope gate：確認 V4 brief 已有人類確認、change 已在 Changes 表內，並盤點現況只有 per-project memory API、尚無 `docs/shared/` 與 `/shared`；下一步可開新 session 進入 Executor | 無（No user-facing change；本次僅完成規劃、handoff 切換與 shared knowledge 基線盤點，尚未新增跨專案掃描、shared docs 或新頁面） |
| 2026-04-04 | V4 Change 3 executor verify | 完成 `rule-conflict-detection-v2` 的 apply / verify：`/decisions` 現在會用 shared utility 偵測 same-category rule conflicts，rules tab 顯示 conflict overview、衝突原因與對象；下一步待 Review Gate 判定是否可進入 commit / sync / archive | 有（使用者現在可在 `/decisions` 的 rules tab 直接看到規則衝突摘要與 explanation，不再只是一個否定詞前綴警告 badge） |
| 2026-04-04 | V4 Change 3 executor start | 啟動 `rule-conflict-detection-v2` executor，已建立 `openspec/changes/rule-conflict-detection-v2/` 並切換 brief / handoff 到 active 狀態；本輪 scope 鎖定 `/decisions` conflict detection + explanation + targeted verify，不做 auto-fix / writeback | 無（No user-facing change；本次先建立 active change artifacts 與治理同步，尚未改動 `/decisions` UI 或 rules API 行為） |
| 2026-04-04 | V4 Change 3 planner | 啟動 `rule-conflict-detection-v2` 的 Planner scope gate，確認 V4 brief 已有人類確認、目前無 active duplicate change，並盤點 `/decisions` 現況僅支援否定詞前綴衝突偵測；下一步待 Executor session 決定是否進入 `#opsx-new` | 無（No user-facing change；本次僅完成 change 規劃與 handoff 切換，尚未改動 `/decisions` UI、API 或規則資料） |
| 2026-04-04 | V4 Change 2 executor verify | 完成 `memory-dedup-suggestions` 的 apply / verify：`/api/memory` 現在會回傳 dedup summary 與 suggestion groups，`/memory` 已顯示疑似重複建議並提供 merge / delete action；下一步待 Review Gate 判定是否進入 sync / archive | 有（使用者現在可在 `/memory` 直接看到疑似重複條目群組，並在人工確認後執行 merge 或刪除；所有操作都會先 backup） |
| 2026-04-04 | V4 Change 2 review gate fail | Review Gate 發現 `memory-dedup-suggestions` 的 blocking mismatch：`/api/memory/dedup` merge action 尚未驗證 `primaryItemId` 屬於本次 duplicate group，錯誤 payload 可能誤改其他 memory item；下一步需修補 server-side guard 與 targeted verify，完成後才能進入 commit / sync / archive | 無（No user-facing change；已上線的 dedup UI 仍可操作，但本 change 尚未通過收尾閘門） |
| 2026-04-04 | V4 Change 2 review gate pass | 已修補 `memory-dedup-suggestions` 的 merge action 邊界：server 現在會驗證 `primaryItemId` 與 `itemIds` 屬於同一 duplicate group，並拒絕 non-duplicate delete；重跑 targeted verify、health/source regression 與 local API smoke 後，Review Gate 重新判定 PASS | 無（No user-facing change；本次為收尾品質修補與治理狀態更新，`/memory` 的可見功能不變） |
| 2026-04-04 | V4 Change 2 archive | `memory-dedup-suggestions` 已完成 main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-memory-dedup-suggestions/`；下一步可切到 `rule-conflict-detection-v2` 或 template blocker | 無（No user-facing change；本次為治理收尾與封存狀態更新，使用者可見能力已在 apply / verify 階段上線） |
| 2026-04-04 | V4 Change 1 archive | `memory-health-scoring` 已完成 main spec sync 與 archive，active change 已封存至 `openspec/changes/archive/2026-04-04-memory-health-scoring/`；下一步可切到 `memory-dedup-suggestions` 或 template blocker | 無（No user-facing change；本次為治理收尾與封存狀態更新，使用者可見能力已在 apply / verify 階段上線） |
| 2026-04-04 | V4 Change 1 review gate pass | `memory-health-scoring` 已修補 missing source / missing date guard，Review Gate 重新判定 PASS；下一步可進入 commit / sync，archive 仍待人工確認 | 無（No user-facing change；本次為收尾品質修補與治理狀態更新，`/memory` 的可見功能不變） |
| 2026-04-04 | V4 Change 1 review gate fail | Review Gate 發現 `memory-health-scoring` 的 blocking mismatch：近期但無 source metadata 的條目仍可能被標成 `healthy`；下一步需修補 scoring 規則與 targeted verify，完成後才能進入 commit / sync / archive | 無（No user-facing change；已實作的 `/memory` 健康度 UI 仍可操作，但本 change 尚未通過收尾閘門） |
| 2026-04-04 | V4 Change 1 executor verify | 完成 `memory-health-scoring` 的 apply / verify：`/api/memory` 現在會回傳 health summary 與 per-item health metadata，`/memory` 已顯示健康度概覽與健康 badge；下一步待 Review Gate 判定是否進入 commit / sync / archive | 有（使用者現在可在 `/memory` 先看到過期比例與建議清理數量，再依每條記憶的 `健康 / 待確認 / 過期風險` 標記決定是否整理） |
| 2026-04-04 | V3 Change 6 archive | `import-ui-multi-source` 已 archive 至 `openspec/changes/archive/2026-04-03-import-ui-multi-source/`，V3 六個 planned changes 全數完成；下一步轉向 template blocker 與 V4 規劃 | 無（No user-facing change；本次為治理收尾，使用者可見能力已在 apply / verify / sync 階段上線） |
| 2026-04-04 | V3 Change 6 review gate + sync | `import-ui-multi-source` Review Gate 判定 PASS，main spec 已同步到 `openspec/specs/import-ui-multi-source/spec.md`，目前只剩 archive 需人工確認 | 無（No user-facing change；使用者可見能力已在 executor verify 階段上線，本次是治理收尾與 spec 同步） |
| 2026-04-04 | V3 Change 6 executor verify | 完成 `import-ui-multi-source` apply / verify：`/extract` 新增工具來源 selector、per-source import controls 與 candidate source badge；下一步待 Review Gate 判定是否進入 sync / archive | 有（使用者現在可在 `/extract` 先選 `plain` / `chatgpt` / `copilot`，再使用對應入口匯入內容；候選審核階段可直接看到來源 badge） |
| 2026-04-04 | V3 Change 6 executor start | 啟動 `import-ui-multi-source` executor，完成 preflight 與 `#opsx-new` / `#opsx-ff` artifact 草稿；brief / handoff 已切換為 active change 狀態，下一步進入 `/extract` tool selector 與 source badge 實作 | 無（No user-facing change；本次僅建立 active change artifacts 與治理同步，尚未改動 `/extract` UI 或匯入行為） |
| 2026-04-03 | V3 Change 6 planner | 啟動 `import-ui-multi-source` 的 Planner scope gate，確認 brief 已有人類確認、change 屬於 V3 Import UI scope，且 repo 無 active duplicate；handoff 已切換為 Executor-ready 規劃狀態 | 無（No user-facing change；本次僅完成規劃、交接與治理同步，尚未改動 `/extract` UI 或匯入流程） |
| 2026-04-03 | V3 Change 5 archive | 完成 `source-attribution-in-memory` 的 main spec sync 與 archive 收尾；下一步切換至 `import-ui-multi-source` | 無（No user-facing change；功能已在 executor apply / verify 階段上線，本次為治理收尾與交接切換） |
| 2026-04-03 | V3 Change 5 executor | 完成 `source-attribution-in-memory` 的 apply / verify：`/extract` 寫回 memory 時會保存來源 metadata，`/memory` 可顯示對應來源 badge；既有 legacy 條目維持相容 | 有（使用者現在可在 `/memory` 看到新寫回記憶的來源 badge，例如 ChatGPT / Copilot / Plain；既有條目若沒有 metadata 則維持原樣） |
| 2026-04-03 | V3 Change 5 executor start | 啟動 `source-attribution-in-memory` executor，完成 `#opsx-new`、`#opsx-ff` 與 strict validate；active change 進入 memory source metadata / badge 實作 | 無（No user-facing change；目前僅建立 artifacts、切換 handoff 與 brief 狀態，尚未改動 `/memory` 或 writeback 行為） |
| 2026-04-03 | V3 Change 5 planner | 啟動 `source-attribution-in-memory` 的 Planner scope gate，確認 brief 已有人類確認、change 仍在 V3 scope 內，並將 handoff 切換為 memory source metadata / badge 規劃 | 無（No user-facing change；本次僅完成規劃與交接切換，尚未改動 `/memory` 或 writeback 行為） |
| 2026-04-03 | V3 Change 4 archive | 完成 `local-import-vscode-copilot` archive，active change 已封存至 `openspec/changes/archive/2026-04-03-local-import-vscode-copilot/`，handoff 轉向下一個 V3 change | 無（No user-facing change；本次為治理收尾與交接切換，`/extract` 能力不變） |
| 2026-04-03 | V3 Change 4 git publish | 完成 `add copilot local import` commit 與 `origin/main` push，handoff 改為僅待人工確認 `#opsx-archive` | 無（No user-facing change；僅同步發布狀態與交接資訊） |
| 2026-04-03 | V3 Change 4 review-gate cleanup | 校正 `docs/planning/v3-brief.md` 的 Change 4 impact 文字，使 brief 與 `/extract` 實際能力、handoff、manual 同步一致 | 無（No user-facing change；僅治理文件對齊，功能仍為 Copilot local import + ChatGPT / plain text 共存） |
| 2026-04-03 | V3 Change 4 executor | 完成 `local-import-vscode-copilot` 的 apply / verify / sync：`/extract` 新增 Copilot 本機 session list、path override 與單一 session 載入；既有 ChatGPT / plain text 路徑維持可用 | 有（使用者現在可在 `/extract` 直接刷新並載入本機 VS Code Copilot Chat JSONL session，再沿用既有 extraction / review / writeback 流程；尚無搜尋、多 session merge 或 source badge） |
| 2026-04-03 | V3 Change 4 executor start | 啟動 `local-import-vscode-copilot` executor，完成 `#opsx-new` 與 preflight，確認本機 `Code - Insiders` 存在可讀的 Copilot session JSONL；下一步進入 parser / API / `/extract` local import UI 實作 | 無（No user-facing change；目前僅建立 active change artifacts、更新 brief / handoff / manual，尚未改動 `/extract` 行為） |
| 2026-04-03 | V3 Change 3 archive | 完成 `chatgpt-adapter` 的 main spec sync 與 archive 收尾；`/extract` 的 ChatGPT transcript / JSON 匯入能力維持上線，下一步切換至 `local-import-vscode-copilot` | 無（No new user-facing change；本次為治理收尾與主 spec 同步，功能已在 executor 階段上線） |
| 2026-04-03 | V3 Change 3 executor | 完成 `chatgpt-adapter` 的 new / ff / apply / verify：`/extract` 新增 ChatGPT transcript auto-detect、JSON/TXT 上傳入口與 plain-text fallback 驗證 | 有（使用者現在可在 `/extract` 直接貼上 ChatGPT transcript，或上傳 ChatGPT conversation JSON / TXT；仍無多 conversation picker 與 source badge） |
| 2026-04-03 | V3 Change 3 planner | 啟動 `chatgpt-adapter` 的 Planner scope gate，確認 change 在 V3 brief scope 內、無 active duplicate change，並交棒給下一個 Executor session 建立 artifacts | 無（No user-facing change；本次僅完成 change 規劃與 handoff 更新，尚未改動 `/extract` 或匯入格式支援） |
| 2026-04-03 | V3 Change 2 archive | 完成 `plain-text-adapter-refactor` 的 main spec sync、Review Gate 修補與 archive 收尾；下一步切換至 `chatgpt-adapter` | 無（No user-facing change；本次為治理收尾，已上線的 `/extract` adapter-based plain text flow 不變） |
| 2026-04-03 | V3 Change 2 apply | 完成 `plain-text-adapter-refactor`：新增 `PlainTextAdapter`、將 `/extract` 入口改接 `ConversationDoc`、補 adapter 驗證與 smoke 證據 | 無（No workflow change；純文字貼上與寫回操作路徑不變，僅內部改為 adapter-based pipeline） |
| 2026-04-03 | V3 Change 2 preflight | 啟動 `plain-text-adapter-refactor` 的 Planner 前置，收斂 change scope、驗收條件與風險，準備進入 `#opsx-new` | 無（No user-facing change；本次僅規劃 `PlainTextAdapter` 重構邊界，尚未改動 `/extract` 行為） |
| 2026-04-03 | V3 Change 1 | 完成 `conversation-schema-definition` 的 schema 文件、主 spec sync 與 archive 收尾 | 無（No user-facing change；本次僅定義 `ConversationMessage` / `ConversationDoc` 契約並同步治理文件，尚未改動 `/extract` 或 `/memory` 操作） |
| 2026-04-02 | V4 | 撰寫 v4-brief.md，定義治理自動化與個人 AI OS 計劃 | 無（規劃文件，未開始實作） |
| 2026-04-02 | V3 | 撰寫 v3-brief.md，定義跨工具整合層計劃 | 無（規劃文件，未開始實作） |
| 2026-04-02 | Template 1.5 | 升級 copilot-workspace-template v1.5.0，凍結 Style Guide | 無（開發流程改善，不影響產品功能） |
| 2026-04-01 | V2 | V2 四個 Changes 全部完成，工作台穩定化 | 有：writeback 更安全、多專案真切換、文件一致 |
| 2026-03-28 | V1 | V1 Phase 1–5 全部完成 | 有：完整知識閉環工作台可用 |

## 參考連結
- Version Brief（V1）：`docs/planning/v1-brief.md`
- Version Brief（V2）：`docs/planning/v2-brief.md`
- Roadmap：`docs/roadmap.md`
