# LPS-1 Compliance Levels

**Version:** 1.0
**Date:** 2026-02-17
**Maintainer:** XXXIII Working Group

---

## Overview

LPS-1 defines six progressive compliance levels (L0–L5) for protocol
conformance. Each level is a strict superset of the level below it. An
implementation MUST satisfy all requirements of lower levels before
claiming a higher level.

Compliance levels enable adopters to implement the protocol
incrementally, starting with basic hash anchoring and progressing toward
full observability as infrastructure matures.

---

## Level Definitions

### Level 0 — Anchor Only

The minimum viable provenance commitment. A single content hash stored
on a public blockchain.

| Requirement | Description |
|-------------|-------------|
| L0.1 | SHA-256 hash of source content computed |
| L0.2 | Hash recorded on any public blockchain |
| L0.3 | Transaction hash published or discoverable |

**Achievable with:** A single smart contract call or OpenTimestamps
submission. No build pipeline required.

---

### Level 1 — Deterministic Build

Reproducible content hashing with canonical normalisation.

| Requirement | Description |
|-------------|-------------|
| L1.1 | All Level 0 requirements |
| L1.2 | UTF-8 encoding enforced |
| L1.3 | CRLF line-ending normalisation applied before hashing |
| L1.4 | Trailing whitespace stripped per line |
| L1.5 | Identical inputs produce identical hashes across environments |

**Achievable with:** A normalisation script + hashing utility. Build
must be reproducible by any third party from source files alone.

---

### Level 2 — Merkle Provenance

Per-content-type Merkle trees with a combined edition root.

| Requirement | Description |
|-------------|-------------|
| L2.1 | All Level 1 requirements |
| L2.2 | Independent Merkle tree per content type (manuscript, artefact, image, prompt) |
| L2.3 | Leaf ordering: lexicographic by canonical filename |
| L2.4 | Edition root derived from ordered concatenation of content-type roots |
| L2.5 | Merkle proof generation for individual leaves |

**Achievable with:** A Merkle tree builder that accepts content
directories and outputs roots + proof files.

---

### Level 3 — On-Chain Anchoring

Immutable blockchain record binding edition root to block timestamp.

| Requirement | Description |
|-------------|-------------|
| L3.1 | All Level 2 requirements |
| L3.2 | Anchor contract deployed on public blockchain |
| L3.3 | Edition root stored immutably (no proxy patterns, no upgradeability) |
| L3.4 | IPFS CID stored alongside edition root |
| L3.5 | Edition lifecycle state machine enforced on-chain |
| L3.6 | FROZEN state prevents modification of anchored data |

**Achievable with:** A LiteraryAnchor-style smart contract + IPFS
pinning service. Contract must be verified and source-published.

---

### Level 4 — Signed Canonical Root

ECDSA identity binding with on-chain author registry.

| Requirement | Description |
|-------------|-------------|
| L4.1 | All Level 3 requirements |
| L4.2 | Author identity bound via ECDSA signature |
| L4.3 | On-chain identity registry mapping wallet → external identifiers |
| L4.4 | ORCID or equivalent persistent identifier linked |
| L4.5 | Signature recoverable from on-chain data |

**Achievable with:** An AuthorIdentity contract + wallet-signed
edition commitment. External identifiers (ORCID, DOI) registered
on-chain.

---

### Level 5 — Fully Observable

Cross-chain timestamping and client-side independent verification.

| Requirement | Description |
|-------------|-------------|
| L5.1 | All Level 4 requirements |
| L5.2 | Edition root anchored on at least two independent chains |
| L5.3 | Client-side verification interface (read-only RPC observation) |
| L5.4 | Real-time on-chain state display (no intermediary APIs) |
| L5.5 | All contracts source-verified on block explorer |
| L5.6 | Full test suite published and passing |

**Achievable with:** Cross-chain timestamping (e.g., OpenTimestamps for
Bitcoin) + client-side chain reader + verified contract source.

---

## Compliance Matrix

The following matrix maps protocol features to compliance levels:

| Feature | L0 | L1 | L2 | L3 | L4 | L5 |
|---------|----|----|----|----|----|----|
| SHA-256 hash | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CRLF normalisation | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reproducible build | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Merkle trees | | | ✓ | ✓ | ✓ | ✓ |
| Edition root | | | ✓ | ✓ | ✓ | ✓ |
| On-chain anchor | | | | ✓ | ✓ | ✓ |
| IPFS persistence | | | | ✓ | ✓ | ✓ |
| Edition lifecycle | | | | ✓ | ✓ | ✓ |
| ECDSA identity | | | | | ✓ | ✓ |
| Author registry | | | | | ✓ | ✓ |
| Cross-chain timestamp | | | | | | ✓ |
| Client-side verification | | | | | | ✓ |
| Source-verified contracts | | | | | | ✓ |

---

## XXXIII Reference Implementation

The XXXIII protocol reference implementation achieves **Level 5 — Fully
Observable**.

### Evidence

| Level | Requirement | Evidence |
|-------|-------------|----------|
| L0 | Hash on chain | Edition root anchored on Polygon (Block 83,109,781) |
| L1 | Deterministic build | CRLF-normalised SHA-256 pipeline, reproducible from source |
| L2 | Merkle provenance | 6 independent Merkle trees, combined edition root |
| L3 | On-chain anchor | LiteraryAnchor contract at `0x97f456...8bba90`, FROZEN |
| L4 | ECDSA identity | AuthorIdentity at `0x5Ad0B2...1EcF80`, ORCID registered |
| L5 | Cross-chain | Bitcoin via OpenTimestamps, Polygon primary |
| L5 | Client-side | On-Chain State section at xxxiii.io (direct RPC reads) |
| L5 | Verified | VII / VII contracts source-verified on Polygonscan |
| L5 | Tests | 293 tests passing across VII suites |

### Contracts

| Contract | Address | Verified |
|----------|---------|----------|
| LiteraryAnchor | `0x97f456300817eaE3B40E235857b856dfFE8bba90` | ✓ |
| AuthorIdentity | `0x5Ad0B272Fb0d5c3fB4F4fB5b80Fe06a71E1EcF80` | ✓ |
| RoyaltyRouter | `0x44169829489d70aaecbf845870652871C65fC461` | ✓ |
| EditionNFT | `0x9e9Cc1486bf440Bd9eAaaD947958524Aaed3f8b0` | ✓ |
| StoryNFT | `0xD67e537Dba1236f802432cbDD30Fec3f6D38e7E3` | ✓ |
| RecoveryToolkit | `0xedE0Ec0C1BdCFBa4FE6AE0a4C53290a1e83e89cB` | ✓ |
| KernelV2 | `0xca9F6604A9b498DB31d113836E2957c0a9aAE037` | ✓ |

---

## Claiming Compliance

To claim an LPS-1 compliance level, an implementation MUST:

1. Satisfy all requirements of the claimed level and all levels below it
2. Publish evidence (transaction hashes, contract addresses, test results)
3. Make source code available for independent verification

Compliance is self-assessed. There is no certification authority. The
protocol's design ensures that any claim can be independently verified
by a third party using only public data.

### Badge Format

Implementations MAY display compliance level badges in the format:

```
LPS-1 Level N — [Level Name]
```

Example:

```
LPS-1 Level 5 — Fully Observable
```
