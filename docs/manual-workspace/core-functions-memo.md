# WOS 核心功能說明 (Core Functions Memo)

> 本文件為開發者自我備忘錄，記錄 WOS 各模組的核心邏輯與操作路徑。

## 3.1 儀表板與專案管理 (Overview)
- **功能說明**：顯示專案進度、治理待辦事項與當前專案上下文。
- **關鍵操作**：
    - 查看 Dashboard 上的「治理待辦事項」。
    - 切換 Sidebar 專案確保資料源正確。
- [SCREENSHOT: overview_dashboard]

## 3.2 知識提取與正規化 (Extract)
- **功能說明**：將對話 transcript 轉換為 memory。
- **步驟**：
    1. 選擇 `Source` (ChatGPT/Gemini/Claude/Copilot)。
    2. 貼上文字或匯入 JSON。
    3. 點擊 `提取候選知識`。
    4. 審核並執行 `寫回` (Writeback)。
- **注意**：系統會自動建立 `.backup/` 備份。
- [SCREENSHOT: extract_page_initial]
- [SCREENSHOT: extract_candidate_review]

## 3.3 專案記憶維護 (Memory)
- **功能說明**：檢視與維護知識庫的健康度。
- **指標說明**：
    - `健康度 Badge`：綠色(正常)、黃色(待確認)、紅色(過期風險)。
    - `疑似重複`：自動比對相似內容，提供 Merge/Delete 建議。
- [SCREENSHOT: memory_health_overview]
- [SCREENSHOT: memory_dedup_ui]

## 3.4 決策與規則衝突 (Decisions)
- **功能說明**：追蹤技術決策，並自動分析規則衝突。
- **核心檢查點**：
    - 規則 Tab 下的 `Conflict Explanation`。
- [SCREENSHOT: decisions_rules_tab]

## 3.5 交接建構器 (Handoff)
- **功能說明**：標準化 Session 交接流程。
- [SCREENSHOT: handoff_builder]
