# Changelog — Personal AI Work System

所有版本變更依據 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 格式記錄，版號遵循 [SemVer](https://semver.org/)。

---

## [1.1.2] — 2026-04-10

### URL 識別與環境標籤
- `web/server.js`：HTML response 自動注入 `window.__APP_META__`（projectId / projectName / env / port）
- `web/public/js/app.js`：`<title>` 顯示 `頁面 — 專案名 [ENV:PORT]`；sidebar 顯示環境標籤；nav links 自動贋加 `?projectId`
- startup log 顯示帶 projectId 的完整 URL

---

## [1.1.1] — 2026-04-06

### 基礎設施
- `web/server.js`：PORT 改為 `process.env.PORT`（預設 3000）；NODE_ENV 控制 banner 標籤（[DEV]/[PROD]）
- 新增 `scripts/deploy-to-prod.ps1`：一鍵布版到正式區（PORT 3001）
- 新增 `scripts/setup-prod-worktree.ps1`：首次設置 git worktree 正式區

---

## [1.1.0] — 2026-04-05

### V5：外部 API 整合與多工具擴充層

**新增**
- **Gemini Adapter**：`/extract` 新增 Gemini 來源選項；可直接貼上 Gemini transcript，系統自動辨識格式並解析為 `ConversationDoc`，候選與寫回保留 `gemini` 來源標記
- **Claude Adapter**：`/extract` 新增 Claude 來源選項；可直接貼上 Claude transcript（Human / Assistant 格式），寫回保留 `claude` 來源標記
- **ChatGPT API 自動載入**：`/settings` 新增 API Keys 設定區塊（local-only，儲存於 `web/api-keys.json`，受 `.gitignore` 保護）；`/extract` ChatGPT 來源新增「API 載入」流程，可追蹤並載入 OpenAI platform conversations，寫回保留 `chatgpt-api` 來源標記
- **多工具 Adapter 文件補齊**：`/extract` 各來源 panel 補齊「支援格式」說明；`docs/workflows/conversation-schema.md` 補齊 V5 支援來源矩陣

---

## [1.0.0] — 2026-04-04

### V4：治理、自動化、個人 AI 作業系統

**新增**
- **Memory 健康度評分**：`/api/memory` 提供 health summary；`/memory` 顯示過期比例與每條記憶的健康 badge / reason（新鮮度 × 來源權重）
- **疑似重複記憶偵測**：`/api/memory` 提供 dedup summary；`/memory` 新增「疑似重複建議」區塊，支援 merge / delete，改寫前自動 backup
- **規則衝突偵測 v2**：`/decisions` rules tab 顯示 conflict overview / 衝突規則組數 / per-rule explanation（signal-based，same-category）
- **跨專案 Shared Knowledge 候選**：`/api/memory` 提供 `sharedKnowledge` payload；`/memory` 顯示跨專案重複主題與建議 shared 摘要；`node tools/generate_shared_knowledge_report.js` 可輸出 snapshot
- **治理排程**：`web/governance.json` + server startup due-check；Overview 顯示治理待辦（memory review / decisions review 到期提示）

---

## [0.5.0] — 2026-04-04

### V3：跨工具整合層

**新增**
- **Conversation Schema 定義**：統一 `ConversationDoc` schema，所有 adapter 輸出共同介面
- **Pure Text Adapter 重構**：既有純文字入口接上 `ConversationDoc` adapter 基線
- **ChatGPT Adapter**：支援 ChatGPT 分享頁 transcript 貼上與 conversation JSON 上傳，不符格式自動退回 `PlainTextAdapter`
- **VS Code Copilot 本機匯入**：`/extract` 可讀取最近的 VS Code Copilot JSONL session，支援覆寫 session 路徑
- **來源 Metadata**：寫回 memory 時自動保存 `<!-- source: ... -->` metadata；`/memory` 顯示來源 badge
- **多來源匯入 UI**：`/extract` 新增工具來源 selector，各 source panel 獨立；候選審核與 summary 顯示來源 badge / source summary

---

## [0.3.0] — 2026-04-01

### V2：穩定化與多專案工作台

**改善**
- Writeback 安全強化：寫回前自動 backup（`.backup/` 機制），不再整檔覆蓋
- 多專案真實切換：切換專案後 API 資料源完整跟著切換
- Roadmap 與文件對齊
- 流程驗證與 UX 強化：loading / error / empty 狀態覆蓋

---

## [0.1.0] — 2026-03-27

### V1：單專案知識閉環工作台

**新增**
- 本地 dev server（`node web/server.js`）
- 專案總覽頁（roadmap 進度 + 當前任務）
- Handoff Builder（選模板 → 填欄位 → 複製 markdown）
- 知識提取與審核寫回（貼上對話 → 候選提取 → 審核 → 寫回 `docs/memory/`）
- 決策與規則檢視（搜尋篩選 + tab 分類）
- 多專案切換 + 全域搜尋 + sidebar 專案名稱
