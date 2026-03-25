# real-project-validation

## ADDED Requirements

### Requirement: Real Project Validation Inputs Must Be Authentic

The Phase 3 validation flow MUST use authentic project-context inputs as the primary evidence source.

#### Scenario: Validation run uses authentic project context

WHEN an operator executes a Phase 3 validation run
THEN the run SHALL reference real project tasks or conversations as input context and SHALL record the source summary for traceability.

#### Scenario: Synthetic-only input is provided

WHEN a run is attempted with only synthetic or fabricated input context
THEN the run MUST be marked invalid for Phase 3 acceptance and SHALL be excluded from pass criteria.

### Requirement: At Least Two End-to-End Validation Runs

Phase 3 MUST complete at least two end-to-end runs using the existing S2 pipeline boundaries.

#### Scenario: Two runs are completed

WHEN Run A and Run B are both completed
THEN each run MUST include input summary, candidate list, human review outcome, writeback or rejection evidence, operator, and timestamp.

#### Scenario: Fewer than two runs are completed

WHEN acceptance is evaluated with fewer than two valid runs
THEN Phase 3 MUST be considered not accepted.

### Requirement: Candidate Utility Threshold Must Be Measured

Phase 3 MUST evaluate candidate utility with a measurable approval quality threshold.

#### Scenario: Approved candidates are reviewed

WHEN approved candidates are evaluated by human review
THEN directly adoptable candidate ratio MUST be measured and SHALL be at least 70 percent for acceptance.

#### Scenario: Threshold is not met

WHEN the adoptable ratio is below 70 percent
THEN the run MUST document root-cause categories and proposed corrective actions before closure.

### Requirement: Dedupe Conflict Resolution Must Be Complete

Phase 3 MUST ensure dedupe conflicts are explicitly resolved in each validation run.

#### Scenario: Dedupe conflict exists

WHEN one or more candidates share the same dedupe key
THEN each conflict MUST have a recorded resolution outcome (merge, keep, or reject).

#### Scenario: Unresolved dedupe conflict remains

WHEN unresolved dedupe conflicts remain at review time
THEN Phase 3 acceptance MUST fail.

### Requirement: Non-Regression Against S2 Scope

Phase 3 MUST validate S2 capabilities without expanding or redefining S2 scope.

#### Scenario: Phase 3 artifacts are reviewed

WHEN proposal, design, tasks, and delta spec are reviewed
THEN they MUST not introduce new S2 core contract fields or alter S2 requirement intent.

#### Scenario: Scope expansion is detected

WHEN any artifact attempts to expand S2 scope within Phase 3
THEN the change MUST be flagged for re-scoping before execution.

### Requirement: Governance Evidence Synchronization For Phase 3

Each Phase 3 execution MUST synchronize validation evidence across governance documents.

#### Scenario: Validation is completed

WHEN strict validation is executed for the change
THEN PASS evidence and executed command details SHALL be recorded in governance artifacts.

#### Scenario: Handoff readiness is checked

WHEN the next agent reviews governance files
THEN roadmap, current-task, and runlog MUST provide enough detail to continue work without extra verbal clarification.
