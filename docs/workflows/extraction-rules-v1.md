# 提取規則清單 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **目的**：定義 10 條以上可判斷 pass/fail 的提取規則，每條含正例與反例。

---

## 使用說明

每條規則格式：
- **規則**：明確的行為準則（應做 / 不應做）
- **Pass 例**：符合規則的具體行為
- **Fail 例**：違反規則的具體行為
- **判斷方式**：快速判斷 pass/fail 的依據

---

## 規則清單

### R-01：候選必須有唯一 `dedupe_key`

**規則**：每個提取候選都必須指定一個小寫連字符格式的 `dedupe_key`，且在同一輪提取中不得重複。

**Pass 例**：
```
candidate_id: cand-s5-20260326-01
dedupe_key: s5-flow-minimum
```

**Fail 例**：
```
candidate_id: cand-s5-20260326-01
# 沒有 dedupe_key 欄位
```

**判斷方式**：檢查每個candidate 是否有且僅有一個 `dedupe_key` 值且不與其他候選重複。

---

### R-02：`confidence` 必須在 0.00–1.00 之間

**規則**：信心分數必須是 0.00 到 1.00 之間的小數，不能使用文字描述（如「高」「低」）。

**Pass 例**：
```
confidence: 0.92
```

**Fail 例**：
```
confidence: 高
confidence: 1.5
confidence: -0.1
```

**判斷方式**：用正規表達式 `^0(\.\d+)?$|^1(\.0+)?$` 驗證格式。

---

### R-03：`decision` 只接受三種值

**規則**：審核決策欄位 `decision` 僅允許 `adopted`、`rejected`、`duplicate`，不允許空值或其他字串。

**Pass 例**：
```
decision: adopted
```

**Fail 例**：
```
decision: maybe
decision: （空白）
decision: yes
```

**判斷方式**：直接字串比對是否為三者之一。

---

### R-04：`adopted` 候選必須有寫回目標

**規則**：每個 `decision: adopted` 的候選必須明確指定寫入目標路徑，不允許「之後再決定」。

**Pass 例**：
```
decision: adopted
writeback_target: docs/memory/preference-rules.md
```

**Fail 例**：
```
decision: adopted
# 沒有 writeback_target
```

**判斷方式**：若 `decision = adopted` 則 `writeback_target` 不得為空。

---

### R-05：不得寫入 `archive/` 目錄

**規則**：任何 writeback 操作不得將內容寫入 `openspec/changes/archive/` 或 `docs/roadmap/archive/` 目錄。

**Pass 例**：
```
writeback_target: docs/memory/task-patterns.md  # ✓ 正式記憶層
```

**Fail 例**：
```
writeback_target: openspec/changes/archive/2026-03-25-.../spec.md  # ✗ 封存區
```

**判斷方式**：目標路徑字串不得包含 `/archive/`。

---

### R-06：`rejected` 候選只記錄原因，不做寫入

**規則**：被拒絕的候選只需記錄 `reason`，不得有任何 `writeback_target` 或寫入動作。

**Pass 例**：
```
decision: rejected
reason: 違反草稿層寫入邊界，直接覆寫 final layer
# 無 writeback_target
```

**Fail 例**：
```
decision: rejected
reason: 可信度不足
writeback_target: docs/memory/xxx.md  # ✗ 拒絕仍寫入
```

**判斷方式**：若 `decision = rejected` 則不得存在 `writeback_target` 欄位。

---

### R-07：人工審核必須記錄 `reviewer` 和 `reviewed_at`

**規則**：所有 `pending` 轉 `adopted/rejected` 的決策必須填寫 `reviewer`（角色名）和 `reviewed_at`（YYYY-MM-DD）。

**Pass 例**：
```
reviewer: GitHub Copilot
reviewed_at: 2026-03-26
```

**Fail 例**：
```
# 只有 decision，沒有 reviewer 和 reviewed_at
decision: adopted
```

**判斷方式**：decision 非 `pending` 時，`reviewer` 和 `reviewed_at` 必須存在且非空。

---

### R-08：治理同步六項必在每輪完成前執行

**規則**：每輪提取流程結束前，必須完成 `extraction-flow-v1.md` Step 6 中的所有治理同步項目，不得選擇性略過。

**Pass 例**：
```
# runlog 已追加本輪段落
# handoff current-task.md 的 Done 與 Validation Status 已更新
```

**Fail 例**：
```
# runlog 未更新（以「待後續同步」為由略過）
```

**判斷方式**：交叉比對 runlog 的最後更新時間與本輪操作時間，應為同一日。

---

### R-09：去重前必須讀取現有 `docs/memory/` 快照

**規則**：在開始候選識別之前，必須先讀取 `docs/memory/*.md` 作為去重基線，不得先生成候選再補充比對。

**Pass 例**：
```
# Step 1 結束前已讀取 docs/memory/ 所有檔案
# Step 3 去重時與快照比對
```

**Fail 例**：
```
# 先批量生成 20 個候選，再說「等一下我來做去重」
```

**判斷方式**：在候選清單生成前，有明確記錄讀取 `docs/memory/` 的動作。

---

### R-10：`confidence < 0.60` 的候選應標記為低優先，預設拒絕

**規則**：信心分數低於 0.60 的候選，除非有明確高優先理由，否則預設判定為 `rejected`。

**Pass 例**：
```
confidence: 0.48
decision: rejected
reason: 信心分數不足，缺乏驗證佐證
```

**Fail 例**：
```
confidence: 0.45
decision: adopted
reason: 感覺還不錯
```

**判斷方式**：若 `confidence < 0.60` 且 `decision = adopted`，則 `reason` 必須包含明確的推翻理由（如「已有外部佐證」）。

---

### R-11：每輪提取的 `source_summary` 不得為空

**規則**：每輪提取必須有一個 `source_summary` 描述本次來源的核心主題，不得為空或僅填「待補」。

**Pass 例**：
```
source_summary: 建立輕量 UI 工作台最小閉環驗收路徑
```

**Fail 例**：
```
source_summary:
source_summary: 待補
```

**判斷方式**：`source_summary` 字串長度 ≥ 10 且非預設填充字串（如「待補」「TBD」）。

---

### R-12：`duplicate` 候選不得重新寫入，即使內容有差異

**規則**：一旦候選被標記為 `duplicate`，不論其內容是否與現有版本微有差異，本輪皆不進行寫入；若確認需要更新，應改標為 `update` 並重新審核。

**Pass 例**：
```
status: duplicate
# 不執行任何 writeback 動作
```

**Fail 例**：
```
status: duplicate
# 因「內容更新了」直接寫入，未走 update 審核流程
```

**判斷方式**：`status = duplicate` 時，對應 `writeback_target` 必須為空或不存在。

---

## 規則總覽

| # | 規則摘要 | Pass 判斷 | Fail 判斷 |
|---|---------|----------|----------|
| R-01 | dedupe_key 唯一且存在 | 有且不重複 | 缺欄位或重複 |
| R-02 | confidence 值域 0.00-1.00 | 小數格式正確 | 文字或超出範圍 |
| R-03 | decision 只接受三種值 | adopted/rejected/duplicate | 其他字串或空值 |
| R-04 | adopted 需有 writeback_target | 有明確路徑 | 無路徑 |
| R-05 | 不得寫入 archive/ | 目標不含 /archive/ | 目標含 /archive/ |
| R-06 | rejected 不寫入 | 無 writeback_target | 有 writeback_target |
| R-07 | 審核決策需有 reviewer + reviewed_at | 兩欄均填寫 | 任一缺失 |
| R-08 | 每輪治理同步六項必做 | 全部更新 | 任一省略 |
| R-09 | 去重前讀取 memory 快照 | 有讀取記錄 | 後補對照 |
| R-10 | confidence < 0.60 預設拒絕 | rejected 或有明確推翻理由 | 無理由 adopted |
| R-11 | source_summary 非空 | 長度≥10 且非預設填充 | 空值或 TBD |
| R-12 | duplicate 不寫入 | 無 writeback_target | 有寫入行為 |

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版，12 條規則，基於 S5/S6/S7 實際執行抽象化 |
