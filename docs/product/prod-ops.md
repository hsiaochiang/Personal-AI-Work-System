# 個人 AI 工作台 — 正式區操作說明

> 適用環境：正式區 `D:\prod\Personal-AI-Work-System`
> 測試區另見：`d:\program\Personal-AI-Work-System`

---

## 環境一覽

| 項目 | 測試區 (DEV) | 正式區 (PROD) |
|------|------------|-------------|
| 路徑 | `d:\program\Personal-AI-Work-System` | `D:\prod\Personal-AI-Work-System` |
| URL | http://localhost:3000 | http://localhost:3001 |
| Git | 主 repo（開發用） | 獨立 clone（資料分離）|
| 目錄內容 | 完整（含開發工具） | 精簡（僅 `web/` + `docs/`）|
| 識別標籤 | 頁面 title / sidebar 顯示 `[DEV:3000]` | 顯示 `[PROD:3001]` |

---

## 正式區目錄結構

```
D:\prod\Personal-AI-Work-System\
├── web\                   # 主服務：Node.js server + 前端
│   ├── server.js          # HTTP server（PORT 3001）
│   ├── public\            # 靜態前端（HTML / CSS / JS）
│   ├── projects.json      # 專案清單設定
│   ├── governance.json    # 治理排程設定
│   └── node_modules\      # npm 依賴（不入 git）
├── docs\
│   ├── roadmap.md         # 專案進度（Overview 頁面讀取）
│   ├── handoff\           # 任務交接文件（Task 頁面讀取）
│   ├── memory\            # 累積知識庫（Memory 頁面讀寫）
│   ├── templates\         # Handoff 模板
│   └── shared\            # 跨工具共用知識快照
├── VERSION                # 目前版本號
└── CHANGELOG.md           # 版本歷史
```

> 正式區透過 `git sparse-checkout` 只保留服務運行必要的目錄。
> `design/`, `openspec/`, `scripts/`, `tools/`, `.github/`, `docs/agents/`, `docs/planning/` 等開發檔案不會出現在正式區。

---

## 一、啟動正式區服務

開啟 PowerShell，執行：

```powershell
$env:PORT="3001"
$env:NODE_ENV="production"
node D:\prod\Personal-AI-Work-System\web\server.js
```

啟動成功後，終端機顯示：

```
  [PROD] 個人 AI 工作系統儀表板
  ──────────────────────────────────
  專案：個人 AI 工作系統（personal-ai）
  環境：production  PORT：3001

  頁面：
    總覽     http://localhost:3001/?projectId=personal-ai
    當前任務  http://localhost:3001/task?projectId=personal-ai
    專案記憶  http://localhost:3001/memory?projectId=personal-ai
```

開啟瀏覽器：**http://localhost:3001/?projectId=personal-ai**
（browser tab 顯示 `專案總覽 — 個人 AI 工作系統 [PROD:3001]`）

---

## 二、頁面功能說明

| URL | 頁面 | 功能 |
|-----|------|------|
| `/?projectId=personal-ai` | 專案總覽 | roadmap 進度、治理待辦 |
| `/task?projectId=personal-ai` | 當前任務 | `docs/handoff/current-task.md` 即時顯示 |
| `/memory?projectId=personal-ai` | 專案記憶 | `docs/memory/` 知識庫瀏覽與搜尋 |
| `/decisions?projectId=personal-ai` | 決策與規則 | 規則衝突偵測、決策歷史 |
| `/handoff?projectId=personal-ai` | Handoff 產生器 | 產生給 AI 讀取的任務背景 |
| `/extract?projectId=personal-ai` | 知識提取 | 將 AI 對話提取為記憶條目 |
| `/settings?projectId=personal-ai` | 設定 | OpenAI API Key 管理 |
| `/projects?projectId=personal-ai` | Projects Hub | 多專案切換 |
| `/search?projectId=personal-ai` | 全域搜尋 | 跨頁面內容搜尋 |

---

## 三、停止服務

在啟動的 PowerShell 視窗按 **Ctrl + C**。

或找到 node 進程強制停止：

```powershell
# 找到佔用 port 3001 的 PID
netstat -ano | findstr ":3001"
# 停止（替換 PID）
Stop-Process -Id <PID> -Force
```

---

## 四、部署新版本（從測試區執行）

> 每次有新版本要上線，在**測試區**執行以下步驟。

在 `d:\program\Personal-AI-Work-System` 執行：

```powershell
# 1. 確認版本號（VERSION 檔案）
Get-Content VERSION

# 2. 停止正式區服務（若正在運行）

# 3. 執行部署腳本
.\scripts\deploy-to-prod.ps1
# 輸入 Y 確認

# 4. 重新啟動正式區服務
$env:PORT="3001"; $env:NODE_ENV="production"
node D:\prod\Personal-AI-Work-System\web\server.js
```

部署腳本會自動：
- 從 GitHub 拉取最新 tag
- 切換正式區到指定版本
- 必要時更新 npm 依賴
- 記錄部署時間到 `docs/runlog/`

---

## 五、多專案設定

如需讓正式區服務管理多個專案，編輯 `D:\prod\Personal-AI-Work-System\web\projects.json`：

```json
{
  "projects": [
    {
      "id": "personal-ai",
      "name": "個人 AI 工作系統",
      "path": "D:\\prod\\Personal-AI-Work-System",
      "description": "個人 AI 工作流程與知識管理系統"
    }
  ]
}
```

在 URL 切換專案：`?projectId=<id>`

---

## 六、首次設置（僅一次）

若正式區目錄不存在，在測試區執行：

```powershell
.\scripts\setup-prod-worktree.ps1
```

完成後手動複製 API 金鑰（若有使用 OpenAI 功能）：

```powershell
Copy-Item "d:\program\Personal-AI-Work-System\web\api-keys.json" `
          "D:\prod\Personal-AI-Work-System\web\api-keys.json"
```

---

## 七、資料備份說明

正式區為獨立 git repo，`gitignore` 的資料檔（`api-keys.json`、`openai-conversation-index.json`）不受版本控制，需手動備份。

**目前狀態**：資料備份機制規劃中（V6 scope）。
**暫行做法**：定期手動複製 `docs/memory/` 和 `web/*.json` 到備份位置。
