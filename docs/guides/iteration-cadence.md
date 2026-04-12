# Iteration Cadence — 產品迭代節奏指南

> 目的：定義固定的產品迭代週期，讓需求收集、版本規劃、實作執行、收尾歸檔形成可持續的閉環。

---

## 迭代週期概覽

建議節奏：**雙週迭代**（可依實際工作量調整為單週或月度）

```
週期起點（週一）
  ├─ 評審 inbox → 更新 backlog 優先序
  └─ 若有足夠需求 → 規劃下個版本（v{N}-brief.md）
           ↓
週期中（週二~週四）
  └─ OpenSpec changes 實作 → smoke test → archive
           ↓
週期末（週五）
  ├─ deploy-to-prod.ps1
  ├─ CHANGELOG.md 更新
  └─ docs/roadmap.md 狀態更新
```

---

## 需求來源

| 來源類型 | 如何記錄 | 存放位置 |
|---|---|---|
| 使用產品時自己發現 | 隨時建立 inbox 文件 | `docs/product/inbox/` |
| 使用者回饋 | 隨時建立 inbox 文件 | `docs/product/inbox/` |
| 模板問題通報 | 見 `docs/guides/template-feedback.md` | `docs/product/inbox/` |
| 內部產品規劃想法 | 隨時建立 inbox 文件 | `docs/product/inbox/` |

---

## 各週期動作與提示詞

### 隨時：收集需求到 Inbox

```
我想記錄一個產品想法 / 問題 / 回饋：

[描述問題或想法]

請幫我建立一份 inbox 需求文件到 docs/product/inbox/<today>-<slug>.md，
來源為：self / user-feedback / observing（選一個）
類型為：feature / bug / ux-improvement / product-idea（選一個）
```

---

### 週期起點：Backlog 評審

```
現在進行本週期的 backlog 評審。

請：
1. 讀取 docs/product/inbox/ 下所有尚未處理的需求文件
2. 依影響範圍 × 實作複雜度評估優先序
3. 更新 docs/product/backlog.md（加入「未來考慮」或「下版納入」）
4. 列出建議納入下個版本的需求清單
```

---

### 週期起點：開新版本（若有足夠需求）

```
OpenSpec Planner

根據 docs/product/backlog.md 中「下版納入」的項目，
幫我規劃 V{N} 的 version brief（docs/planning/v{N}-brief.md）。
版本定位：[一句話說明這版的主軸]
```

---

### 週期中：執行 Change

```
OpenSpec Executor

請依照 docs/planning/v{N}-brief.md 中確認的 change 清單，
開始執行第一個待實作的 change。
```

---

### 週期末：收尾

```
Review Gate

請對本週期完成的所有 changes 進行最終 gate review，
確認可以 commit、部署與歸檔。
```

部署指令：
```powershell
# 確認 DEV 已 commit
git log --oneline -5

# 部署到正式區
.\scripts\deploy-to-prod.ps1
```

---

## 文件結構總覽

```
docs/
├─ product/
│   ├─ backlog.md              ← 需求優先序列表（迭代起點更新）
│   └─ inbox/
│       ├─ _TEMPLATE.md        ← 新增需求時複製此範本
│       ├─ YYYY-MM-DD-<slug>.md
│       └─ ...
├─ planning/
│   ├─ v{N}-brief.md           ← 版本確認書（開版時產出）
│   └─ ...
├─ roadmap.md                  ← 版本全貌（每版收尾更新）
├─ guides/
│   ├─ iteration-cadence.md    ← 本文件
│   └─ template-feedback.md   ← 模板問題通報流程
└─ runlog/                     ← 每日工作紀錄
```

---

## 常見問題

**Q：Inbox 累積很多，不知道從哪開始評審？**  
A：先看 `阻塞現有流程: yes` 的項目，這些是優先解決的 bug 或 UX 阻礙。

**Q：這個迭代週期是強制的嗎？**  
A：不強制，是建議節奏。若工作量不足，可跳過本週期的「開新版本」步驟，等下個週期再評審。

**Q：緊急 bug 不等週期怎麼辦？**  
A：建立 inbox 文件 → 直接用 `OpenSpec Planner` 規劃 hotfix change → 執行修復 → 只更新 `CHANGELOG.md` 和 `backlog.md`（歸入「已納入版本」），不需要等週期起點。
