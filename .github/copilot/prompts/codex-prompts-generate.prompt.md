---
agent: agent
description: "確認 v{N}-brief.md 後，為每個 Change 生成帶序號的 Codex 三角色提示詞 MD 檔案，並在 brief 新增 Prompt 清單區段"
---
請依照以下步驟，為當前版本的每個 Change 生成帶序號的 Codex 三角色提示詞 MD 檔案，並在 brief 新增執行清單。

## 步驟

1. **確認版本號**：讀取 `docs/roadmap.md`，確認當前版本號 N（例如 3 → 使用 `v3`）
2. **讀取版本 brief**：讀取 `docs/planning/v{N}-brief.md`，依照「預計拆分的 Changes」表格的順序，取得所有 change 名稱與重點提示
3. **確認 brief 狀態**：若 brief 尚未由使用者確認（確認日期欄位為空），停下回報，不繼續生成
4. **建立輸出目錄**：`docs/agents/codex-prompts/v{N}/`（不存在則建立）
5. **為每個 Change 依序生成三個檔案**
   - 序號規則：按 Changes 表順序，第 i 個 change（從 1 起算）的序號為：plan=(i-1)×3+1、execute=(i-1)×3+2、review=(i-1)×3+3
   - 命名格式：`{序號:02d}-{change-name}-{plan|execute|review}.md`（例：`01-my-change-plan.md`）
   - **存在性檢查**：只檢查帶序號的新格式（`01-my-change-plan.md`）。目錄中若有舊格式（如 `my-change-planner.md`、`my-change-executor.md`，即無序號前綴的同名 change 檔案），**不視為已存在**，仍必須建立帶序號的新格式檔案。
   - 若帶序號的新格式檔案已存在，則跳過（除非使用者明確要求覆寫）
6. **在 brief 新增「Codex 執行 Prompt 清單」區段**（若已存在 `## Codex 執行 Prompt 清單` 標題行則跳過；否則必須插入）

---

## 序號計算方式

| Change 位置 | plan | execute | review |
|------------|------|---------|--------|
| 第 1 個 change | 01 | 02 | 03 |
| 第 2 個 change | 04 | 05 | 06 |
| 第 3 個 change | 07 | 08 | 09 |
| 第 N 個 change | (N-1)×3+1 | (N-1)×3+2 | (N-1)×3+3 |

---

## 每個 Change 的三個檔案格式

### `docs/agents/codex-prompts/v{N}/{seq:02d}-<change-name>-plan.md`

```markdown
# Planner — <change-name>

> **Codex session 角色：OpenSpec Planner**
> 開啟方式：開新 session（`codex --yolo -C <repo-path>`）
> 角色規格書：`.github/agents/openspec-planner.agent.md`

---

## 初始化

請依序讀取並遵循以下文件：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/handoff/blockers.md`
4. `docs/roadmap.md`
5. `docs/planning/v{N}-brief.md`
6. `.github/agents/openspec-planner.agent.md`

---

## 本次任務

針對 change **`<change-name>`** 產出完整規劃：

- change name（確認或調整至 kebab-case）
- scope / non-scope
- acceptance criteria（從 brief 直接轉化，不自行增減）
- 主要風險（規格 / 技術）

**重點提示：**

<從 brief 的 In Scope 中提取此 change 相關的重點，逐條列出>

規劃產出後**等待確認**，確認無誤後提醒更新 brief 的 Changes 表（狀態設為「進行中」），再結束本 session。

---

> 本 prompt 由 `docs/agents/codex-prompts/v{N}/` 統一管理。
> 完整流程說明：`docs/agents/codex-cli-init.md`
```

### `docs/agents/codex-prompts/v{N}/{seq:02d}-<change-name>-execute.md`

```markdown
# Executor — <change-name>

> **Codex session 角色：OpenSpec Executor**
> 開啟方式：開新 session（`codex --yolo -C <repo-path>`）
> 角色規格書：`.github/agents/openspec-executor.agent.md`

---

## 初始化

請依序讀取並遵循以下文件：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/handoff/blockers.md`
4. `docs/roadmap.md`
5. `docs/planning/v{N}-brief.md`
6. `.github/agents/openspec-executor.agent.md`

---

## 本次任務

執行 change **`<change-name>`** 的完整 OpenSpec 流程：

/opsx-new "<change-name>"
/opsx-ff
/opsx-apply "<change-name>"
/opsx-verify "<change-name>"

依 change 類型（UI / Logic / Doc-only）決定 review 範圍：

- UI change → 執行 `/ui-review` + `/ux-review` + smoke
- Logic change → smoke only
- Doc-only change → verify only

無 blocking issue → 連續推進至 `/commit-push`
有 blocking issue → 停下回報

---

> 本 prompt 由 `docs/agents/codex-prompts/v{N}/` 統一管理。
> 完整流程說明：`docs/agents/codex-cli-init.md`
```

### `docs/agents/codex-prompts/v{N}/{seq:02d}-<change-name>-review.md`

```markdown
# Review Gate — <change-name>

> **Codex session 角色：Review Gate**
> 開啟方式：開新 session（`codex --yolo -C <repo-path>`）
> 角色規格書：`.github/agents/review-gate.agent.md`

---

## 初始化

請依序讀取並遵循以下文件：

1. `AGENTS.md`
2. `docs/handoff/current-task.md`
3. `docs/planning/v{N}-brief.md`
4. `.github/agents/review-gate.agent.md`

---

## 本次任務

針對 change **`<change-name>`** 進行最終把關：

1. 確認 acceptance criteria 已全部通過
2. 確認 Done Gate 所需證據均已存在（smoke / ui-review / ux-review 視類型）
3. 確認無 blocking issues
4. 輸出 Gate Decision（是否建議 commit / sync / archive）
5. 若通過 → 執行 `/opsx-sync` 後執行 `/opsx-archive "<change-name>"`

---

> 本 prompt 由 `docs/agents/codex-prompts/v{N}/` 統一管理。
> 完整流程說明：`docs/agents/codex-cli-init.md`
```

---

## 步驟 6：在 brief 新增 Codex 執行 Prompt 清單區段

在 `docs/planning/v{N}-brief.md` 的「預計拆分的 Changes」表格**後**（在下一個 `##` 區段前）插入以下區段（依實際 change 數量填入表格列）：

```markdown
## Codex 執行 Prompt 清單

> 使用方式：複製下方路徑，於 Codex CLI terminal 執行：
> ```powershell
> codex --yolo < docs/agents/codex-prompts/v{N}/<filename>.md
> ```
> 角色切換（Planner → Executor → Review）**必須開新 session**，不可 resume。
>
> 狀態說明：`—` 未執行 ｜ `🔄 執行中` ｜ `✅ 完成`

| # | 路徑 | 角色 | Change | 狀態 |
|---|------|------|--------|------|
| 01 | `docs/agents/codex-prompts/v{N}/01-<change-1>-plan.md` | Planner | <change-1> | — |
| 02 | `docs/agents/codex-prompts/v{N}/02-<change-1>-execute.md` | Executor | <change-1> | — |
| 03 | `docs/agents/codex-prompts/v{N}/03-<change-1>-review.md` | Review Gate | <change-1> | — |
...（依實際 changes 數量繼續）
```

---

## 完成後回報

列出：
- 版本號（v{N}）
- 生成的帶序號檔案清單（共 changes 數量 × 3 個）
- brief 是否已插入「Codex 執行 Prompt 清單」區段
- 後續使用方式：複製清單中的路徑 → 貼入 Codex CLI terminal → 每個角色開新 session
