<#
.SYNOPSIS
    首次設置正式區（獨立 git clone，只需執行一次）

.DESCRIPTION
    - 從 GitHub 將 repo clone 到 D:\prod\Personal-AI-Work-System
    - Checkout 到 VERSION 對應的 tag（detached HEAD）
    - 執行 npm install --omit=dev
    - 提示複製 api-keys.json（需手動執行一次）

.NOTES
    正式區為獨立 git clone，有自己的 .git，與 dev 互不干擾。
    Data（api-keys.json 等 gitignored 檔案）不受 deploy 影響。
    日常布版請使用：.\scripts\deploy-to-prod.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$DEV_ROOT    = "d:\program\Personal-AI-Work-System"
$PROD_ROOT   = "D:\prod\Personal-AI-Work-System"
$REMOTE_URL  = "https://github.com/hsiaochiang/Personal-AI-Work-System.git"

# 讀取版本
$version = (Get-Content (Join-Path $DEV_ROOT "VERSION") -Raw).Trim()
$tag = "v$version"

Write-Host ""
Write-Host "  首次設置正式區（standalone clone）" -ForegroundColor Cyan
Write-Host "  ──────────────────────────────────"
Write-Host "  Remote：$REMOTE_URL"
Write-Host "  Tag：$tag"
Write-Host "  目標：$PROD_ROOT"
Write-Host ""

# 確認目標目錄不存在或為空
if (Test-Path $PROD_ROOT) {
    $items = @(Get-ChildItem $PROD_ROOT -Force)
    if ($items.Count -gt 0) {
        Write-Error "目標目錄非空，請手動確認後再執行：$PROD_ROOT"
        exit 1
    }
    Remove-Item -Path $PROD_ROOT -Force
}

# git clone
Write-Host "  git clone $REMOTE_URL..."
git clone $REMOTE_URL $PROD_ROOT
Write-Host "  clone 完成 ✓" -ForegroundColor Green

# checkout tag
Write-Host "  git checkout tags/$tag..."
git -C $PROD_ROOT checkout "tags/$tag" --detach --force
$actual = git -C $PROD_ROOT describe --tags --exact-match HEAD 2>$null
if ($actual -ne $tag) {
    Write-Error "Checkout 後版本不符：預期 $tag，實際 $actual"
    exit 1
}
Write-Host "  Checkout $tag 完成 ✓" -ForegroundColor Green

# sparse-checkout non-cone：明確指定包含路徑，根層未列出的檔案（AGENTS.md 等）不會出現
Write-Host "  設定 sparse-checkout (non-cone include list)..."
git -C $PROD_ROOT sparse-checkout init --no-cone
$patterns = @(
    "/web/",
    "/docs/memory/",
    "/docs/handoff/",
    "/docs/templates/",
    "/docs/shared/",
    "/docs/roadmap.md",
    "/VERSION",
    "/CHANGELOG.md",
    "/README.md",
    "/.gitignore"
)
$patterns | Set-Content -Path "$PROD_ROOT\.git\info\sparse-checkout" -Encoding UTF8
git -C $PROD_ROOT sparse-checkout reapply
Write-Host "  sparse-checkout 完成 ✓" -ForegroundColor Green

# npm install
Write-Host "  npm install --omit=dev..."
Push-Location "$PROD_ROOT\web"
npm install --omit=dev
Pop-Location
Write-Host "  npm install 完成 ✓" -ForegroundColor Green

# 提示 api-keys.json
Write-Host ""
Write-Host "  ⚠️  請手動執行以下指令複製 API 金鑰（只需一次）：" -ForegroundColor Yellow
Write-Host '  Copy-Item "d:\program\Personal-AI-Work-System\web\api-keys.json" "D:\prod\Personal-AI-Work-System\web\api-keys.json"' -ForegroundColor Cyan
Write-Host ""
Write-Host "  設置完成！啟動正式區服務："
Write-Host '  $env:PORT="3001"; $env:NODE_ENV="production"; node D:\prod\Personal-AI-Work-System\web\server.js' -ForegroundColor Cyan
Write-Host "  → http://localhost:3001 應顯示 [PROD] 個人 AI 工作系統儀表板"
Write-Host ""
