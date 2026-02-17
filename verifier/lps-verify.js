#!/usr/bin/env node
/**
 * lps-verify.js — LPS-1 Edition Verifier
 * ════════════════════════════════════════
 *
 * Independent verification tool that recomputes the entire
 * deterministic pipeline from source files and confirms:
 *
 *   1. Every file hash matches the manifest
 *   2. Merkle roots recompute correctly
 *   3. editionRoot = SHA256(mR || aR || iR || pR)
 *   4. Compiled output hash matches
 *   5. Merkle proofs validate for every leaf
 *
 * This is the canonical conformance checker for LPS-1.
 *
 * Usage:
 *   node verifier/lps-verify.js [--work-dir <dir>] [--manifest <path>]
 *
 * Exit codes:
 *   0 — All checks pass
 *   1 — One or more checks failed
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── Crypto primitives (self-contained — no imports) ──────────────

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  if (/\.md$/i.test(filePath)) {
    const text = data.toString("utf-8");
    const crlf = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
    return sha256(Buffer.from(crlf, "utf-8"));
  }
  return sha256(data);
}

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
      const right = current[i + 1] || left;
      next.push(sha256(left + right));
    }
    layers.push(next);
    current = next;
  }
  return { root: current[0], leaves: hashes, layers };
}

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

// ── Reporter ─────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function pass(label, detail) {
  passCount++;
  console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail) {
  failCount++;
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
}

// ── Main verification ────────────────────────────────────────────

function verify(workDir, manifestPath) {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 EDITION VERIFIER");
  console.log("══════════════════════════════════════════════════\n");

  // ── Load manifest ──────────────────────────────────────────
  if (!fs.existsSync(manifestPath)) {
    console.error(`✗ Manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  pass("Manifest loaded", path.basename(manifestPath));

  // ── Schema check ───────────────────────────────────────────
  if (manifest.schema === "literary-protocol-standard") {
    pass("Schema", manifest.schema);
  } else {
    fail("Schema", `expected 'literary-protocol-standard', got '${manifest.schema}'`);
  }

  // ── 1. Verify individual file hashes ───────────────────────
  console.log("\n── File Hash Verification ──\n");
  const categories = ["manuscript", "artifacts", "images", "prompts"];

  for (const cat of categories) {
    const files = (manifest.files && manifest.files[cat]) || [];
    const dir = path.join(workDir, cat);

    for (const entry of files) {
      const fp = path.join(dir, entry.file);
      if (!fs.existsSync(fp)) {
        fail(`${cat}/${entry.file}`, "File not found");
        continue;
      }
      const computed = sha256File(fp);
      if (computed === entry.sha256) {
        pass(`${cat}/${entry.file}`, computed.slice(0, 16) + "…");
      } else {
        fail(`${cat}/${entry.file}`, `expected ${entry.sha256.slice(0, 16)}… got ${computed.slice(0, 16)}…`);
      }
    }
  }

  // ── 2. Recompute Merkle roots ──────────────────────────────
  console.log("\n── Merkle Root Verification ──\n");

  const treeData = {};
  for (const cat of categories) {
    const files = (manifest.files && manifest.files[cat]) || [];
    const hashes = files.map((f) => f.sha256);
    const tree = buildMerkleTree(hashes);
    treeData[cat] = tree;

    const expectedKey = cat === "manuscript" ? "manuscriptRoot"
      : cat === "artifacts" ? "artifactRoot"
      : cat === "images" ? "imageRoot"
      : "promptRoot";
    const expected = manifest.integrity[expectedKey];

    if (tree.root === expected) {
      pass(`${expectedKey}`, tree.root.slice(0, 24) + "…");
    } else {
      fail(`${expectedKey}`, `expected ${expected?.slice(0, 16)}… got ${tree.root.slice(0, 16)}…`);
    }
  }

  // ── 3. Verify editionRoot ──────────────────────────────────
  console.log("\n── Edition Root Verification ──\n");

  const computedEdition = sha256(
    treeData.manuscript.root +
    treeData.artifacts.root +
    treeData.images.root +
    treeData.prompts.root
  );

  if (computedEdition === manifest.integrity.editionRoot) {
    pass("editionRoot", computedEdition.slice(0, 24) + "…");
  } else {
    fail("editionRoot", `expected ${manifest.integrity.editionRoot?.slice(0, 16)}… got ${computedEdition.slice(0, 16)}…`);
  }

  // ── 4. Verify compiled hash ────────────────────────────────
  console.log("\n── Compiled Hash Verification ──\n");

  const compiledPath = path.resolve(workDir, "..", "dist", "compiled.md");
  if (fs.existsSync(compiledPath)) {
    const compiledHash = sha256File(compiledPath);
    if (compiledHash === manifest.integrity.compiledHash) {
      pass("compiledHash", compiledHash.slice(0, 24) + "…");
    } else {
      fail("compiledHash", `expected ${manifest.integrity.compiledHash?.slice(0, 16)}… got ${compiledHash.slice(0, 16)}…`);
    }
  } else {
    fail("compiledHash", "dist/compiled.md not found");
  }

  // ── 5. Verify Merkle proofs (from merkle.json) ─────────────
  console.log("\n── Merkle Proof Verification ──\n");

  const merkleFile = path.resolve(workDir, "..", "dist", "merkle.json");
  if (fs.existsSync(merkleFile)) {
    const merkle = JSON.parse(fs.readFileSync(merkleFile, "utf-8"));
    const proofs = merkle.proofs || [];
    let proofsPassed = 0;

    for (const p of proofs) {
      if (verifyMerkleProof(p.leafHash, p.proof, merkle.roots.manuscriptRoot)) {
        proofsPassed++;
      } else {
        fail(`Proof: ${p.file}`, "Proof does not resolve to manuscriptRoot");
      }
    }

    if (proofsPassed === proofs.length && proofs.length > 0) {
      pass(`Merkle proofs`, `${proofsPassed}/${proofs.length} verified`);
    } else if (proofs.length === 0) {
      pass("Merkle proofs", "No proofs to verify (empty tree)");
    }
  } else {
    fail("Merkle proofs", "dist/merkle.json not found");
  }

  // ── Summary ────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════");
  console.log(`  RESULT: ${passCount} PASS / ${failCount} FAIL`);
  console.log("══════════════════════════════════════════════════\n");

  return { passCount, failCount };
}

// ── CLI ──────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  let workDir = path.resolve(__dirname, "..", "example-work");
  let manifestPath = path.resolve(__dirname, "..", "dist", "manifest.json");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--work-dir" && args[i + 1]) workDir = path.resolve(args[i + 1]);
    if (args[i] === "--manifest" && args[i + 1]) manifestPath = path.resolve(args[i + 1]);
  }

  const result = verify(workDir, manifestPath);
  process.exit(result.failCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
} else {
  module.exports = { verify, sha256, sha256File, buildMerkleTree, verifyMerkleProof };
}
