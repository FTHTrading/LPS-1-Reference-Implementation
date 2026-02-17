# LPS-1 Governance

**Version:** 1.0
**Date:** 2026-02-17
**Maintainer:** XXXIII Working Group

---

## Governance Model

The XXXIII protocol is maintained under an **author-led governance model**
with structured contribution pathways. This model balances decisive
technical stewardship with transparent decision records.

### Current Phase: Author-Led

In the current phase, the Protocol Author holds final authority over
specification changes, contract deployments, and reference implementation
updates. All decisions are documented as Architecture Decision Records
(ADRs) for institutional transparency.

### Future Phase: Working Group

As adoption grows, governance will transition to a multi-stakeholder
Working Group model. The transition criteria are defined in §6.

---

## Roles and Responsibilities

| Role | Entity | Scope |
|------|--------|-------|
| Protocol Author | Kidd James | Specification authorship, final approval |
| Specification Steward | XXXIII Working Group | Spec maintenance, ADR review |
| Reference Implementation | FTHTrading | Code, tests, deployment |
| Security Review | Internal audit | Vulnerability assessment |

### Protocol Author

The Protocol Author:

- Authors and approves all specification versions
- Approves or rejects improvement proposals
- Signs on-chain identity attestations
- Maintains the canonical deployment

### Specification Steward

The XXXIII Working Group:

- Maintains specification documents
- Reviews and records architectural decisions
- Manages the improvement proposal pipeline
- Publishes release notes for version changes

---

## Decision Process

### Standard Changes

1. Proposal filed as GitHub issue with `proposal` label
2. Technical evaluation by the Protocol Author
3. Architecture Decision Record (ADR) drafted in `docs/adr/`
4. Reference implementation updated to reflect accepted changes
5. Specification document updated
6. Version tag applied

### Breaking Changes

Changes that alter on-chain behaviour, Merkle construction, or hash
derivation rules require:

1. All steps from Standard Changes
2. New contract deployment (no proxy upgrades)
3. Migration documentation
4. Minimum 30-day notice period

### Emergency Changes

Security-critical fixes may bypass the standard process:

1. Vulnerability disclosed privately to Protocol Author
2. Fix implemented and tested
3. ADR published retroactively
4. Version tag applied with security advisory

---

## Versioning

All specification versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** — Breaking changes to hash derivation, Merkle construction,
  or on-chain format
- **MINOR** — New compliance levels, additional content types, extended
  features
- **PATCH** — Clarifications, typo fixes, documentation improvements

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-06-15 | Initial manuscript hashing pipeline |
| 1.0.0 | 2026-01-15 | Full Merkle architecture, Polygon deployment |
| 2.0.0 | 2026-02-15 | Protocol demonstration layer, observability |
| 2.2.0 | 2026-02-17 | Canonical title update, compliance formalisation |

---

## Improvement Proposals

Improvement proposals extend the protocol's capabilities. Each proposal
follows the naming convention `LPS-N` for core protocol extensions and
`IAPL-N` for audio publishing layer extensions.

| Proposal | Title | Status | Champion |
|----------|-------|--------|---------|
| LPS-1 | Literary Publishing Standard | Active | Kidd James |
| IAPL-1 | Immutable Audio Publishing Layer | Active | Kidd James |
| LPS-2 | Cross-Chain Anchor Standard | Draft | — |
| LPS-3 | Zero-Knowledge Proof of Origin | Research | — |
| LPS-4 | Multi-Author Edition Support | Proposed | — |
| LPS-5 | Audio Edition Merkle Standard | Active | Kidd James |

### Proposal Lifecycle

```
PROPOSED → DRAFT → ACTIVE → FINAL
                 ↘ WITHDRAWN
```

- **PROPOSED** — Initial idea, no specification text
- **DRAFT** — Specification text in progress, may change
- **ACTIVE** — Specification complete, reference implementation exists
- **FINAL** — Stable, no further changes except errata
- **WITHDRAWN** — Abandoned or rejected

---

## Architecture Decision Records

All significant technical decisions are documented as ADRs in
`docs/adr/`. Each ADR follows the format:

```
# ADR-NNNN: [Title]

## Status: [Accepted | Superseded | Deprecated]

## Context: [What prompted this decision]

## Decision: [What was decided]

## Consequences: [What follows from this decision]
```

### Current ADRs

| ADR | Title |
|-----|-------|
| 0001 | Anchor Immutability |
| 0002 | Deterministic Build Pipeline |
| 0003 | Six-Tree Merkle Architecture |
| 0004 | Client-Side Observability |
| 0005 | ECDSA Author Identity |
| 0006 | Polygon Mainnet Selection |

---

## Transition Criteria

Governance transitions from Author-Led to Working Group when **any two**
of the following conditions are met:

1. **Adoption** — At least 3 independent implementations claim LPS-1
   Level 2 or above
2. **Contributors** — At least 5 distinct contributors with merged
   pull requests
3. **Institutional Interest** — A grant, partnership, or formal
   endorsement from a recognised institution
4. **Specification Maturity** — LPS-1 reaches FINAL status with no
   breaking changes for 12 consecutive months

Until transition criteria are met, the Protocol Author retains full
authority. This prevents premature bureaucracy while ensuring a clear
path to decentralised governance.

---

## Contact

- **GitHub:** [FTHTrading/2500-donkeys](https://github.com/FTHTrading/2500-donkeys)
- **Site:** [xxxiii.io](https://xxxiii.io)
- **ORCID:** [0009-0008-8425-939X](https://orcid.org/0009-0008-8425-939X)
- **DOI:** [10.5281/zenodo.18646886](https://doi.org/10.5281/zenodo.18646886)

---

## License

This governance document is released under CC BY 4.0.
