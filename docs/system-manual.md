# System Manual — Personal AI Work System

## 系統概述

Personal AI Work System（WOS）是一個讓使用者在多個 AI 對話 session 之間保持上下文連續性的個人工作台。透過 markdown 驅動的文件結構與輕量 web UI，支援 handoff 產生、對話知識提取、審核寫回、決策檢視與多專案管理。

## 目前版本

- **V1** — 單專案知識閉環工作台 ✅ 已完成
- **V2** — 穩定化與多專案工作台 ✅ 已完成
- **V3** — 跨工具整合層 🔄 進行中
- **V4** — 治理、自動化、個人 AI 作業系統 ⏳ 規劃中

## 功能總覽

### 專案總覽（Overview）
- 能力描述：顯示 roadmap 進度與當前任務狀態
- 操作方式：瀏覽器開啟 http://localhost:3000/
- 限制：僅讀取，不可在 UI 編輯

### Handoff Builder（/handoff）
- 能力描述：選擇 handoff 類型（規劃/實作/整合），編輯欄位，產生 markdown，一鍵複製
- 操作方式：選模板 → 填寫欄位 → 預覽 → 複製
- 限制：範本結構硬編碼在前端 JS，不支援自訂範本

### 知識提取與寫回（/extract）
- 能力描述：在 `/extract` 先選擇工具來源（純文字 / ChatGPT / VS Code Copilot），再用對應入口貼上文字、上傳 ChatGPT JSON / TXT，或載入 Copilot session；內容會先正規化為 `ConversationDoc`，再進入候選提取、審核與寫回 `docs/memory/`
- 操作方式：開啟 `/extract` → 選擇工具來源 → 依模式貼上文字、上傳 ChatGPT 檔案，或刷新並載入 Copilot session → 點「提取候選知識」→ 審核候選（可看到來源 badge）→ 點「寫回」
- 改善（V2）：寫回前自動 backup（`.backup/` 機制），不再整檔覆蓋
- 改善（V3 Change 2）：既有純文字入口已接上 `ConversationDoc` adapter 基線，為後續多來源匯入保留共同介面
- 改善（V3 Change 3）：新增 `ChatGPTAdapter`，支援分享頁 transcript 貼上與 ChatGPT conversation JSON 匯入；若內容不符合 ChatGPT 偵測條件，系統會自動退回 `PlainTextAdapter`
- 改善（V3 Change 4）：新增 Copilot 本機 session 匯入；`/extract` 可直接讀取最近的 VS Code Copilot JSONL session，並支援覆寫 session 路徑
- 改善（V3 Change 5）：寫回 memory 條目時會自動保存來源 metadata（`plain` / `chatgpt` / `copilot`），供 `/memory` 顯示來源 badge
- 改善（V3 Change 6）：`/extract` 新增工具來源 selector 與 per-source import controls；候選審核卡片與 summary 會顯示來源 badge / source summary

### 專案記憶（/memory）
- 能力描述：讀取 `docs/memory/*.md` 並以分類卡片呈現專案記憶
- 操作方式：瀏覽器開啟 http://localhost:3000/memory
- 改善（V3 Change 5）：若記憶條目含 `<!-- source: ... -->` metadata，頁面會顯示對應來源 badge；舊條目沒有 metadata 仍可正常顯示

### 決策與規則檢視（/decisions）
- 能力描述：瀏覽決策記錄、搜尋篩選、檢視偏好規則、基本衝突偵測
- 操作方式：輸入關鍵字搜尋，切換 tab 查看不同分類
- 限制：衝突偵測僅基於否定詞前綴比對

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
- `/extract` 的工具來源 selector 目前只涵蓋 `plain` / `chatgpt` / `copilot`；尚未支援 Gemini / Claude / Antigravity
- 舊有 memory 條目大多尚未回填來源 metadata，因此 `/memory` 只會對新寫回或手動補 metadata 的條目顯示來源 badge
- 無自動化治理（V4 改善目標）

## 版本歷史摘要
| 版本 | 日期 | 主要變更 |
|------|------|---------||
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
