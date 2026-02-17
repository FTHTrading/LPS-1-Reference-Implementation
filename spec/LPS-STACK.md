# LPS Protocol Stack

**Version:** 1.0
**Date:** 2026-02-18
**Maintainer:** XXXIII Working Group

---

## Overview

The LPS Protocol Stack defines the complete architecture of the
Deterministic Literary Publishing Standard ecosystem. Each layer is
independently specified, independently implementable, and
independently verifiable.

---

## Stack Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                        │
│         Client-side chain reads · Event timeline        │
│         RPC verification · Status indicators            │
├─────────────────────────────────────────────────────────┤
│                    COMPLIANCE                           │
│         Level 0–5 conformance matrix                    │
│         Self-assessment · Certification                 │
├─────────────────────────────────────────────────────────┤
│                    DISTRIBUTION                         │
│         LPS-NFT · ERC-721 + ERC-2981                    │
│         EditionNFT · StoryNFT · RoyaltyRouter           │
├─────────────────────────────────────────────────────────┤
│                    AUDIO LAYER                          │
│         IAPL-1 · Immutable Audio Publishing Layer       │
│         Kokoro TTS · Audio Merkle tree                  │
├─────────────────────────────────────────────────────────┤
│                    CORE PROTOCOL                        │
│         LPS-1 · Literary Publishing Standard            │
│         SHA-256 · Merkle trees · On-chain anchor        │
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                       │
│         Polygon Mainnet · IPFS · OpenTimestamps         │
│         Non-upgradeable contracts · Git provenance      │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Definitions

### Layer 1 — Infrastructure

The foundational layer providing settlement, storage, and
temporal anchoring.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Settlement** | Polygon Mainnet (Chain ID 137) | Immutable on-chain anchor, block-level timestamps |
| **Storage** | IPFS (content-addressed) | Decentralised persistence via CID |
| **Cross-chain** | OpenTimestamps → Bitcoin | Independent temporal attestation |
| **Version Control** | Git | Commit-level authorship history |
| **Contracts** | Solidity (non-upgradeable) | LiteraryAnchor, PublishingKernelV2, AuthorIdentity |

**Specification:** No dedicated spec. Infrastructure requirements are
embedded in LPS-1 §3 (Protocol Layers) and §10 (Security Considerations).

### Layer 2 — Core Protocol (LPS-1)

The normative specification for deterministic literary publishing.

| Component | Description |
|-----------|-------------|
| **Content Hashing** | SHA-256 with CRLF normalisation (FIPS 180-4) |
| **Merkle Architecture** | Four independent trees: manuscript, artifact, image, prompt |
| **Edition Root** | Combined hash: `SHA-256(manuscriptRoot ‖ artifactRoot ‖ imageRoot ‖ promptRoot)` |
| **Edition Lifecycle** | DRAFT → ANCHORED → FROZEN → CANONICAL / SUPERSEDED / RETRACTED |
| **Identity** | ECDSA author binding via AuthorIdentity contract |
| **Freeze Mechanism** | Permanent, irreversible on-chain seal |

**Specification:** [LPS-1.md](LPS-1.md)
**Status:** Informational (v1.0)
**Compliance Levels:** 0–5

### Layer 3 — Audio Layer (IAPL-1)

Extension layer for immutable audio provenance.

| Component | Description |
|-----------|-------------|
| **Audio Generation** | Kokoro TTS with deterministic narrator configuration |
| **Audio Hashing** | Per-file SHA-256 fingerprint |
| **Audio Merkle Tree** | Independent tree for audio content (13 leaves in ref impl) |
| **Audio Root** | Anchored alongside edition root |

**Specification:** [IAPL-1.md](https://github.com/FTHTrading/LPS-1-Reference-Implementation/blob/main/spec/IAPL-1.md)
**Status:** Active (v1.0)
**Dependency:** Requires LPS-1 Layer 2

### Layer 4 — Distribution (LPS-NFT)

Token-based distribution layer for literary editions and stories.

| Component | Contract | Standard |
|-----------|----------|----------|
| **EditionNFT** | `0x9e9Cc1486bf440Bd9eAaaD947958524Aaed3f8b0` | ERC-721 + ERC-2981 |
| **StoryNFT** | `0xD67e537Dba1236f802432cbDD30Fec3f6D38e7E3` | ERC-721 + ERC-2981 |
| **RoyaltyRouter** | `0x44169829489d70aaecbf845870652871C65fC461` | Pull-based distribution |
| **RecoveryToolkit** | `0xedE0Ec0C1BdCFBa4FE6AE0a4C53290a1e83e89cB` | Asset recovery |

**Specification:** Implicit in LPS-1 §3 Layer 5 (Token Layer).
Formal LPS-NFT specification is planned.
**Status:** Deployed, 69 RecoveryToolkit tests passing
**Dependency:** Requires LPS-1 Layer 2

### Layer 5 — Compliance

Conformance measurement and certification framework.

| Component | Description |
|-----------|-------------|
| **Level 0** | Anchor Only — SHA-256 hash on any public blockchain |
| **Level 1** | Deterministic Build — CRLF normalisation + reproducible hash |
| **Level 2** | Merkle Provenance — Per-type trees + combined edition root |
| **Level 3** | On-Chain Anchoring — Immutable record binding root to block |
| **Level 4** | Signed Canonical Root — ECDSA identity + author registry |
| **Level 5** | Fully Observable — Cross-chain + client-side verification |

**Specification:** [COMPLIANCE.md](COMPLIANCE.md)
**XXXIII Status:** Level 5 — Fully Observable
**Dependency:** Compliance levels map to LPS-1 requirements

### Layer 6 — Observability

Client-side verification and live chain state monitoring.

| Component | Description |
|-----------|-------------|
| **Chain Reads** | 11 parallel contract reads via ethers.js v6 |
| **Event Timeline** | EditionAnchored, EditionFrozen event decoding |
| **Status Indicators** | Live/loading/error state with automatic refresh |
| **Verification** | Client-side SHA-256 hash verification (drag-and-drop) |
| **RPC Strategy** | 5 prioritised endpoints with fallback |

**Specification:** ADR-0004 (Client-Side Observability)
**Status:** Production on xxxiii.io
**Dependency:** Requires deployed Layer 1 infrastructure

---

## Stack Interaction Model

```
User ─── Observability (L6) ─── reads ──▶ Infrastructure (L1)
  │                                              │
  │                                              │
  ▼                                              ▼
Verify ─── Compliance (L5) ─── measures ─▶ Core Protocol (L2)
  │                                              │
  │                                              │
  ▼                                              ▼
Collect ── Distribution (L4) ── mints ───▶ Edition Root
  │                                              │
  │                                              │
  ▼                                              ▼
Listen ─── Audio Layer (L3) ── extends ──▶ Merkle Architecture
```

---

## Improvement Proposals

| Proposal | Layer | Title | Status |
|----------|-------|-------|--------|
| LPS-2 | L1 | Cross-chain anchor standard | Draft |
| LPS-3 | L2 | Zero-knowledge proof of origin | Research |
| LPS-4 | L2 | Multi-author edition support | Proposed |
| LPS-5 | L3 | Audio edition Merkle standard | Active |

---

## Implementation Reference

| Metric | Value |
|--------|-------|
| **Contracts deployed** | 7 (all verified on Polygonscan) |
| **Test coverage** | 293 tests + 58 ref impl tests |
| **Compliance level** | Level 5 — Fully Observable |
| **Specification status** | Informational |
| **Governance model** | Author-led (transition criteria defined) |

---

## Cross-References

- [LPS-1 Specification](LPS-1.md)
- [IAPL-1 Specification](https://github.com/FTHTrading/LPS-1-Reference-Implementation/blob/main/spec/IAPL-1.md)
- [Compliance Matrix](COMPLIANCE.md)
- [Governance Model](GOVERNANCE.md)
- [Roadmap](../ROADMAP.md)
- [Funding Brief](../FUNDING_BRIEF.md)
