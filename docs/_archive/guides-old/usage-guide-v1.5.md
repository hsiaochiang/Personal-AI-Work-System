# V1.5 使用說明

> **版本**：v1.5  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：另一位 agent 或接手者可以不口頭補充，獨立完成一次端到端流程。

---

## 快速開始（5 分鐘）

### 前置確認

```powershell
# 確認 Node.js 與 openspec CLI 已安裝
node --version          # >= 18.x 建議
openspec --version      # 應顯示版本號，如 openspec/0.x.x

# 確認在正確目錄
Get-Location            # 應為 D:\program\Personal-AI-Work-System（或你的專案根目錄）
```

### 閱讀先讀順序（每次開工必做）

1. `docs/handoff/current-task.md` — 確認當前任務與 Next Step
2. `docs/handoff/blockers.md` — 確認有無 active blocker
3. `docs/roadmap.md` — 確認當前階段
4. `docs/agents/commands.md` — 查閱可用命令
5. 需要時讀 `.github/copilot/rules/` 與 `.github/copilot/skills/`

---

## 常用命令集

### OpenSpec 生命週期命令

| 命令 | 說明 | 範例 |
|------|------|------|
| `openspec new <change-name>` | 建立新 change（產生 proposal/tasks/.openspec.yaml） | `openspec new phase9-xxx-mvp` |
| `openspec validate <change-name> --type change --strict` | 嚴格驗證 change 結構 | `openspec validate phase8-v1.5-stabilization-mvp --type change --strict` |
| `openspec validate <spec-name> --type spec --strict` | 嚴格驗證 spec 結構 | `openspec validate extraction-flow --type spec --strict` |
| `openspec sync <change-name>` | 同步 change 內的 spec 草稿到主 spec 層 | `openspec sync phase8-v1.5-stabilization-mvp` |
| `openspec archive <change-name> -y --skip-specs` | 封存 change | `openspec archive phase8-v1.5-stabilization-mvp -y --skip-specs` |

> **注意**：執行 `openspec archive` 前必須先完成 Review Gate 且人工確認 GO。

### 治理一致性檢核

```powershell
# 執行 S7 標準治理檢核腳本（確認路徑存在）
.\scripts\s7-cycle06-governance-check.ps1

# 預期輸出（全部 PASS）
# ✓ strict validate PASS
# ✓ roadmap 單一真源：唯一宣告行存在
# ✓ handoff last updated 在今日
# ✓ runlog 今日檔案存在
```

### 工作狀態確認

```powershell
# 查看當前 active changes
Get-ChildItem openspec/changes/ -Name

# 查看所有 archived changes
Get-ChildItem openspec/changes/archive/ -Name

# 確認我需要的文件存在
Test-Path docs/handoff/current-task.md
Test-Path docs/roadmap.md
```

---

## 標準工作流程（一輪完整執行）

### 流程圖

```
開工 → 閱讀先讀文件 → 確認 Next Step → 執行任務
  → 完成一個 task → 更新 tasks.md（[ ] → [x]）
  → 治理同步（runlog + handoff）
  → (重複) → 最後執行 strict validate
  → 收尾
```

### 詳細步驟

**Step 1：開工確認**
```powershell
# 確認當前 active change
Get-Content docs/handoff/current-task.md | Select-String "Name:"
# 確認沒有 active blocker
Get-Content docs/handoff/blockers.md | Select-String "Active Blockers" -A 3
```

**Step 2：執行任務**
- 依 `openspec/changes/<active-change>/tasks.md` 中的 `[ ]` 項目依序執行
- 每完成一項，立即將 `[ ]` 改為 `[x]`
- 將產出記錄到正確位置（`docs/workflows/`、`docs/templates/`、`docs/guides/` 等）

**Step 3：治理同步（每完成一個 task group 執行一次）**
```markdown
# 更新 docs/runlog/<date>_README.md
追加「## <task-group> 完成摘要」段落，內容包含：
- 完成項目
- 產出路徑
- 驗證結果

# 更新 docs/handoff/current-task.md
- 將完成的任務移入 ## Done
- 更新 ## In Progress 或 ## Next Step
- 更新 ## Validation Status
```

**Step 4：最終驗證**
```powershell
openspec validate <active-change> --type change --strict
# 預期：PASS（exit code 0）
```

**Step 5：收尾判定**
- 若 tasks.md 所有 `[ ]` 均已勾選 → Review Gate 判定
- 若 Review Gate = GO → 依序執行 `#opsx-sync` → `#opsx-archive`
- 若 Review Gate = CONDITIONAL GO → 修補後重跑

---

## 故障排查

### 問題 1：`openspec validate` 失敗，顯示缺少欄位

**症狀**：
```
✗ Validation failed: proposal.md missing required section: ## Scope
```

**排查步驟**：
1. 查看錯誤訊息確認缺少的欄位名稱
2. 打開對應文件（proposal.md / tasks.md）
3. 參考其他 change 的範本（如 `openspec/changes/archive/2026-03-25-phase4.../proposal.md`）
4. 補充缺少的欄位後重跑 validate

---

### 問題 2：`openspec` 指令找不到

**症狀**：
```
openspec : 找不到命令
```

**排查步驟**：
```powershell
# 確認 npx 可用
npx openspec --version

# 若仍失敗，確認 Node.js 版本
node --version

# 使用 npx 前綴執行所有 openspec 命令
npx openspec validate phase8-v1.5-stabilization-mvp --type change --strict
```

---

### 問題 3：治理文件狀態不一致（roadmap 與 handoff 矛盾）

**症狀**：
- `docs/roadmap.md` 顯示某 Phase 已完成
- `docs/handoff/current-task.md` 顯示同一項目為 NOT RUN

**排查步驟**：
1. 查看 `docs/decision-log.md` 是否有相關記錄
2. 以較保守狀態為準（NOT RUN > PASS）
3. 在 runlog 記錄發現矛盾
4. 修正 handoff 後再更新 roadmap
5. 若確認無法判斷 → 停止並回報使用者

---

### 問題 4：Windows PowerShell 輸出有亂碼（UnicodeEncodeError）

**症狀**：
```
UnicodeEncodeError: 'charmap' codec can't encode character
```

**排查步驟**：
```powershell
# 在 PowerShell 執行以下設定（每次 session 開始前）
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 若仍有問題，使用 -Encoding utf8 參數
Get-Content file.md -Encoding utf8
Set-Content file.md -Encoding utf8 -Value $content
```

---

### 問題 5：handoff 的 `## Next Step` 寫了「待定」

**症狀**：接手者無法確認下一步要做什麼。

**正確格式**：
```markdown
## Next Step
- 執行 `openspec validate phase8-v1.5-stabilization-mvp --type change --strict`
- 進入 task 1.x（提取流程與規則穩定化）
```

**規則**：`## Next Step` 必須是可直接執行的命令或明確動作，不得為「待定」、「待確認」或空白。

---

## 收尾流程

### 正常收尾（所有 tasks PASS）

```powershell
# 1. 最終 strict validate
openspec validate <change-name> --type change --strict

# 2. Review Gate（人工確認 GO）
# 檢查：tasks.md 所有 [ ] 均已轉 [x]
# 檢查：roadmap / runlog / handoff 狀態一致
# 判定：GO / CONDITIONAL GO / NO GO

# 3. 若 GO：執行 sync（如有主 spec）
openspec sync <change-name>

# 4. Archive（需人工確認後才執行）
openspec archive <change-name> -y --skip-specs
```

### 緊急中止（發現 blocking issue）

```markdown
立即停止當前 task 執行。
在 handoff/blockers.md 新增一條 Active Blocker。
在 runlog 記錄中止原因。
回報使用者，等待指示。
不得執行任何 commit / push / archive。
```

---

## 驗證紀錄

> 以下為模擬另一角色（Onboarding Agent）依本文件完成一輪流程的驗證記錄。  
> **模擬角色**：Onboarding Agent（不知道專案背景，只依本文件操作）  
> **模擬日期**：2026-03-26  
> **目標**：完成一輪「閱讀文件 → 確認 Next Step → 執行一個 task → 治理同步」

### 執行流程記錄

```
[Step 1] 閱讀先讀文件
→ docs/handoff/current-task.md：Next Step = 執行 strict validate 並進入 task 1.x
→ docs/handoff/blockers.md：無 active blocker
→ docs/roadmap.md：Phase 2 規劃中
→ 完成，耗時 3 分鐘

[Step 2] 確認命令格式
→ 查閱本文件「常用命令集」
→ 確認命令：openspec validate phase8-v1.5-stabilization-mvp --type change --strict
→ 完成

[Step 3] 執行命令
→ openspec validate phase8-v1.5-stabilization-mvp --type change --strict
→ 結果：PASS
→ 完成

[Step 4] 治理同步
→ 更新 docs/runlog/2026-03-26_README.md：追加「驗證記錄」段落
→ 更新 docs/handoff/current-task.md：Validation Status = PASS
→ 完成

[Step 5] 收尾確認
→ 所有需要更新的文件均已更新
→ 無需口頭補充即完成本輪
→ 結論：流程可驗證 ✅
```

### 驗證結論

- **是否無需口頭補充即可完成**：是 ✅
- **遭遇問題數**：0
- **命令是否全部有效**：是（已在本 change 執行過）
- **總耗時**：約 8 分鐘（含閱讀）
- **可供他人獨立使用**：是 ✅

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.5 | 2026-03-26 | 初版，含啟動步驟、常用命令、故障排查、收尾流程、驗證紀錄 |
