# multi-tool-integration-framework

## ADDED Requirements

### Requirement: Multi-Tool Adapter Framework Must Support Minimum Two Sources

The S6 implementation MUST provide an adapter-based integration framework that supports at least two tool sources in one run.

#### Scenario: Two sources are ingested in one run

WHEN an operator triggers candidate ingestion with valid context
THEN the system SHALL execute at least two adapters and collect candidates in a single run scope.

#### Scenario: One source adapter fails

WHEN one adapter fails due to timeout or tool error
THEN the system SHALL continue with available adapters, record failure metadata, and mark run status as degraded (not silent success).

### Requirement: Candidate Data Must Be Normalized Into A Unified Schema

All tool outputs MUST be normalized into a shared candidate schema before entering review.

#### Scenario: Raw outputs have different formats

WHEN adapters return heterogeneous raw payloads
THEN the system SHALL map each item into normalized fields including candidate_id, summary, confidence, dedupe_key, source_tool, and source_ref.

#### Scenario: Required fields are missing

WHEN a candidate cannot satisfy required normalized fields
THEN that candidate MUST be rejected from review queue and logged with validation reason.

### Requirement: Merge And Dedupe Must Preserve Source Traceability

The merge/dedupe process MUST prevent duplicate review workload while preserving source traceability.

#### Scenario: Same dedupe_key appears from multiple sources

WHEN multiple normalized candidates share one dedupe_key
THEN the system SHALL merge them into one review item while preserving all source references.

#### Scenario: Dedupe conflict is ambiguous

WHEN dedupe rules cannot determine safe merge behavior
THEN the item MUST be marked for manual conflict review instead of auto-merge.

### Requirement: Human Review Gate Must Be Mandatory Before Writeback

No candidate MUST be written back unless explicitly reviewed by a human operator.

#### Scenario: Candidate is adopted

WHEN reviewer marks a candidate as adopted
THEN decision metadata SHALL include reviewer, reviewed_at, and reason, and item becomes eligible for draft writeback.

#### Scenario: Candidate remains pending

WHEN candidate has no explicit adopted/rejected decision
THEN the system MUST block writeback and surface pending count as validation failure.

### Requirement: Writeback Must Be Draft-Only And Governance-Safe

S6 outputs MUST be written to draft evidence targets only, and MUST NOT overwrite archived or protected final records.

#### Scenario: Draft writeback succeeds

WHEN adopted items are submitted
THEN the system SHALL write only adopted items to draft evidence output with run_id and evidence paths.

#### Scenario: Protected path overwrite is attempted

WHEN workflow attempts to write into archived S1-S5 artifacts or protected final memory records
THEN the operation MUST be blocked and logged as policy violation.

### Requirement: Governance Synchronization Must Be Required For Acceptance

S6 acceptance MUST require synchronized updates across roadmap, runlog, handoff, and QA evidence.

#### Scenario: Validation pass with synchronized governance

WHEN strict validation passes and demo run completes
THEN governance files SHALL present consistent S6 status, validation evidence, and next-step handoff notes.

#### Scenario: Governance mismatch detected

WHEN governance artifacts disagree on phase status or validation result
THEN S6 acceptance MUST fail until consistency is restored.
