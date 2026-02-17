# XXXIII Protocol Roadmap

**Version:** 1.0
**Date:** 2026-02-18
**Maintainer:** XXXIII Working Group

---

## Overview

This roadmap defines the milestone-based development trajectory for the
XXXIII Deterministic Literary Publishing Standard. Each phase builds on
the previous, extending the protocol from a single-author reference
implementation toward multi-implementation institutional adoption.

Phases are sequential. A phase is not considered complete until all
technical deliverables are verified and documented.

---

## Phase I — Deterministic Anchor

**Status:** Complete
**Timeline:** 2025-06 → 2026-02

### Objective

Establish a deterministic publishing pipeline with cryptographic
proof-of-origin, Merkle-based provenance, and immutable on-chain
anchoring.

### Technical Deliverables

- [x] SHA-256 canonical hashing with CRLF normalisation
- [x] Four-tree Merkle architecture (manuscript, artifact, image, prompt)
- [x] Combined edition root derivation
- [x] IPFS content-addressed storage
- [x] LiteraryAnchor contract (Polygon Mainnet)
- [x] PublishingKernelV2 with freeze mechanism
- [x] AuthorIdentity with ECDSA binding
- [x] EditionNFT + StoryNFT (ERC-721 + ERC-2981)
- [x] RoyaltyRouter (pull-based distribution)
- [x] RecoveryToolkit (69 tests)
- [x] Client-side observability layer
- [x] Cross-chain anchoring (OpenTimestamps → Bitcoin)
- [x] LPS-1 specification (RFC-style)
- [x] IAPL-1 audio provenance layer
- [x] 293 tests + 58 reference implementation tests
- [x] Research paper published (DOI: 10.5281/zenodo.18646886)
- [x] LPS-1 Level 5 compliance achieved

### Protocol Impact

Single-author, single-implementation proof of concept demonstrating
that deterministic literary publishing is technically viable on public
infrastructure.

### Funding Alignment

Self-funded. No external grants. Demonstrates feasibility without
institutional dependency.

---

## Phase II — Multi-Author Support

**Status:** Proposed
**Tracking:** LPS-4

### Objective

Extend the protocol to support collaborative authorship with
per-author identity binding and shared edition governance.

### Technical Deliverables

- [ ] Multi-signer edition anchoring
- [ ] Per-author contribution attestation
- [ ] Shared edition root with author-specific sub-trees
- [ ] Co-author royalty split configuration
- [ ] AuthorIdentity v2 with delegation support
- [ ] Updated specification sections (LPS-1 §4, §7, §8)

### Protocol Impact

Moves the protocol from single-author provenance to collaborative
literary works. Required for anthology, translation, and editorial
use cases.

### Funding Alignment

Aligns with digital humanities grants focused on collaborative
authorship attribution and provenance tracking.

### Risks

- Author key coordination complexity
- Dispute resolution mechanism required
- Gas cost scaling with author count

---

## Phase III — Ethereum L1 Mirror

**Status:** Research
**Tracking:** LPS-2

### Objective

Establish a cross-chain anchor standard enabling edition root
mirroring to Ethereum L1 for maximum settlement finality.

### Technical Deliverables

- [ ] Cross-chain anchor specification (LPS-2)
- [ ] Ethereum L1 mirror contract
- [ ] Bridge verification between Polygon and L1
- [ ] Updated compliance matrix (Level 5+ for cross-chain)
- [ ] Cost analysis and batching strategy

### Protocol Impact

Provides settlement-layer finality for literary provenance.
Demonstrates chain-agnostic protocol design.

### Funding Alignment

Aligns with Ethereum Foundation grants for cross-chain
interoperability and cultural asset preservation.

### Risks

- L1 gas costs may require batching or rollup strategies
- Bridge security assumptions
- Timing guarantees across chains

---

## Phase IV — Zero-Knowledge Proof Inclusion

**Status:** Research
**Tracking:** LPS-3

### Objective

Enable zero-knowledge verification of Merkle inclusion, allowing
third parties to verify content membership without accessing the
full content tree.

### Technical Deliverables

- [ ] zk-SNARK circuit for Merkle inclusion proof
- [ ] On-chain verifier contract
- [ ] Privacy-preserving content verification API
- [ ] Updated specification (LPS-1 §5)
- [ ] Benchmarks: proof generation time, verification gas cost

### Protocol Impact

Enables privacy-preserving provenance verification. Critical for
pre-publication content protection and embargo compliance.

### Funding Alignment

Aligns with privacy-technology grants and zero-knowledge
research funding programmes.

### Risks

- Circuit complexity for four-tree architecture
- Proof generation time on consumer hardware
- Trusted setup requirements (if using Groth16)

---

## Phase V — Institutional Verification API

**Status:** Planned

### Objective

Provide a standards-compliant REST API for institutional consumers
(libraries, archives, publishers) to verify literary provenance
without direct blockchain interaction.

### Technical Deliverables

- [ ] REST API specification (OpenAPI 3.x)
- [ ] Verification endpoints: hash check, Merkle proof, edition lookup
- [ ] Rate-limited public tier
- [ ] Institutional authentication tier
- [ ] API documentation and integration guides
- [ ] Compliance level verification endpoint

### Protocol Impact

Lowers the integration barrier for institutional adoption. Enables
library catalog systems and publisher workflows to verify provenance
through standard HTTP interfaces.

### Funding Alignment

Directly aligns with digital preservation grants (NEH, Mellon,
IMLS) and library technology modernisation programmes.

### Risks

- Centralisation of verification defeats protocol ethos
- API availability becomes a dependency
- Must maintain trust-minimised design (API as convenience, not authority)

---

## Phase VI — Multi-Implementation Adoption

**Status:** Planned

### Objective

Achieve independent implementations of LPS-1 by external teams,
triggering the governance transition from author-led to working
group model.

### Technical Deliverables

- [ ] Interoperability test suite
- [ ] Compliance certification process
- [ ] At least 3 independent implementations
- [ ] At least 5 active contributors
- [ ] Governance transition executed (per GOVERNANCE.md §6)
- [ ] Working group charter formalised

### Protocol Impact

Transforms LPS-1 from a single-team standard into an
industry-adopted protocol. This is the point at which the
specification becomes infrastructure.

### Funding Alignment

Aligns with standards-body formation grants and open-source
sustainability programmes (e.g., Open Technology Fund,
Protocol Labs, Filecoin Foundation).

### Risks

- Adoption requires compelling use cases beyond the reference implementation
- Governance transition must not fragment the specification
- Maintaining backward compatibility across implementations

---

## Summary

| Phase | Title | Status | Tracking |
|-------|-------|--------|----------|
| I | Deterministic Anchor | **Complete** | — |
| II | Multi-Author Support | Proposed | LPS-4 |
| III | Ethereum L1 Mirror | Research | LPS-2 |
| IV | zk-Proof Inclusion | Research | LPS-3 |
| V | Institutional Verification API | Planned | — |
| VI | Multi-Implementation Adoption | Planned | — |

---

## Cross-References

- [LPS-1 Specification](spec/LPS-1.md)
- [IAPL-1 Specification](https://github.com/FTHTrading/LPS-1-Reference-Implementation/blob/main/spec/IAPL-1.md)
- [Compliance Matrix](spec/COMPLIANCE.md)
- [Governance Model](spec/GOVERNANCE.md)
- [Working Group](WORKING_GROUP.md)
- [Funding Brief](FUNDING_BRIEF.md)
