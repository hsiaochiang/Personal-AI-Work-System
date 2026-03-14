# Personal AI Work System

## 專案目標

- 建立一套可跨 ChatGPT、Gemini、VS Code、Antigravity 使用的核心知識庫
- 讓每個專案都能逐步累積專屬記憶，而不是只累積聊天紀錄
- 讓重複任務逐步從自由提示詞，收斂成固定工作流與 SKILL
- 讓 AI 在同一專案中越來越懂我的標準，並降低每次啟動摩擦
- 讓新專案可以從既有模板快速開始，而不是重頭建制

## 目前狀態

- 已完成第一輪規劃與專案骨架
- 已導入 `copilot-workspace-template` 作為 workspace template
- 已建立專案記憶檔、handoff 模板與更新流程
- 已定義 V1 roadmap 與整體專案 roadmap
- 下一步是進入 Phase 1，開始用真實工作手動跑流程

## 專案結構

- `.github/`: Copilot instructions、rules、skills、prompts、agents
- `openspec/`: OpenSpec 規格與 changes
- `design/`: 設計輸入與 Stitch 相關檔案
- `experience/`: session 總結與分享素材
- `docs/planning/`: 規劃與設計文件
- `docs/memory/`: 專案記憶與決策
- `docs/workflows/`: 日常工作流程與策略
- `docs/templates/`: handoff 與交接模板
- `docs/product/`: 產品願景、價值與 UI 規劃
- `docs/roadmap/`: V1 與整體專案 roadmap
- `docs/references/`: 參考資料與外部文件快照

## 文件位置

給我看的文件都在 `docs/` 下面。

### docs 內的重要檔案

- `docs/planning/ai-workflow-planning.md`: 總規劃文件
- `docs/memory/project-context.md`: 專案背景、限制、術語與脈絡
- `docs/memory/preference-rules.md`: 使用偏好、工作習慣、禁忌與規則
- `docs/memory/task-patterns.md`: 專案中的高頻任務流程
- `docs/memory/output-patterns.md`: 常用交付樣式與輸出偏好
- `docs/memory/decision-log.md`: 已定案事項與決策理由
- `docs/memory/skill-candidates.md`: 值得升級為 SKILL 或固定 workflow 的候選
- `docs/workflows/update-workflow.md`: 日常讀取、提取、確認與更新流程
- `docs/workflows/conversation-and-branch-strategy.md`: 對話切分與分支使用策略
- `docs/templates/implementation-handoff-template.md`: 實作串交接模板
- `docs/templates/planning-handoff-template.md`: 規劃串交接模板
- `docs/templates/integration-handoff-template.md`: 整合串交接模板
- `docs/product/ui-and-product-vision.md`: UI 與產品願景
- `docs/product/ui-information-architecture.md`: UI 資訊架構與低保真畫面草圖
- `docs/product/immediate-value-and-usage-scenarios.md`: 完成後可立即使用的價值與使用情境
- `docs/roadmap/v1-roadmap.md`: 第一版 roadmap、工作項目與時間估算
- `docs/roadmap/project-roadmap.md`: 整個專案的版本演進 roadmap
- `docs/roadmap.md`: 給 template / Copilot workflow 使用的目前階段摘要
- `docs/decision-log.md`: 給 template / Copilot workflow 使用的決策索引

## 使用方式

### 開始工作前

- 先閱讀本檔
- 視需要補讀 `docs/memory/project-context.md`、`docs/memory/preference-rules.md` 與 `docs/memory/decision-log.md`

### 工作進行中

- 優先依照既有專案記憶與偏好合作
- 若出現新的背景、偏好、流程或決策，先留在對話中，工作後再整理

### 工作結束後

- 提出可沉澱內容
- 經確認後更新對應檔案

## 最近更新

- 完成文件分類與資料夾重組
- 定義 V1 roadmap 與整個專案 roadmap
