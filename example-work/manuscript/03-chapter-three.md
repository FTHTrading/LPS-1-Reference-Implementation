# Chapter Three: Branches

The protocol branches into new territory.

Once an edition is anchored, it becomes part of a lineage. Edition 2 can
reference Edition 1. A translation can reference the original. A revised
edition can supersede an earlier one. The chain of provenance is visible
to anyone who reads the contract.

## Versioning

LPS-1 treats editions as append-only. You cannot delete an edition — you
can only add new ones. This creates an archaeological record of the work's
evolution:

- Edition 1: First publication
- Edition 2: Corrected errata
- Edition 3: New foreword added
- Edition 4: Audio binding attached

Each edition has its own Merkle roots, its own IPFS CID, its own SHA-256
hash. The contract maintains the full history.

## The Canonical Edition

At any given time, one edition is marked as canonical. This is the
"current" version — the one that readers should reference. The author
can update the canonical pointer, but they cannot erase the history.

This distinction matters. A retracted edition is still visible on-chain.
Its Merkle roots are still verifiable. Its IPFS content is still
retrievable. But the canonical pointer has moved forward.

## Provenance

Every edition can carry a provenance signature — an ECDSA signature
from the author's wallet over the edition root. This proves that the
author explicitly approved the content at a specific point in time.

Provenance is optional in LPS-1 v1 but mandatory in v2. The hardened
kernel enforces signature verification at the contract level.

