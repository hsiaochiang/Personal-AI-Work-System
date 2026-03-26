# autonomous-governance-execution

## ADDED Requirements

### Requirement: One-Shot Continuation Must Complete End-To-End Execution

S7 MUST support a single start command that performs intake validation, implementation, validation, and governance sync without repeated manual prompts.

#### Scenario: Single trigger completes one execution cycle

WHEN operator triggers S7 continuation once
THEN the workflow SHALL run intake checks, execute one highest-value smallest-safe step, validate outputs, and generate a fixed-format report.

#### Scenario: Hard blocker is encountered

WHEN workflow detects a true blocker
THEN it SHALL stop safely, record blocker details, and provide explicit unblock criteria instead of partial silent completion.

### Requirement: Governance Sync Must Be Mandatory Per Execution Cycle

Each S7 execution cycle MUST synchronize governance evidence as a required gate.

#### Scenario: Standard cycle without UI/UX impact

WHEN execution changes docs/process artifacts only
THEN runlog and handoff SHALL both be updated before completion.

#### Scenario: Cycle includes UI/UX or flow interaction changes

WHEN execution includes UI/UX or interaction flow updates
THEN uiux and qa evidence SHALL also be synchronized in the same cycle.

### Requirement: Execution Reporting Must Follow Deterministic Structure

S7 outputs MUST follow a deterministic report structure for handoff reliability.

#### Scenario: Successful execution report

WHEN an execution cycle finishes
THEN output SHALL include Current state, Changes made, Validation, Open issues, and Next step.

#### Scenario: Incomplete report

WHEN any required report section is missing
THEN execution SHALL be treated as non-accepted and require report completion.

### Requirement: Safety Guardrails Must Prevent Destructive Operations

S7 execution MUST preserve non-destructive operation boundaries.

#### Scenario: Normal execution

WHEN cycle runs under normal conditions
THEN it SHALL not execute commit, push, reset, or destructive git commands.

#### Scenario: Requested action conflicts with guardrails

WHEN a step requires destructive operation without explicit approval
THEN workflow SHALL refuse the action and provide safe alternatives.

### Requirement: S7 Planning Startup Must Produce Active Change Artifacts

S7 startup MUST create complete active change artifacts for continuation.

#### Scenario: Planning startup executed

WHEN S7 startup is initiated
THEN proposal.md, design.md, tasks.md, and delta spec SHALL exist under one active change directory.

#### Scenario: Artifact set is incomplete

WHEN any required artifact is missing
THEN S7 planning startup SHALL be marked incomplete and blocked from handoff.

### Requirement: S7 Acceptance Must Be Measurable And Replayable

S7 acceptance MUST be based on measurable criteria and at least one replayable validation run.

#### Scenario: Measurable acceptance is satisfied

WHEN strict validation passes and governance files are synchronized
THEN S7 cycle SHALL be accepted only if all required report sections are present and evidence paths are recorded.

#### Scenario: Replay evidence is missing

WHEN no replayable smoke evidence is attached
THEN S7 cycle MUST be marked incomplete even if implementation text exists.

### Requirement: Human Decision Items Must Be Explicitly Listed

S7 planning outputs MUST list human decision items that cannot be auto-finalized by agents.

#### Scenario: Human decision list exists

WHEN planner artifacts are generated
THEN they SHALL include unresolved human decisions such as dependency policy, mandatory verify scope, and expansion boundaries.

#### Scenario: Human decision list is omitted

WHEN planner artifacts omit human decision points
THEN planning SHALL be treated as partial and cannot be considered handoff-ready.
