# LPS-1: Literary Protocol Standard — Specification

**Version:** 1.0.0
**Status:** Draft
**Authors:** FTH Trading
**Date:** 2024-2025
**License:** MIT

---

## Abstract

LPS-1 defines a deterministic pipeline for anchoring literary works on a
blockchain. It specifies how manuscripts are compiled, hashed, organized
into Merkle trees, and recorded on-chain such that any third party can
independently verify the integrity and provenance of the work.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in RFC 2119.

---

## 1. Scope

LPS-1 covers:

1. Deterministic compilation of manuscript source files
2. Cryptographic hashing of all edition components
3. Merkle tree construction for content integrity
4. Edition root computation
5. On-chain anchoring requirements
6. Independent verification procedures

LPS-1 does NOT cover:

- Token economics or NFT mechanics
- Royalty distribution (see companion contracts)
- Digital rights management
- Content hosting or delivery
- AI-generated content policies

---

## 2. Terminology

| Term | Definition |
|------|-----------|
| **Edition** | A specific, immutable version of a literary work |
| **Manuscript** | The ordered set of source text files |
| **Artifact** | Supplementary files (EPUB, PDF, etc.) |
| **Leaf** | A SHA-256 hash of a single file |
| **Merkle Root** | The root hash of a binary Merkle tree |
| **Edition Root** | The combined hash of all four Merkle roots |
| **Anchor** | The on-chain transaction that records an edition |
| **Provenance** | Cryptographic proof of authorship via ECDSA signature |

---

## 3. Deterministic Build Rules

### 3.1 Encoding

All text files MUST be encoded in UTF-8. No byte order mark (BOM) SHALL
be present. Binary files (images, compiled artifacts) are processed as
raw byte streams.

### 3.2 File Ordering

Manuscript files MUST be processed in the exact order specified by the
`order.json` manifest. Filesystem sort order SHALL NOT be used.

The `order.json` file MUST contain a `manuscript` array listing filenames
in canonical order:

```json
{
  "manuscript": [
    "00-front-matter.md",
    "01-chapter-one.md",
    "02-chapter-two.md"
  ]
}
```

### 3.3 Compilation

The compiled output is produced by concatenating all manuscript files in
order, separated by exactly two LF characters (`\n\n`). No additional
whitespace, headers, or separators SHALL be injected.

```
compiled = file[0] + "\n\n" + file[1] + "\n\n" + ... + file[n]
```

### 3.4 CRLF Normalization

Before hashing, all markdown files (`.md`) MUST be normalized to CRLF
line endings, regardless of the source platform:

```
normalized = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n")
```

This ensures that files produce identical hashes on Windows, macOS, and
Linux. Binary files are NOT normalized.

### 3.5 Hashing

All hashes MUST use SHA-256 (FIPS 180-4). Output MUST be lowercase
hexadecimal, 64 characters.

```
hash = SHA-256(normalized_content)  →  "a1b2c3d4..."
```

---

## 4. Merkle Construction

### 4.1 Four Independent Trees

LPS-1 defines four independent Merkle trees:

| Tree | Content | Required |
|------|---------|----------|
| `manuscriptRoot` | Ordered text files | REQUIRED |
| `artifactRoot` | Supplementary files (EPUB, PDF) | OPTIONAL |
| `imageRoot` | Cover art, illustrations | OPTIONAL |
| `promptRoot` | Generative AI prompts | OPTIONAL |

If a category has no files, its root MUST be `SHA-256("empty")`.

### 4.2 Tree Construction

1. Compute SHA-256 leaf hash for each file in the category
2. Pair leaves left-to-right: `parent = SHA-256(left + right)`
3. If a level has an odd number of nodes, duplicate the last node
4. Repeat until one root remains

"Concatenation" means string concatenation of hex hashes:

```
parent = SHA-256("a1b2..." + "c3d4...")
```

### 4.3 Odd Leaf Rule

When a tree level has an odd number of nodes, the last node is
duplicated to form a complete pair:

```
[A, B, C] → [SHA-256(A+B), SHA-256(C+C)]
```

This is consistent with Bitcoin's Merkle tree construction.

---

## 5. Edition Root

The edition root combines all four Merkle roots into a single hash:

```
editionRoot = SHA-256(manuscriptRoot + artifactRoot + imageRoot + promptRoot)
```

The concatenation order is fixed and MUST NOT be reordered. This is the
canonical identifier for the edition.

---

## 6. State Machine

An edition progresses through the following states:

```
DRAFT → ANCHORED → [CANONICAL] → [SUPERSEDED | RETRACTED]
```

- **ANCHORED:** The edition root is recorded on-chain
- **CANONICAL:** Marked as the current authoritative version
- **SUPERSEDED:** Replaced by a newer edition (still verifiable)
- **RETRACTED:** Explicitly withdrawn by the author (still verifiable)

Transitions are append-only. An edition's Merkle roots MUST NOT be
modified after anchoring.

---

## 7. On-Chain Requirements

### 7.1 Minimum Storage

A conforming contract MUST store, per edition:

- Edition number (uint256)
- Title (string)
- IPFS CID (string)
- Content hash — SHA-256 of compiled output (bytes32)
- Five Merkle roots (bytes32 each):
  - manuscriptRoot
  - artifactRoot
  - imageRoot
  - promptRoot
  - editionRoot
- Timestamp (uint256)
- Author address (address)

### 7.2 Immutability

Once an edition is anchored, its stored values MUST NOT be modifiable.
The contract MAY support appending new editions, updating the canonical
pointer, or recording retractions, but existing data MUST be preserved.

### 7.3 Author Restriction

Only the author (contract deployer or designated authority) SHALL be
permitted to anchor editions, update canonical status, or retract.

### 7.4 Provenance Signature (v2)

LPS-1 v2 contracts SHOULD require an ECDSA signature over the edition
root, verified on-chain:

```solidity
bytes32 messageHash = keccak256(abi.encodePacked(editionRoot));
bytes32 ethHash = ECDSA.toEthSignedMessageHash(messageHash);
address signer = ECDSA.recover(ethHash, signature);
require(signer == author, "Invalid provenance signature");
```

---

## 8. Verification

### 8.1 Independent Verification

Any party with access to the source files MUST be able to independently:

1. Compile the manuscript per order.json
2. Hash all files with SHA-256 (CRLF-normalized for .md)
3. Build four Merkle trees
4. Compute the edition root
5. Compare against the on-chain record

If all values match, the edition is verified.

### 8.2 Merkle Proofs

A Merkle proof for a specific leaf consists of O(log n) sibling hashes
and their positions (left/right). Verification proceeds from leaf to root:

```
for each step in proof:
  if step.position == "left":
    hash = SHA-256(step.hash + hash)
  else:
    hash = SHA-256(hash + step.hash)

assert hash == root
```

### 8.3 Audio Binding (IAPL-1)

When an audio rendering is bound to an edition, the audio edition root
is computed as:

```
audioEditionRoot = SHA-256(editionRoot + audioRoot)
```

See IAPL-1 specification for details.

---

## 9. Conformance Levels

### Level 1: Basic Conformance

- Deterministic compile per §3
- SHA-256 hashing per §3.5
- manuscriptRoot Merkle tree per §4
- editionRoot computation per §5
- On-chain storage per §7.1

### Level 2: Full Conformance

- All Level 1 requirements
- All four Merkle trees (§4.1)
- ECDSA provenance signatures (§7.4)
- Timelock for retractions
- Independent manifest generation

### Level 3: Extended Conformance

- All Level 2 requirements
- Audio binding (IAPL-1)
- License registry on-chain
- Royalty routing
- Identity declaration

---

## 10. Security Considerations

### 10.1 Hash Collision

SHA-256 is considered collision-resistant. No practical collision attacks
are known as of this writing. If SHA-256 is compromised in the future,
a new version of LPS-1 SHOULD specify an alternative algorithm.

### 10.2 CRLF Normalization

CRLF normalization is a potential source of discrepancy. Implementations
MUST normalize before hashing, not after. The normalization function
MUST be: strip all CR, then convert LF to CRLF.

### 10.3 Immutability

On-chain data is immutable by design. However, IPFS content can be
unpinned. Implementations SHOULD use multiple pinning services and
SHOULD record content hashes on-chain for verification even if IPFS
content becomes unavailable.

### 10.4 Key Management

The author's private key controls all anchoring operations. Loss of
the key means loss of the ability to publish new editions. Compromise
of the key means unauthorized anchoring. Standard key management
practices (hardware wallets, multisig) are RECOMMENDED.

---

## Appendix A: Reference Implementation

This specification is accompanied by a reference implementation at:

```
https://github.com/FTHTrading/LPS-1-Reference-Implementation
```

The reference implementation includes:

- Five Solidity contracts (LiteraryAnchor, PublishingKernel, PublishingKernelV2, RoyaltyRouter, AuthorIdentity)
- Deterministic pipeline (compile, hash, merkle, manifest)
- Independent verifier
- Sample work ("The Protocol Garden")
- Comprehensive test suite

---

## Appendix B: JSON Schemas

### order.json

```json
{
  "title": "string",
  "subtitle": "string (optional)",
  "author": "string",
  "editionNumber": "number",
  "manuscript": ["string (filename)"]
}
```

### manifest.json

```json
{
  "schema": "literary-protocol-standard",
  "schemaVersion": "1.0.0",
  "type": "edition-manifest",
  "edition": { "title": "string", "editionNumber": "number", "author": "string" },
  "integrity": {
    "compiledHash": "hex string (64 chars)",
    "editionRoot": "hex string (64 chars)",
    "manuscriptRoot": "hex string (64 chars)",
    "artifactRoot": "hex string (64 chars)",
    "imageRoot": "hex string (64 chars)",
    "promptRoot": "hex string (64 chars)"
  }
}
```

### merkle.json

```json
{
  "schema": "literary-protocol-standard",
  "roots": {
    "manuscriptRoot": "hex",
    "artifactRoot": "hex",
    "imageRoot": "hex",
    "promptRoot": "hex",
    "editionRoot": "hex"
  },
  "trees": { "manuscript": {}, "artifact": {}, "image": {}, "prompt": {} },
  "proofs": [{ "file": "string", "leafHash": "hex", "proof": [] }]
}
```

---

*End of LPS-1 Specification.*
