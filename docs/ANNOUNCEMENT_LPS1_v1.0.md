# XXXIII Protocol: LPS-1 v1.0 Public Release

---

## Status

| Field | Value |
|-------|-------|
| **Document** | Public Announcement — LPS-1 v1.0 |
| **Date** | February 17, 2026 |
| **Tag** | `v3.0-standards-foundation` |
| **Status** | Production — Polygon Mainnet |
| **Conformance** | Level 5 — Fully Observable |
| **License** | MIT (infrastructure) · CC BY 4.0 (paper) |
| **Author** | Kidd James (Kevan Burns) |

> No chain state was modified in the v3.0 standards foundation release. All on-chain data, Merkle roots, contract addresses, and anchored content remain exactly as deployed.

---

## Executive Summary

- **LPS-1** is an open specification for deterministic literary publishing — cryptographic proof that a manuscript existed in a specific form at a specific time, verifiable by anyone.
- **Seven smart contracts** are deployed, source-verified, and operational on Polygon Mainnet. Total deployment cost: under $2.50.
- **Two literary works** are fully anchored: *The 2,500 Donkeys* (novel, ~75k words) and *Private Placement Puppetry* (13 stories + audio narration).
- The protocol achieves **Level 5 (Fully Observable)** conformance — the highest tier in the LPS compliance matrix — with live on-chain state readable at [xxxiii.io](https://xxxiii.io).
- A **six-layer protocol stack** (LPS-STACK) formalizes infrastructure, core protocol, audio, distribution, compliance, and observability as independently specified layers.
- A **six-phase roadmap** charts the path from single-author deterministic anchor through multi-implementation ecosystem adoption.
- All infrastructure is open source. No proxies. No upgradeability. No admin keys.

---

## What LPS-1 Is

LPS-1 (Literary Publishing Standard) defines a deterministic pipeline for anchoring literary manuscripts on a public blockchain. The specification covers SHA-256 content hashing, Merkle tree construction, on-chain edition lifecycle management, IPFS content addressing, and ECDSA author identity binding. It is designed so that any party — author, publisher, auditor, or reader — can independently verify that a work has not been altered after its anchor timestamp, without relying on any intermediary.

The protocol does not tokenize literature as a financial instrument. It provides provenance infrastructure: the ability to prove authorship, integrity, and temporal ordering of creative works using public, permissionless systems.

**Full specification:** [LPS-1.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/LPS-1.md)

---

## What Is Live Today (Polygon Mainnet)

### Smart Contracts

| Component | Address | Purpose | Verification |
|-----------|---------|---------|:------------:|
| **LiteraryAnchor** | [`0x97f4...a90`](https://polygonscan.com/address/0x97f456300817eaE3B40E235857b856dfFE8bba90#code) | Genesis anchor, edition registry | [Verified](https://polygonscan.com/address/0x97f456300817eaE3B40E235857b856dfFE8bba90#code) |
| **KernelV2** | [`0xca9F...037`](https://polygonscan.com/address/0xca9F6604A9b498DB31d113836E2957c0a9aAE037#code) | 5-root Merkle editions, ECDSA freeze | [Verified](https://polygonscan.com/address/0xca9F6604A9b498DB31d113836E2957c0a9aAE037#code) |
| **AuthorIdentity** | [`0xB9ff...170`](https://polygonscan.com/address/0xB9ffa688A8Bb332221030BbBE46bE5bF03323170#code) | 12 works + 4 linked contracts | [Verified](https://polygonscan.com/address/0xB9ffa688A8Bb332221030BbBE46bE5bF03323170#code) |
| **RoyaltyRouter** | [`0x4416...461`](https://polygonscan.com/address/0x44169829489d70aaecbf845870652871C65fC461#code) | Pull-based revenue distribution | [Verified](https://polygonscan.com/address/0x44169829489d70aaecbf845870652871C65fC461#code) |
| **EditionNFT** | [`0x9e9C...b0`](https://polygonscan.com/address/0x9e9Cc1486bf440Bd9eAaaD947958524Aaed3f8b0#code) | ERC-721 + ERC-2981, 3-tier supply | [Verified](https://polygonscan.com/address/0x9e9Cc1486bf440Bd9eAaaD947958524Aaed3f8b0#code) |
| **StoryNFT** | [`0xD67e...E3`](https://polygonscan.com/address/0xD67e537Dba1236f802432cbDD30Fec3f6D38e7E3#code) | ERC-721 + ERC-2981, 14 stories | [Verified](https://polygonscan.com/address/0xD67e537Dba1236f802432cbDD30Fec3f6D38e7E3#code) |
| **RecoveryToolkit** | [`0xedE0...cB`](https://polygonscan.com/address/0xedE0Ec0C1BdCFBa4FE6AE0a4C53290a1e83e89cB#code) | Asset recovery | [Verified](https://polygonscan.com/address/0xedE0Ec0C1BdCFBa4FE6AE0a4C53290a1e83e89cB#code) |

### Anchored Works

| Work | SHA-256 | IPFS CID | Status |
|------|---------|----------|:------:|
| *The 2,500 Donkeys* (Novel) | `cdef74d1...578364` | [`QmVQ79NM...g8vK`](https://ipfs.io/ipfs/QmVQ79NM3qxAsBpftTG4YhD4KV9sUEmM3WwFrc5vs5g8vK) | Frozen + Signed |
| *Private Placement Puppetry* (Stories) | `77bb9f5e...3a123a` | [`QmahPEAZ...581LV`](https://ipfs.io/ipfs/QmahPEAZuWz3dFa55BsNgBEkjBzvWm5M3xbGaRYwm581LV) | Frozen + Signed |

### Metrics

| Metric | Value |
|--------|-------|
| Tests | 293 across VII suites + 58 reference implementation |
| Merkle Trees | 6 (4 novel + 2 stories) |
| Deployment Cost | < $2.50 total |
| Upgradeability | None |
| Genesis Block | [83,002,198](https://polygonscan.com/block/83002198) (February 14, 2026) |

> **On-chain naming note:** The StoryNFT contract and certain on-chain edition notes record the working title "PPE Puppetry." This is immutable blockchain state. The canonical title is "Private Placement Puppetry." See [Release Notes v2.2](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/RELEASE_NOTES_v2.2.md) for the full provenance of this rename.

---

## Compliance Claim

XXXIII claims **Level 5 — Fully Observable** conformance under the LPS compliance matrix.

| Level | Requirement | Evidence |
|:-----:|-------------|:--------:|
| L0 | Hash + timestamp | ✓ SHA-256, Polygon block timestamp |
| L1 | Merkle tree integrity | ✓ 6-tree architecture |
| L2 | On-chain anchor | ✓ LiteraryAnchor + KernelV2 |
| L3 | Reproducible build | ✓ Deterministic pipeline |
| L4 | Public verification | ✓ `npm run lps:verify` (51 checks) |
| L5 | Runtime observability | ✓ Live chain reads at [xxxiii.io](https://xxxiii.io) |

**Full matrix with evidence mapping:** [COMPLIANCE.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/COMPLIANCE.md)

---

## How to Verify (90 Seconds)

### Protocol Verification

```bash
git clone https://github.com/FTHTrading/2500-donkeys.git
cd 2500-donkeys
npm install
npm run lps:verify
```

This executes 51 automated checks: SHA-256 hash comparison, Merkle root reconstruction, IPFS CID validation, on-chain state read, and edition consistency. All results are printed to stdout. Pass/fail is deterministic.

### Optional: View Live Site Locally

```bash
cd site
npx wrangler pages dev .
```

Opens the full protocol interface with live Polygon chain reads at `localhost:8788`.

### Reference Implementation

```bash
git clone https://github.com/FTHTrading/LPS-1-Reference-Implementation.git
cd LPS-1-Reference-Implementation
npm install
npx hardhat test          # 37 contract tests + 21 pipeline tests
node demo/demo.js         # end-to-end pipeline demonstration
node cli/verify.js        # CLI verifier
```

**Repository:** [FTHTrading/LPS-1-Reference-Implementation](https://github.com/FTHTrading/LPS-1-Reference-Implementation)

---

## Governance & Adoption

The protocol currently operates under an **author-led governance model** with defined transition criteria for moving to a working group structure.

- **Improvement proposals** follow a lifecycle: Draft → Proposed → Active → Final, with each proposal assigned a unique identifier (LPS-2 through LPS-5 are scoped).
- **Architectural decisions** are recorded in the [ADR registry](https://github.com/FTHTrading/2500-donkeys/tree/master/docs/adr) (6 ADRs published).
- **Transition criteria** for community governance are codified: second independent implementation, external specification review, and public comment period.

**Governance model:** [GOVERNANCE.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/GOVERNANCE.md)
**Working group scope:** [WORKING_GROUP.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/WORKING_GROUP.md)

---

## Roadmap

The development trajectory is organized in six phases. Current status:

| Phase | Milestone | Status |
|:-----:|-----------|:------:|
| I | **Deterministic Anchor** — SHA-256, Merkle trees, Polygon anchoring, LPS-1 spec | ✅ Complete |
| II | **Multi-Author Support** — Multi-signer editions, collaborative provenance (LPS-4) | Proposed |
| III | **Ethereum L1 Mirror** — Cross-chain anchor replication, state proof bridging (LPS-2) | Research |
| IV | **Zero-Knowledge Proof** — Private verification, selective disclosure (LPS-3) | Research |
| V | **Institutional API** — REST/GraphQL endpoints, SDK, batch anchoring | Planned |
| VI | **Multi-Implementation Adoption** — Second implementation, interoperability suite | Planned |

**Full roadmap with deliverables and risk framing:** [ROADMAP.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/ROADMAP.md)

---

## Funding Alignment

### Why Polygon

Polygon Mainnet was selected as the primary chain for three reasons documented in [ADR-0006](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/adr/ADR-0006-polygon-mainnet.md):

1. **Cost** — Sub-dollar transactions make literary anchoring economically viable for individual authors.
2. **Permanence** — EVM-compatible L1 with established validator set and finality guarantees.
3. **Public verification** — Polygonscan provides free, immediate source-code verification accessible to non-technical reviewers.

### What Funding Accelerates

- **Security audit** — Independent review of all seven contracts by a recognized firm.
- **SDK development** — TypeScript/Python libraries for third-party integration with the anchoring pipeline.
- **Multi-implementor adoption** — Grants for a second independent implementation to validate the specification.
- **Ecosystem integration** — Partnerships with digital libraries, university presses, and rights management platforms.
- **Specification formalization** — Professional editorial review of LPS-1 for standards-track submission.

No dollar amounts are specified here. Budget categories and grant alignment details are available in the [Funding Brief](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/FUNDING_BRIEF.md).

---

## Licensing & Disclosures

| Component | License |
|-----------|---------|
| Smart contracts, build tools, verification scripts | MIT |
| Research paper, specification documents | CC BY 4.0 |
| Literary works (*The 2,500 Donkeys*, *Private Placement Puppetry*) | © Kidd James — All rights reserved |

**This protocol is infrastructure for provenance verification.** It is not a financial instrument. Tokens minted via EditionNFT and StoryNFT represent collectible editions of literary works — they do not constitute securities, do not promise financial returns, and carry no governance rights over the protocol.

The contracts are non-upgradeable. There are no admin keys, no proxy patterns, and no mechanism for the author or any party to alter anchored content after deployment.

---

## Links

| Resource | URL |
|----------|-----|
| Protocol Site | [xxxiii.io](https://xxxiii.io) |
| Protocol Repository | [FTHTrading/2500-donkeys](https://github.com/FTHTrading/2500-donkeys) |
| Reference Implementation | [FTHTrading/LPS-1-Reference-Implementation](https://github.com/FTHTrading/LPS-1-Reference-Implementation) |
| LPS-1 Specification | [LPS-1.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/LPS-1.md) |
| LPS Stack Architecture | [LPS-STACK.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/LPS-STACK.md) |
| Compliance Matrix | [COMPLIANCE.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/COMPLIANCE.md) |
| Governance | [GOVERNANCE.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/spec/GOVERNANCE.md) |
| Roadmap | [ROADMAP.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/ROADMAP.md) |
| Funding Brief | [FUNDING_BRIEF.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/FUNDING_BRIEF.md) |
| Core Team | [CORE_TEAM.md](https://github.com/FTHTrading/2500-donkeys/blob/master/docs/roles/CORE_TEAM.md) |
| DOI | [10.5281/zenodo.18646886](https://doi.org/10.5281/zenodo.18646886) |
| ORCID | [0009-0008-8425-939X](https://orcid.org/0009-0008-8425-939X) |

---

*XXXIII Protocol — Deterministic Literary Publishing*
*Author: Kidd James · February 2026*
