# Bug 報告：user-manual-v5.md 每次部署後消失於 PROD

**發現日期**: 2026-04-12  
**嚴重等級**: High（使用者手冊在正式環境缺失）  
**狀態**: 已修復

---

## 問題描述

使用者手冊 `docs/product/user-manual-v5.md` 存在於 DEV 端與 git repository，但每次部署到 PROD 後，PROD 環境中此檔案不存在，且 `docs/product/` 目錄根本不存在於 PROD。

## 根本原因

PROD 使用 git sparse-checkout（non-cone 模式）限制部署範圍，讓 PROD 只包含必要的執行檔案。但 `setup-prod-worktree.ps1` 中定義的 sparse-checkout 路徑清單**遺漏了 `/docs/product/`**：

```powershell
# 原始清單（不完整）
$patterns = @(
    "/web/",
    "/docs/memory/",
    "/docs/handoff/",
    "/docs/templates/",
    "/docs/shared/",
    # ❌ /docs/product/ 遺漏！
    "/docs/roadmap.md",
    ...
)
```

每次 `deploy-to-prod.ps1` 執行 `git sparse-checkout reapply` 時，只有清單內的路徑會被保留，`docs/product/` 因不在清單中而被 git 排除。

## 影響

- 使用者無法在 PROD 看到操作說明手冊
- 若要求 AI 讀取手冊路徑，PROD 端會返回 404
- 每次部署都會「靜默」清除此檔案，不會有任何錯誤提示

## 修復方式

1. **`scripts/setup-prod-worktree.ps1`**：在 `$patterns` 陣列加入 `"/docs/product/"`
2. **立即修復 PROD**：執行以下指令更新目前 PROD 的 sparse-checkout：
   ```powershell
   Set-Location "D:\prod\Personal-AI-Work-System"
   git sparse-checkout add /docs/product/
   git sparse-checkout reapply
   ```
3. **觸發 git checkout** 讓 `docs/product/` 實際出現：
   ```powershell
   git -C "D:\prod\Personal-AI-Work-System" checkout HEAD -- docs/product/
   ```

## 預防措施（建議）

### 短期

在 `deploy-to-prod.ps1` 的後置步驟（Step 5 之後）加入關鍵檔案存在性檢查：

```powershell
# 關鍵檔案 smoke check
$criticalFiles = @(
    "web/server.js",
    "web/package.json",
    "docs/product/user-manual-v5.md",
    "VERSION"
)
$missing = $criticalFiles | Where-Object { -not (Test-Path (Join-Path $PROD_ROOT $_)) }
if ($missing) {
    Write-Warning "以下關鍵檔案在 PROD 中缺失："
    $missing | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
}
```

### 中期

在 `docs/product/` 新增 `.keep` 檔案（即使 sparse-checkout 路徑正確，空目錄不會被 git 追蹤）。

### 長期

考慮在 PROD 的 CI/CD 驗證步驟加入自動化 smoke test，確保頁面與 API 端點都 200 OK。

---

## 相關檔案

- 修復：`scripts/setup-prod-worktree.ps1`（已修）
- 手冊位置：`docs/product/user-manual-v5.md`（DEV 端唯一正本）
- 部署腳本：`scripts/deploy-to-prod.ps1`

## 教訓

> 任何使用者可見的文件（手冊、README、CHANGELOG），在加入 git 並期望出現於 PROD 時，**必須同步確認 sparse-checkout 清單已包含其所在目錄**。
