param(
    [string]$RepoRoot = "D:/program/Personal-AI-Work-System"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $RepoRoot

Write-Host "[S7-Cycle04] RepoRoot: $RepoRoot"

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

Write-Host "[S7-Cycle04] Required files: PASS"

openspec validate --changes "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null
openspec change validate "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null

Write-Host "[S7-Cycle04] OpenSpec strict validate: PASS"

$matches = Select-String -Path "docs/roadmap.md","docs/handoff/current-task.md","docs/handoff/blockers.md","docs/runlog/2026-03-26_README.md" -Pattern "S7|Review Gate|GO|Cycle-03|Cycle-04"
if (-not $matches -or $matches.Count -lt 10) {
    throw "Governance consistency keywords are insufficient. Expected at least 10 matches, got $($matches.Count)."
}

Write-Host "[S7-Cycle04] Governance consistency: PASS ($($matches.Count) matches)"

$templatePython = "d:/program/copilot-workspace-template/.venv/Scripts/python.exe"
$templateScript = "D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py"
if (-not (Test-Path $templatePython)) {
    throw "Template python not found: $templatePython"
}
if (-not (Test-Path $templateScript)) {
    throw "Template script not found: $templateScript"
}

& $templatePython $templateScript --verify-only --root $RepoRoot | Out-Null
Write-Host "[S7-Cycle04] Template verify-only: PASS"

Write-Host "[S7-Cycle04] Overall: PASS"
