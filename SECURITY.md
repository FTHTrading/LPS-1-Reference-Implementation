# Security Policy

## Scope

This repository is a reference implementation for the Literary Protocol
Standard (LPS-1). It contains no production smart contracts, no private
keys, no mainnet RPC endpoints, and no funds.

The security considerations below apply to both the protocol design and
this reference implementation.

---

## Reporting Vulnerabilities

If you discover a security vulnerability in the protocol design or
reference implementation, please report it responsibly:

**Email:** security@xxxiii.io

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested mitigation (if any)

Reports will be acknowledged within 48 hours. A resolution timeline
will be provided upon triage.

---

## Threat Model

### In Scope

| Threat | Mitigation |
|--------|-----------|
| Content tampering after anchoring | SHA-256 + Merkle trees + on-chain immutability |
| False authorship claims | ECDSA provenance signatures (V2) |
| Coerced or impulsive retraction | 48-hour timelock (V2) |
| Reentrancy in revenue distribution | Pull-based withdrawal pattern |
| Unauthorized edition modification | Edition freeze / seal mechanism (V2) |
| Admin key compromise | No admin backdoors; author-only authorization |
| Upgrade-path exploitation | Non-upgradeable contracts by design |

### Out of Scope

| Area | Rationale |
|------|-----------|
| Gas optimization | Reference implementation prioritizes clarity over efficiency |
| Frontend vulnerabilities | No frontend is included in this repository |
| IPFS availability | Content-addressed storage is not hosting; availability is the pinner's responsibility |
| Token economics | No tokens exist in this repository |
| Key management practices | Operational concern; outside protocol scope |

---

## Smart Contract Security

The Solidity contracts in this repository are reference implementations.
Before any production deployment, the following steps are expected:

1. Professional audit by a reputable security firm
2. Formal verification of critical state invariants
3. Testnet deployment with full integration testing
4. Staged mainnet rollout with limited initial exposure

### Design Decisions

**Non-upgradeability.** Contracts are not upgradeable. Immutability is a
deliberate property of LPS-1. If a contract must be replaced, a new
deployment is made and the previous edition is superseded on-chain.

**No admin keys.** The only authorized address is the deploying author.
There are no owner overrides, no multi-sig requirements at the contract
level, and no backdoor functions.

**Pull-based withdrawals.** RoyaltyRouter distributes funds through the
withdrawal pattern rather than push transfers. This eliminates reentrancy
risk and prevents failed sends from blocking other payees.

**Timelock on destructive operations.** PublishingKernelV2 enforces a
48-hour delay on retraction operations. This guards against key compromise,
coercion, and impulsive decisions.

**Edition freeze.** PublishingKernelV2 allows the author to permanently
seal an edition, preventing any further state changes including retraction.

---

## Cryptographic Assumptions

LPS-1 relies on three cryptographic primitives:

| Primitive | Standard | Usage |
|-----------|----------|-------|
| SHA-256 | FIPS 180-4 | Content hashing, Merkle tree construction, edition root |
| ECDSA | secp256k1 | Provenance signatures (V2 contracts) |
| Keccak-256 | Ethereum | Address derivation, storage slot computation |

If a practical attack is discovered against any of these primitives,
a new version of the protocol specification should be issued with
updated cryptographic requirements.

### Hash Collision Resistance

SHA-256 provides 128-bit collision resistance. No practical collision
attacks are known. The protocol's integrity guarantees depend on this
property remaining intact.

### CRLF Normalization

Platform-dependent line endings are a common source of hash mismatches
across operating systems. LPS-1 normalizes all markdown files to CRLF
before hashing, ensuring identical digests on Windows, macOS, and Linux.

---

## Dependencies

| Package | Purpose | Security Posture |
|---------|---------|-----------------|
| Hardhat | Build toolchain, local node | Widely audited |
| OpenZeppelin Contracts 4.9.6 | Solidity base contracts | Industry-standard, audited |
| Node.js `crypto` module | SHA-256 computation | Part of Node.js core |

Run `npm audit` regularly. Pin dependency versions in production
deployments.

---

## Disclosure Policy

This project follows coordinated disclosure. Vulnerabilities will be
patched before public announcement. Credit will be given to reporters
unless anonymity is requested.

---

*See also: [LPS-1 Specification — Security Considerations](spec/LPS-1.md#10-security-considerations)*
