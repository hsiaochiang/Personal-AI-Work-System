# S7 Prompt Pack（2026-03-26）

> 目的：提供可直接貼上執行的提示詞，避免每次手動重組上下文。
> 使用前提：維持不 commit / 不 push / 不 reset，採 smallest safe change。

## 1) WOS 接手啟動（推薦先跑）

```text
@WOS
請接手 Personal-AI-Work-System 並直接執行 S7 規劃啟動。

硬性要求：
1. 先做最小驗證：AGENTS.md、docs/handoff/current-task.md、docs/handoff/blockers.md、docs/roadmap.md、docs/agents/project-context.md、docs/agents/commands.md。
2. 直接做，不要只給建議。
3. 不 commit、不 push、不 reset、不使用破壞性 git 指令。
4. 完成後至少更新 docs/runlog/2026-03-26_README.md 與 docs/handoff/current-task.md。

既有可用資產：
- Stitch 路由展示入口：design/stitch/snapshots/2026-03-26/index.html?autoplay=1#/overview
- S6 已 archive，S7 為條件式 GO。

輸出格式固定：
Current state
Changes made
Validation
Open issues
Next step
```

## 2) OpenSpec Planner（S7 定義一次產出）

```text
@OpenSpec Planner
請基於目前專案狀態，建立 S7 change 定義草案（proposal/design/tasks/spec）。

目標：
- 以最小可驗收範圍定義 S7（避免 scope 膨脹）
- 明確列出 scope / non-scope / acceptance criteria / 風險
- 任務切成可一天內驗收的小步驟

限制：
- 不修改 S1-S6 archived 成果
- 不新增重大 dependency
- 不做破壞性 git 操作

請輸出：
1. change name 建議
2. scope/non-scope
3. acceptance criteria（可測量）
4. proposal/design/tasks/spec 草案路徑與重點
5. 需要人工決策項目
```

## 3) OpenSpec Executor（依既有定義往前推）

```text
@OpenSpec Executor
請依已確認的 S7 change 定義直接執行，不要停在建議。

執行要求：
1. 逐 task 落地，採 smallest safe change。
2. 每完成一段就更新治理證據：runlog + handoff（必要時 uiux/qa）。
3. 嚴禁 commit/push/reset。
4. 若遇 blocker，先最小排查再回報阻塞點。

驗證要求：
- 補最小 smoke 證據
- 回報實際做了哪些檔案變更與結果

回覆格式：
Current state / Changes made / Validation / Open issues / Next step
```

## 4) Review Gate（收尾把關）

```text
@Review Gate
請對目前 S7 執行結果做最終 Gate Review，重點放在風險與回歸。

檢查重點：
1. 治理一致性：roadmap / handoff / runlog / qa 是否一致
2. 驗證證據是否可重播
3. 是否有 scope 漂移、邊界失守或未關閉 blocker
4. 是否達到最小可交付標準

輸出：
- Gate 結論（GO / CONDITIONAL GO / NO-GO）
- 必修項（若有）
- 可選優化項（若有）
```

## 5) 一鍵延續提示詞（你可直接貼這段）

```text
@WOS
請直接延續上一輪進度，不要停在建議。
先做最小接手驗證，然後直接執行下一個最高價值且最小安全步驟。
必須同步更新 runlog + handoff；有 UI/UX 或流程變更就同步更新 uiux/qa。
嚴禁 commit/push/reset。
回覆固定：Current state / Changes made / Validation / Open issues / Next step。
```
