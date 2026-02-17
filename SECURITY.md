# Security Policy

## Scope

This repository is a **reference implementation** for the Literary Protocol
Standard (LPS-1). It contains no production smart contracts, no private keys,
no mainnet RPC endpoints, and no funds.

## Reporting Vulnerabilities

If you discover a security vulnerability in the protocol design or
reference implementation, please report it responsibly:

**Email:** security@xxxiii.io

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for
resolution.

## Smart Contract Security

The Solidity contracts in this repository are reference implementations.
Production deployments should undergo:

1. **Professional audit** by a reputable firm
2. **Formal verification** of critical invariants
3. **Testnet deployment** before mainnet
4. **Staged rollout** with limited exposure

### Known Design Decisions

- **No upgradability:** Contracts are not upgradeable by design. Immutability
  is a feature of LPS-1.
- **No admin keys:** The only authorized address is the author (deployer).
  There are no admin backdoors.
- **Pull-based withdrawals:** RoyaltyRouter uses the withdrawal pattern to
  prevent reentrancy.
- **Timelock:** PublishingKernelV2 enforces a 48-hour timelock on retractions
  to prevent impulsive or coerced actions.

## Cryptographic Assumptions

LPS-1 relies on:

- **SHA-256** (FIPS 180-4) for content hashing
- **ECDSA** (secp256k1) for provenance signatures
- **Keccak-256** for Ethereum address derivation

If any of these primitives are compromised, a new version of the protocol
should be issued.

## Dependencies

This project uses:

- Hardhat (build toolchain)
- OpenZeppelin Contracts (battle-tested Solidity libraries)
- Node.js crypto module (SHA-256)

Keep dependencies updated. Run `npm audit` regularly.

## Out of Scope

The following are not security concerns for this repository:

- Gas optimization (reference implementation prioritizes clarity)
- Frontend vulnerabilities (no frontend included)
- IPFS availability (content addressing, not hosting)
- Token economics (no tokens in this repo)
