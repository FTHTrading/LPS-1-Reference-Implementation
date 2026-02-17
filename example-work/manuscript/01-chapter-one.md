# Chapter One: Seeds

The garden began with a single seed — a hash.

Not a seed in the botanical sense, though the metaphor holds. A cryptographic
hash is a fingerprint of content. Change one comma, one space, one invisible
character, and the hash changes entirely. This is the foundation of
deterministic publishing.

Consider a manuscript. It lives as a sequence of files on disk. Each file
has a precise byte representation. When we hash each file with SHA-256, we
get a 64-character hexadecimal string that uniquely identifies that exact
arrangement of bytes.

But a single hash is not enough. We need structure.

## The Merkle Tree

A Merkle tree organizes hashes into a binary tree. Leaf nodes are the file
hashes. Parent nodes are computed by concatenating their children and hashing
the result:

    parent = SHA256(left_child + right_child)

If a level has an odd number of nodes, the last node is duplicated. This
continues until we reach a single root hash — the Merkle root.

The beauty of this structure is that any single leaf can be verified against
the root using only O(log n) hashes. This is the Merkle proof.

## Four Trees, One Root

The Literary Protocol Standard defines four independent Merkle trees:

1. **Manuscript** — the text itself
2. **Artifacts** — supplementary files (EPUB, PDF, etc.)
3. **Images** — cover art, illustrations
4. **Prompts** — generative AI prompts used in creation

The edition root combines all four:

    editionRoot = SHA256(manuscriptRoot + artifactRoot + imageRoot + promptRoot)

This single hash anchors the entire edition on-chain.

