# Design: color-contrast-a11y

> **建立日期**：2026-05-01  
> **對應 proposal**：`proposal.md`

---

## 現況分析

### CSS Token 現況（`style.css` `:root`）

```css
--on-surface-variant: #9a9590;   /* warm gray — secondary text */
--outline:            #555555;   /* dark gray — borders/dividers */
```

### 對比度驗算（`#9a9590` on 各背景）

| 背景 token | 背景 hex | 對比度 | 通過 AA？ |
|-----------|---------|:------:|:--------:|
| `--surface-lowest` | `#141417` | 6.19 | ✅ |
| `--surface-container-lowest` | `#1a1a1e` | 5.85 | ✅ |
| `--surface-container` | `#222228` | 5.33 | ✅ |
| `--surface-container-high` | `#2a2a32` | 4.71 | ✅ |
| **`--surface`** | `#32323a` | **4.28** | ❌ |
| **`--primary-container`** | `#3d3222` | **4.21** | ❌ |

### 對比度驗算（`#555555` on 各背景）

`--outline: #555555` 在所有 PAIS 背景上均大幅不足（1.51 ~ 1.9），**不適合作為文字顏色**。

---

## 設計決策

### D-01：提升 `--on-surface-variant` 至 `#a8a39d`

**決策**：將 `:root` 中的 `--on-surface-variant: #9a9590` 改為 `#a8a39d`。

**理由**：
- `#a8a39d` 在所有 PAIS 背景上均通過 WCAG AA（最低 5.00 on `#3d3222`）
- 視覺變化極小（+14 亮度，同色調 warm gray）
- 一行修改覆蓋所有現有 `var(--on-surface-variant)` 使用場景

**對比度驗算（`#a8a39d`）**：

| 背景 hex | 對比度 | 通過 AA？ |
|---------|:------:|:--------:|
| `#141417` | 7.35 | ✅ |
| `#1a1a1e` | 6.93 | ✅ |
| `#222228` | 6.32 | ✅ |
| `#2a2a32` | 5.69 | ✅ |
| `#32323a` | 5.08 | ✅ |
| `#3d3222` | 5.00 | ✅ |

### D-02：修正 4 個 CSS class 的錯誤 `color: var(--outline)` 用法

**決策**：將以下 4 個 class 的 `color: var(--outline)` 改為 `color: var(--on-surface-variant)`。

| Class | 所在行 | 背景 | 修正後對比度 |
|-------|:------:|------|:----------:|
| `.governance-todo-note` | 398 | `#3d3222` | 5.00 ✅ |
| `.memory-dedup-item-sub` | 826 | `#32323a` | 5.08 ✅ |
| `.memory-item-health-reason` | 870 | `#2a2a32` | 5.69 ✅ |
| `.project-card-path` | 2378 | `#2a2a32` | 5.69 ✅ |

**理由**：`--outline` token 語義上用於邊框與分隔線，不應作為文字顏色。`--on-surface-variant` 才是 secondary text 的正確 token。搭配 D-01，修正後所有背景均通過。

### D-03：修正 Settings 外部連結顏色

**決策**：新增 `.settings-copy a` 顏色規則：`color: var(--primary)`。

**理由**：
- `.settings-copy p` 已套用 `color: var(--on-surface-variant)`，但 `<a>` 元素不繼承，回退至瀏覽器預設藍 `#0000ee`
- `--primary: #e2a84b`（amber gold）在 `#2a2a32` 背景的對比度：**5.07** ✅，且符合設計系統的 interactive/link 顏色
- 作用域限定在 `.settings-copy a`，不影響其他頁面連結

---

## 修改範圍

**唯一修改檔案**：`web/public/css/style.css`（PAIS PROD）

| 修改 | 類型 | 影響行 |
|------|------|:------:|
| `--on-surface-variant` token 值 | token 更新 | line 13 |
| `.governance-todo-note` color | 屬性更換 | line 398 |
| `.memory-dedup-item-sub` color | 屬性更換 | line 826 |
| `.memory-item-health-reason` color | 屬性更換 | line 870 |
| `.project-card-path` color | 屬性更換 | line 2378 |
| `.settings-copy a` color（新增規則） | 新增 | line 1537 後 |

**總計**：1 個 token 更新 + 4 個屬性替換 + 1 個新規則 = **6 行修改**

---

## 零副作用確認

- `--on-surface-variant` 所有現有使用者均受益（對比度只增不減）
- `--outline` 仍保持 `#555555`，所有邊框/分隔線用法不受影響
- 無 HTML 或 JavaScript 修改
- 無 font-size 或 font-weight 更動
