<#
.SYNOPSIS
    首次設置正式區 git worktree（只需執行一次）

.DESCRIPTION
    - 刪除空的 D:\prod\Personal-AI-Work-System（若存在）
    - 使用 git worktree add 將其連結到與 dev 同一份 .git
    - checkout 到目前 VERSION 對應的 tag
    - 執行 npm install --omit=dev
    - 提示複製 api-keys.json（需手動執行一次）

.NOTES
    執行完成後，請手動複製 api-keys.json：
    Copy-Item "d:\program\Personal-AI-Work-System\web\api-keys.json" "D:\prod\Personal-AI-Work-System\web\api-keys.json"
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$DEV_ROOT  = "d:\program\Personal-AI-Work-System"
$PROD_ROOT = "D:\prod\Personal-AI-Work-System"

# 讀取版本
$version = (Get-Content (Join-Path $DEV_ROOT "VERSION") -Raw).Trim()
$tag = "v$version"

Write-Host ""
Write-Host "  首次設置正式區 worktree" -ForegroundColor Cyan
Write-Host "  ──────────────────────────────────"
Write-Host "  Tag：$tag"
Write-Host "  目標：$PROD_ROOT"
Write-Host ""

# 確認 tag 存在
$tagExists = git -C $DEV_ROOT tag --list $tag
if (-not $tagExists) {
    Write-Error "Tag '$tag' 不存在，請先在 dev 建立 tag 再執行本腳本。"
    exit 1
}

# 移除空目錄（worktree add 要求目標不存在或是全新目錄）
if (Test-Path $PROD_ROOT) {
    $items = @(Get-ChildItem $PROD_ROOT -Force)
    if ($items.Count -gt 0) {
        Write-Error "目標目錄非空，請手動確認後再執行：$PROD_ROOT"
        exit 1
    }
    Remove-Item -Path $PROD_ROOT -Force
    Write-Host "  已移除空目錄 $PROD_ROOT"
}

# git worktree add
Write-Host "  git worktree add $PROD_ROOT $tag --detach..."
git -C $DEV_ROOT worktree add $PROD_ROOT $tag --detach
Write-Host "  worktree 建立完成 ✓" -ForegroundColor Green

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
Write-Host "  設置完成！驗證："
Write-Host '  $env:PORT="3001"; $env:NODE_ENV="production"; node D:\prod\Personal-AI-Work-System\web\server.js' -ForegroundColor Cyan
Write-Host "  → http://localhost:3001 應顯示 [PROD] 個人 AI 工作系統儀表板"
Write-Host ""
