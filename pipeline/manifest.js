#!/usr/bin/env node
/**
 * manifest.js — Integrity Manifest Generator
 * ════════════════════════════════════════════
 *
 * Generates a complete integrity manifest for an edition:
 *   - Per-file SHA-256 hashes and sizes
 *   - Merkle roots (4 trees + editionRoot)
 *   - Combined compiled hash
 *   - Metadata for on-chain anchoring
 *
 * Usage:
 *   node pipeline/manifest.js [--work-dir example-work]
 *
 * Output:
 *   dist/manifest.json
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { sha256File } = require("./hash");

// ── Config ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
let workDir = path.resolve(__dirname, "..", "example-work");
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--work-dir" && args[i + 1]) workDir = path.resolve(args[i + 1]);
}

const DIST_DIR = path.resolve(__dirname, "..", "dist");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ── Main ─────────────────────────────────────────────────────────

function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — Integrity Manifest");
  console.log("══════════════════════════════════════════════════\n");

  // Check prerequisites
  const merkleFile = path.join(DIST_DIR, "merkle.json");
  const compiledFile = path.join(DIST_DIR, "compiled.md");

  if (!fs.existsSync(merkleFile)) {
    console.error("✗ dist/merkle.json not found. Run: npm run merkle");
    process.exit(1);
  }
  if (!fs.existsSync(compiledFile)) {
    console.error("✗ dist/compiled.md not found. Run: npm run compile");
    process.exit(1);
  }

  const merkle = JSON.parse(fs.readFileSync(merkleFile, "utf-8"));
  const compiledHash = sha256File(compiledFile);
  const compiledSize = fs.statSync(compiledFile).size;

  // Read order.json for metadata
  const orderFile = path.join(workDir, "order.json");
  const order = fs.existsSync(orderFile) ? JSON.parse(fs.readFileSync(orderFile, "utf-8")) : {};

  // Scan all source files
  const categories = ["manuscript", "artifacts", "images", "prompts"];
  const fileInventory = {};
  let totalFiles = 0;
  let totalBytes = 0;

  for (const cat of categories) {
    const dir = path.join(workDir, cat);
    fileInventory[cat] = [];
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).sort();
    for (const file of files) {
      const fp = path.join(dir, file);
      if (!fs.statSync(fp).isFile()) continue;
      const hash = sha256File(fp);
      const size = fs.statSync(fp).size;
      fileInventory[cat].push({ file, sha256: hash, sizeBytes: size });
      totalFiles++;
      totalBytes += size;
    }
  }

  // Assemble manifest
  const manifest = {
    schema: "literary-protocol-standard",
    schemaVersion: "1.0.0",
    type: "edition-manifest",
    generatedAt: new Date().toISOString(),

    edition: {
      title: order.title || "Untitled",
      editionNumber: order.editionNumber || 1,
      author: order.author || "Unknown",
    },

    integrity: {
      compiledHash,
      compiledSizeBytes: compiledSize,
      editionRoot: merkle.roots.editionRoot,
      manuscriptRoot: merkle.roots.manuscriptRoot,
      artifactRoot: merkle.roots.artifactRoot,
      imageRoot: merkle.roots.imageRoot,
      promptRoot: merkle.roots.promptRoot,
    },

    files: fileInventory,

    stats: {
      totalFiles,
      totalBytes,
      categories: Object.fromEntries(
        categories.map((c) => [c, fileInventory[c].length])
      ),
    },

    verification: {
      algorithm: "sha256",
      merkleScheme: "ordered-concatenation",
      oddLeafRule: "duplicate-last",
      editionRootFormula: "sha256(manuscriptRoot + artifactRoot + imageRoot + promptRoot)",
      crlfNormalization: "markdown files normalized to CRLF before hashing",
    },
  };

  // Write
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outPath = path.join(DIST_DIR, "manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`  Title:          ${manifest.edition.title}`);
  console.log(`  Edition:        ${manifest.edition.editionNumber}`);
  console.log(`  Files:          ${totalFiles}`);
  console.log(`  Total size:     ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`  compiledHash:   ${compiledHash.slice(0, 24)}…`);
  console.log(`  editionRoot:    ${manifest.integrity.editionRoot.slice(0, 24)}…`);
  console.log(`\n  ✓ Written: dist/manifest.json\n`);

  return manifest;
}

// ── Export or run ────────────────────────────────────────────────
if (require.main === module) {
  main();
} else {
  module.exports = { main };
}
