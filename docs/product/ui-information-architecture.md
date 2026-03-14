# UI Information Architecture

## 目的

把本專案未來 UI 的資訊架構與主要畫面先定清楚，讓「個人 AI 工作台」不只是概念，而是具備可想像、可拆解、可逐步實作的畫面骨架。

## 產品定位

這個 UI 不是另一個通用聊天工具。

它的角色是：

- 專案入口
- 記憶中樞
- 對話交接工具
- 沉澱審核介面
- 規則與決策檢視台

## 主要導覽結構

第一版建議只有 5 個主區塊：

1. Projects
2. Workspace
3. Handoffs
4. Memory Review
5. Rules And Decisions

這樣的導覽已足夠支撐第一到第二階段，不需要一開始就做太多頁面。

## 頁面 1：Projects

### 核心目的

- 看到所有專案
- 快速知道每個專案目前進度
- 決定要進哪個專案繼續工作

### 主要資訊

- 專案名稱
- 專案狀態
- 最近更新時間
- 最近處理的任務
- 下一步建議

### 主要操作

- 進入專案
- 建立新專案
- 查看最近更新

### 低保真草圖

```text
+--------------------------------------------------------------+
| Personal AI Work System                                      |
+--------------------------------------------------------------+
| Search projects...                                           |
+--------------------------------------------------------------+
| [Project Card]                                               |
| Name: Personal AI Work System                                |
| Status: Planning completed / Ready for MVP implementation    |
| Updated: 2026-03-14                                          |
| Next: Define extraction workflow                             |
| [Open Workspace] [Create Handoff]                            |
+--------------------------------------------------------------+
| [Project Card]                                               |
| ...                                                          |
+--------------------------------------------------------------+
```

## 頁面 2：Workspace

### 核心目的

- 進入單一專案後，快速看懂現在的工作全貌
- 讓使用者不必翻很多檔案才能開始

### 主要資訊分區

- 專案摘要
- 目前目標
- 最近決策
- 專案記憶
- 最近工作
- 待沉澱候選

### 建議版面

- 左側：專案記憶導覽
- 中間：目前工作焦點
- 右側：候選與提醒

### 低保真草圖

```text
+------------------+--------------------------------+------------------+
| Project Memory   | Current Focus                  | Review Queue     |
+------------------+--------------------------------+------------------+
| README           | Project: Personal AI Work...   | Candidate 1      |
| Context          | Status: Ready for MVP design   | Candidate 2      |
| Preferences      | Next step: Extraction flow     | Candidate 3      |
| Task Patterns    |                                |                  |
| Output Patterns  | Recent decisions               | Pending handoffs |
| Decisions        | - UI should exist long-term    | - Impl handoff   |
| Skills           | - Branches != chat length      |                  |
+------------------+--------------------------------+------------------+
```

## 頁面 3：Handoffs

### 核心目的

- 開新對話時，不需要重新手打背景與要求
- 讓規劃串、實作串、整合串的交接標準化

### 主要資訊

- handoff 類型
- 任務目標
- 任務邊界
- 已定案原則
- 相關檔案
- 驗收標準

### 主要操作

- 選擇 handoff 類型
- 自動帶入專案資訊
- 編輯內容
- 複製 handoff
- 儲存 handoff

### 低保真草圖

```text
+--------------------------------------------------------------+
| Handoff Builder                                              |
+--------------------------------------------------------------+
| Type: [Planning v] [Implementation v] [Integration v]        |
| Project: Personal AI Work System                             |
+--------------------------------------------------------------+
| Goal                                                         |
| [ Build first extraction workflow ......................... ] |
+--------------------------------------------------------------+
| Do not do                                                    |
| [ Do not build UI or multi-tool sync yet .................. ] |
+--------------------------------------------------------------+
| Related files                                                |
| [x] README.md                                                |
| [x] ai-workflow-planning.md                                  |
| [x] update-workflow.md                                       |
+--------------------------------------------------------------+
| Acceptance criteria                                          |
| [ Define first operational extraction flow ............... ]  |
+--------------------------------------------------------------+
| [Generate] [Copy] [Save]                                     |
+--------------------------------------------------------------+
```

## 頁面 4：Memory Review

### 核心目的

- 把原始對話轉成正式專案記憶
- 讓沉澱有明確入口，不必手動比對大量文字

### 主要資訊

- 候選摘要
- 建議分類
- 來源片段
- 建議寫入位置
- 狀態

### 主要操作

- 接受
- 修改
- 忽略
- 合併既有規則

### 低保真草圖

```text
+--------------------------------------------------------------+
| Memory Review                                                |
+--------------------------------------------------------------+
| Candidate: Keep planning and implementation in separate chats|
| Suggested category: preference-rules                         |
| Source: conversation on 2026-03-14                           |
| Write to: preference-rules.md                                |
| [Accept] [Edit] [Ignore]                                     |
+--------------------------------------------------------------+
| Candidate: Branches should follow code change boundaries     |
| Suggested category: decision-log                             |
| [Accept] [Edit] [Ignore]                                     |
+--------------------------------------------------------------+
```

## 頁面 5：Rules And Decisions

### 核心目的

- 集中查看專案中的規則、決策與候選項
- 快速找到影響後續工作的內容

### 主要資訊

- 偏好規則
- 任務模式
- 輸出模式
- 決策紀錄
- skill 候選

### 主要操作

- 篩選
- 搜尋
- 編輯
- 標記已確認 / 候選

### 低保真草圖

```text
+--------------------------------------------------------------+
| Rules And Decisions                                          |
+--------------------------------------------------------------+
| Tabs: Preferences | Tasks | Outputs | Decisions | Skills     |
+--------------------------------------------------------------+
| [Rule] Use plain language                                    |
| Status: Confirmed                                            |
| Source: early planning discussion                            |
+--------------------------------------------------------------+
| [Decision] Long-term product should include UI               |
| Date: 2026-03-14                                             |
| Impact: product direction                                    |
+--------------------------------------------------------------+
```

## 第一版 MVP 對應的最小畫面集合

若未來要開始做 UI，第一版不需要一次做完整工作台。

最小可用集合建議只做：

1. Projects
2. Workspace
3. Handoffs
4. Memory Review

`Rules And Decisions` 可以先作為 Workspace 內的一個區塊，之後再獨立成頁。

## 設計重點

### 重點 1：低摩擦

- 一進去就能開始工作
- 一眼看懂下一步
- 不要求使用者先填大量欄位

### 重點 2：資訊優先

- 重視清楚結構，不重視花俏視覺
- 讓使用者快速掃描，而不是沉浸式瀏覽

### 重點 3：工作導向

- 每個頁面都要支援工作決策
- 不做只是「好看」但不幫助工作的區塊

## 對目前階段的結論

目前專案雖然還沒開始做 UI，但未來產品的主要畫面與區塊已可明確想像。

這代表後續進入實作階段時，可以先從最小可用畫面集合開始，而不是臨時邊做邊猜。
