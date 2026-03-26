# v1-5-stabilization-foundation

## ADDED Requirements

### Requirement: Extraction Flow Must Be Standardized And Stable

Phase 2 MUST define one standardized extraction flow and one stable rule set for repeatable execution.

#### Scenario: Standard flow is executed

WHEN an operator performs extraction under Phase 2
THEN the workflow SHALL follow documented input, steps, and output contracts without ad-hoc interpretation.

#### Scenario: Rule conflict appears

WHEN extraction rules conflict
THEN the workflow SHALL apply a documented priority order and record the resolution.

### Requirement: Template Fields Must Be Converged

Phase 2 MUST converge template fields into required, optional, and deprecated groups across core governance documents.

#### Scenario: Core templates are checked

WHEN handoff, runlog, and qa templates are reviewed
THEN each field SHALL have one unambiguous status and definition.

#### Scenario: Deprecated field is encountered

WHEN an old field appears during execution
THEN the workflow SHALL map it using a compatibility table and avoid breaking existing records.

### Requirement: Real Cases Must Be Reviewed For Rule Fitness

Phase 2 MUST validate rules through retrospective review of real cases.

#### Scenario: Multi-case review is performed

WHEN at least two case types are reviewed
THEN the workflow SHALL produce a gap list and actionable rule adjustments.

#### Scenario: Single-case evidence only

WHEN only one case is reviewed
THEN acceptance SHALL be blocked until a second case type is evaluated.

### Requirement: New Project Initialization Must Be Replayable

Phase 2 MUST provide a replayable initialization path from zero to handoff-ready.

#### Scenario: New project bootstrap is executed

WHEN an operator follows initialization instructions
THEN required baseline files SHALL be created and a first handoff-ready state SHALL be reachable.

#### Scenario: Clean-room replay fails

WHEN initialization cannot be replayed from documented steps
THEN the initialization definition SHALL be marked incomplete.

### Requirement: Project And Personal Boundaries Must Be Explicit

Phase 2 MUST define explicit boundaries between project-level and personal-level data/actions.

#### Scenario: Write target is evaluated

WHEN a workflow writes artifacts
THEN it SHALL determine whether target is project scope or personal scope based on documented path rules.

#### Scenario: Boundary conflict occurs

WHEN project and personal policies conflict
THEN the conflict resolution procedure SHALL be applied and logged.

### Requirement: Version-1 Usage Guide Must Enable Independent Operation

Phase 2 MUST deliver a first usage guide that enables independent execution by another agent.

#### Scenario: Guide-based execution

WHEN a non-author agent follows the guide
THEN one full cycle SHALL be executable without oral clarification.

#### Scenario: Missing troubleshooting path

WHEN a known failure mode appears and no troubleshooting instruction exists
THEN guide acceptance SHALL fail until remediation steps are documented.
