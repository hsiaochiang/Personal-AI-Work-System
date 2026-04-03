# source-attribution-in-memory

## Purpose

Allow memory entries written from `/extract` to retain their originating tool metadata and surface that provenance in `/memory`, while preserving compatibility with existing markdown structure and legacy entries.

## Requirements

### Requirement: 系統 MUST 在 memory writeback 保存來源 metadata

當使用者從 `/extract` 採用候選並寫回 `docs/memory/*.md` 時，系統 MUST 將每筆新寫入條目的來源工具保存為隱藏 metadata，供後續 `/memory` 追溯顯示。

#### Scenario: 採用 ChatGPT 或 Copilot 候選時保存來源
- **WHEN** 使用者寫回一筆 `source` 為 `chatgpt`、`copilot` 或 `plain` 的候選
- **THEN** 系統 MUST 在該 memory 條目旁寫入 `<!-- source: <tool> -->` metadata
- **AND** metadata MUST 與條目內容一起落在同一個 memory markdown 區段

#### Scenario: 同一批寫回多筆條目時逐筆保留來源
- **WHEN** 使用者一次寫回多筆候選到同一個 memory 檔案
- **THEN** 系統 MUST 為每筆新增條目各自保存來源 metadata
- **AND** 不得只在區段標題或檔案層級保存單一來源值

### Requirement: `/memory` MUST 解析來源 metadata 並顯示 badge

`/memory` 頁面 MUST 能從 memory markdown 條目讀取來源 metadata，並在每筆有來源資訊的記憶項目上顯示對應 badge，不破壞既有列表資訊層級。

#### Scenario: 來源 metadata 存在時顯示 badge
- **WHEN** `/memory` 讀到包含 `<!-- source: chatgpt -->`、`<!-- source: copilot -->` 或 `<!-- source: plain -->` 的條目
- **THEN** 該條目 MUST 顯示對應的來源 badge
- **AND** badge MUST 與原有記憶內容一起出現在同一張 item card 中

#### Scenario: 未知自訂來源仍可顯示
- **WHEN** 條目 metadata 為 `custom:<tool>` 或其他合法來源值
- **THEN** `/memory` MUST 保留該來源值並以可讀 badge 顯示
- **AND** 不得因來源不在內建列表而使條目消失或解析失敗

### Requirement: 系統 MUST 與既有 memory markdown 相容並提供可重跑驗證

本 change MUST 保持既有沒有來源 metadata 的 memory 條目可正常顯示，並提供可重跑驗證來確認 writeback 與 `/memory` 顯示邏輯。

#### Scenario: Legacy 條目沒有來源 metadata 時仍正常顯示
- **WHEN** `/memory` 讀取歷史上沒有 `source` metadata 的條目
- **THEN** 系統 MUST 仍正常顯示條目文字
- **AND** 該條目 MAY 不顯示來源 badge，但不得造成整個群組解析失敗

#### Scenario: Targeted verify 覆蓋 metadata 與 UI 解析
- **WHEN** 執行本 change 的 targeted verify
- **THEN** 驗證 MUST 覆蓋 memory writeback 產生的 source metadata
- **AND** 驗證 MUST 覆蓋 `/memory` parser 或 render 對 badge 顯示的行為
- **AND** 驗證 MUST 確認既有 plain / chatgpt / copilot 路徑未被此 change 破壞
