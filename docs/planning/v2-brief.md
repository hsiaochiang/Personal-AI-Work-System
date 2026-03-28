# V2 Brief

> 這份文件是 `V2` 的版本確認文件。
> 作用是定義：這一版要解什麼問題、做什麼、不做什麼、何時算完成。
> 它位在 `roadmap` 和 `OpenSpec change` 之間。

## 版本定位

`V2` 是 **穩定化與多專案工作台版本**。

它不是重新發明產品方向，也不是直接往更炫的功能擴張。  
它的任務是把目前已經出現的 `V1` 工作台骨架，從「可跑的雛形」提升成「可持續使用、可放心依賴、可擴展到多專案」的版本。

## 為什麼要做 V2

目前專案已經做出幾個重要能力：

- roadmap / current task / memory 的基本檢視
- handoff builder
- extraction / review / writeback 的核心雛形
- decisions / rules 檢視頁

但現在還有幾個明顯缺口：

1. 寫回記憶的安全性不足
2. 多專案切換還不是真正的資料源切換
3. 文件對版本完成度的描述仍有漂移
4. 使用情境驗證還偏向 route smoke，而不是完整工作流程驗證

所以 `V2` 要解決的不是「有沒有更多頁面」，而是：

- 這個工作台能不能更可信任
- 能不能真的支援多專案
- 能不能讓版本狀態與實際能力一致

## V2 要解的核心問題

### 1. 可信任的知識閉環

`V1` 已有對話提取與寫回雛形，但若 writeback 太脆弱，使用者就不敢真的依賴它。

### 2. 真正的多專案工作方式

目前較接近 UI 上的選取狀態，尚未成為真正的「專案資料切換」。

### 3. 文件、產品、狀態的一致性

如果 roadmap、handoff、user guide 對當前完成度說法不同，後續 agent 與使用者都容易誤判。

### 4. 從雛形走向穩定產品

`V2` 應讓這個專案從「已經可以 demo」走向「可以日常使用」。

## V2 完成後，使用者應該可以做到什麼

- 在多個專案之間切換，而且各頁資料真的跟著切換
- 更放心地採用 extraction 候選並寫回記憶
- 透過更一致的 roadmap 與文件判讀目前狀態
- 用完整但仍輕量的工作台持續管理專案知識

## In Scope

以下內容屬於 `V2` 範圍內：

### A. Writeback safety hardening

- 寫回前 backup
- draft / review / apply 的最小安全流程
- 避免整檔粗暴覆蓋
- 降低 extraction 採用時資訊被截斷或過度簡化的問題

### B. Multi-project true switching

- 支援多個專案設定
- 專案切換後 API 資料源也跟著切換
- Overview / Task / Memory / Decisions / Search 等頁面都能反映當前專案

### C. Docs and status alignment

- `docs/roadmap.md` 成為單一真源
- `docs/handoff/current-task.md` 回到短期交接用途
- `docs/product/user-guide-current.md` 只描述目前可用能力
- 版本狀態與實際能力對齊

### D. Flow-based validation

- 不只測 route 200
- 補上 handoff / extraction / review / writeback / reload / project switching 的情境驗證

### E. UI completion for trust and usability

- 補齊必要的 loading / empty / error state
- 調整資訊架構與提示，使工作台更可理解
- 保留輕量實作方式，不導入重框架

## Out of Scope

以下內容不屬於 `V2`：

- ChatGPT / Gemini / Antigravity 的正式接入
- 多工具 conversation adapter
- 自動化治理與排程
- 向量資料庫 / embeddings / RAG
- 大型前端框架重構
- 進階 autonomous agent orchestration

這些應留到 `V3` 或 `V4`。

## V2 建議拆分方式

我建議 `V2` 至少拆成以下幾個 changes，而不是一次混在同一個大 change：

### Change 1：writeback safety hardening

目標：

- 讓記憶寫回變得可控、可回復、可檢查

### Change 2：multi-project true switching

目標：

- 讓多專案從 UI 假切換，升級成資料源真切換

### Change 3：roadmap and docs alignment

目標：

- 讓 roadmap 成為專案單一真源
- 消除 current-task / user guide 的描述漂移

### Change 4：flow validation and usability hardening

目標：

- 補足完整工作流驗證
- 修正影響日常使用的 UI / feedback 問題

## V2 完成標準

`V2` 不應以「頁面做完」來判定，而應以「工作台是否可信任」來判定。

建議完成標準如下：

### 1. Writeback 安全性達標

- 採用候選時，不再只是整檔覆寫
- 至少有 backup 或 draft 機制
- 寫回內容不再只保留過度簡化的一行摘要

### 2. 多專案切換達標

- repo 內可配置 2 個以上專案
- 切換專案後，各頁面都顯示對應專案資料

### 3. 文件真源達標

- roadmap、handoff、current guide 對版本狀態不再互相矛盾

### 4. 工作流驗證達標

- 至少一條真實流程可被完整驗證：
  - 產生 handoff
  - 開新對話
  - 提取候選
  - 審核寫回
  - 重新讀取結果

## 依賴與前提

`V2` 依賴：

- `V1` 已有基本工作台骨架
- 既有 docs 結構繼續保留
- 現有 vanilla JS + Node server 架構暫時不重構

## 風險

### 1. 範圍膨脹

若把多專案、UI polish、搜尋、治理、自動化都塞進 `V2`，版本會再次失焦。

### 2. 安全性修補不足

如果只補 UI，不補 writeback safety，工作台仍難以成為日常依賴工具。

### 3. 版本邊界不清

若不先定 `V2` 邊界，後續 OpenSpec changes 很容易越做越散。

## V2 與 V3 / V4 的邊界

### V3

聚焦在：

- 多工具接入
- conversation schema 標準化
- importer / adapter 機制

### V4

聚焦在：

- 治理
- 自動化
- 跨專案共享能力
- 更完整的個人 AI 工作作業系統

## 建議的下一步

1. 先更新 `docs/roadmap.md`
2. 讓 roadmap 清楚標出 `V1`、`V2`、`V3`、`V4`
3. 以本文件為基準，開第一個 `V2` 的 OpenSpec change
4. 優先處理：
   - writeback safety
   - roadmap / docs alignment
   - multi-project true switching

## 一句話總結

`V2` 的任務不是做更多功能，
而是把目前的個人 AI 工作台從「可演示的雛形」提升成「可以穩定依賴的產品」。
