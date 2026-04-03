# upgrade-advisor（目標專案升級顧問）

## 角色定位

在**目標專案**中使用的升級顧問。幫助目標專案使用者了解：
- 目前安裝的模板版本是什麼
- 上游是否有新版本
- 升級會影響哪些檔案
- 如何安全地執行升級

> 本 skill 由 bootstrap `--init` 時自動種入目標專案。
> 觸發方式：在目標專案中輸入 `#template-upgrade`

---

## 必讀規則

- `rules/75-deploy-governance.md` — 布版治理規範（managed / protected 邊界）
- `rules/80-template-boundary.md` — 模板邊界規則（檔案分類定義）

---

## 前置條件

- [ ] 目前在**目標專案**目錄中（不是模板專案本身）
- [ ] `template-lock.json` 存在於 `.github/copilot/template-lock.json`
- [ ] 已知模板專案的本機工具路徑（或 GitHub URL）

---

## 步驟

### Step 1：讀取當前版本

```powershell
# 讀取目標專案的 template-lock.json
Get-Content .github/copilot/template-lock.json | ConvertFrom-Json | Select-Object template_version, template_tag, applied_at
```

擷取出：
- `template_version`：目前安裝版本
- `template_tag`：安裝時的 git tag
- `applied_at`：上次套用時間

### Step 2：確認上游最新版本

**方法 A（本機 clone 存在）：**
```powershell
$templateRoot = "$HOME\tools\copilot-workspace-template"
Set-Location $templateRoot
git fetch --tags --quiet
git describe --tags --abbrev=0  # 最新 tag
Get-Content VERSION              # 最新版本號
```

**方法 B（GitHub Release 頁面）：**
- 到 [GitHub Releases](https://github.com/hsiaochiang/copilot-workspace-template/releases) 查看最新版本

### Step 3：執行升級預覽

```powershell
$templateRoot = "$HOME\tools\copilot-workspace-template"
python "$templateRoot\deploy\bootstrap.py" --root . --upgrade-preview
```

預覽輸出包含：
- **會自動覆蓋**的 managed files
- **會跳過**（需人工合併）的 protected files
- **新增**的檔案

### Step 4：產出個人化升級計畫

根據 upgrade-preview 輸出，產出以下格式的升級計畫：

```markdown
## 模板升級計畫

**目前版本**：v{CURRENT}（安裝於 {DATE}）
**最新版本**：v{LATEST}
**版本差異**：{CHANGELOG 對應版本段落}

### 自動處理項目（managed files）
以下檔案將由升級指令自動覆蓋，**無需人工介入**：
| 檔案 | 異動 |
|------|------|
| .github/copilot/rules/xx.md | 更新 |
| .github/copilot/skills/yy.md | 新增 |

### 需人工審查項目（protected files）
以下檔案**不會**被自動覆蓋，但模板的骨架有變更，建議對比後手動合併：
| 檔案 | 建議動作 |
|------|---------|
| docs/roadmap.md | 對比後保留、或手動補充新段落 |
| docs/agents/commands.md | 對比後手動更新指令 |

### 需手動刪除（若有舊版遺留檔案）
| 檔案 | 原因 |
|------|------|
| （本次無）| — |

### 升級步驟
1. 備份目前狀態（可選）：
   ```powershell
   git add . && git commit -m "chore: pre-upgrade snapshot"
   ```
2. 執行升級：
   ```powershell
   python "$templateRoot\deploy\bootstrap.py" --root . --upgrade
   ```
3. 驗證：
   ```powershell
   python "$templateRoot\deploy\bootstrap.py" --root . --verify-only
   python "$templateRoot\deploy\bootstrap.py" --root . --status
   ```
4. 手動合併 protected files（參考上表）
5. Commit：
   ```powershell
   git add .
   git commit -m "chore: upgrade template to v{LATEST}"
   ```
```

### Step 5：合併策略說明（衝突解決）

#### managed files（安心覆蓋）
```powershell
# 升級時自動處理，不需任何動作
python "$templateRoot\deploy\bootstrap.py" --root . --upgrade
```

#### protected files（需人工合併）
```powershell
# 方式 A：查看差異後手動合併
# 先看看上游版本
Get-Content "$templateRoot\docs\agents\commands.md"
# 再看目前版本
Get-Content .\docs\agents\commands.md
# 手動合併差異
```

```powershell
# 方式 B：接受上游版本（會覆蓋本地變更）
python "$templateRoot\deploy\bootstrap.py" --root . --upgrade-apply --mode overwrite
```

#### 已刪除的 managed files
```powershell
# 需手動刪除舊版遺留檔（bootstrap 不自動刪除）
Remove-Item .github/copilot/rules/old-rule.md
```

---

## 輸出

- 個人化升級計畫（inline Markdown）
- 可直接複製執行的 PowerShell 指令
- 下一步清晰導引

---

## 注意事項

- 本 skill 在**目標專案**中執行，路徑引用的是模板專案的工具路徑
- 若使用 GitHub remote 升級方式，需要先設定 git remote：
  ```powershell
  git remote add template https://github.com/hsiaochiang/copilot-workspace-template.git
  git fetch template --tags
  ```
- 升級前建議先 commit 或 stash 目前工作，方便回退
