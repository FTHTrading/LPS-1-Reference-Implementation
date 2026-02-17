# XXXIII Funding Brief

**Version:** 1.0
**Date:** 2026-02-18
**Prepared by:** XXXIII Working Group

---

## Problem Statement

Literary works have no standardised mechanism for cryptographic
proof-of-origin. Authors cannot independently prove when a work
was written, that its contents have not been altered, or that a
specific individual authored it — without relying on centralised
intermediaries.

Existing publishing infrastructure depends on institutional trust:
publishers, distributors, and platform operators serve as de facto
authorities on authorship and content integrity. This model
concentrates verification power in commercial entities and excludes
independent authors from provenance infrastructure entirely.

The problem is structural. It is not solved by digitisation,
e-book platforms, or document management systems. These tools
replicate the same trust model in digital form.

---

## Current State of Web3 Publishing

Blockchain-based publishing projects have focused primarily on:

1. **Tokenisation** — Representing literary works as tradeable assets
2. **Access control** — Gating content behind token ownership
3. **Marketplace creation** — Building platforms for buying and selling literary NFTs

These approaches treat blockchain as a distribution mechanism, not as
provenance infrastructure. They address commerce, not verification.

No widely adopted standard exists for:

- Deterministic content hashing of literary manuscripts
- Merkle-based provenance commitments across content types
- Immutable on-chain anchoring with forward-only edition lifecycles
- Client-side cryptographic verification without backend dependencies

---

## What LPS Solves

The Literary Publishing Standard (LPS-1) defines a deterministic
protocol for literary provenance with six independently verifiable
layers:

| Layer | Function |
|-------|----------|
| Filesystem | Canonical file ordering and version control |
| Git | Commit-level authorship history |
| SHA-256 | FIPS 180-4 cryptographic fingerprint |
| Merkle Trees | Per-content-type provenance commitments |
| IPFS | Content-addressed decentralised storage |
| Polygon | Immutable on-chain anchor with block timestamp |

The protocol establishes:

- **Proof of origin** at byte-level precision
- **Content integrity** via four independent Merkle trees
- **Temporal anchoring** on public blockchains
- **Author identity** through ECDSA signature binding
- **Edition lifecycle** with deterministic state transitions
- **Cross-chain attestation** via OpenTimestamps (Bitcoin)

The result is a literary work whose authorship, integrity, and
publication timeline are independently verifiable by anyone with
access to a blockchain node — without trusting the author, publisher,
or any intermediary.

---

## Why Polygon

Polygon Mainnet (Chain ID 137) was selected as the primary settlement
layer based on a structured cost-benefit analysis documented in
ADR-0006:

| Factor | Assessment |
|--------|-----------|
| **Transaction cost** | < $0.01 per anchor operation |
| **Finality** | ~2 second block times |
| **EVM compatibility** | Full Solidity support, standard tooling |
| **Verification** | Polygonscan source verification, public RPC |
| **Ecosystem** | Established validator set, institutional adoption |
| **Longevity** | Backed by Polygon Labs, Ethereum-aligned roadmap |

Cross-chain anchoring to Bitcoin via OpenTimestamps provides
independent temporal attestation on the most secure public blockchain.

---

## Measurable Impact

The reference implementation demonstrates:

| Metric | Value |
|--------|-------|
| Contracts deployed and verified | 7 / 7 |
| Test coverage | 293 tests across 7 suites |
| Reference implementation tests | 58 (37 contract + 21 pipeline) |
| Compliance level achieved | Level 5 — Fully Observable |
| Architecture Decision Records | 6 documented |
| Specification status | Informational (RFC-style, 14 sections) |
| Research paper | Published, DOI-indexed, open access |
| Cross-chain anchoring | Polygon + Bitcoin (OpenTimestamps) |
| Client-side verification | Production (xxxiii.io) |
| Upgrade mechanism | None (non-upgradeable by design) |

---

## Adoption Path

### Near-term (Phase II–III)

- Multi-author support enabling collaborative works
- Ethereum L1 mirror for settlement-layer finality
- Interoperability test suite for alternative implementations

### Medium-term (Phase IV–V)

- Zero-knowledge proof inclusion for privacy-preserving verification
- Institutional verification API (REST, OpenAPI 3.x)
- Library and archive integration pilots

### Long-term (Phase VI)

- Three or more independent implementations
- Governance transition to multi-stakeholder working group
- Standards-body recognition pathway

---

## Budget Categories

| Category | Scope |
|----------|-------|
| **Protocol Development** | Specification authorship, security review, cryptographic analysis |
| **Reference Implementation** | Smart contract development, test coverage, CI/CD infrastructure |
| **Interoperability** | Test suite development, alternative implementation support |
| **Documentation** | Specification maintenance, integration guides, academic publication |
| **Infrastructure** | IPFS pinning, RPC endpoint provisioning, monitoring |
| **Community** | Contributor onboarding, reviewer engagement, governance facilitation |

---

## Grant Alignment

The LPS protocol aligns with the following grant categories and
institutional priorities:

### Digital Preservation

- National Endowment for the Humanities (NEH) — Digital Humanities Advancement Grants
- Andrew W. Mellon Foundation — Scholarly Communications
- Institute of Museum and Library Services (IMLS) — National Digital Platform

**Alignment:** LPS provides cryptographic proof-of-origin and content
integrity for literary works, directly supporting digital preservation
objectives.

### Open-Source Infrastructure

- Protocol Labs / Filecoin Foundation — Open-source grants
- Ethereum Foundation — Academic Grants Round
- Open Technology Fund — Internet Freedom

**Alignment:** LPS is MIT-licensed infrastructure with a published
specification (CC BY 4.0). The protocol is designed for multi-implementation
adoption.

### Web3 Standards

- Polygon Village — Builder grants
- Gitcoin — Public goods funding
- Optimism — RetroPGF (retroactive public goods funding)

**Alignment:** LPS-1 is a public standard deployed on Polygon Mainnet
with full source verification and no commercial lock-in.

### Academic Research

- Zenodo / OpenAIRE — Open access research infrastructure
- ResearchGate — Academic networking and citation
- ORCID — Researcher identification

**Alignment:** The protocol's research paper is published with DOI,
ORCID binding, and open access licensing.

---

## Summary

XXXIII is a standards-grade protocol for literary provenance. It is
not a platform, marketplace, or publishing tool. It is infrastructure
for proving that a specific person wrote a specific work at a specific
time — using mathematics, not intermediaries.

The protocol is fully specified, fully deployed, fully tested, and
fully open. What it requires next is adoption beyond a single
implementation, and the institutional recognition that makes
multi-implementation adoption sustainable.

---

## References

- LPS-1 Specification: [docs/spec/LPS-1.md](spec/LPS-1.md)
- LPS Protocol Stack: [docs/spec/LPS-STACK.md](spec/LPS-STACK.md)
- Compliance Matrix: [docs/spec/COMPLIANCE.md](spec/COMPLIANCE.md)
- Governance Model: [docs/spec/GOVERNANCE.md](spec/GOVERNANCE.md)
- Roadmap: [docs/ROADMAP.md](ROADMAP.md)
- Research Paper: [DOI 10.5281/zenodo.18646886](https://doi.org/10.5281/zenodo.18646886)
- Reference Implementation: [GitHub](https://github.com/FTHTrading/LPS-1-Reference-Implementation)
- Protocol Site: [xxxiii.io](https://xxxiii.io)
