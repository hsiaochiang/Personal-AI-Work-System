param(
    [string]$RepoRoot = "D:/program/Personal-AI-Work-System"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $RepoRoot

Write-Host "[S7-Cycle05] RepoRoot: $RepoRoot"

$requiredFiles = @(
    "docs/roadmap.md",
    "docs/handoff/current-task.md",
    "docs/handoff/blockers.md",
    "docs/runlog/2026-03-26_README.md",
    "docs/qa/2026-03-26_smoke.md"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing required file: $file"
    }
}

Write-Host "[S7-Cycle05] Required files: PASS"

openspec validate --changes "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null
openspec change validate "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null
Write-Host "[S7-Cycle05] OpenSpec strict validate: PASS"

$matches = Select-String -Path "docs/roadmap.md","docs/handoff/current-task.md","docs/handoff/blockers.md","docs/runlog/2026-03-26_README.md" -Pattern "S7|Review Gate|GO|Cycle-04|Cycle-05"
if (-not $matches -or $matches.Count -lt 10) {
    throw "Governance consistency keywords are insufficient. Expected at least 10 matches, got $($matches.Count)."
}
Write-Host "[S7-Cycle05] Governance consistency: PASS ($($matches.Count) matches)"

$templatePython = "d:/program/copilot-workspace-template/.venv/Scripts/python.exe"
$templateScript = "D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py"
if (-not (Test-Path $templatePython)) {
    throw "Template python not found: $templatePython"
}
if (-not (Test-Path $templateScript)) {
    throw "Template script not found: $templateScript"
}

$env:PYTHONIOENCODING = "utf-8"
$templateOutput = & $templatePython $templateScript --verify-only --root $RepoRoot 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "Template verify-only failed with exit code $LASTEXITCODE"
}

$templateText = ($templateOutput | Out-String)
if ($templateText -match "UnicodeEncodeError") {
    throw "Template verify-only output contains UnicodeEncodeError"
}

Write-Host "[S7-Cycle05] Template verify-only encoding-safe: PASS"
Write-Host "[S7-Cycle05] Overall: PASS"
