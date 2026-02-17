# XXXIII Core Team

**Version:** 1.0
**Date:** 2026-02-18

---

## Overview

The XXXIII core team maintains the Deterministic Literary Publishing
Standard (LPS-1), its reference implementation, and all supporting
infrastructure. This document defines current roles, responsibilities,
and the structural path for future expansion.

---

## Core Roles

### Protocol Author

| Field | Value |
|-------|-------|
| **Name** | Kidd James |
| **Entity** | XXXIII Working Group |
| **Authority** | Final approval on all specification versions |
| **Scope** | LPS-1 authorship, improvement proposal decisions, on-chain identity attestations, canonical deployment signing |

The Protocol Author holds sole authority over specification changes in
the current author-led governance phase. All decisions are recorded as
Architecture Decision Records in `docs/adr/`.

### Specification Editor

| Field | Value |
|-------|-------|
| **Name** | XXXIII Working Group |
| **Scope** | Specification document maintenance, ADR review, improvement proposal pipeline management, release note publication |

The Specification Editor ensures consistency between the normative
specification (LPS-1), informative documentation, and the reference
implementation. Edits to the specification require Protocol Author
approval.

### Infrastructure Maintainer

| Field | Value |
|-------|-------|
| **Entity** | FTHTrading |
| **Scope** | Reference implementation, CI/CD pipelines, contract deployment, test suites, site infrastructure |

The Infrastructure Maintainer operates the reference implementation
repository, CI verification pipeline (LPS Verify), and the xxxiii.io
protocol site. Infrastructure changes that affect protocol semantics
require Protocol Author approval.

### Security Reviewer

| Field | Value |
|-------|-------|
| **Entity** | Internal |
| **Scope** | Vulnerability assessment, threat model maintenance, key custody review, RPC endpoint auditing |

Security review is currently performed internally. External audit
engagement is planned as part of the institutional adoption roadmap
(see `docs/ROADMAP.md`).

---

## Organisational Structure

```
Protocol Author (Kidd James)
├── Specification Editor (XXXIII WG)
│   ├── LPS-1 maintenance
│   ├── ADR review
│   └── Improvement proposals
├── Infrastructure Maintainer (FTHTrading)
│   ├── Reference implementation
│   ├── CI/CD pipelines
│   └── Site infrastructure
└── Security Reviewer (Internal)
    ├── Threat model
    └── Key custody
```

---

## Expansion Path

As adoption progresses beyond a single implementation, the core team
structure will expand according to the governance transition criteria
defined in `docs/spec/GOVERNANCE.md`:

1. **External Reviewers** — Invited technical reviewers for specification
   feedback (see `REVIEWERS.md`)
2. **Contributors** — Community contributors following structured
   pathways (see `CONTRIBUTORS.md`)
3. **Working Group Members** — Formal multi-stakeholder governance
   when transition criteria are met

---

## Cross-References

- [GOVERNANCE.md](../spec/GOVERNANCE.md) — Governance model and transition criteria
- [WORKING_GROUP.md](../WORKING_GROUP.md) — Working group scope and versioning authority
- [CONTRIBUTORS.md](CONTRIBUTORS.md) — Contribution pathways
- [REVIEWERS.md](REVIEWERS.md) — Review process
