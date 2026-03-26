# 模板欄位矩陣 v1

> **版本**：v1.0  
> **建立日期**：2026-03-26  
> **所屬 Change**：`phase8-v1.5-stabilization-mvp`  
> **來源**：掃描 `docs/handoff/current-task.md`、`docs/runlog/2026-03-26_README.md`、`docs/qa/2026-03-26_smoke.md`  
> **目的**：形成欄位矩陣（文件類型 × 欄位名 × 狀態），定義必填/選填/棄用欄位。

---

## Part 1：現行欄位矩陣

### 1.1 `handoff/current-task.md` 欄位清單

| 欄位名 | 格式 | 出現狀況 | 說明 |
|-------|------|:-------:|------|
| `# Current Task` | H1 | 最頂層標題 | 文件標識頭 |
| `## Task` | H2 section | 必有 | 任務識別：Name / Owner agent / Started on / Last updated on / Related issue / Branch |
| ` - Name` | 清單項 | 必有 | change 名稱 |
| ` - Owner agent` | 清單項 | 必有 | 負責 agent |
| ` - Started on` | 清單項 | 必有 | 開始日期（YYYY-MM-DD） |
| ` - Last updated on` | 清單項 | 必有 | 最後更新日期 |
| ` - Related issue / spec` | 清單項 | 必有 | 關聯 issue 或 spec 說明 |
| ` - Branch / worktree` | 清單項 | 必有 | git branch 名稱 |
| `## Goal` | H2 section | 必有 | 任務目標說明 |
| `## Scope` | H2 section | 必有 | In scope / Out of scope |
| `## Constraints` | H2 section | 必有 | Technical / Product/UX 限制 |
| `## Done` | H2 section | 必有 | 已完成事項清單 |
| `## In Progress` | H2 section | 必有 | 進行中項目 |
| `## Next Step` | H2 section | 必有 | 下一步行動（必須是可執行命令或明確動作） |
| `## Validation Status` | H2 section | 必有 | 每項驗證的 PASS/FAIL/NOT RUN/GO 狀態 |
| `## Safe Continuation Guardrails` | H2 section | 必有 | 安全邊界約束清單 |
| `## Evidence Paths` | H2 section | 必有 | 關鍵文件路徑列表 |
| `## <History> 歷史摘要` | H2 section | 選填 | 前一 session 的重要摘要（如 S6 歷史摘要） |

### 1.2 `runlog/<date>_README.md` 欄位清單

| 欄位名 | 格式 | 出現狀況 | 說明 |
|-------|------|:-------:|------|
| `# Runlog <date>` | H1 | 必有 | 日期標頭 |
| `## 今日目標` | H2 section | 必有 | 本日期望完成的目標清單 |
| `## 今日進度` | H2 section | 必有 | 已完成的步驟與產出（以 `-` 清單形式） |
| `## 阻塞` | H2 section | 必有 | 當前 blocker（無則寫「目前無 active blockers」） |
| `## 證據（paths）` | H2 section | 必有 | 所有產出路徑清單 |
| `## 下一步` | H2 section | 必有 | 明確的可執行命令或行動 |
| `## <Task> 結果摘要` | H2 section | 選填 | 某任務/cycle 的專屬結果摘要段落 |
| `## 今日收斂判定` | H2 section | 選填 | 本日工作是否可交接與未結案項目 |

### 1.3 `qa/<date>_smoke.md` 欄位清單

| 欄位名 | 格式 | 出現狀況 | 說明 |
|-------|------|:-------:|------|
| `# Smoke Test <date>` | H1 | 必有 | 日期標頭 |
| `## Scope` | H2 section | 必有 | 測試範圍：change 名稱、目標說明 |
| `## Commands` | H2 section | 必有 | 執行的命令清單（含 validate 命令） |
| `## Results` | H2 section | 必有 | 每個命令的結果（PASS/FAIL） |
| `## <Task> 演示` | H2 section | 選填 | 特定任務的端到端演示記錄 |
| ` - Input summary` | 子段落 | 選填 | 演示的輸入描述 |
| ` - Candidate list` | 子段落 | 選填 | 候選清單（含所有必填欄位） |
| ` - Review decisions` | 子段落 | 選填 | 審核決策記錄 |
| ` - Draft writeback` | 子段落 | 選填 | 寫回目標與結果 |
| `## Governance Sync Check` | H2 section | 必有 | 四項治理文件同步 checkbox |
| `## Evidence Paths` | H2 section | 必有 | 相關證據路徑 |

---

## Part 2：欄位狀態定義

### 必填（Required）

> 缺少此類欄位視為文件不完整，不得交接。

| 欄位名 | 適用文件 | 必填理由 |
|-------|---------|---------|
| `## Task`（含 Name/Owner/Date） | handoff | 用於識別誰在負責與何時開始 |
| `## Goal` | handoff | 無目標的任務無法驗收 |
| `## Scope` | handoff | 保護邊界，防止 scope 漂移 |
| `## Done` | handoff | 已完成記錄，讓下一位 agent 知道無需重做 |
| `## Next Step` | handoff | 下一步必須可執行，不得為「待定」 |
| `## Validation Status` | handoff | 驗收依據，無此欄無法判定 done |
| `## Evidence Paths` | handoff | 驗證時的查找依據 |
| `## 今日目標` | runlog | 沒有目標的 runlog 無意義 |
| `## 今日進度` | runlog | 主要產出記錄 |
| `## 阻塞` | runlog | 即使沒有 blocker 也必須明確寫出 |
| `## 證據（paths）` | runlog | 所有產出必須有路徑可查 |
| `## Scope` | qa/smoke | 驗收範圍必須明確 |
| `## Commands` | qa/smoke | 無命令等同無法重播 |
| `## Results` | qa/smoke | 無結果等同無驗收 |
| `## Governance Sync Check` | qa/smoke | 確認治理文件同步完整度 |

### 選填（Optional）

> 有此類欄位提升可追溯性，但缺少不阻礙交接。

| 欄位名 | 適用文件 | 說明 |
|-------|---------|------|
| `## Constraints` | handoff | 當有特殊技術/產品約束時填寫 |
| `## Safe Continuation Guardrails` | handoff | 當有不得執行的操作時填寫 |
| `## <History> 歷史摘要` | handoff | 跨 session 交接時補充 |
| `## <Task> 結果摘要` | runlog | 特定 task 完成後的摘要段落 |
| `## 今日收斂判定` | runlog | session 收尾時填寫 |
| `## <Task> 演示` | qa/smoke | 有端對端演示時記錄 |
| `## Evidence Paths` | qa/smoke | 與 runlog 有重疊時可省略 |

### 棄用（Deprecated）

> 舊文件中可能存在，新文件不應再使用，遇到可安全忽略或合併到其他欄位。

| 欄位名 | 原適用文件 | 棄用原因 | 替代方案 |
|-------|----------|---------|---------|
| `## Status` | 早期 handoff | 語意過於模糊，不同 agent 有不同解讀 | 改用 `## Validation Status`（明確每項） |
| `## Notes` | 早期 runlog | 容易成為垃圾堆，無結構 | 改用有明確主題的 H2 段落 |
| `## TODO` | 早期文件 | 與 `## Next Step` 重複 | 使用 `## Next Step`（必須可執行） |
| `## References` | 早期文件 | 與 `## Evidence Paths` 重複 | 使用 `## Evidence Paths` |

---

## Part 3：過渡期對照表

> 供舊文件遷移時使用。

| 舊欄位名 | 新欄位名 | 遷移動作 |
|---------|---------|---------|
| `## Status` | `## Validation Status` | 將舊狀態值拆解為 `PASS/FAIL/NOT RUN` 逐項列出 |
| `## Notes` | `## <本次主題> 摘要` | 重命名為有意義的主題名 |
| `## TODO` | `## Next Step` | 篩選出「下一個可執行步驟」，其他移入 `## Done`（已完成）或刪除 |
| `## References` | `## Evidence Paths` | 直接重命名，確保格式為路徑清單 |

---

## 衝突清單

> 以下欄位在掃描現行文件時發現定義不一致，已統一於本矩陣中。

| 衝突欄位 | 衝突描述 | 裁決 |
|---------|---------|------|
| `## Status` vs `## Validation Status` | 前者出現在早期 handoff，語意不統一 | 強制使用 `## Validation Status`，舊值遷移 |
| `## 下一步` vs `## Next Step` | runlog 用中文，handoff 用英文 | runlog 維持中文（`## 下一步`），handoff 使用英文（`## Next Step`） |
| `## 今日進度` 格式不固定 | 部分 runlog 無清單，直接寫段落 | 統一為 `- ` 清單格式（一行一事） |

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-26 | 初版。掃描 handoff/runlog/qa 三類文件後建立矩陣，定義必填/選填/棄用 |
