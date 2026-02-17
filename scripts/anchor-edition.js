#!/usr/bin/env node
/**
 * anchor-edition.js — Anchor an Edition On-Chain (Local)
 * ═══════════════════════════════════════════════════════
 *
 * Reads dist/manifest.json and anchors the edition to a locally
 * deployed PublishingKernel contract.
 *
 * Usage:
 *   npx hardhat run scripts/anchor-edition.js
 *
 * Prerequisites:
 *   1. npx hardhat node  (running)
 *   2. npx hardhat run scripts/deploy-local.js  (contracts deployed)
 *   3. npm run build  (pipeline complete, dist/manifest.json exists)
 */

const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — Anchor Edition");
  console.log("══════════════════════════════════════════════════\n");

  // Read manifest
  const manifestPath = path.resolve(__dirname, "..", "dist", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("✗ dist/manifest.json not found. Run: npm run build");
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  console.log(`  Title:        ${manifest.edition.title}`);
  console.log(`  Edition:      ${manifest.edition.editionNumber}`);
  console.log(`  editionRoot:  ${manifest.integrity.editionRoot.slice(0, 24)}…\n`);

  // Get signer
  const [deployer] = await hre.ethers.getSigners();

  // Prepare Merkle roots tuple
  const roots = [
    "0x" + manifest.integrity.manuscriptRoot,
    "0x" + manifest.integrity.artifactRoot,
    "0x" + manifest.integrity.imageRoot,
    "0x" + manifest.integrity.promptRoot,
    "0x" + manifest.integrity.editionRoot,
  ];

  // Deploy a LiteraryAnchor for the genesis reference
  const LiteraryAnchor = await hre.ethers.getContractFactory("LiteraryAnchor");
  const anchor = await LiteraryAnchor.deploy(
    manifest.edition.title,
    "ipfs://QmReferenceImplementationCID",
    "0x" + manifest.integrity.compiledHash
  );
  await anchor.waitForDeployment();
  const anchorAddr = await anchor.getAddress();
  console.log(`  LiteraryAnchor:   ${anchorAddr}`);

  // Deploy a PublishingKernel with genesis edition
  // constructor(title, ipfsCID, sha256Hash, MerkleRoots, genesisAnchor, authorSignature)
  const placeholderSig = "0x" + "00".repeat(65);
  const PublishingKernel = await hre.ethers.getContractFactory("PublishingKernel");
  const kernel = await PublishingKernel.deploy(
    manifest.edition.title,
    "ipfs://QmReferenceImplementationCID",
    "0x" + manifest.integrity.compiledHash,
    roots,
    anchorAddr,
    placeholderSig
  );
  await kernel.waitForDeployment();
  const addr = await kernel.getAddress();
  console.log(`  PublishingKernel: ${addr}`);

  // Anchor a second edition with updated data
  const newRoots = roots; // same roots for demo — in production these would differ
  const tx = await kernel.anchorEdition(
    "ipfs://QmEdition2CID",
    "0x" + manifest.integrity.compiledHash,
    "Second edition anchored from pipeline",
    newRoots,
    placeholderSig
  );

  const receipt = await tx.wait();
  console.log(`\n  ✓ Edition anchored`);
  console.log(`    TX:     ${receipt.hash}`);
  console.log(`    Block:  ${receipt.blockNumber}`);
  console.log(`    Gas:    ${receipt.gasUsed.toString()}`);

  // Verify
  const editionCount = await kernel.editionCount();
  console.log(`\n  Editions on-chain: ${editionCount}`);

  const edition = await kernel.getEdition(1);
  console.log(`  On-chain title:    ${edition.title}`);
  console.log(`  On-chain root:     ${edition.roots.editionRoot.slice(0, 24)}…\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
