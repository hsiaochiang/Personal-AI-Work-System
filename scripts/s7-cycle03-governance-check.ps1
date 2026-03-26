param(
    [string]$RepoRoot = "D:/program/Personal-AI-Work-System"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $RepoRoot

Write-Host "[S7-Cycle03] RepoRoot: $RepoRoot"

$requiredFiles = @(
    "docs/roadmap.md",
    "docs/handoff/current-task.md",
    "docs/handoff/blockers.md",
    "docs/runlog/2026-03-26_README.md"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing required file: $file"
    }
}

Write-Host "[S7-Cycle03] Required files: PASS"

openspec validate --changes "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null
openspec change validate "phase7-v4-autonomous-continuation-governance-automation-mvp" --strict | Out-Null

Write-Host "[S7-Cycle03] OpenSpec strict validate: PASS"

$matches = Select-String -Path "docs/roadmap.md","docs/handoff/current-task.md","docs/handoff/blockers.md","docs/runlog/2026-03-26_README.md" -Pattern "S7|Review Gate|GO|Cycle-03"
if (-not $matches -or $matches.Count -lt 8) {
    throw "Governance consistency keywords are insufficient. Expected at least 8 matches, got $($matches.Count)."
}

Write-Host "[S7-Cycle03] Governance consistency: PASS ($($matches.Count) matches)"
Write-Host "[S7-Cycle03] Overall: PASS"
