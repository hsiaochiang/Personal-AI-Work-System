# 專案層與個人層邊界規範 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：定義 `docs/`、`/memories/`、`openspec/` 三層的讀寫邊界、責任歸屬與衝突處理流程。

---

## 路徑與責任邊界規範

### L-01：`docs/` 為專案層，所有 agent 可讀寫

**規則**：`docs/` 目錄下的所有文件屬於專案層，任何 agent 在執行任務時可依需求讀取或寫入，寫入時必須符合對應模板格式（參考 `field-matrix-v1.md`）。

**正例**：
```
agent 更新 docs/handoff/current-task.md 的 ## Done 區塊
→ ✓ 合規，屬於 agent 可直接更新的欄位
```

**反例**：
```
agent 刪除 docs/roadmap/archive/ 下的歸檔文件
→ ✗ 違規，archive/ 屬封存區，不得刪除或覆寫
```

**責任歸屬**：執行任務的 agent 負責；任何寫入動作需在 runlog 中留有記錄。

---

### L-02：`/memories/`（user-scope）為個人層，只能由明確觸發寫入

**規則**：`/memories/` 根目錄下的文件（非 repo/、非 session/）屬於使用者個人層，跨所有 workspace 持久化。Agent 執行任務時**不得默默寫入**此層，只有在使用者明確指示「記錄到個人記憶」時才允許操作。

**正例**：
```
使用者：「把這個偏好寫入個人記憶」
agent 使用 memory tool 寫入 /memories/workstyle.md
→ ✓ 合規，有明確觸發
```

**反例**：
```
agent 自行判斷「這個規則很重要」並寫入 /memories/rules.md
→ ✗ 違規，未獲得使用者明確授權
```

**責任歸屬**：使用者負責；agent 只執行明確指令。

---

### L-03：`/memories/session/`（session-scope）屬臨時層，隨對話結束清除

**規則**：`/memories/session/` 用於記錄當前對話的臨時狀態，如任務分步計畫、中間結果。任何 agent 可在對話中讀寫此層，但不得依賴此層的內容在下次對話中繼續工作（因為會被清除）。

**正例**：
```
agent 在 /memories/session/plan.md 記錄當前 task 的執行步驟
→ ✓ 合規，屬臨時工作狀態
```

**反例**：
```
agent 在 /memories/session/important-rule.md 記錄一條重要規則，
並期望下次對話中還能讀到
→ ✗ 違規，session 結束後即清除，應改寫入 docs/memory/ 或 /memories/
```

**責任歸屬**：執行任務的 agent 負責，但不得對持久性有任何期望。

---

### L-04：`/memories/repo/`（repo-scope）屬專案層 agent 記憶，只能以 `create` 寫入

**規則**：`/memories/repo/` 存放 repo 範疇內的事實（如 CLI 修正記錄、build 命令、已驗證慣例）。任何 agent 均可讀取；寫入時只允許 `create` 操作（新建），不允許覆寫已有內容（需通過 `str_replace` 精確修改）。

**正例**：
```
agent 發現 openspec CLI 有參數格式問題，建立
/memories/repo/openspec-cli-correction-2026-03-24.md
→ ✓ 合規，新建 + 事實記錄
```

**反例**：
```
agent 刪除 /memories/repo/openspec-cli.md 並重建整份
→ ✗ 違規，應只 str_replace 修改需要更新的部分
```

**責任歸屬**：發現新事實的 agent 負責建立；修改需有明確理由並在同一對話中完成。

---

### L-05：`openspec/changes/`（active）只允許寫入當前 active change

**規則**：`openspec/changes/` 下的 active change 目錄，只有當前指定的 active change 可被寫入。不得跨 change 修改其他 change 的 artifacts，即使那些 change 尚未封存。

**正例**：
```
當前 active change 為 phase8-v1.5-stabilization-mvp
agent 修改 openspec/changes/phase8-v1.5-stabilization-mvp/tasks.md
→ ✓ 合規
```

**反例**：
```
agent 修改 openspec/changes/phase4-v1-convergence-finalization/tasks.md
（即使该 change 仍在 active/）
→ ✗ 違規，非當前 active change
```

**責任歸屬**：執行任務的 agent 負責；不確定目前 active change 時，先讀 handoff/current-task.md。

---

### L-06：`openspec/changes/archive/` 為封存區，禁止任何寫入

**規則**：所有已 archive 的 change 目錄（`openspec/changes/archive/`）均為封存狀態，任何 agent 不得修改、刪除、新增其中的任何文件。只允許讀取（作為案例參考）。

**正例**：
```
agent 讀取 openspec/changes/archive/2026-03-25-phase4.../proposal.md
用於案例回顧分析
→ ✓ 合規，只讀
```

**反例**：
```
agent 修改 openspec/changes/archive/.../tasks.md 以「補充驗收記錄」
→ ✗ 違規，封存區禁止任何寫入
```

**責任歸屬**：封存決策由人工確認；一旦 archive，agent 不得觸碰。

---

### L-07：`openspec/specs/`（主 spec）與 change 內的 specs/ 是分開的

**規則**：`openspec/specs/<spec-name>/spec.md` 是跨 change 共用的主 spec；`openspec/changes/<change-name>/specs/` 是 change 草稿層。兩者不得混用：草稿 spec 只服務當前 change，主 spec 是共用版本。

**正例**：
```
在 change tasks.md 中引用
openspec/changes/phase8.../specs/stabilization-mvp/spec.md（草稿）
在驗證完成後，再 sync 到 openspec/specs/stabilization-mvp/spec.md（主 spec）
→ ✓ 合規，草稿→主 spec 的正確流程
```

**反例**：
```
在草稿階段直接修改 openspec/specs/stabilization-mvp/spec.md
（跳過草稿驗證即寫入主 spec）
→ ✗ 違規，應先完成 change validate 再 sync
```

**責任歸屬**：spec sync 動作需明確的 `openspec sync` 命令觸發，不得手動複製。

---

## 衝突處理流程

### 衝突情境 1：agent 記憶（`/memories/repo/`）與專案文件（`docs/`）內容矛盾

**情境描述**：
`/memories/repo/openspec-cli.md` 記錄某命令的用法，但 `docs/agents/commands.md` 中的用法不同。

**裁決流程**：
1. **先查時間**：比對兩份文件的最後更新日期，較新者優先。
2. **若時間相近**：以 `docs/agents/commands.md` 為準（project-first 原則），因為它是可被所有 agent 核對的文件。
3. **同步修正**：在同一對話中修正過期版本，並在 runlog 留痕說明「修正了 X 與 Y 的矛盾，保留 Y 版本，理由：...」。
4. **若無法判斷哪個正確**：停止並回報給使用者，列出兩個版本的差異，等待決策。

**預設原則**：`project-first`——`docs/` 層的文件比 `/memories/repo/` 層優先，因為前者有更多人工核對機會。

---

### 衝突情境 2：session 臨時計畫（`/memories/session/`）與 active change tasks（`openspec/changes/.../tasks.md`）不一致

**情境描述**：
Agent 在 `/memories/session/plan.md` 規劃了 6 個步驟，但 `openspec/changes/.../tasks.md` 只有 4 個對應任務，多出的 2 個步驟找不到 task 對應。

**裁決流程**：
1. **以 tasks.md 為執行依據**：session 計畫是輔助工作記錄，`tasks.md` 是已確認的範疇定義。
2. **多出的步驟**：若確認在 scope 內但 tasks.md 未列出 → 先標記為「額外工作」並詢問使用者是否補充至 tasks.md。
3. **若確認不在 scope 內** → 在 session 計畫中標記為 `out-of-scope`，不執行。
4. **不得自行決定 scope 擴張**：只有人工確認後才可修改 tasks.md 增加任務。

**預設原則**：`tasks.md 決定範疇`，session plan 只是執行過程的輔助筆記。

---

### 衝突情境 3：`docs/roadmap.md` 狀態與 `docs/handoff/current-task.md` 狀態互斥

**情境描述**：
`docs/roadmap.md` 顯示 Phase 2 某工作項目已勾選「完成」，但 `docs/handoff/current-task.md` 的 `## Validation Status` 仍顯示 `NOT RUN`。

**裁決流程**：
1. **以 `decision-log.md` 為最終仲裁**：若 decision-log 有明確記錄，以其結論為準。
2. **若 decision-log 無記錄**：以較保守的狀態為準（`NOT RUN` > PASS），並在 runlog 記錄發現矛盾。
3. **修正優先序**：先修正 handoff（執行層），再更新 roadmap（規劃層），確保路徑是「事實→記錄」不是「記錄→假設事實」。
4. **若無法確認**：停止並回報使用者，等待人工裁決。

**預設原則**：`decision-log 最終仲裁`；無 decision-log 時採保守原則，修正後補寫 decision-log。

---

## 邊界規則總覽

| 路徑 | 讀 | 寫 | 責任 | 備註 |
|------|:--:|:--:|------|------|
| `docs/` | ✅ 任何 agent | ✅ 執行 agent | 執行 agent | 需符合 field-matrix-v1 格式 |
| `/memories/`（user） | ✅ | ⚠️ 需明確觸發 | 使用者 | 跨 workspace 持久化 |
| `/memories/session/` | ✅ | ✅ 執行 agent | 執行 agent | 對話結束即清除 |
| `/memories/repo/` | ✅ | ✅ create only | 執行 agent | 只能新建，修改需 str_replace |
| `openspec/changes/<active>/` | ✅ | ✅ 當前 active | 執行 agent | 只有當前 active 可寫 |
| `openspec/changes/<非 active>/` | ✅ | ❌ | — | 只讀，不得寫入 |
| `openspec/changes/archive/` | ✅ | ❌ | — | 封存，禁止寫入 |
| `openspec/specs/`（主 spec） | ✅ | ⚠️ sync 才能寫 | 執行 agent | 需先完成草稿→validate→sync |

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版，7 條邊界規則 + 3 組衝突情境 + 總覽表 |
