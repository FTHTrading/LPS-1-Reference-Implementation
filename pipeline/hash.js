#!/usr/bin/env node
/**
 * hash.js — SHA-256 Hashing Utility
 * ═══════════════════════════════════
 *
 * Computes SHA-256 hashes for individual files and compiled output.
 * Handles CRLF normalization for markdown files per LPS-1 §3.
 *
 * Rules:
 *   - Algorithm: SHA-256 (lowercase hex output)
 *   - Markdown (.md): Normalize to CRLF before hashing
 *   - Binary files: Hash raw bytes
 *   - All encoding: UTF-8
 *
 * Usage:
 *   node pipeline/hash.js [file1] [file2] ...
 *   node pipeline/hash.js --compiled          # hash dist/compiled.md
 *   node pipeline/hash.js --dir <directory>   # hash all files in directory
 *
 * Output:
 *   Prints hashes to stdout; optionally writes dist/hashes.json
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── Core hash functions ──────────────────────────────────────────

/**
 * SHA-256 hash of a buffer or string. Returns lowercase hex.
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Hash a file with CRLF normalization for markdown.
 *
 * LPS-1 §3.4: All markdown files MUST be normalized to CRLF
 * line endings before hashing, regardless of platform.
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {string} SHA-256 hex hash
 */
function sha256File(filePath) {
  const data = fs.readFileSync(filePath);

  if (/\.md$/i.test(filePath)) {
    // Normalize: strip all CR, then convert LF → CRLF
    const text = data.toString("utf-8");
    const crlf = text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
    return sha256(Buffer.from(crlf, "utf-8"));
  }

  return sha256(data);
}

/**
 * Hash all files in a directory (non-recursive).
 *
 * @param {string} dirPath - Directory to hash
 * @returns {Array<{file: string, sha256: string, sizeBytes: number}>}
 */
function hashDirectory(dirPath) {
  const results = [];
  const files = fs.readdirSync(dirPath).sort();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) continue;

    results.push({
      file,
      sha256: sha256File(filePath),
      sizeBytes: stats.size,
    });
  }

  return results;
}

// ── CLI ──────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const DIST_DIR = path.resolve(__dirname, "..", "dist");

  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — SHA-256 Hash");
  console.log("══════════════════════════════════════════════════\n");

  const results = [];

  if (args.includes("--compiled")) {
    const compiled = path.join(DIST_DIR, "compiled.md");
    if (!fs.existsSync(compiled)) {
      console.error("✗ dist/compiled.md not found. Run compile first.");
      process.exit(1);
    }
    const hash = sha256File(compiled);
    const size = fs.statSync(compiled).size;
    results.push({ file: "compiled.md", sha256: hash, sizeBytes: size });
    console.log(`  compiled.md  ${hash}`);
  } else if (args.includes("--dir")) {
    const dirIdx = args.indexOf("--dir");
    const dir = path.resolve(args[dirIdx + 1] || ".");
    const hashes = hashDirectory(dir);
    for (const h of hashes) {
      results.push(h);
      console.log(`  ${h.file.padEnd(40)} ${h.sha256.slice(0, 16)}… (${h.sizeBytes} B)`);
    }
  } else if (args.length > 0) {
    for (const arg of args.filter((a) => !a.startsWith("--"))) {
      const filePath = path.resolve(arg);
      if (!fs.existsSync(filePath)) {
        console.error(`  ✗ Not found: ${arg}`);
        continue;
      }
      const hash = sha256File(filePath);
      const size = fs.statSync(filePath).size;
      results.push({ file: path.basename(filePath), sha256: hash, sizeBytes: size });
      console.log(`  ${path.basename(filePath).padEnd(40)} ${hash}`);
    }
  } else {
    console.log("  Usage:");
    console.log("    node pipeline/hash.js --compiled");
    console.log("    node pipeline/hash.js --dir <directory>");
    console.log("    node pipeline/hash.js <file1> <file2> ...");
    return;
  }

  // Write results
  if (results.length > 0) {
    if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
    const outPath = path.join(DIST_DIR, "hashes.json");
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
    console.log(`\n  ✓ Written: dist/hashes.json (${results.length} entries)\n`);
  }
}

// ── Export or run ────────────────────────────────────────────────
if (require.main === module) {
  main();
} else {
  module.exports = { sha256, sha256File, hashDirectory };
}
