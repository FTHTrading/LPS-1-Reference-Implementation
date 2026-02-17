# LPS-1 Reference Implementation

**The Literary Protocol Standard — Deterministic Publishing on Blockchain**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636.svg)](https://soliditylang.org/)

---

## What Is This?

LPS-1 is a protocol for anchoring literary works on a blockchain with
cryptographic integrity guarantees. This repository is the complete
reference implementation — everything needed to:

1. **Compile** a manuscript deterministically
2. **Hash** every file with SHA-256
3. **Build** four independent Merkle trees
4. **Compute** a single edition root
5. **Anchor** the edition on-chain
6. **Verify** independently that nothing has changed

No private keys. No mainnet dependencies. No business logic.
Pure protocol infrastructure.

---

## Quick Start

```bash
# Clone
git clone https://github.com/FTHTrading/LPS-1-Reference-Implementation.git
cd LPS-1-Reference-Implementation

# Install
npm install

# Full demo (compile → hash → merkle → manifest → verify)
npm run demo

# Or step by step:
npm run compile       # Concatenate manuscript files
npm run hash          # SHA-256 the compiled output
npm run merkle        # Build Merkle trees + edition root
npm run manifest      # Generate integrity manifest
npm run verify        # Independent verification
```

---

## Architecture

```
LPS-1-Reference-Implementation/
├── contracts/              ← Solidity smart contracts
│   ├── LiteraryAnchor.sol      Proof-of-origin anchor
│   ├── PublishingKernel.sol     Edition anchoring + Merkle roots
│   ├── PublishingKernelV2.sol   Hardened: ECDSA, timelock, freeze
│   ├── RoyaltyRouter.sol       Revenue splits + recoupment
│   └── AuthorIdentity.sol      On-chain identity declaration
├── pipeline/               ← Deterministic build pipeline
│   ├── compile.js              Concatenate manuscript files
│   ├── hash.js                 SHA-256 with CRLF normalization
│   ├── merkle.js               4-tree Merkle construction
│   └── manifest.js             Integrity manifest generator
├── verifier/               ← Independent verification
│   ├── lps-verify.js           Recompute & verify everything
│   └── cli.js                  CLI wrapper
├── example-work/           ← Sample literary work
│   ├── order.json              Canonical file ordering
│   ├── manuscript/             Text files
│   ├── artifacts/              Supplementary files
│   ├── images/                 Cover art, illustrations
│   └── prompts/                AI prompt transparency
├── scripts/                ← Deployment & demo scripts
│   ├── deploy-local.js         Deploy to local Hardhat
│   ├── anchor-edition.js       Anchor an edition on-chain
│   └── demo.js                 Full pipeline demo
├── spec/                   ← Protocol specifications
│   ├── LPS-1.md                Literary Protocol Standard
│   └── IAPL-1.md               Immutable Audio Publishing Layer
├── test/                   ← Test suites
│   ├── contract.test.js        Smart contract tests
│   └── pipeline.test.js        Pipeline determinism tests
└── docker/                 ← Reproducible builds
    └── Dockerfile
```

---

## The Protocol

### Merkle Construction

LPS-1 builds four independent Merkle trees:

| Tree | Content | Required |
|------|---------|----------|
| `manuscriptRoot` | Ordered text files | Yes |
| `artifactRoot` | EPUB, PDF, etc. | Optional |
| `imageRoot` | Cover art, illustrations | Optional |
| `promptRoot` | AI prompts | Optional |

The edition root combines all four:

```
editionRoot = SHA256(manuscriptRoot + artifactRoot + imageRoot + promptRoot)
```

### Determinism Rules

- **UTF-8 only** — no BOM, no Latin-1
- **CRLF normalization** — all `.md` files normalized before hashing
- **Canonical ordering** — files processed per `order.json`, not filesystem sort
- **SHA-256** — lowercase hex, 64 characters
- **Odd leaf rule** — duplicate last leaf when tree level has odd count

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| **LiteraryAnchor** | Minimal proof-of-origin: IPFS CID, SHA-256, author, editions |
| **PublishingKernel** | Full edition management: Merkle roots, licenses, supersede, retract |
| **PublishingKernelV2** | Hardened: ECDSA signatures, 48h timelock, freeze, admin role |
| **RoyaltyRouter** | Programmable splits with recoupment waterfall, pull-based withdrawal |
| **AuthorIdentity** | Identity declaration, bibliography, contract linking |

---

## Testing

```bash
# Smart contract tests (Hardhat + Mocha + Chai)
npm test

# Pipeline tests
npm run test:pipeline

# All tests
npm run test:all
```

---

## Local Deployment

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy-local.js

# Terminal 3: Anchor an edition
npm run build
npx hardhat run scripts/anchor-edition.js
```

---

## Docker

```bash
# Build
docker build -t lps1-ref -f docker/Dockerfile .

# Run full pipeline
docker run --rm lps1-ref npm run demo

# Run tests
docker run --rm lps1-ref npm run test:all
```

---

## Specifications

- [LPS-1: Literary Protocol Standard](spec/LPS-1.md) — RFC-style specification
- [IAPL-1: Immutable Audio Publishing Layer](spec/IAPL-1.md) — Audio binding extension

---

## No Production Data

This repository contains **zero** production addresses, private keys,
mainnet RPCs, or business logic. It is a clean-room protocol
implementation safe for public sharing.

To see LPS-1 in production: [xxxiii.io](https://xxxiii.io)

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built by [FTH Trading](https://github.com/FTHTrading)*
