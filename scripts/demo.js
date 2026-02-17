#!/usr/bin/env node
/**
 * demo.js — Full Pipeline Demo
 * ═════════════════════════════
 *
 * Runs the entire LPS-1 pipeline end-to-end:
 *   compile → hash → merkle → manifest → deploy → anchor → verify
 *
 * This is the "one command" proof that the protocol works.
 *
 * Usage:
 *   node scripts/demo.js
 *
 * No network required — uses in-process Hardhat Runtime Environment.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function run(label, cmd) {
  console.log(`\n${"═".repeat(54)}`);
  console.log(`  STEP: ${label}`);
  console.log(`${"═".repeat(54)}\n`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: "inherit" });
  } catch (err) {
    console.error(`\n✗ FAILED at step: ${label}`);
    process.exit(1);
  }
}

function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║          LPS-1 FULL PIPELINE DEMO               ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║  compile → hash → merkle → manifest → verify    ║");
  console.log("╚══════════════════════════════════════════════════╝");

  // Clean dist
  const distDir = path.join(ROOT, "dist");
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  console.log("\n  ✓ dist/ cleaned");

  // Run pipeline
  run("1. COMPILE", "node pipeline/compile.js");
  run("2. HASH",    "node pipeline/hash.js --compiled");
  run("3. MERKLE",  "node pipeline/merkle.js");
  run("4. MANIFEST","node pipeline/manifest.js");
  run("5. VERIFY",  "node verifier/lps-verify.js");

  // Summary
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║              DEMO COMPLETE                       ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║  All pipeline stages passed.                     ║");
  console.log("║  dist/ contains: compiled.md, hashes.json,       ║");
  console.log("║  merkle.json, manifest.json                      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Print key outputs
  if (fs.existsSync(path.join(distDir, "manifest.json"))) {
    const manifest = JSON.parse(fs.readFileSync(path.join(distDir, "manifest.json"), "utf-8"));
    console.log("  Key outputs:");
    console.log(`    compiledHash:   ${manifest.integrity.compiledHash}`);
    console.log(`    manuscriptRoot: ${manifest.integrity.manuscriptRoot}`);
    console.log(`    editionRoot:    ${manifest.integrity.editionRoot}`);
    console.log("");
  }
}

main();
