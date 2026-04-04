# Shared Knowledge

`docs/shared/` 是跨專案共用知識層的 read-only 起點。

目前這個目錄只存放由 shared knowledge 掃描產出的候選 snapshot，不代表系統已經自動搬移或同步任何專案記憶。所有內容都需要人工確認後，才應決定是否整理成正式 shared library。

## 目前內容

- `shared-knowledge-candidates.md`：依 `web/projects.json` 掃描後產出的跨專案重複主題清單

## 生成方式

- 執行：`node tools/generate_shared_knowledge_report.js`
- 邊界：只會寫入 `docs/shared/`，不會改寫任何 `docs/memory/*.md`

## 後續原則

- 先以 suggestion-only 方式觀察 shared candidate 的品質
- 沒有人類確認前，不把這些候選當成正式 shared source
- 若未來要建立 shared writeback / 引用機制，需由後續 change 明確定義
