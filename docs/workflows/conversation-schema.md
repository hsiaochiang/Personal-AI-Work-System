# Conversation Schema 規格（V3 Change 1）

> Change: `conversation-schema-definition`  
> 依據：`docs/planning/v3-brief.md` In Scope A  
> 性質：docs-only schema definition（本文件不包含 adapter 實作與 extraction 邏輯改動）

---

## 1. 目的與邊界

本規格定義跨工具對話的內部統一格式，讓後續 adapter（PlainText / ChatGPT / Gemini / Claude / ChatGPT API / VS Code Copilot）都輸出同一個資料契約，再送入既有 extraction 流程。

本規格僅處理：
- `ConversationMessage` 欄位契約
- `ConversationDoc` 封裝契約
- 來源命名、時間欄位與驗證規則

本規格不處理：
- adapter 具體解析邏輯
- extraction / review / writeback 實作改造
- UI 與 API 變更

---

## 2. 型別定義（Canonical）

```ts
type ConversationRole = "user" | "assistant" | "system" | "tool";

type ConversationSource =
  | "plain"
  | "chatgpt"
  | "chatgpt-api"
  | "gemini"
  | "claude"
  | "copilot"
  | `custom:${string}`;

interface ConversationMessage {
  role: ConversationRole;
  content: string;
  source: ConversationSource;
  timestamp: string | null; // ISO 8601 when not null
}

interface ConversationDocMetadata {
  schemaVersion: "v1";
  importedAt: string; // ISO 8601
  sessionId?: string;
  title?: string;
  toolVersion?: string;
}

interface ConversationDoc {
  messages: ConversationMessage[];
  metadata: ConversationDocMetadata;
}
```

---

## 3. 欄位語意與限制

### 3.1 `ConversationMessage`

| 欄位 | 型別 | 必填 | 規則 |
|---|---|:---:|---|
| `role` | string | ✅ | 只允許 `user` / `assistant` / `system` / `tool` |
| `content` | string | ✅ | 不可為空字串；建議先 `trim()` 後長度 > 0 |
| `source` | string | ✅ | 受控值：`plain` / `chatgpt` / `chatgpt-api` / `gemini` / `claude` / `copilot`；其他來源使用 `custom:<tool>` |
| `timestamp` | string \| null | ✅ | 可為 `null`；有值時必須是 ISO 8601 |

### 3.2 `ConversationDoc`

| 欄位 | 型別 | 必填 | 規則 |
|---|---|:---:|---|
| `messages` | `ConversationMessage[]` | ✅ | 至少 1 筆 |
| `metadata.schemaVersion` | string | ✅ | 目前固定 `"v1"` |
| `metadata.importedAt` | string | ✅ | ISO 8601 |
| `metadata.sessionId` | string | ❌ | 來源可提供時填入 |
| `metadata.title` | string | ❌ | 來源可提供時填入 |
| `metadata.toolVersion` | string | ❌ | 工具版本或匯入器版本（可選） |

---

## 4. 驗證規則（MUST）

1. 每個 adapter 輸出 MUST 是單一 `ConversationDoc` 物件。  
2. `messages` MUST 為非空陣列。  
3. 每筆 `ConversationMessage` MUST 含 `role`、`content`、`source`、`timestamp` 四欄。  
4. `timestamp` 有值時 MUST 為 ISO 8601；缺值時 MUST 為 `null`（不可缺鍵）。  
5. `metadata` MUST 含 `schemaVersion` 與 `importedAt`。  
6. `schemaVersion` 在 V3 Change 1 MUST 為 `"v1"`。  

---

## 5. 來源命名規則

- 內建來源：
  - `plain`: 純文字貼上流程
  - `chatgpt`: ChatGPT transcript / conversation JSON / TXT 手動匯入
  - `chatgpt-api`: 透過已設定 API key 與 tracked `conversationId` 載入的 OpenAI platform conversation
  - `gemini`: Gemini transcript 貼上匯入
  - `claude`: Claude transcript 貼上匯入
  - `copilot`: VS Code Copilot Chat 匯入流程
- 自訂來源：
  - 格式：`custom:<tool>`
  - 例：`custom:gemini`、`custom:antigravity`

命名原則：
- 全小寫
- 不含空白
- 不含版本號（版本資訊放在 `metadata.toolVersion`）

## 6. V5 支援來源矩陣

| source | `/extract` 入口 | 支援格式 | 目前限制 |
|---|---|---|---|
| `plain` | `純文字` | 一般對話貼上文字、人工整理後的純文字 | 不做來源格式偵測；直接走 `PlainTextAdapter` |
| `chatgpt` | `ChatGPT` | ChatGPT 分享頁 transcript、官方 conversation JSON、TXT 匯出內容 | 不支援多 conversation picker；JSON 若含多筆 conversation，現階段 deterministic 選最近一筆 |
| `chatgpt-api` | `ChatGPT` → API 載入 | 已設定 OpenAI API key 後，載入本工作台已追蹤的 OpenAI platform conversations | 不支援直接列出 ChatGPT 產品聊天歷史；需先追蹤 `conversationId` |
| `gemini` | `Gemini` | Gemini 網頁複製的 transcript 全文、含 `You` / `Gemini` turn 標頭的貼上文字 | 不支援 API 載入、檔案上傳或 multi-conversation picker |
| `claude` | `Claude` | Claude.ai 網頁複製的 transcript 全文、含 `Human` / `Assistant` / `Claude` 標頭的貼上文字 | 不支援 API 載入、檔案上傳或 multi-conversation picker |
| `copilot` | `VS Code Copilot` | 本機 Copilot Chat session JSONL 載入 | 需先從本機 session 清單載入；尚無搜尋或多 session merge |

### 6.1 匯入提示撰寫原則

- `chatgpt` 與 `chatgpt-api` 必須分開描述，避免誤導為可直接讀取 ChatGPT 產品聊天歷史。
- `gemini` / `claude` 目前都屬半自動 transcript 貼上流程，不得在文件中宣稱 API import。
- `/extract` 的 UI copy 應優先回答三件事：支援格式、入口位置、目前限制。

---

## 7. 合法範例

### 7.1 最小範例（plain）

```json
{
  "messages": [
    {
      "role": "user",
      "content": "幫我整理這次重構的重點。",
      "source": "plain",
      "timestamp": null
    },
    {
      "role": "assistant",
      "content": "建議先拆出 adapter 介面，再改 extraction 入口。",
      "source": "plain",
      "timestamp": null
    }
  ],
  "metadata": {
    "schemaVersion": "v1",
    "importedAt": "2026-04-02T09:30:00+08:00"
  }
}
```

### 7.2 含擴充 metadata 範例（copilot）

```json
{
  "messages": [
    {
      "role": "user",
      "content": "請定義 ConversationDoc schema。",
      "source": "copilot",
      "timestamp": "2026-04-01T14:20:11+08:00"
    },
    {
      "role": "assistant",
      "content": "可先固定 schemaVersion v1，再保留 metadata 擴充欄位。",
      "source": "copilot",
      "timestamp": "2026-04-01T14:20:33+08:00"
    }
  ],
  "metadata": {
    "schemaVersion": "v1",
    "importedAt": "2026-04-02T10:10:00+08:00",
    "sessionId": "cp-session-001",
    "title": "V3 schema planning",
    "toolVersion": "copilot-chat-insiders"
  }
}
```

---

## 8. Adapter 實作者檢查清單

- [ ] 輸出是 `ConversationDoc`（非裸陣列、非 raw text）
- [ ] `messages.length >= 1`
- [ ] 每筆 message 四欄完整且型別正確
- [ ] `timestamp` 無值時用 `null`，不省略欄位
- [ ] `metadata.schemaVersion = "v1"`
- [ ] `metadata.importedAt` 有 ISO 8601 時間

---

## 9. 版本記錄

| 版本 | 日期 | 說明 |
|---|---|---|
| v1 | 2026-04-02 | V3 Change 1 初版，定義 `ConversationMessage` / `ConversationDoc` 契約 |
| v1.1 | 2026-04-04 | V5 Change 4 補齊 `chatgpt-api` / `gemini` / `claude` / `copilot` 支援格式矩陣與來源命名說明 |
