---
name: promote-decision
description: "Use when: 剛議定新做法，想確保下次也能重現。Does: 評估決議是否需要升級到 rule/agent/prompt，產出決策記錄。Returns: decision-log 更新 + 具體 diff（若需要升級到執行契約）。"
agent: agent
---

請根據上一輪對話或我剛描述的決議，執行決議升級流程。

## 步驟 1：摘要決議

用一句話說清楚：這次議定的「下次也要這樣做」是什麼。

## 步驟 2：判斷類型

| 類型 | 定義 | 處理方式 |
|------|------|---------|
| **純記錄** | 只是一個取捨或背景知識 | 寫到 decision-log，不改任何檔案 |
| **執行契約** | 「agent 必須在某情況做某事」「prompt 必須包含某元素」 | 寫 decision-log + 提供具體 diff |

## 步驟 3：寫入 decision-log

在 `docs/decision-log.md` 新增一條，格式：

```markdown
### [YYYY-MM-DD] <決議標題>

**決議**：<一句話摘要>
**原因**：<為什麼這樣決定>
**類型**：純記錄 / 執行契約
**影響範圍**：<若為執行契約，列出受影響的檔案>
```

## 步驟 4（僅執行契約類）：產出 diff

列出：
- 要修改的檔案路徑
- Before / After 的具體內容

**等我確認後再執行修改。**

## 步驟 5（確認後）：執行修改

收到確認後：
1. 執行步驟 4 的修改
2. 詢問是否需要 bump 版本號
3. 提示是否要在下次 `#session-close` 時一起 commit
