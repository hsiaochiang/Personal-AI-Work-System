# lightweight-ui-workbench

## ADDED Requirements

### Requirement: UI Workbench MVP Must Provide A Single-Page Minimal Flow

The S5 implementation MUST provide a single-page lightweight UI workbench that supports the minimum operator flow: context input, candidate generation, human review, and draft writeback.

#### Scenario: Minimum flow runs end-to-end

WHEN an operator opens the workbench and submits a valid context input
THEN the system SHALL present candidate items, allow review actions, and complete draft writeback in one continuous flow.

#### Scenario: Flow is incomplete

WHEN any one of the four minimum steps is missing or non-operational
THEN S5 MVP acceptance MUST fail.

### Requirement: Candidate Review Decisions Must Be Explicit And Traceable

Every candidate item MUST require an explicit human decision (adopt or reject) with traceable metadata before writeback.

#### Scenario: Candidate is adopted

WHEN an operator adopts a candidate
THEN the decision SHALL record operator, timestamp, and short rationale, and SHALL mark the item as approved for draft writeback.

#### Scenario: Candidate is rejected

WHEN an operator rejects a candidate
THEN the decision SHALL record operator, timestamp, and rejection reason, and SHALL prevent that item from writeback output.

### Requirement: Writeback Must Target Draft Layer Only

S5 MUST write outputs to a draft evidence layer and MUST NOT directly overwrite archived S1-S4 artifacts or long-term memory final records.

#### Scenario: Draft writeback succeeds

WHEN an approved candidate set is submitted
THEN output SHALL be written to a designated draft location with traceable run metadata.

#### Scenario: Direct overwrite is attempted

WHEN the workflow attempts to modify archived S1-S4 artifacts or protected final records
THEN the action MUST be blocked and logged as a policy violation.

### Requirement: Governance Evidence Must Be Synchronized For S5

S5 execution MUST synchronize roadmap, runlog, handoff, and QA evidence to reflect the same phase status and validation outcome.

#### Scenario: Validation passes and evidence is synced

WHEN strict validation and MVP run are completed
THEN governance documents SHALL contain consistent status, command evidence, and next-step notes.

#### Scenario: Governance mismatch is detected

WHEN governance files disagree on S5 status or validation result
THEN S5 acceptance MUST fail until consistency is restored.

### Requirement: Rollback Must Preserve Docs-First Integrity

S5 MUST provide a rollback path that restores a known-good draft state without introducing new scope.

#### Scenario: MVP flow fails during validation

WHEN end-to-end flow or validation fails
THEN rollback SHALL restore the latest known-good draft state and record corrective action in runlog/QA.

#### Scenario: Rollback proposal includes scope expansion

WHEN a rollback action proposes new feature scope
THEN it MUST be rejected and replaced by a minimal correction plan.
