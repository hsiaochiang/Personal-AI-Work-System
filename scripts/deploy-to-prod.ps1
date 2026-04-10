<#
.SYNOPSIS
    將指定 git tag 部署到正式區 D:\prod\Personal-AI-Work-System

.DESCRIPTION
    低摩擦高掌控的本機布版工具。
    - 正式區使用 git worktree（與 dev 共用同一 .git）
    - 每次 deploy = checkout 到指定 tag（原子性切換）
    - 服務啟動於 PORT 3001（測試區 PORT 3000）

.PARAMETER Version
    要部署的版本號（不含 v 前綴），例如 1.1.0。
    預設讀取 dev 根目錄的 VERSION 檔。

.PARAMETER DryRun
    僅預覽，不實際執行 checkout。

.EXAMPLE
    .\scripts\deploy-to-prod.ps1
    .\scripts\deploy-to-prod.ps1 -Version 1.2.0
    .\scripts\deploy-to-prod.ps1 -DryRun

.NOTES
    環境配置：
      測試區 (Dev)   http://localhost:3000   d:\program\Personal-AI-Work-System  [DEV]
      正式區 (Prod)  http://localhost:3001   D:\prod\Personal-AI-Work-System     [PROD]
    
    正式區為獨立 git clone（有自己的 .git），deploy 透過 git fetch + checkout tag 更新。
    Data（api-keys.json 等 gitignored 檔案）不會被 checkout 覆蓋。
    首次設置請先執行 scripts\setup-prod-worktree.ps1
#>

[CmdletBinding()]
param(
    [string]$Version,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── 路徑設定 ──────────────────────────────────────────────────
$DEV_ROOT  = "d:\program\Personal-AI-Work-System"
$PROD_ROOT = "D:\prod\Personal-AI-Work-System"
$PROD_PORT = 3001

# ── Step 1：讀取版本號 ─────────────────────────────────────────
if (-not $Version) {
    $versionFile = Join-Path $DEV_ROOT "VERSION"
    if (-not (Test-Path $versionFile)) {
        Write-Error "找不到 VERSION 檔：$versionFile"
        exit 1
    }
    $Version = (Get-Content $versionFile -Raw).Trim()
}
$tag = "v$Version"

Write-Host ""
Write-Host "  部署準備" -ForegroundColor Cyan
Write-Host "  ──────────────────────────────────"
Write-Host "  版本：$tag"
Write-Host "  來源：$DEV_ROOT"
Write-Host "  目標：$PROD_ROOT"
Write-Host "  PORT：$PROD_PORT"
if ($DryRun) { Write-Host "  模式：DRY RUN（不實際執行）" -ForegroundColor Yellow }
Write-Host ""

# ── Step 2：前置檢查 ──────────────────────────────────────────
Write-Host "  [1/5] 前置檢查..." -ForegroundColor Gray

# 2a. dev git status 確認 clean
$gitStatus = git -C $DEV_ROOT status --porcelain 2>&1
if ($gitStatus) {
    Write-Host ""
    Write-Warning "Dev 有未提交的變更，建議先 commit 再部署："
    $gitStatus | ForEach-Object { Write-Host "       $_" -ForegroundColor Yellow }
    Write-Host ""
    $confirm = Read-Host "  仍要繼續？(y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "  已取消。" -ForegroundColor Yellow
        exit 0
    }
}

# 2b. git tag 存在
$tagExists = git -C $DEV_ROOT tag --list $tag
if (-not $tagExists) {
    Write-Error "Tag '$tag' 不存在於 dev repo。請先執行：git tag -a $tag -m '$tag' && git push --follow-tags"
    exit 1
}

# 2c. prod worktree 存在
if (-not (Test-Path $PROD_ROOT)) {
    Write-Error "正式區目錄不存在：$PROD_ROOT`n請先執行：.\scripts\setup-prod-worktree.ps1"
    exit 1
}

Write-Host "  [1/5] 前置檢查 ✓" -ForegroundColor Green

# ── Step 3：顯示差異摘要 ──────────────────────────────────────
Write-Host "  [2/5] 差異摘要..." -ForegroundColor Gray

$currentProdTag = git -C $PROD_ROOT describe --tags --exact-match HEAD 2>$null
if ($currentProdTag) {
    if ($currentProdTag -eq $tag) {
        Write-Host ""
        Write-Host "  正式區已是 $tag，無需重新部署。" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "  目前正式區版本：$currentProdTag → 將更新至 $tag"
    $commits = git -C $DEV_ROOT log --oneline "$currentProdTag..$tag" 2>$null
    if ($commits) {
        Write-Host "  更新包含："
        $commits | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "  正式區目前版本：(未知) → 將部署 $tag"
}

Write-Host ""

# ── Step 4：人工確認 ─────────────────────────────────────────
if (-not $DryRun) {
    $confirm = Read-Host "  確認部署 $tag 到正式區？(y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "  已取消。" -ForegroundColor Yellow
        exit 0
    }
}

# ── Step 5：從 remote fetch 最新 tags 後 Checkout ──────────────
Write-Host "  [3/5] Fetch + Checkout $tag..." -ForegroundColor Gray

if (-not $DryRun) {
    # Prod 是獨立 clone，需先 fetch 才能取得最新 tags
    git -C $PROD_ROOT fetch origin --tags --quiet 2>&1 | Out-Null
    git -C $PROD_ROOT checkout "tags/$tag" --detach --force 2>&1 | Out-Null
    # reapply sparse-checkout：確保 checkout 後仅保留指定路徑（不強制重寫 pattern）
    git -C $PROD_ROOT sparse-checkout reapply 2>&1 | Out-Null
    $actual = git -C $PROD_ROOT describe --tags --exact-match HEAD 2>$null
    if ($actual -ne $tag) {
        Write-Error "Checkout 後版本不符：預期 $tag，實際 $actual"
        exit 1
    }
}
Write-Host "  [3/5] Checkout ✓" -ForegroundColor Green

# ── Step 6：依賴更新（只在 package.json 有變動時） ─────────────
Write-Host "  [4/5] 依賴檢查..." -ForegroundColor Gray

$pkgChanged = $false
if ($currentProdTag) {
    $pkgDiff = git -C $DEV_ROOT diff "$currentProdTag" $tag -- web/package.json 2>$null
    $pkgChanged = [bool]$pkgDiff
}

if ($pkgChanged -or -not $currentProdTag) {
    Write-Host "  package.json 有變動，執行 npm install..." -ForegroundColor Gray
    if (-not $DryRun) {
        Push-Location "$PROD_ROOT\web"
        npm install --omit=dev
        Pop-Location
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "npm install 發生警告，請手動確認：$PROD_ROOT\web"
        }
    }
    Write-Host "  [4/5] npm install ✓" -ForegroundColor Green
} else {
    Write-Host "  [4/5] 依賴無變動，略過 ✓" -ForegroundColor Green
}

# ── Step 7：記錄部署 ─────────────────────────────────────────
Write-Host "  [5/5] 記錄部署..." -ForegroundColor Gray

if (-not $DryRun) {
    $runlogDir  = Join-Path $DEV_ROOT "docs\runlog"
    $today      = (Get-Date -Format "yyyy-MM-dd")
    $runlogFile = Join-Path $runlogDir "${today}_README.md"

    $logLine = "| $today | deploy-to-prod | $tag | $PROD_ROOT |`n"

    if (Test-Path $runlogFile) {
        # append 到既有 runlog
        Add-Content -Path $runlogFile -Value "`n### Deploy Log`n$logLine"
    } else {
        # 建立最小 runlog（不干擾 OpenSpec 流程）
        $content = "# Runlog $today`n`n### Deploy Log`n| 日期 | Action | Version | Target |`n|------|--------|---------|--------|`n$logLine"
        Set-Content -Path $runlogFile -Value $content -Encoding UTF8
    }
}
Write-Host "  [5/5] 記錄完成 ✓" -ForegroundColor Green

# ── 完成 ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "  啟動正式區服務："
Write-Host '  $env:PORT="3001"; $env:NODE_ENV="production"; node D:\prod\Personal-AI-Work-System\web\server.js' -ForegroundColor Cyan
Write-Host ""
Write-Host "  正式區：http://localhost:3001"
Write-Host "  測試區：http://localhost:3000"
Write-Host ""

if ($DryRun) {
    Write-Host "  (DRY RUN 完成，未實際修改正式區)" -ForegroundColor Yellow
}
