# semi-auto-memory-extraction-mvp

## Purpose

Define repository requirements for the V1 Phase 2 semi-auto memory extraction MVP, including normalized conversation input, candidate schema, human confirmation gate, and governance evidence synchronization.

## Requirements

### Requirement: Conversation Record Input Contract

The semi-auto extraction flow MUST accept a normalized conversation record format before candidate extraction starts.

#### Scenario: Valid conversation input is submitted

WHEN an operator provides a conversation record containing `conversation_id`, `source`, `captured_at`, and `messages` with `role` and `content`
THEN the system SHALL mark the input as valid and allow candidate extraction.

#### Scenario: Required fields are missing

WHEN any required field in the input contract is missing
THEN the system MUST reject extraction and SHALL record the rejection reason for traceability.

### Requirement: Candidate Schema And Memory Mapping

The extraction flow MUST produce candidate objects that follow a minimal schema and explicit memory target mapping.

#### Scenario: Candidate is generated from valid input

WHEN extraction runs on a valid conversation record
THEN each candidate MUST include `candidate_id`, `memory_scope`, `summary`, `evidence_excerpt`, `confidence`, `dedupe_key`, and `status`.

#### Scenario: Candidate memory scope is assigned

WHEN a candidate is created
THEN `memory_scope` SHALL be one of `user`, `session`, or `repo`, and the writeback target SHALL match that scope.

### Requirement: Human Confirmation Gate Before Writeback

The flow MUST require explicit human confirmation before any memory writeback happens.

#### Scenario: Candidate is approved by human review

WHEN a reviewer sets candidate `status` to `approved`
THEN the system MUST allow writeback and SHALL record reviewer identity, timestamp, and target file path.

#### Scenario: Candidate is not approved

WHEN candidate `status` is `pending` or `rejected`
THEN the system MUST block writeback.

### Requirement: Validation And Governance Evidence Sync

Each execution MUST keep validation and governance documents synchronized for auditability.

#### Scenario: Change execution is completed

WHEN the S2 change run is completed
THEN strict validation MUST pass with `openspec change validate phase2-semi-auto-memory-extraction-mvp --strict`, and handoff/runlog/roadmap SHALL be updated with traceable evidence.

#### Scenario: End-to-end loop evidence is required

WHEN acceptance is reviewed
THEN at least one real run of `conversation record -> candidate -> human confirmation -> writeback` MUST be documented in runlog.
