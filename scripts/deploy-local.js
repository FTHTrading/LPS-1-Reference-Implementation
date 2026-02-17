#!/usr/bin/env node
/**
 * deploy-local.js — Deploy All Contracts to Local Hardhat Network
 * ═══════════════════════════════════════════════════════════════
 *
 * Deploys all five LPS-1 protocol contracts to a local Hardhat node.
 * No mainnet, no private keys, no .env required.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-local.js
 *
 * Prerequisites:
 *   npx hardhat node  (in another terminal)
 */

const hre = require("hardhat");

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  LPS-1 — Local Deployment");
  console.log("══════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`  Deployer: ${deployer.address}\n`);

  // ── 1. LiteraryAnchor ──────────────────────────────────────
  const LiteraryAnchor = await hre.ethers.getContractFactory("LiteraryAnchor");
  // constructor(string _title, string _ipfsCID, string _sha256Hash)
  const anchor = await LiteraryAnchor.deploy(
    "The Protocol Garden",                                               // _title
    "ipfs://QmExampleCID",                                               // _ipfsCID
    "0x" + "a".repeat(64)                                                // _sha256Hash
  );
  await anchor.waitForDeployment();
  const anchorAddr = await anchor.getAddress();
  console.log(`  LiteraryAnchor:      ${anchorAddr}`);

  // ── 2. PublishingKernel ────────────────────────────────────
  const sampleRoots = [
    "0x" + "aa".repeat(32),
    "0x" + "bb".repeat(32),
    "0x" + "cc".repeat(32),
    "0x" + "dd".repeat(32),
    "0x" + "ee".repeat(32),
  ];
  const placeholderSig = "0x" + "00".repeat(65);

  const PublishingKernel = await hre.ethers.getContractFactory("PublishingKernel");
  // constructor(title, ipfsCID, sha256Hash, MerkleRoots, genesisAnchor, authorSignature)
  const kernel = await PublishingKernel.deploy(
    "The Protocol Garden",
    "ipfs://QmExampleCID",
    "0x" + "a".repeat(64),
    sampleRoots,
    anchorAddr,
    placeholderSig
  );
  await kernel.waitForDeployment();
  const kernelAddr = await kernel.getAddress();
  console.log(`  PublishingKernel:    ${kernelAddr}`);

  // ── 3. PublishingKernelV2 ──────────────────────────────────
  // V2 requires a valid ECDSA signature over the editionRoot
  const editionRoot = sampleRoots[4]; // 0xee...ee
  const v2Sig = await deployer.signMessage(hre.ethers.getBytes(editionRoot));

  const PublishingKernelV2 = await hre.ethers.getContractFactory("PublishingKernelV2");
  // constructor(title, ipfsCID, sha256Hash, MerkleRoots, genesisAnchor, predecessorKernel, authorSignature)
  const kernelV2 = await PublishingKernelV2.deploy(
    "The Protocol Garden",
    "ipfs://QmExampleCID",
    "0x" + "a".repeat(64),
    sampleRoots,
    anchorAddr,
    kernelAddr,              // predecessor = v1 kernel
    v2Sig
  );
  await kernelV2.waitForDeployment();
  const kernelV2Addr = await kernelV2.getAddress();
  console.log(`  PublishingKernelV2:  ${kernelV2Addr}`);

  // ── 4. RoyaltyRouter ──────────────────────────────────────
  const RoyaltyRouter = await hre.ethers.getContractFactory("RoyaltyRouter");
  // constructor(editionRef, wallets[], roles[], basisPoints[])
  const router = await RoyaltyRouter.deploy(
    "The Protocol Garden",  // editionRef
    [deployer.address],     // wallets
    ["Author"],             // roles
    [10000]                 // basis points (100% to deployer for demo)
  );
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`  RoyaltyRouter:      ${routerAddr}`);

  // ── 5. AuthorIdentity ─────────────────────────────────────
  const AuthorIdentity = await hre.ethers.getContractFactory("AuthorIdentity");
  const identity = await AuthorIdentity.deploy(
    "Reference Author",       // realName
    "Ref",                    // nickname
    "R. Author",              // pseudonym
    "LPS-1 Foundation",       // organization
    "example.com",            // domain
    "https://example.com"     // externalAuthorUrl
  );
  await identity.waitForDeployment();
  const identityAddr = await identity.getAddress();
  console.log(`  AuthorIdentity:     ${identityAddr}`);

  // ── Summary ────────────────────────────────────────────────
  console.log("\n── Deployment Complete ──\n");
  console.log("  All 5 contracts deployed to local Hardhat network.");
  console.log("  No mainnet interaction. No gas spent.\n");

  return {
    anchor: anchorAddr,
    kernel: kernelAddr,
    kernelV2: kernelV2Addr,
    router: routerAddr,
    identity: identityAddr,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
