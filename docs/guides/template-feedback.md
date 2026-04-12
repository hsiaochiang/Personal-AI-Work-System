# Template Feedback Guide — 問題通報與修復指南

> 適用對象：在 **PAIS DEV** 工作中，發現問題需要決定「在目標專案修」還是「回到 Copilot Template 修」的開發者。

---

## 命名框架速查

| 術語 | 路徑 | 說明 |
|---|---|---|
| **PAIS DEV** | `D:\program\Personal-AI-Work-System` | 目標專案開發環境 |
| **PAIS PROD** | `D:\prod\Personal-AI-Work-System` | 正式上線環境 |
| **Copilot Template** | `D:\program\copilot-workspace-template` | 模板工具，rules/skills/agents 的上游來源 |

---

## Step 0 — 判斷問題在哪一層

```
在 PAIS DEV / PAIS PROD 發現問題
  ↓
查看 TEMPLATE-FILES.md
  ↓
  ├─ project-owned / protected / init-only
  │       → 【路徑 A】直接在 PAIS DEV 修復
  │
  └─ managed（rules/ skills/ agents/ 等）
          → 【路徑 B】回到 Copilot Template 修復，再同步進 PAIS DEV
```

**快速判斷表：**

| 問題類型 | 走哪條路 |
|---|---|
| UI 按鈕、樣式、頁面行為 | 路徑 A（project-owned） |
| 使用者操作文件、system-manual | 路徑 A（project-owned） |
| PAIS 特有流程限制 | 路徑 A（寫入 90-project-custom.md） |
| rules/（quality-gate、ux-flow 等）邏輯缺陷 | 路徑 B（managed） |
| skills/（code-reviewer、smoke-tester 等）行為錯誤 | 路徑 B（managed） |
| agents/（WOS agent、OpenSpec 系列）行為不符預期 | 路徑 B（managed） |
| 兩個以上專案都遇到同一問題 | 路徑 B |

---

## 路徑 A — 在 PAIS DEV 直接修復（project-owned）

適用於：PAIS 特有的程式碼、文件、專案設定

### A1 — 建立 inbox 需求紀錄

```
我想記錄一個產品問題：

[描述問題]

請幫我建立一份 inbox 需求文件到
docs/product/inbox/<today>-<slug>.md
```

### A2 — 規劃並執行修復

```
OpenSpec Planner

我在 PAIS 發現了一個需要修正的問題：
[描述問題、位置、預期行為]

請幫我規劃一個 OpenSpec change。
```

確認後執行：

```
OpenSpec Executor

請依照剛才確認的 change 定義開始執行。
```

### A3 — 部署到 PAIS PROD

```powershell
# 在 PAIS DEV 根目錄
.\scripts\deploy-to-prod.ps1
```

---

## 路徑 B — 修復 Copilot Template 再同步（managed files）

適用於：rules/ skills/ agents/ 等模板管理的 managed files 有根本性缺陷

### B1 — 在 PAIS DEV 暫存問題描述

在 `.github/copilot/rules/90-project-custom.md` 末尾記錄：

```markdown
## [待回饋 Copilot Template] YYYY-MM-DD — <問題簡述>
- 問題位置：<managed file 路徑>
- 問題描述：<實際行為 vs 預期行為>
- 重現步驟：<1~3 步>
- 建議修法：<可選>
```

### B2 — 切換到 Copilot Template，建立 OpenSpec Change

> **重要**：在 VS Code 另開資料夾 `D:\program\copilot-workspace-template`，或加入 workspace。

```
OpenSpec Planner

我發現 Copilot Template 有一個 managed file 的缺陷需要修正：

問題位置：template_src/<對應路徑>
問題描述：<實際行為 vs 預期行為>
重現步驟：<填入步驟>
建議修法：<填入或留空>

請幫我規劃一個 OpenSpec change，修改 template_src/ 下對應的 managed file。
```

### B3 — 修改 template_src/，執行 sync

Change 確認後，修改對應的 `template_src/` 檔案，再執行 sync：

```powershell
cd D:\program\copilot-workspace-template

# 確認修改正確
python deploy/bootstrap.py --extract-source   # 可選：先抽出現有版本比對

# 同步 template_src/ 到 live 版
python deploy/bootstrap.py --sync-template-src
```

### B4 — 在 Copilot Template 完成 OpenSpec 收尾

```
Review Gate

請對 Copilot Template 的這個 change 進行最終 gate review。
```

確認後 commit Copilot Template。

### B5 — 回到 PAIS DEV，執行 upgrade

```powershell
cd D:\program\Personal-AI-Work-System

# 預覽將被同步的 managed files 差異
python D:\program\copilot-workspace-template\deploy\bootstrap.py --root . --upgrade-preview

# 確認無誤後套用
python D:\program\copilot-workspace-template\deploy\bootstrap.py --root . --upgrade-apply
```

### B6 — PAIS DEV commit → 部署 PAIS PROD

```powershell
# 確認 managed files 已更新
git diff --stat

# commit
git add .
git commit -m "chore: sync managed files from Copilot Template upgrade"

# 部署
.\scripts\deploy-to-prod.ps1
```

---

## 快速查找：問題對應修復位置

| 問題 | 路徑 | 對應位置 |
|---|---|---|
| AI agent 行為不符預期 | B | `D:\program\copilot-workspace-template\template_src\.github\agents\` |
| Done Gate / Review Gate 規則漏洞 | B | `template_src\.github\copilot\rules\35-quality-gate.md` |
| Skill 邏輯有誤 | B | `template_src\.github\copilot\skills\` |
| UI 按鈕意圖不清、流程斷點 | A | `web/public/js/`、`web/public/css/` |
| UX 審查未覆蓋完整流程 | B | `template_src\.github\copilot\rules\35-quality-gate.md` |
| PAIS 特有限制 | A | `.github/copilot/rules/90-project-custom.md` |
| 使用者操作說明有誤 | A | `docs/product/`、`docs/guides/` |

---

## 本指南涵蓋的通報情境（真實案例）

| 日期 | 問題 | 路徑 | 修復位置 |
|---|---|---|---|
| 2026-04-10 | `/extract` 審核候選流程 UX 缺失 | A | `web/public/js/extract.js`、`css/style.css`、`extract.html` |
| 2026-04-10 | `35-quality-gate.md` 未規定端到端審查 | B | `template_src\.github\copilot\rules\35-quality-gate.md` |
| 2026-04-10 | Gemini adapter 片段輸入拋錯 | A | `web/public/js/conversation-adapters.js` |

---

## 相關文件

- [TEMPLATE-FILES.md](../../TEMPLATE-FILES.md) — 檔案分層分類（managed / protected / init-only / project-owned）
- [80-template-boundary.md](../../.github/copilot/rules/80-template-boundary.md) — 模板邊界規則
- [90-project-custom.md](../../.github/copilot/rules/90-project-custom.md) — 專案自訂擴充槽
- [35-quality-gate.md](../../.github/copilot/rules/35-quality-gate.md) — Done Gate 完整規則
- [iteration-cadence.md](iteration-cadence.md) — 產品迭代節奏指南
