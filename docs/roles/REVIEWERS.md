# XXXIII Review Process

**Version:** 1.0
**Date:** 2026-02-18

---

## Overview

This document defines the review process for specification changes,
implementation contributions, and interoperability assessments within
the XXXIII protocol ecosystem.

---

## Review Types

### 1. Specification Review

Reviews of changes to LPS-1 or related specifications (IAPL-1, LPS-2
through LPS-5).

**Scope:**
- Normative language accuracy (RFC 2119 compliance)
- Cryptographic parameter correctness
- Backward compatibility assessment
- Cross-reference integrity between specification sections

**Outcome:** Approve, Request Changes, or Reject with rationale.

### 2. Implementation Review

Reviews of pull requests to the reference implementation or
infrastructure repositories.

**Scope:**
- Test coverage for new or changed functionality
- Determinism preservation (canonical ordering, normalisation)
- Gas efficiency for on-chain operations
- No regression in existing test suites

**Outcome:** Approve, Request Changes, or Reject with rationale.

### 3. Interoperability Review

Assessments of alternative LPS-1 implementations submitted by
external teams.

**Scope:**
- Compliance level claimed vs. evidence provided
- Hash output determinism (canonical SHA-256 match)
- Merkle tree construction compatibility
- Edition lifecycle state machine conformance

**Outcome:** Interoperability report with compliance level assessment.

---

## Reviewer Criteria

Reviewers are selected based on demonstrated expertise in one or more
of the following domains:

| Domain | Qualification |
|--------|---------------|
| **Cryptography** | SHA-256, Merkle trees, ECDSA signature schemes |
| **Smart Contracts** | Solidity, EVM, deployment patterns |
| **Content Addressing** | IPFS, CID construction, pinning strategies |
| **Publishing Standards** | Literary metadata, edition management, DOI/ORCID |
| **Protocol Design** | RFC authorship, standard specification processes |

---

## Current Reviewers

| Reviewer | Domain | Status |
|----------|--------|--------|
| Protocol Author (Kidd James) | All domains | Active |
| Internal Security | Cryptography, Smart Contracts | Active |

As the protocol matures, external reviewers will be invited based on
the expansion path defined in `CORE_TEAM.md`.

---

## Review Process

### Standard Review

```
Submission
    │
    ▼
Assignment ─── Reviewer selected by Specification Editor
    │
    ▼
Technical Review ─── 7-day review window
    │
    ▼
Feedback ─── Approve / Request Changes / Reject
    │
    ▼
Resolution ─── Author addresses feedback
    │
    ▼
Final Approval ─── Protocol Author sign-off
```

### Emergency Review

For security-critical changes, the review window is reduced to 48 hours
and requires Protocol Author direct involvement.

### Breaking Change Review

Changes that affect protocol semantics, hash outputs, or on-chain
behaviour require:

1. Written impact assessment
2. Review by all active reviewers
3. Architecture Decision Record (ADR)
4. Protocol Author approval
5. Major version increment

---

## Review Checklist

Reviewers should verify:

- [ ] Change does not alter existing Merkle roots or content hashes
- [ ] Change does not modify deployed contract behaviour
- [ ] Change is documented (ADR if architectural, release note if user-facing)
- [ ] Tests pass across all suites (293 tests + 58 ref impl tests)
- [ ] Specification and implementation remain consistent
- [ ] Compliance level implications are assessed

---

## Cross-References

- [CORE_TEAM.md](CORE_TEAM.md) — Core team structure
- [CONTRIBUTORS.md](CONTRIBUTORS.md) — Contribution pathways
- [GOVERNANCE.md](../spec/GOVERNANCE.md) — Decision authority
- [COMPLIANCE.md](../spec/COMPLIANCE.md) — Compliance level definitions
