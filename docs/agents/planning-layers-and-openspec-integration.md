# Planning Layers And OpenSpec Integration

> 本文件提供 agent 使用的工作規則。
> 目的是避免把 roadmap、版本規劃、單次 change 混在一起，導致 scope 漂移、版本邊界不清、OpenSpec change 越開越散。

## 為什麼需要這份文件

這個專案在開發上有一個高頻風險：

- agent 容易把整個產品 roadmap 當成當前任務
- agent 容易把版本規劃直接拆成 implementation task
- agent 容易用單一 OpenSpec change 承接過大的版本範圍

為了避免這些問題，本專案採用以下三層結構：

1. `roadmap` 管全貌
2. `version brief` 管這一版
3. `OpenSpec change` 管這一次改動

## 三層結構

## 第一層：Roadmap 層

主要文件：

- `docs/roadmap.md`

### 這一層回答什麼

- 整個產品往哪裡走
- `V1`、`V2`、`V3`、`V4` 各自是什麼
- 現在位於哪個版本
- 下一個版本是什麼

### Agent 何時看這一層

當任務涉及：

- 產品全貌
- 版本定位
- 長期方向
- 現在位於哪一版
- 下一版應做什麼

### Agent 不要用這一層做什麼

- 不要直接拿 roadmap 當 implementation task list
- 不要從 roadmap 直接展開大量程式修改
- 不要只因為 roadmap 提到未來版本，就提早實作遠期能力

## 第二層：Version Brief 層

主要文件：

- `docs/planning/v2-brief.md`
- 後續可有 `v3-brief.md`
- 後續可有 `v4-brief.md`

### 這一層回答什麼

- 這一版要解什麼核心問題
- 這一版的 in scope / out of scope
- 這一版何時才算完成
- 這一版預計拆成哪些 changes

### Agent 何時看這一層

當任務涉及：

- 當前版本應不應該做某功能
- 某項工作應歸在 `V2` 還是留到 `V3` / `V4`
- 要為某版本規劃 phase 或 milestone
- 要判斷版本邊界與完成條件

### Agent 不要用這一層做什麼

- 不要把 version brief 當成單次 change 的 tasks 清單
- 不要在 version brief 中塞太多低層 implementation 細節

## 第三層：OpenSpec Change 層

主要位置：

- `openspec/changes/<change-name>/`

典型內容：

- `proposal.md`
- `tasks.md`
- `specs/...`

### 這一層回答什麼

- 這一次具體要改什麼
- 為什麼現在要改這個
- 完成後有哪些可驗證行為
- 執行上有哪些步驟

### Agent 何時看這一層

當任務涉及：

- 開新 change
- 執行某個 change
- 審查 proposal / spec / tasks
- 驗證當前改動是否可 apply / archive

### Agent 不要用這一層做什麼

- 不要把整個版本直接塞進一個 change
- 不要用單一 change 承接 roadmap 全貌

## Agent 判斷流程

若任務不清楚應該看哪一層，請依下列順序判斷：

### 情況 1：使用者在問「整個產品接下來怎麼走」

先看：

- `docs/roadmap.md`

必要時再看：

- `docs/planning/v2-brief.md`
- 其他版本 brief

### 情況 2：使用者在問「這一版到底要做什麼」

先看：

- 對應版本的 brief

再回頭對照：

- `docs/roadmap.md`

### 情況 3：使用者在問「這一次要怎麼改」

先看：

- active OpenSpec change

必要時回頭看：

- 對應版本 brief
- `docs/roadmap.md`

## 專案內的建議工作順序

當專案要往下一步推進時，建議順序如下：

1. 先更新 `docs/roadmap.md`
2. 再確認或更新當前版本 brief
3. 再開新的 OpenSpec change
4. change 完成後回寫 roadmap / decision-log / handoff

## 反模式

以下是 agent 應避免的做法：

### 1. 拿 roadmap 直接當 task list

這會讓遠期版本和當前變更混在一起。

### 2. 沒有 version brief 就直接開一串 changes

這會讓 change 一個個做下去後，整體版本邊界越來越模糊。

### 3. 用單一 change 承接整個版本

這會讓 OpenSpec change 過大、難驗證、難 archive。

### 4. 在不同文件各自宣告版本完成

版本完成度應優先由 `docs/roadmap.md` 統一定義。

## 對現有 agent 的整合方式

若 agent 任務涉及版本、範圍或 change 規劃，建議在既有入口規則中補這一條：

> 若任務涉及 roadmap、版本規劃、scope 判斷或 OpenSpec change 切分，先讀 `docs/agents/planning-layers-and-openspec-integration.md`。

## 給 agent 的一句話版本

在這個專案中：

- `roadmap` 決定全貌
- `version brief` 決定這一版
- `OpenSpec change` 決定這一次改動

不要把這三層混在一起。
