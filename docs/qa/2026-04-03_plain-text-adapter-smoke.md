# PlainTextAdapter Smoke Test

> Change: `plain-text-adapter-refactor`
> 類型：Logic change
> 日期：2026-04-03

## 目標

確認 V3 Change 2 將既有純文字貼上流程抽成 `PlainTextAdapter` 後：
- `ConversationDoc` 契約可被正確建立與驗證
- `/extract` 頁面可正常載入新的 adapter 模組
- 純文字 happy path 沒有破壞 V2/V3 現有基線

## 執行命令

```bash
node tools/verify_plain_text_adapter.js
```

## 驗證內容

### 1. Adapter contract
- 建立非空純文字輸入的 `ConversationDoc`
- 驗證 `schemaVersion = "v1"`
- 驗證 `messages[0].source = "plain"`
- 驗證 `timestamp = null`
- 驗證 `conversationDocToText()` 可還原 extraction 使用的文字內容
- 驗證空白輸入會被拒絕

### 2. Local extract smoke
- 以 Node 直接啟動本地 `web/server.js`
- 請求 `GET /extract`
- 驗證頁面 HTML 含 `PlainTextAdapter` 說明與 `/js/conversation-adapters.js` script tag
- 請求 `GET /js/conversation-adapters.js`
- 驗證 adapter script 可被 server 正常提供

## 結果

- `PASS adapter contract`
- `PASS local extract smoke`
- `ALL PASS plain-text adapter verification`

## 備註

- 本次 smoke 屬 logic change 的最小可重跑驗證，覆蓋 adapter 契約與 `/extract` 靜態載入。
- Template verify 未執行：本機環境缺少可用 Python，且 template repo 既有 `.venv` shim 指向失效路徑；本 change 仍已完成針對 runtime refactor 的 targeted verification。
