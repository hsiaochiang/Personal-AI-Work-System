# Gemini CLI Skill 衝突改善建議報告

## 1. 現況分析 (Current Issue)
Gemini CLI 在啟動時偵測到大量 Skill 名稱衝突。具體表現為：
- **路徑 A**: `D:\program\Personal-AI-Work-System\.agents\skills\`
- **路徑 B**: `D:\program\Personal-AI-Work-System\.gemini\skills\`

當兩個不同路徑下的 `SKILL.md` 檔案擁有相同的 `name` 屬性時，CLI 會發出警告並依照預設優先級進行覆蓋（目前由 `.agents\skills\` 覆蓋 `.gemini\skills\`）。

## 2. 官方規則與依據 (Official Rules & Guidelines)

根據 Gemini CLI 的開發規範（參考自 \`cli_help\` 及內建 \`skill-creator\` 指引）：

1.  **唯一性原則 (Uniqueness)**：
    - 每個被載入的 Skill 必須具備唯一的 \`name\`。
    - 系統不允許在同一個 session 中存在兩個名稱完全相同的指令集。
2.  **載入優先序 (Loading Priority)**：
    - CLI 會掃描多個預設目錄（如 \`.gemini/skills\`、\`.github/skills\`、\`.agents/skills\`）。
    - 發生名稱衝突時，系統會報警並選擇其中之一，這可能導致版本混亂（例如：您修改了 A 目錄的程式碼，但 CLI 實際上在執行 B 目錄的舊版）。
3.  **架構建議 (Architecture Best Practice)**：
    - **Single Source of Truth (SSOT)**：共用的業務邏輯（如 OpenSpec 流程）應儲存於「中立目錄」（如 \`.agents/skills\`）。
    - **Platform Adapters**：特定的平台入口（如 \`.gemini/\` 或 \`.github/\`）應僅作為「引用者」或「導讀者」，而不應存放重複的物理複本。

## 3. 改善建議方案

### 方案 A：移除冗餘複本 (推薦)
這是最徹底的解決方法。既然 \`.agents/skills/\` 已包含完整的 OpenSpec Skill，應移除平台專屬目錄下的重複檔案。

**操作步驟：**
1.  核對內容：確保 \`.agents/skills/\` 下的內容是最新的。
2.  刪除目錄：刪除整個 \`D:\program\Personal-AI-Work-System\.gemini\skills\` 目錄。
3.  重啟服務：重啟 Gemini CLI 終端機。

### 方案 B：重新命名以作區分 (若邏輯不同)
如果您希望保留兩者，且它們的行為有所不同，必須修改 \`SKILL.md\` 的 Metadata。

**操作步驟：**
1.  修改 \`.gemini/skills/<name>/SKILL.md\`。
2.  將 \`name:\` 欄位加上字首，例如 \`name: gemini-openspec-propose\`。

## 4. 總結與預期效果
實施 **方案 A** 後，系統將僅保留一份 canonical (正本) Skill：
- **消除警告**：不再出現 \`Skill conflict detected\`。
- **維護簡化**：未來修改流程只需更新一處。
- **邏輯一致**：確保所有 Agent（Gemini, Copilot, Claude）使用的都是同一套 OpenSpec 邏輯。

---
*文件生成日期：2026-04-04*
*負責 Agent：Gemini CLI*