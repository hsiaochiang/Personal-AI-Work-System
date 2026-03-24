# manual-workflow-pilot

## ADDED Requirements

### Requirement: Single Manual Workflow Pilot

The repository MUST support one complete, real, manual Phase 1 workflow pilot for an active OpenSpec change.

#### Scenario: Agent starts from governance entrypoints

WHEN an agent starts the pilot from the repository governance entrypoints
THEN the agent MUST be able to identify the current roadmap state, current task, blockers, project context, and command entrypoints without oral clarification.

### Requirement: Pilot Evidence Chain

The workflow pilot MUST leave a traceable evidence chain inside the repository.

#### Scenario: Completed pilot writes evidence back to governance files

WHEN the single manual workflow pilot is completed
THEN the repository SHALL contain synchronized updates in roadmap, decision log, runlog, current-task, and at least one project memory or equivalent governance evidence file.

### Requirement: Handoff Replayability

The pilot MUST leave enough handoff detail for the next agent or user to continue without extra verbal context.

#### Scenario: Next agent resumes from handoff

WHEN the next agent reads the current task and blockers files after the pilot
THEN the files MUST state the task state, next step, validation status, and blocker or no-blocker result for the pilot.

### Requirement: Friction Capture With Minimal Fixes

The pilot MUST record workflow friction and limit fixes to the smallest scope directly related to the friction.

#### Scenario: Pilot exposes missing or unused workflow fields

WHEN the manual workflow pilot exposes useful files, unused fields, or friction points
THEN the repository SHALL record those findings and MUST limit any fixes to the directly related instructions, template fields, or usage order for this pilot.