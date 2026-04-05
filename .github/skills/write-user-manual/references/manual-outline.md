# 使用者操作說明手冊 — 目標大綱

> 此檔案定義 `docs/product/user-manual-v5.md` 的目標結構。
> 每節的來源文件對應請見 `source-docs-index.md`。

---

# 個人 AI 工作台 操作說明手冊（V5）

> 版本：V5 ｜ 適用讀者：有技術背景的個人使用者

---

## 1. 快速開始

### 1.1 環境需求
- Node.js 版本
- 目錄結構

### 1.2 啟動指令
```bash
cd <專案根目錄>/web
npm start
```

### 1.3 首頁概覽
- 瀏覽器開啟 http://localhost:3000
- 各頁面入口說明（Overview、Extract、Memory、Handoff、Decisions、Settings）

---

## 2. 功能模組詳解

### 2.1 Overview（專案狀態）
- 頁面：`/`
- 顯示內容：roadmap 進度、治理待辦
- 資料來源：`docs/roadmap.md`

### 2.2 Handoff Builder（交接文件）
- 頁面：`/handoff`
- 功能：選擇類型 → 填寫欄位 → 預覽 → 複製
- 使用情境：開始新 AI 對話前準備背景

### 2.3 知識提取與寫回（Extract）← V5 重點
- 頁面：`/extract`
- 功能概述：將 AI 對話內容解析為知識條目，寫回至專案記憶

#### 2.3.1 支援的工具來源
| 來源 | 輸入方式 | 識別標記 |
|------|----------|----------|
| ChatGPT（JSON） | 手動貼上 JSON | `chatgpt` |
| ChatGPT（API） | API 自動載入 | `chatgpt-api` |
| Gemini | 文字貼上 | `gemini` |
| Claude | 文字貼上 | `claude` |
| VS Code Copilot | 本機 session | `copilot` |
| 手動輸入 | 直接輸入 | `plain` |

#### 2.3.2 各工具操作方式
- ChatGPT JSON 格式要求與步驟
- ChatGPT API 載入流程
- Gemini 文字貼上格式要求與步驟
- Claude 文字貼上格式要求與步驟
- Copilot session 操作

#### 2.3.3 來源標記（Source Badge）
- 每筆記憶條目顯示來源標記
- 用途：記憶溯源與過濾

### 2.4 專案記憶（Memory）
- 頁面：`/memory`
- 功能：按分類瀏覽記憶條目
- 分類：決策、偏好、輸出模式、背景、候選、任務模式

### 2.5 決策與規則檢視（Decisions）
- 頁面：`/decisions`
- 功能：檢視決策記錄與規則衝突偵測

### 2.6 設定管理（Settings）
- 頁面：`/settings`
- 功能：API Key 管理

#### 2.6.1 OpenAI API Key 設定
- 設定位置與步驟
- 安全說明：本機儲存，不上傳至任何服務
- 用途：啟用 ChatGPT API 自動載入功能

---

## 3. 多工具整合指南（V5）

### 3.1 工具選擇決策樹
```
想要匯入 AI 對話？
├─ ChatGPT
│   ├─ 有 OpenAI API Key → 使用 API 自動載入（最省事）
│   └─ 沒有 API Key → 從 ChatGPT 網頁匯出 JSON，手動貼上
├─ Gemini → 複製對話文字，貼上至 Extract 頁面
├─ Claude → 複製對話文字，貼上至 Extract 頁面
└─ VS Code Copilot → 使用本機 session 功能
```

### 3.2 ChatGPT 整合
- JSON 匯出步驟（從 ChatGPT 網頁）
- API 自動載入設定前提（需先設定 API Key）
- 兩種方式的比較

### 3.3 Gemini 整合
- 支援的對話格式
- 貼上步驟與注意事項

### 3.4 Claude 整合
- 支援的對話格式
- 貼上步驟與注意事項

### 3.5 VS Code Copilot 整合
- 本機 session 使用說明

---

## 4. 常見問題與已知限制

### 4.1 常見問題
- API Key 設定後沒有作用？
- 貼上文字後無法識別來源？
- 記憶條目重複？

### 4.2 已知限制（V5）
- Gemini / Claude API 自動抓取：不支援（官方 API 限制）
- OAuth 登入流程：不支援
- 多人協作：不支援
- 雲端同步：不支援

### 4.3 資料安全
- 所有資料儲存在本機
- API Key 不上傳至任何外部服務
- 建議定期備份 `docs/` 目錄
