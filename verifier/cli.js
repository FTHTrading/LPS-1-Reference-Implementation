#!/usr/bin/env node
/**
 * cli.js — LPS-1 Verification CLI
 * ═════════════════════════════════
 *
 * Thin CLI wrapper around lps-verify.js with help text and argument parsing.
 *
 * Usage:
 *   npx lps-verify                           # verify example-work
 *   npx lps-verify --work-dir ./my-book      # verify custom work directory
 *   npx lps-verify --manifest ./my-manifest  # verify against custom manifest
 *   npx lps-verify --help
 */

const path = require("path");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  LPS-1 Edition Verifier
  ══════════════════════

  Independently recomputes the deterministic pipeline and verifies:
    - File hashes (SHA-256, CRLF-normalized for .md)
    - Four Merkle roots (manuscript, artifact, image, prompt)
    - Edition root = SHA256(mR + aR + iR + pR)
    - Compiled output hash
    - Merkle proofs for every leaf

  Options:
    --work-dir <path>    Source work directory (default: example-work)
    --manifest <path>    Manifest JSON to verify against (default: dist/manifest.json)
    --help, -h           Show this help

  Exit codes:
    0  All checks pass
    1  One or more checks failed

  Examples:
    node verifier/cli.js
    node verifier/cli.js --work-dir ./my-novel
    node verifier/cli.js --manifest ./dist/manifest.json
  `);
  process.exit(0);
}

// Delegate to the verifier
require("./lps-verify");
