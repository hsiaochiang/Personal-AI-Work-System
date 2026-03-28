# 2026-03-28 需求確認書層與 OpenSpec 的關係

## 目的

這份文件用來回答兩個問題：

- `OpenSpec change` 裡的 `proposal`、`spec`、`tasks`，是否就等於需求確認書
- 在這個專案裡，是否需要另外建立一層「需求確認書層」

## 快速結論

### 結論 1：`OpenSpec change` 很接近需求確認書，但不完全等於

對單一 change 來說，`proposal`、`spec`、`tasks` 已經承接了大部分需求確認功能：

- `proposal`
  說明為什麼要做這次 change、要解什麼問題、調整哪些能力

- `spec`
  定義這次 change 完成後，系統應具備哪些可驗證行為

- `tasks`
  列出這次 change 的執行步驟與拆解方式

所以：

**若你現在只要推進一個具體 change，通常不需要另外再做一份正式需求確認書。**

### 結論 2：若你要推進的是整個版本，就建議有一層比 change 更上位的確認文件

如果接下來不是只做一個小變更，而是要推進一整個版本，例如 `V2`，那就建議有一份比單一 change 更上位的輕量確認文件。

這份文件的用途不是取代 OpenSpec，而是回答：

- 這一版到底要解什麼問題
- 這一版的 in scope / out of scope 是什麼
- 這一版何時才算完成
- 這一版會拆成哪些 OpenSpec changes

所以：

**若你接下來要推的是整個 V2，建議建立一層輕量版的需求確認書層。**

## 三層關係

我建議這個專案用以下三層來運作。

## 第一層：Roadmap 層

由 `docs/roadmap.md` 承擔。

### 這一層回答什麼

- 整個產品往哪裡走
- `V1`、`V2`、`V3`、`V4` 各自是什麼
- 現在位於哪個版本
- 下一個版本是什麼

### 這一層不處理什麼

- 不處理單次 change 的細節
- 不處理每個 task 的拆解

## 第二層：版本確認層

這就是你剛剛問的「需求確認書層」。

我建議不要叫得太重，可以用下面任一名稱：

- `V2 brief`
- `release brief`
- `scope brief`
- `version brief`

### 這一層回答什麼

- 這一版要解什麼核心問題
- 這一版的 in scope / out of scope
- 這一版的完成標準
- 這一版預計拆成哪些 phase 或 changes
- 哪些東西留到下一版

### 這一層不處理什麼

- 不處理具體 implementation task
- 不取代 OpenSpec proposal/spec/tasks

## 第三層：OpenSpec Change 層

由 `openspec/changes/<change-name>/` 承擔。

### 這一層回答什麼

- 這一次實際要改什麼
- 為什麼現在要改這個
- 成功後會有哪些可驗證行為
- 執行上要做哪些步驟

### 典型內容

- `proposal.md`
- `tasks.md`
- `specs/...`

## 是否需要建立需求確認書層

## 情況 A：只做單一 change

例如：

- `roadmap` 重構
- `writeback safety` 修補
- `projects` 真實資料切換

這種情況下：

**不需要另外建立需求確認書層。**

直接把需求確認內容寫進該次 OpenSpec change 即可。

## 情況 B：要推進整個版本

例如你接下來要做的是 `V2`，而且預期 `V2` 會拆成多個 changes，例如：

- writeback safety
- multi-project true switching
- review flow hardening
- docs alignment

這種情況下：

**建議建立一份輕量版版本確認文件。**

原因是：

- OpenSpec change 比較適合管理單次變更
- 版本層如果沒有先定 scope，很容易 change 一個個做下去後，整體版本邊界越來越模糊

## 對這個專案的建議

依目前專案狀態，我建議這樣做：

### 1. 先用 `docs/roadmap.md` 定義全貌

讓 roadmap 清楚呈現：

- `V1` 到 `V4` 的版本地圖
- 當前版本位在哪裡

### 2. 為下一個真正要推進的版本建立一份輕量 brief

如果下一步是 `V2`，就建立一份：

- `docs/planning/v2-brief.md`

內容只要包含：

- 版本目標
- 核心問題
- in scope
- out of scope
- 完成條件
- 預計拆成哪些 changes

### 3. 再把 `V2` 拆成一個一個 OpenSpec changes

例如：

- `v2-writeback-safety-hardening`
- `v2-multi-project-true-switching`
- `v2-docs-and-status-alignment`

這些 change 再各自用 `proposal`、`spec`、`tasks` 落地。

## 建議的判斷原則

如果你在想「現在這件事應該寫在 roadmap、brief、還是 OpenSpec change」，可以用這個方式判斷：

- 如果是在回答「整個產品往哪裡走」，寫在 roadmap
- 如果是在回答「這一版到底要做什麼」，寫在版本 brief
- 如果是在回答「這一次具體怎麼改」，寫在 OpenSpec change

## 一句話總結

`OpenSpec change` 可以承接單次變更的需求確認，
但如果你接下來要推的是整個版本，仍建議補一層輕量版的版本確認文件。

## 最後建議

我對這個專案最推薦的做法是：

1. `docs/roadmap.md` 管全貌
2. `V2 brief` 管這一版
3. `OpenSpec changes` 管這一次改動

這樣不會文件過重，也不會讓版本邊界和 change 邊界混在一起。
