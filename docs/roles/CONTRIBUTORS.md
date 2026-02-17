# XXXIII Contribution Guide

**Version:** 1.0
**Date:** 2026-02-18

---

## Overview

XXXIII welcomes contributions that strengthen the Deterministic Literary
Publishing Standard. This document defines contribution pathways,
quality expectations, and the process for submitting work.

---

## Contribution Pathways

### 1. Specification Feedback

Submit issues to the [2500-donkeys](https://github.com/FTHTrading/2500-donkeys)
repository with the `spec-feedback` label. Feedback may address:

- Ambiguity in normative requirements (RFC 2119 keywords)
- Missing edge cases in protocol semantics
- Inconsistencies between specification and reference implementation
- Errors in cryptographic parameter definitions

### 2. Reference Implementation

Contributions to the [LPS-1 Reference Implementation](https://github.com/FTHTrading/LPS-1-Reference-Implementation)
follow standard pull request workflow:

- Fork the repository
- Create a feature branch from `main`
- Submit a pull request with clear description
- Include tests for new functionality
- Ensure all existing tests pass (`npx hardhat test`)

### 3. Alternative Implementations

Independent implementations of LPS-1 are encouraged. An alternative
implementation should:

- Target a specific compliance level (Level 0–5)
- Reference the normative specification (`docs/spec/LPS-1.md`)
- Document deviations from the reference implementation
- Submit an interoperability report (see `REVIEWERS.md`)

### 4. Documentation

Documentation contributions include:

- Tutorials for specific compliance levels
- Integration guides for existing publishing platforms
- Translations of specification documents
- Technical blog posts or academic citations

### 5. Architecture Decision Records

Propose new ADRs by filing an issue with the `adr-proposal` label.
ADRs follow the format established in `docs/adr/`. The Protocol Author
approves or rejects proposed ADRs.

---

## Quality Standards

All contributions must meet the following baseline:

| Criterion | Requirement |
|-----------|-------------|
| **Code style** | Consistent with existing codebase conventions |
| **Tests** | New functionality must include tests |
| **Documentation** | Public API changes require documentation updates |
| **Commit messages** | Imperative mood, reference issue numbers |
| **No breaking changes** | Without prior discussion and Protocol Author approval |

---

## Intellectual Property

- Infrastructure code is licensed under MIT
- Specification documents are licensed under CC BY 4.0
- Literary content (manuscripts, stories) remains under author copyright
- Contributors agree that their contributions fall under the applicable
  license of the component they modify

---

## Recognition

Contributors are acknowledged in release notes and, for sustained
contributions, in the project's governance structure. See
`docs/spec/GOVERNANCE.md` §6 for the working group transition criteria
that formalise multi-stakeholder participation.

---

## Process

```
Issue / Proposal
       │
       ▼
  Discussion
       │
       ▼
  Pull Request ──── Review (REVIEWERS.md)
       │
       ▼
  Protocol Author Approval
       │
       ▼
  Merge + Release Note
```

---

## Contact

- Repository: [FTHTrading/2500-donkeys](https://github.com/FTHTrading/2500-donkeys)
- Specification: [LPS-1](../spec/LPS-1.md)
- Governance: [GOVERNANCE.md](../spec/GOVERNANCE.md)
