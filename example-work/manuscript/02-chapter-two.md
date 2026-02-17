# Chapter Two: Roots

The roots grow deeper than most realize.

When an edition is anchored on-chain, it creates an immutable record. The
smart contract stores the edition root, the IPFS CID, the SHA-256 hash of
the compiled manuscript, and a timestamp. No one — not the author, not the
platform, not even the contract deployer — can alter this record.

This is the difference between a database and a blockchain. A database can
be edited. A blockchain cannot. The anchor is permanent.

## The Anchoring Process

The deterministic pipeline proceeds in strict order:

1. **Compile** — concatenate manuscript files per order.json
2. **Hash** — compute SHA-256 of compiled output
3. **Merkle** — build four trees, compute edition root
4. **Manifest** — generate integrity map
5. **Anchor** — call the smart contract with the roots

Each step depends on the previous. The output is reproducible by anyone
with the source files. This is the core promise of LPS-1: given the same
inputs, any verifier will compute the same outputs.

## Determinism

Determinism requires discipline:

- **UTF-8 only.** No BOM, no Latin-1, no Shift-JIS.
- **CRLF normalization.** All markdown files are normalized to CRLF before
  hashing, regardless of the author's operating system.
- **Canonical ordering.** Files are processed in the order specified by
  order.json, not filesystem sort order.
- **No hidden state.** The pipeline reads files and produces hashes.
  Nothing else.

If you change one byte in one file, the entire tree changes. This is a
feature, not a bug.

