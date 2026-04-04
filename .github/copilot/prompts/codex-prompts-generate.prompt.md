---
agent: agent
description: "確認 v{N}-brief.md 後，為每個 Change 生成帶序號的 Codex 三角色提示詞 MD 檔案，並在 brief 新增 Prompt 清單區段"
---

> ⚠️ **格式強制聲明（執行前必讀）**
> - 輸出檔名**必須**以兩位數序號開頭：`01-my-change-plan.md`
> - 後綴**必須**是 `-plan.md` / `-execute.md` / `-review.md`
> - 命名為 `<change>-planner.md` / `<change>-executor.md` 者為**舊格式，絕對不可產出**
> - brief 中**必須**存在「Codex 執行 Prompt 清單」區段，無論舊版是否存在

請依照以下步驟，為當前版本的每個 Change 生成帶序號的 Codex 三角色提示詞 MD 檔案，並在 brief 新增執行清單。

## 步驟

1. **確認版本號**：讀取 `docs/roadmap.md`，確認當前版本號 N（例如 3 → 使用 `v3`）
2. **讀取版本 brief**：讀取 `docs/planning/v{N}-brief.md`，依照「預計拆分的 Changes」表格的順序，取得所有 change 名稱與重點提示
3. **確認 brief 狀態**：若 brief 尚未由使用者確認（確認日期欄位為空），停下回報，不繼續生成
4. **建立輸出目錄**：`docs/agents/codex-prompts/v{N}/`（不存在則建立）
5. **先計算並輸出完整預期檔名清單（強制步驟，不可跳過）**

   在建立任何檔案之前，**必須先輸出以下表格**（依 brief 中 Changes 表順序）：

   | i | change-name | plan 檔名 | execute 檔名 | review 檔名 |
   |---|-------------|-----------|--------------|-------------|
   | 1 | `<name-1>` | `01-<name-1>-plan.md` | `02-<name-1>-execute.md` | `03-<name-1>-review.md` |
   | 2 | `<name-2>` | `04-<name-2>-plan.md` | `05-<name-2>-execute.md` | `06-<name-2>-review.md` |
   | … | … | … | … | … |

   序號規則：第 i 個 change（從 1 起算）的 plan = `(i-1)×3+1`，execute = `(i-1)×3+2`，review = `(i-1)×3+3`

   > 這個表格是唯一的真實來源。後續只依此表格的路徑建立或跳過檔案，不依目錄瀏覽結果判斷。

6. **依步驟 5 的表格逐一建立檔案**

   - 逐行掃描表格中的每個路徑
   - **跳過條件**：該行的完整路徑（含序號前綴）已存在 → 跳過
   - **必須建立**：該路徑不存在，**或**目錄中只有舊格式檔案（無序號前綴）→ 必須建立新格式
   - 不得因目錄中存在任何「名稱含 change-name 的檔案」而跳過——跳過只認步驟 5 表格中的精確路徑

7. **確保 brief 的「Codex 執行 Prompt 清單」區段存在且完整**

   - 搜尋 brief 中是否有 `## Codex 執行 Prompt 清單` 標題
   - **若不存在** → 在 Changes 表後插入完整區段（含使用說明 + 表格）
   - **若已存在但表格列數不符** → 更新表格使其包含步驟 5 所有路徑
   - 最終 brief 中此區段的表格列數必須等於 N×3（N = changes 數量）

8. **自我驗證（強制，不可跳過）**

   完成後輸出驗證清單，每項必須勾選才算完成：

   ```
   ## 生成驗證
   - [ ] 已輸出步驟 5 的完整預期檔名表格
   - [ ] 所有 change 均有 3 個新格式檔案（共 N×3 個），全部存在於目錄中
   - [ ] 每個檔名均符合 `^\d{2}-.+-(plan|execute|review)\.md$` 格式
   - [ ] 無任何輸出為 `-planner.md` / `-executor.md` 後綴
   - [ ] brief「Codex 執行 Prompt 清單」區段存在且表格有 N×3 列
   ```

   若任何項目未勾選 → 立即補齊，不得結束。

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
