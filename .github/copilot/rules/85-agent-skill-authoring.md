---
applyTo: "**/*.agent.md,**/skills/*.md,**/rules/*.md"
---

# 85-agent-skill-authoring（Agent / Skill / Rule 撰寫規範）

> 目的：確保新增或修改 Agent、Skill、Rule 定義時，遵守專案的規則引用架構，避免規則層與執行層斷裂。
> 本規則在編輯 `.agent.md`、`skills/*.md`、`rules/*.md` 時自動載入。

## 前置步驟（每次新增或修改前必須執行）

```
[ ] 1. 閱讀本文件全部內容
[ ] 2. 閱讀 `.github/copilot-instructions.md` 的任務觸發表
[ ] 3. 閱讀專案現有的 `.github/copilot/rules/` 下所有規則檔
[ ] 4. 列出這個 Agent / Skill / Rule 需要「強制引用」哪些規則
[ ] 5. 確認此 Agent / Skill / Rule 是否與現有定義重複或衝突
[ ] 6. 確認是否需要同步更新 bootstrap render 函式（若此檔案為 managed file）
```

未完成以上步驟，不得開始撰寫定義。

## Rules vs Skills vs Agents — 三者分工

| 類型 | 存放位置 | 用途 | 被動/主動 |
|------|----------|------|-----------|
| **Rule** | `.github/copilot/rules/*.md` | 專案規範、約束條件、不可違反的政策 | **被動**（需要被引用或 `applyTo` 自動載入） |
| **Skill** | `.github/copilot/skills/*.md` | 可重複使用的操作流程、角色定義 | **被動**（在任務觸發表或 agent 定義中被引用） |
| **Agent** | `.github/agents/*.agent.md` | 具備角色、前置條件、執行流程的執行單元 | **主動**（接收指令後執行） |

> 關鍵原則：Rule 是政策文件，Skill 是可重用流程，Agent 是有前置檢查的執行單元。
> 不要把應該是 Skill 的東西寫成 Rule，然後期待 Agent 自己去讀。

## Agent 撰寫規範

### 檔案位置與命名
```
.github/agents/<agent-name>.agent.md
```

### 必要結構

```markdown
---
name: <Agent 名稱>
description: <第三人稱描述，說明角色職責與觸發條件>
tools: [read, search, agent, todo]   # 選用：限制可用工具
---

# 角色
[一句話說明唯一職責]

# 必讀規則（每次啟動時自動套用）
- `rules/<rule-file>.md` — [為什麼要讀]
- `skills/<skill-file>.md` — [為什麼要讀]

# 前置檢查（每次被呼叫時必做）
1. 讀取 [需要讀取的文件或規則]
2. 確認 [關鍵欄位或條件]
3. 若任一條件不符 → 停止，向使用者說明，不得繼續執行

# 工作原則
[列出核心原則]

# 固定輸出格式
[定義輸出結構]
```

### 強制要求
- 每個 Agent **必須有「必讀規則」區塊**，明確列出需要引用的 rules 與 skills
- 每個 Agent **必須有「前置檢查」區塊**，列出啟動前必須確認的條件
- 前置檢查中若有 Gate 條件（如 brief 使用者確認），必須**強制把關**，不符合時停止執行
- description 欄位必須包含觸發條件（Use when... / 適用於...）

## Skill 撰寫規範

### 檔案位置與命名
```
.github/copilot/skills/<skill-name>.md
```

### 必要結構

Skill 不需要 YAML frontmatter，直接以 Markdown 撰寫：

```markdown
# <Skill 名稱>

> 角色定位與使用情境

## 前置條件
[列出使用此 Skill 前必須確認的事項]

## 工作流程
[有序步驟，每步含驗證點]

## 輸出規格
[明確的產出格式、位置、命名]

## 禁止事項
[列出不可違反的限制]
```

## Rule 撰寫規範

### 檔案位置與命名
```
.github/copilot/rules/<NN>-<name>.md
```
- 編號 10~89：模板全域規則（managed，upgrade 會覆蓋）
- 編號 90：專案自訂槽位（protected，upgrade 不覆蓋）

### 必要結構

```markdown
---
applyTo: "<glob-pattern>"     # 選用：自動載入條件
---

# <NN>-<name>（規則標題）

> 目的：[一句話]

## [規範內容]
[具體規則條目]
```

### 何時加 `applyTo`
- 若規則只在特定檔案類型編輯時才需要 → 使用 `applyTo` glob
- 若規則是全域政策（如 scope guard、quality gate）→ 不加 `applyTo`，由 agent 在必讀規則中引用

## 常見設計錯誤（禁止重蹈）

### ❌ Agent 沒有「必讀規則」或「前置檢查」區塊
Agent 定義只有「做什麼」，沒有「開始前先確認什麼」。
→ 每個 Agent 都必須有這兩個區塊。

### ❌ 規則存在但 Agent 不引用
規則寫在 `rules/`，但沒有任何 Agent 在前置條件中讀取它。
→ 在 Agent 的必讀規則中明確列出，並說明要從規則中確認什麼。

### ❌ Gate 條件沒有強制把關
規則要求「使用者確認欄位不為空」，但沒有任何 Agent 檢查它。
→ 把 Gate 條件做成 Agent 的前置檢查，不符合時停止執行。

### ❌ Agent 跳過中間步驟直接執行
Executor 沒有建立 change 目錄就直接改程式碼。
→ 流程步驟必須有驗證點，確認產出存在再進入下一步。

### ❌ 修改了 Agent/Skill/Rule 但沒有同步 bootstrap
若檔案是 managed file，直接改 `.agent.md` 或 `rules/*.md` 會在下次 upgrade 時被覆蓋。
→ 必須同步修改 `deploy/bootstrap.py` 中對應的 render 函式。

## 完成後的交付

建立或修改完成後，必須：

1. 確認檔案位置符合本規範
2. 若為 managed file → 同步更新 bootstrap render 函式
3. 若為新增檔案 → 更新 `TEMPLATE-FILES.md`（若影響分類計數）
4. 提交供審查（可直接建檔，但需在 commit 前提醒使用者確認）
