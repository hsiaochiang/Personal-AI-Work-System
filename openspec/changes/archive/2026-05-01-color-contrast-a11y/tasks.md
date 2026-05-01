# Tasks: color-contrast-a11y

> **狀態**：已完成 ✅  
> **建立日期**：2026-05-01  
> **對應 design**：`design.md`  
> **修改目標環境**：PAIS PROD (`d:\prod\Personal-AI-Work-System\web\public\css\style.css`)

---

## Task 列表

> **執行順序**：T-01 → T-02（6 處修改，全在同一個 CSS 檔）  
> **預估時間**：20 分鐘

---

### T-01：更新 `--on-surface-variant` token（D-01）

**檔案**：`web/public/css/style.css`  
**對應設計決策**：D-01

**目前程式碼（`:root` 第 11–14 行）**：
```css
  /* Text Colors (warm white) */
  --on-surface: #e8e6e1;
  --on-surface-variant: #9a9590;
  --on-background: #e8e6e1;
```

**修改後**：
```css
  /* Text Colors (warm white) */
  --on-surface: #e8e6e1;
  --on-surface-variant: #a8a39d;
  --on-background: #e8e6e1;
```

**驗收條件**：
- [x] `--on-surface-variant` 值為 `#a8a39d`
- [x] 頁面次要文字（如 card description、meta row）顏色略變亮，但同為 warm gray 色調

---

### T-02：修正 4 個 class 的 `color: var(--outline)` + 新增 settings 連結顏色（D-02 + D-03）

**檔案**：`web/public/css/style.css`  
**對應設計決策**：D-02、D-03

#### 2-A：`.governance-todo-note`（line ~394）

**目前**：
```css
.governance-todo-note {
  font-size: 0.74rem;
  color: var(--outline);
  line-height: 1.5;
}
```

**修改後**：
```css
.governance-todo-note {
  font-size: 0.74rem;
  color: var(--on-surface-variant);
  line-height: 1.5;
}
```

#### 2-B：`.memory-dedup-item-sub`（line ~822）

**目前**：
```css
.memory-dedup-item-sub {
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  color: var(--outline);
}
```

**修改後**：
```css
.memory-dedup-item-sub {
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  color: var(--on-surface-variant);
}
```

#### 2-C：`.memory-item-health-reason`（line ~867）

**目前**：
```css
.memory-item-health-reason {
  font-size: 0.75rem;
  color: var(--outline);
  margin-bottom: 0.5rem;
}
```

**修改後**：
```css
.memory-item-health-reason {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  margin-bottom: 0.5rem;
}
```

#### 2-D：`.project-card-path`（line ~2375）

**目前**：
```css
.project-card-path {
  font-size: 0.7rem;
  color: var(--outline);
  font-family: monospace;
  word-break: break-all;
}
```

**修改後**：
```css
.project-card-path {
  font-size: 0.7rem;
  color: var(--on-surface-variant);
  font-family: monospace;
  word-break: break-all;
}
```

#### 2-E：新增 `.settings-copy a` 顏色（在 `.settings-copy p` 規則後插入）

**目前（line ~1531）**：
```css
.settings-copy p {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--on-surface-variant);
}
```

**修改後（加入 a 規則）**：
```css
.settings-copy p {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--on-surface-variant);
}
.settings-copy a {
  color: var(--primary);
}
```

**驗收條件（T-02 整體）**：
- [x] `.governance-todo-note`、`.memory-dedup-item-sub`、`.memory-item-health-reason`、`.project-card-path` 四個 class 均使用 `color: var(--on-surface-variant)`
- [x] Settings 頁面「Google AI Studio」連結顯示為金色（amber primary），不再是瀏覽器預設藍
- [x] `.outline` token 本身（#a8a39d 後的值）不受影響——邊框/分隔線外觀不變

---

## Smoke Test 要點

完成全部修改後執行：

```bash
cd D:\program\Personal-AI-Work-System\UXAuditOrchestrator\scripts
node capture.mjs http://localhost:3000
```

然後確認：

| 頁面 | 預期結果 |
|------|---------|
| index | `color-contrast` violations: 0 |
| memory | `color-contrast` violations: 0 |
| projects | `color-contrast` violations: 0 |
| settings | `color-contrast` violations: 0 |

所有頁面 serious violations 應全數消失（剩餘的 serious 只有 handoff 的 `scrollable-region-focusable`，不在本次 scope）。

---

## 執行順序

1. 在 `style.css` 中用 multi_replace 一次完成 T-01 + T-02 全部 6 處修改
2. 確認 server 在 port 3000 運行
3. 執行 `node capture.mjs`
4. 確認 4 頁面 color-contrast violations 為 0
5. Commit → Push
