# Change Design: ux-p2-ia-kq

**Date**: 2026-05-03  
**Scope**: P2-IA-01 (nav sub-labels, XS) + P2-KQ-04 (copy-for-AI button, S)  
**Status**: 已完成

## 變更項目

### P2-IA-01: 導航副標籤

全部 9 個 HTML 頁面的 sidebar nav-link 加入副標籤，幫助使用者快速理解各頁面用途。

**副標籤對照：**
- 專案總覽 → 即時進度
- 當前任務 → 目前 handoff 狀態
- 專案記憶 → 知識庫與偏好規則
- 決策與規則 → 重要決定與設定
- Handoff 產生器 → 產生 AI 啟動上下文
- 知識提取 → 沉澱對話中的知識
- 設定 → API 金鑰與專案設定
- Projects Hub → 管理多個專案
- 全域搜尋 → 搜尋所有知識

**HTML 結構：**
```html
<a href="/xxx" class="nav-link">
  <span class="material-symbols-outlined">icon</span>
  <span class="nav-link-label">頁面名稱<span class="nav-link-sub">副標說明</span></span>
</a>
```

**CSS：**
- `.nav-link` align-items 改 flex-start
- `.nav-link .material-symbols-outlined` 加 margin-top: 0.05rem; flex-shrink: 0
- `.nav-link-label`: flex column
- `.nav-link-sub`: font-size 0.6875rem, opacity 0.65

### P2-KQ-04: 複製給 AI 按鈕

記憶庫條目與搜尋結果加入 content_copy icon 按鈕（hover 才顯示），點擊複製格式化文字至剪貼簿。

**複製格式：**
`[類型]：標題 — 內容（來源：PAIS，YYYY-MM-DD）`

**實作位置：**
- `memory.js`: 每個 memory-item card 加 .memory-item-copy-ai（right: 2.75rem, bottom: 0.75rem）
- `search.js`: 每個 search-result-item 加 .search-result-copy-ai（right: 0.75rem, top: 50%）
- `style.css`: 對應 hover show + color: var(--primary) on hover
