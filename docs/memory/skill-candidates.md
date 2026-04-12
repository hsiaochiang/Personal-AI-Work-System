# Skill Candidates

## 使用原則

- 只記錄值得升級為 SKILL、固定 workflow 或 agent 規則的模式
- 必須有重複出現的證據，不以單次靈感直接建立
- 先記錄候選，再評估是否正式升級

## 升級門檻

至少同時符合以下多項條件：

- 已重複出現至少三次
- 有穩定的輸入形式
- 有穩定的輸出形式
- 中間步驟可以清楚描述
- 能明顯降低後續工作的摩擦

## 已確認技能

### 技能 1：多工具對話知識提取與沉澱

- 說明：從 ChatGPT / Gemini / Claude / Copilot / 純文字對話中提取專案背景、偏好、決策與任務模式，經審核後寫入 docs/memory/
- 狀態：**已實現**（V3–V5 已上線）
- 實作位置：`/extract` 頁面，支援規則式提取與 AI 輔助提取（Gemini）
- 重複使用依據：本系統核心工作流，每次對話後均可使用

### 技能 2：規劃先行的專案啟動流程

- 說明：對於高不確定性的專案，先完成目標、原則、策略、運作方式、MVP，再進入落地
- 狀態：**已確認**
- 重複使用依據：在本專案 V1~V5 全程驗證有效

## 目前候選

### 候選 1：Gemini AI 輔助決策提取模式

- 說明：對包含長篇技術討論的對話，使用 Gemini AI 提取 tool-insights / task-patterns / decision-log 分類，比規則式引擎準確率更高
- 目前狀態：候選
- 為何值得觀察：已在多次 debug session 中驗證有效，但尚未系統化捕捉最佳提示詞配置
- 尚缺：最佳 prompt engineering 設定與邊界條件文件

### 候選 2：OpenSpec Change 生命週期管理

- 說明：從 Planner → Executor → Review Gate → Archive 的完整 change 管理循環，配合 handoff 交接
- 目前狀態：候選升級
- 為何值得觀察：V3~V5 共執行超過 15 個 change，流程已相當穩定
- 尚缺：正式寫入 `.github/skills/` 的 SKILL 格式定義
