# entrypoint-guidance-pilot

## Purpose

Define the repository requirements for the second manual Phase 1 workflow pilot that focuses on clearer entrypoints, artifact guidance, and unambiguous strict validation.

## Requirements

### Requirement: Entrypoint Order Must Be Explicit

The second manual workflow pilot MUST use an explicit governance entrypoint order before any deeper repository exploration.

#### Scenario: Agent starts the second pilot

WHEN an agent starts the second manual workflow pilot
THEN the agent MUST begin from `AGENTS.md`, current handoff, roadmap, and commands before expanding to broader documentation.

### Requirement: Artifact Guidance Must Use OpenSpec Instructions

The second manual workflow pilot MUST obtain `spec-driven` artifact expectations through `openspec instructions` rather than trial-and-error discovery.

#### Scenario: Agent prepares change artifacts

WHEN the agent needs proposal, design, tasks, or spec formats for the second pilot
THEN the agent MUST use `openspec instructions` to derive the required structure and SHALL record that this path was used.

### Requirement: Strict Validate Command Must Be Unambiguous

The second manual workflow pilot MUST use the active-change validate command that has already been verified in this repository.

#### Scenario: Agent runs strict validate for the second pilot

WHEN the second pilot is validated
THEN the agent MUST use `openspec change validate <change-name> --strict` and SHALL not rely on `openspec validate <change-name> --strict` as the primary validation path.

### Requirement: QA Must Compare Pilot One And Pilot Two

The second manual workflow pilot MUST leave comparison evidence against the first pilot's recorded friction points.

#### Scenario: Agent records second pilot QA

WHEN the second pilot QA is written
THEN it MUST explicitly state whether artifact lookup friction, validate command confusion, and governance entrypoint scanning were reduced, unchanged, or worsened compared with the first pilot.