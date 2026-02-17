#!/usr/bin/env node
/**
 * compile.js — Deterministic Manuscript Compiler
 * ═══════════════════════════════════════════════
 *
 * Reads an order.json manifest and concatenates markdown blocks
 * into a single deterministic output file.
 *
 * Rules (LPS-1 §3):
 *   1. UTF-8 encoding exclusively
 *   2. Files joined in order.json sequence
 *   3. Block separator: "\n\n" (two LF)
 *   4. CRLF normalization before hashing (Step 2)
 *   5. No trailing whitespace injection
 *
 * Usage:
 *   node pipeline/compile.js [--work-dir example-work]
 *
 * Output:
 *   dist/compiled.md
 */

const fs = require("fs");
const path = require("path");

// ── Config ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
let workDir = path.resolve(__dirname, "..", "example-work");
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--work-dir" && args[i + 1]) workDir = path.resolve(args[i + 1]);
}

const ORDER_FILE = path.join(workDir, "order.json");
const MANUSCRIPT_DIR = path.join(workDir, "manuscript");
const DIST_DIR = path.join(path.resolve(__dirname, ".."), "dist");

// ── Main ─────────────────────────────────────────────────────────

function compile() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — Deterministic Compile");
  console.log("══════════════════════════════════════════════════\n");

  // Read order manifest
  if (!fs.existsSync(ORDER_FILE)) {
    console.error(`✗ order.json not found: ${ORDER_FILE}`);
    process.exit(1);
  }
  const order = JSON.parse(fs.readFileSync(ORDER_FILE, "utf-8"));
  const files = order.manuscript || order.files || [];

  if (files.length === 0) {
    console.error("✗ No manuscript files listed in order.json");
    process.exit(1);
  }

  console.log(`  Work directory: ${workDir}`);
  console.log(`  Files:          ${files.length}\n`);

  // Read and concatenate
  const blocks = [];
  let totalBytes = 0;

  for (const filename of files) {
    const filePath = path.join(MANUSCRIPT_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ MISSING: ${filename}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    blocks.push(content);
    totalBytes += Buffer.byteLength(content, "utf-8");
    console.log(`  ✓ ${filename.padEnd(40)} ${(Buffer.byteLength(content, "utf-8") / 1024).toFixed(1)} KB`);
  }

  // Join with deterministic separator
  const compiled = blocks.join("\n\n");

  // Write output
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outputPath = path.join(DIST_DIR, "compiled.md");
  fs.writeFileSync(outputPath, compiled, "utf-8");

  console.log(`\n  Total: ${files.length} files · ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`  ✓ Written: dist/compiled.md\n`);

  return { outputPath, fileCount: files.length, totalBytes };
}

// ── Export or run ────────────────────────────────────────────────
if (require.main === module) {
  compile();
} else {
  module.exports = { compile };
}
