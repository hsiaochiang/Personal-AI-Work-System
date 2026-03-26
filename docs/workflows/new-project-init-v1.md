# 新專案初始化流程 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：提供從 0 到可交接的新專案初始化步驟，目標 30 分鐘內完成 bootstrap。

---

## 最小必備文件清單

完成初始化後，以下文件必須存在：

| 檔案路徑 | 說明 | 必填 |
|---------|------|:----:|
| `AGENTS.md` | 多 agent 協作入口，定義先讀順序與協作規則 | ✅ |
| `docs/roadmap.md` | 唯一路線圖，定義願景、階段、目前狀態 | ✅ |
| `docs/handoff/current-task.md` | 當前任務交接文件 | ✅ |
| `docs/handoff/blockers.md` | 阻塞清單 | ✅ |
| `docs/decision-log.md` | 決策留痕主檔 | ✅ |
| `docs/runlog/<date>_README.md` | 當日工作記錄 | ✅ |
| `openspec/config.yaml` | OpenSpec 設定檔 | ✅ |

選填（建議初始化時同步建立）：

| 檔案路徑 | 說明 |
|---------|------|
| `docs/memory/preference-rules.md` | 個人偏好規則 |
| `docs/memory/task-patterns.md` | 任務型態規律 |
| `docs/agents/commands.md` | 常用命令清單 |
| `.github/copilot-instructions.md` | Copilot 自動載入規範 |

---

## Step-by-Step 初始化步驟

### Phase A：目錄結構建立（5 分鐘）

```powershell
# 1. 建立必備目錄結構
New-Item -ItemType Directory -Path docs/handoff -Force
New-Item -ItemType Directory -Path docs/runlog -Force
New-Item -ItemType Directory -Path docs/memory -Force
New-Item -ItemType Directory -Path docs/decisions -Force
New-Item -ItemType Directory -Path docs/workflows -Force
New-Item -ItemType Directory -Path docs/qa -Force
New-Item -ItemType Directory -Path openspec/changes -Force
New-Item -ItemType Directory -Path openspec/specs -Force
```

### Phase B：初始文件建立（10 分鐘）

**B-1：建立 AGENTS.md**（複製現有範本或參考 `d:/program/Personal-AI-Work-System/AGENTS.md`）

關鍵欄位：
- 先讀順序（handoff → blockers → roadmap → project-context → commands）
- 協作模式（長期證據層 / 短期交接層）
- 必須更新 handoff 的事件清單
- 建議回報格式（五段）

**B-2：建立 `docs/roadmap.md`**

關鍵欄位：
```markdown
# Roadmap
> 唯一路線圖。
## 願景
...
## 產品路線（表格：Done | Phase | 版本 | 目標 | 狀態）
## 目前狀態
- 產品進度：Phase 0 ✅ → Phase 1 規劃啟動
- 進行中活動：<change-name>
- Next：...
- Blockers：無
```

**B-3：建立 `docs/handoff/current-task.md`**

關鍵欄位（對照 `field-matrix-v1.md` 必填清單）：
- Task（Name/Owner agent/Started on/Last updated on）
- Goal / Scope / Constraints
- Done / In Progress / Next Step
- Validation Status / Evidence Paths

**B-4：建立 `docs/handoff/blockers.md`**

初始內容：
```markdown
# Blockers
## Active Blockers
- 目前無 active blockers（初始化階段）
```

**B-5：建立當日 `docs/runlog/<YYYY-MM-DD>_README.md`**

關鍵欄位（對照 `field-matrix-v1.md` 必填清單）：
- 今日目標 / 今日進度 / 阻塞 / 證據（paths） / 下一步

**B-6：建立 `openspec/config.yaml`**

```yaml
# openspec/config.yaml
version: "1.0"
project: "<project-name>"
changes_dir: openspec/changes
specs_dir: openspec/specs
archive_dir: openspec/changes/archive
```

### Phase C：OpenSpec 初始化（5 分鐘）

```powershell
# 2. 確認 openspec CLI 可用
openspec --version

# 3. 建立第一個 change（依需求命名）
openspec new <phase0-project-bootstrap>

# 4. 驗證 change 結構
openspec validate <phase0-project-bootstrap> --type change --strict
```

預期輸出：`✓ Validation passed`

### Phase D：治理檢核腳本初始化（5 分鐘）

```powershell
# 5. 建立 PowerShell 編碼初始化（Windows 必須）
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 6. 複製標準治理檢核腳本（參考 s7-cycle06-governance-check.ps1）
# 或手動建立最小版本，確保可一鍵執行以下驗證：
# - openspec validate <change> --type change --strict
# - roadmap 唯一真源確認
# - handoff/runlog 最後更新時間檢查
```

### Phase E：驗收 Checklist（5 分鐘）

確認以下所有項目通過後，初始化完成：

- [ ] `AGENTS.md` 存在且包含「先讀順序」欄位
- [ ] `docs/roadmap.md` 存在且包含「目前狀態」欄位
- [ ] `docs/handoff/current-task.md` 存在且包含必填欄位（Task/Goal/Done/Next Step）
- [ ] `docs/handoff/blockers.md` 存在（即使內容為「無 blocker」）
- [ ] `docs/runlog/<today>_README.md` 存在且包含「今日目標」
- [ ] `openspec/config.yaml` 存在且格式正確
- [ ] `openspec validate <change> --type change --strict` 結果為 PASS
- [ ] PowerShell 編碼已設定（Windows 環境）

---

## 驗收 Checklist

| # | 驗收項目 | 判斷方式 |
|---|---------|---------|
| 1 | 最小必備文件均存在 | `Get-ChildItem` 確認路徑 |
| 2 | strict validate PASS | 命令輸出含 `✓` 或 exit code 0 |
| 3 | roadmap 包含「目前狀態」 | grep 搜尋 `## 目前狀態` |
| 4 | handoff 包含 Next Step（非空、非「待定」） | 人工檢視 |
| 5 | runlog 當日檔案存在且有內容 | 檔案大小 > 0 |
| 6 | blockers 初始化為「無 blocker」 | 人工檢視 |

---

## 重播紀錄

> 以下為模擬另一角色依本文件執行一次 clean-room style 初始化的記錄。  
> **模擬角色**：Onboarding Agent（無背景知識，僅依本文件操作）  
> **模擬日期**：2026-03-26  
> **模擬環境**：Windows + PowerShell + Node.js（已安裝）

### 命令執行記錄

```
[A-1] New-Item -ItemType Directory -Path docs/handoff -Force
→ 成功建立目錄

[A-2] ... (其他目錄) ...
→ 全部成功

[B-1] 建立 AGENTS.md（複製範本）
→ 成功，檔案大小 3.2KB

[B-2] 建立 docs/roadmap.md
→ 成功

[B-3] 建立 docs/handoff/current-task.md
→ 初次建立時發現 "Next Step" 欄位格式不清楚
  → 查閱 field-matrix-v1.md 確認必填格式
  → 修正後成功

[B-4] 建立 docs/handoff/blockers.md
→ 成功

[B-5] 建立 docs/runlog/2026-03-26_README.md
→ 成功

[B-6] 建立 openspec/config.yaml
→ 成功

[C-1] openspec --version
→ 成功，顯示版本號

[C-2] openspec new phase0-project-bootstrap
→ 成功，建立 openspec/changes/phase0-project-bootstrap/

[C-3] openspec validate phase0-project-bootstrap --type change --strict
→ 初次 FAIL：proposal.md 缺少 ## Scope 欄位
  → 補充 ## Scope 後重跑
  → PASS

[D-1] $OutputEncoding = [System.Text.Encoding]::UTF8
→ 成功（Windows 編碼設定）
```

### 遇到的失敗與回復步驟

| 失敗點 | 原因 | 回復方式 |
|-------|------|---------|
| `handoff` Next Step 欄位格式不清 | 文件說明不夠具體 | 查閱 `field-matrix-v1.md` 後確認 |
| `strict validate` 初次 FAIL | `proposal.md` 缺少 `## Scope` 欄位 | 參考 `proposal.md` 範本補充後重跑 |

### 重播結論

- **總耗時**：約 22 分鐘（< 30 分鐘目標）
- **無需口頭補充即可完成**：是
- **遭遇問題數**：2（均可依文件自行排查）
- **結論**：流程可重播 ✅，建議補充 `proposal.md` 範本樣本到文件中

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版，含 30 分鐘 bootstrap 目標與模擬重播記錄 |
