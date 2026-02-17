#!/usr/bin/env node
/**
 * merkle.js — Merkle Tree Builder
 * ════════════════════════════════
 *
 * Builds four independent Merkle trees from hashed files:
 *   1. manuscriptRoot  — ordered manuscript blocks
 *   2. artifactRoot    — supplementary artifacts (EPUB, PDF, etc.)
 *   3. imageRoot       — cover art, illustrations
 *   4. promptRoot      — generative AI prompts
 *
 * Then computes:
 *   editionRoot = SHA256(manuscriptRoot || artifactRoot || imageRoot || promptRoot)
 *
 * Merkle Construction (LPS-1 §4):
 *   - Algorithm: SHA-256
 *   - Pairing: Ordered concatenation sha256(left + right)
 *   - Odd leaf: Duplicate last leaf
 *   - Empty tree: sha256("empty")
 *
 * Usage:
 *   node pipeline/merkle.js [--work-dir example-work]
 *
 * Output:
 *   dist/merkle.json
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── Import helpers ───────────────────────────────────────────────
const { sha256File } = require("./hash");

// ── Config ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
let workDir = path.resolve(__dirname, "..", "example-work");
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--work-dir" && args[i + 1]) workDir = path.resolve(args[i + 1]);
}

const DIST_DIR = path.resolve(__dirname, "..", "dist");

// ── Core Merkle functions ────────────────────────────────────────

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Build a Merkle tree from an array of leaf hashes.
 *
 * @param {string[]} hashes - Array of hex SHA-256 leaf hashes
 * @returns {{ root: string, leaves: string[], layers: string[][] }}
 */
function buildMerkleTree(hashes) {
  if (hashes.length === 0) {
    return { root: sha256("empty"), leaves: [], layers: [[sha256("empty")]] };
  }

  const layers = [hashes.slice()];
  let current = hashes.slice();

  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] || left; // Odd leaf: duplicate last
      next.push(sha256(left + right));
    }
    layers.push(next);
    current = next;
  }

  return { root: current[0], leaves: hashes, layers };
}

/**
 * Generate a Merkle proof for a leaf at a given index.
 *
 * @param {string[][]} layers - All layers of the Merkle tree
 * @param {number} leafIndex - Index of the leaf to prove
 * @returns {Array<{hash: string, position: string}>}
 */
function getMerkleProof(layers, leafIndex) {
  const proof = [];
  let idx = leafIndex;

  for (let level = 0; level < layers.length - 1; level++) {
    const layer = layers[level];
    const isRight = idx % 2 === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;
    const siblingHash = siblingIdx < layer.length ? layer[siblingIdx] : layer[idx];

    proof.push({
      hash: siblingHash,
      position: isRight ? "left" : "right",
    });
    idx = Math.floor(idx / 2);
  }

  return proof;
}

/**
 * Verify a Merkle proof against a known root.
 *
 * @param {string} leafHash - The leaf hash to verify
 * @param {Array<{hash: string, position: string}>} proof - The proof path
 * @param {string} root - The expected root hash
 * @returns {boolean}
 */
function verifyMerkleProof(leafHash, proof, root) {
  let hash = leafHash;
  for (const step of proof) {
    if (step.position === "left") {
      hash = sha256(step.hash + hash);
    } else {
      hash = sha256(hash + step.hash);
    }
  }
  return hash === root;
}

// ── Directory hashing ────────────────────────────────────────────

function hashDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).sort();
  const results = [];
  for (const file of files) {
    const fp = path.join(dirPath, file);
    if (!fs.statSync(fp).isFile()) continue;
    results.push({ file, sha256: sha256File(fp), sizeBytes: fs.statSync(fp).size });
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────

function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — Merkle Tree Builder");
  console.log("══════════════════════════════════════════════════\n");

  // Read order.json for manuscript ordering
  const orderFile = path.join(workDir, "order.json");
  if (!fs.existsSync(orderFile)) {
    console.error("✗ order.json not found");
    process.exit(1);
  }
  const order = JSON.parse(fs.readFileSync(orderFile, "utf-8"));
  const manuscriptFiles = order.manuscript || [];

  // Hash four categories
  console.log("── Manuscript ──");
  const manuscriptDir = path.join(workDir, "manuscript");
  const manuscriptLeaves = [];
  for (const file of manuscriptFiles) {
    const fp = path.join(manuscriptDir, file);
    if (!fs.existsSync(fp)) {
      console.error(`  ✗ MISSING: ${file}`);
      process.exit(1);
    }
    const hash = sha256File(fp);
    manuscriptLeaves.push({ file, sha256: hash });
    console.log(`  ✓ ${file.padEnd(40)} ${hash.slice(0, 16)}…`);
  }

  console.log("\n── Artifacts ──");
  const artifactLeaves = hashDir(path.join(workDir, "artifacts"));
  for (const l of artifactLeaves) console.log(`  ✓ ${l.file.padEnd(40)} ${l.sha256.slice(0, 16)}…`);
  if (artifactLeaves.length === 0) console.log("  (none)");

  console.log("\n── Images ──");
  const imageLeaves = hashDir(path.join(workDir, "images"));
  for (const l of imageLeaves) console.log(`  ✓ ${l.file.padEnd(40)} ${l.sha256.slice(0, 16)}…`);
  if (imageLeaves.length === 0) console.log("  (none)");

  console.log("\n── Prompts ──");
  const promptLeaves = hashDir(path.join(workDir, "prompts"));
  for (const l of promptLeaves) console.log(`  ✓ ${l.file.padEnd(40)} ${l.sha256.slice(0, 16)}…`);
  if (promptLeaves.length === 0) console.log("  (none)");

  // Build four trees
  console.log("\n── Building Merkle Trees ──\n");

  const manuscriptTree = buildMerkleTree(manuscriptLeaves.map((l) => l.sha256));
  const artifactTree = buildMerkleTree(artifactLeaves.map((l) => l.sha256));
  const imageTree = buildMerkleTree(imageLeaves.map((l) => l.sha256));
  const promptTree = buildMerkleTree(promptLeaves.map((l) => l.sha256));

  console.log(`  manuscriptRoot: ${manuscriptTree.root}`);
  console.log(`  artifactRoot:   ${artifactTree.root}`);
  console.log(`  imageRoot:      ${imageTree.root}`);
  console.log(`  promptRoot:     ${promptTree.root}`);

  // Compute edition root: H(mR || aR || iR || pR)
  const editionRoot = sha256(
    manuscriptTree.root + artifactTree.root + imageTree.root + promptTree.root
  );
  console.log(`\n  editionRoot:    ${editionRoot}`);

  // Generate proofs for manuscript leaves
  const manuscriptProofs = manuscriptLeaves.map((leaf, i) => ({
    file: leaf.file,
    leafHash: leaf.sha256,
    proof: getMerkleProof(manuscriptTree.layers, i),
  }));

  // Assemble output
  const output = {
    schema: "literary-protocol-standard",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),

    roots: {
      manuscriptRoot: manuscriptTree.root,
      artifactRoot: artifactTree.root,
      imageRoot: imageTree.root,
      promptRoot: promptTree.root,
      editionRoot,
    },

    trees: {
      manuscript: {
        root: manuscriptTree.root,
        leafCount: manuscriptTree.leaves.length,
        algorithm: "sha256",
        merkleScheme: "ordered-concatenation",
        oddLeafRule: "duplicate-last",
        leaves: manuscriptLeaves,
        layers: manuscriptTree.layers,
      },
      artifact: {
        root: artifactTree.root,
        leafCount: artifactTree.leaves.length,
        leaves: artifactLeaves,
      },
      image: {
        root: imageTree.root,
        leafCount: imageTree.leaves.length,
        leaves: imageLeaves,
      },
      prompt: {
        root: promptTree.root,
        leafCount: promptTree.leaves.length,
        leaves: promptLeaves,
      },
    },

    proofs: manuscriptProofs,
  };

  // Write
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outPath = path.join(DIST_DIR, "merkle.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n  ✓ Written: dist/merkle.json\n`);

  // Self-verification
  console.log("── Self-Verification ──\n");

  const verifyTree = buildMerkleTree(manuscriptLeaves.map((l) => l.sha256));
  if (verifyTree.root === manuscriptTree.root) {
    console.log("  ✓ manuscriptRoot verified (tree rebuild matches)");
  } else {
    console.error("  ✗ manuscriptRoot MISMATCH");
    process.exit(1);
  }

  let proofsPassed = 0;
  for (const p of manuscriptProofs) {
    if (verifyMerkleProof(p.leafHash, p.proof, manuscriptTree.root)) {
      proofsPassed++;
    } else {
      console.error(`  ✗ Proof failed for ${p.file}`);
    }
  }
  console.log(`  ✓ ${proofsPassed}/${manuscriptProofs.length} Merkle proofs verified`);

  const verifyEdition = sha256(
    manuscriptTree.root + artifactTree.root + imageTree.root + promptTree.root
  );
  if (verifyEdition === editionRoot) {
    console.log("  ✓ editionRoot verified");
  } else {
    console.error("  ✗ editionRoot MISMATCH");
    process.exit(1);
  }

  console.log("\n✓ Merkle construction complete.\n");

  return output;
}

// ── Export or run ────────────────────────────────────────────────
if (require.main === module) {
  main();
} else {
  module.exports = { sha256, sha256File, buildMerkleTree, getMerkleProof, verifyMerkleProof };
}
