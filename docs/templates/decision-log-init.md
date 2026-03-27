# Decision Log 初始化模板

> **用途**：新專案初始化時，複製本文件到 `docs/decision-log.md`，作為決策留痕主檔。
> **命名**：維持 `docs/decision-log.md`（唯一主檔）；個別決策詳情放在 `docs/decisions/<YYYY-MM-DD>_<slug>.md`。
> **更新時機**：每次做出影響專案方向、架構或重大實作方式的決策時，立即追加一筆記錄。

---

# Decision Log

> 決策留痕主檔。每筆決策在此處留摘要，詳情另存於 `docs/decisions/` 目錄。

## 格式說明

每筆決策記錄包含以下欄位：

| 欄位 | 必填 | 說明 |
|------|:----:|------|
| 決策標題 | ✅ | 一句話說明做了什麼決策 |
| 日期 | ✅ | `YYYY-MM-DD` |
| 決策內容 | ✅ | 採用了什麼方案/做法 |
| 理由 | ✅ | 為何選此方案（vs 其他選項） |
| 影響 | ✅ | 哪些文件、流程或設計受到影響 |
| 詳情連結 | — | `docs/decisions/<slug>.md`（若有） |

---

## 決策記錄

<!-- 最新在上，舊的在下 -->

### `<YYYY-MM-DD>`：[REQUIRED] `<決策標題>`

- **決策內容**：[REQUIRED] `<採用了什麼方案>`
- **理由**：[REQUIRED] `<為何選此方案，簡短說明 trade-off>`
- **影響**：[REQUIRED] `<受影響的文件路徑或功能範圍>`
- **詳情**：`docs/decisions/<YYYY-MM-DD>_<slug>.md`（選填）

---

## 填寫範例

```markdown
## Decision Log

### 2026-03-27：採用 OpenSpec 作為 change lifecycle 管理工具

- **決策內容**：使用 npx openspec 命令管理所有 change（new/ff/validate/apply/archive），不自行實作 change tracking 機制
- **理由**：OpenSpec 已提供 strict validate、YAML 定義格式與 archive 命令，避免重複輪子；團隊熟悉度高
- **影響**：`openspec/config.yaml`、`openspec/changes/`、`openspec/specs/` 目錄結構均採 OpenSpec schema
- **詳情**：`docs/decisions/2026-03-27_adopt-openspec.md`

---

### 2026-03-26：Phase 3 不引入 React state management 框架

- **決策內容**：輕量 UI 僅使用 Stitch MCP 的靜態 JSON 渲染，不引入 Redux/Zustand 等狀態管理框架
- **理由**：Phase 3 需求僅為「讀取 markdown 渲染」，無互動狀態需求；引入框架會增加維護複雜度且無對應 ROI
- **影響**：`design/stitch/` 目錄；Phase 5 若需互動，再評估引入
- **詳情**：N/A
```

---

## 決策詳情模板（docs/decisions/ 格式）

若決策複雜需單獨說明，在 `docs/decisions/<YYYY-MM-DD>_<slug>.md` 使用以下格式：

```markdown
# 決策詳情：<決策標題>

- **日期**：<YYYY-MM-DD>
- **所屬 Change**：<change name 或 Phase>

## 背景
<為什麼需要做這個決策，問題是什麼>

## 選項分析
| 選項 | 優點 | 缺點 |
|------|------|------|
| 選項 A | ... | ... |
| 選項 B | ... | ... |

## 決策
採用：**選項 A**

理由：<詳細說明>

## 影響與後續
- 影響範圍：<列出受影響的文件或功能>
- 後續行動：<需要追加的動作>
- 可逆性：<若決策錯誤，如何回滾>
```
