/**
 * contract.test.js — Smart Contract Test Suite
 * ═════════════════════════════════════════════
 *
 * Tests all five LPS-1 protocol contracts:
 *   1. LiteraryAnchor — proof-of-origin, edition history
 *   2. PublishingKernel — edition anchoring, Merkle roots, licenses
 *   3. PublishingKernelV2 — ECDSA enforcement, timelock, freeze
 *   4. RoyaltyRouter — revenue splits, recoupment, withdrawals
 *   5. AuthorIdentity — identity declaration, bibliography, linking
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

// ══════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════

/** Build a MerkleRoots tuple (5 bytes32) from simple hex seeds */
function makeMerkleRoots(seeds = ["aa", "bb", "cc", "dd", "ee"]) {
  return seeds.map((s) => "0x" + s.repeat(32));
}

/** Sign an editionRoot bytes32 using EIP-191 (ethers v6) */
async function signEditionRoot(signer, editionRoot) {
  return signer.signMessage(ethers.getBytes(editionRoot));
}

// ══════════════════════════════════════════════════════════════════════
//  1. LITERARY ANCHOR
// ══════════════════════════════════════════════════════════════════════

describe("LiteraryAnchor", function () {
  let anchor, owner, other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const LiteraryAnchor = await ethers.getContractFactory("LiteraryAnchor");
    // constructor(string _title, string _ipfsCID, string _sha256Hash)
    anchor = await LiteraryAnchor.deploy(
      "Test Book",
      "ipfs://QmTestCID",
      "0x" + "ab".repeat(32)
    );
    await anchor.waitForDeployment();
  });

  it("should set author as deployer", async function () {
    expect(await anchor.author()).to.equal(owner.address);
  });

  it("should store genesis edition", async function () {
    const genesis = await anchor.genesis();
    expect(genesis.ipfsCID).to.equal("ipfs://QmTestCID");
    expect(genesis.title).to.equal("Test Book");
  });

  it("should allow author to anchor editions", async function () {
    // anchorEdition(ipfsCID, sha256Hash, note)
    await anchor.anchorEdition(
      "ipfs://QmEdition2",
      "0x" + "cd".repeat(32),
      "Revised edition"
    );
    expect(await anchor.editionCount()).to.equal(2);
  });

  it("should reject non-author edition additions", async function () {
    await expect(
      anchor.connect(other).anchorEdition(
        "ipfs://QmHack",
        "0x" + "00".repeat(32),
        "Unauthorized"
      )
    ).to.be.revertedWith("Only the author can anchor editions");
  });

  it("should return latest edition", async function () {
    await anchor.anchorEdition(
      "ipfs://QmEdition2",
      "0x" + "cd".repeat(32),
      "Second edition"
    );
    const latest = await anchor.latest();
    expect(latest.ipfsCID).to.equal("ipfs://QmEdition2");
  });

  it("should preserve edition history (append-only)", async function () {
    await anchor.anchorEdition("ipfs://Qm2", "0x" + "11".repeat(32), "Ed 2");
    await anchor.anchorEdition("ipfs://Qm3", "0x" + "22".repeat(32), "Ed 3");
    expect(await anchor.editionCount()).to.equal(3);

    const ed0 = await anchor.editions(0);
    expect(ed0.ipfsCID).to.equal("ipfs://QmTestCID");

    const ed2 = await anchor.editions(2);
    expect(ed2.ipfsCID).to.equal("ipfs://Qm3");
  });
});

// ══════════════════════════════════════════════════════════════════════
//  2. PUBLISHING KERNEL
// ══════════════════════════════════════════════════════════════════════

describe("PublishingKernel", function () {
  let kernel, anchorContract, owner, other;
  const roots = makeMerkleRoots();

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    // Deploy a LiteraryAnchor first (used as genesisAnchor address)
    const LiteraryAnchor = await ethers.getContractFactory("LiteraryAnchor");
    anchorContract = await LiteraryAnchor.deploy("PK Test", "ipfs://QmGenesis", "0x" + "ff".repeat(32));
    await anchorContract.waitForDeployment();
    const anchorAddr = await anchorContract.getAddress();

    // constructor(title, ipfsCID, sha256Hash, MerkleRoots, genesisAnchor, authorSignature)
    const sig = "0x" + "00".repeat(65); // placeholder signature (v1 doesn't verify)
    const PublishingKernel = await ethers.getContractFactory("PublishingKernel");
    kernel = await PublishingKernel.deploy(
      "Test Book",
      "ipfs://QmGenesisCID",
      "0x" + "ff".repeat(32),
      roots,
      anchorAddr,
      sig
    );
    await kernel.waitForDeployment();
  });

  it("should set author as deployer", async function () {
    expect(await kernel.author()).to.equal(owner.address);
  });

  it("should store genesis edition (edition 0)", async function () {
    expect(await kernel.editionCount()).to.equal(1);
    const genesis = await kernel.genesis();
    expect(genesis.ipfsCID).to.equal("ipfs://QmGenesisCID");
    expect(genesis.title).to.equal("Test Book");
  });

  it("should anchor a new edition", async function () {
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const sig = "0x" + "00".repeat(65);
    // anchorEdition(ipfsCID, sha256Hash, note, MerkleRoots, authorSignature)
    await kernel.anchorEdition(
      "ipfs://QmEdition2",
      "0x" + "ab".repeat(32),
      "Second edition",
      newRoots,
      sig
    );
    expect(await kernel.editionCount()).to.equal(2);
  });

  it("should reject non-author anchoring", async function () {
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const sig = "0x" + "00".repeat(65);
    await expect(
      kernel.connect(other).anchorEdition(
        "ipfs://QmHack",
        "0x" + "00".repeat(32),
        "Hack",
        newRoots,
        sig
      )
    ).to.be.revertedWith("PublishingKernel: caller is not the author");
  });

  it("should set canonical edition", async function () {
    // Genesis (edition 0) is already canonical. Add edition 1, then set 0 non-canonical.
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const sig = "0x" + "00".repeat(65);
    await kernel.anchorEdition("ipfs://Qm2", "0x" + "ab".repeat(32), "Ed2", newRoots, sig);

    // setCanonical(editionId, isCanonical)
    await kernel.setCanonical(0, false);
    const ed0 = await kernel.getEdition(0);
    expect(ed0.isCanonical).to.be.false;

    const [canonId, canonEdition] = await kernel.canonicalEdition();
    expect(canonId).to.equal(1);
  });

  it("should grant and revoke licenses", async function () {
    const now = Math.floor(Date.now() / 1000);
    // grantLicense(editionId, grantee, templateId, territory, termStart, termEnd, fieldsOfUse, royaltyRouter)
    await kernel.grantLicense(
      0,
      other.address,
      "CC-BY-NC-4.0",
      "US",
      now,
      now + 365 * 86400,
      "print",
      ethers.ZeroAddress
    );
    expect(await kernel.licenseCount()).to.equal(1);

    await kernel.revokeLicense(0);
    const license = await kernel.getLicense(0);
    expect(license.revoked).to.be.true;
  });

  it("should supersede editions", async function () {
    const r1 = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const r2 = makeMerkleRoots(["a1", "a2", "a3", "a4", "a5"]);
    const sig = "0x" + "00".repeat(65);
    await kernel.anchorEdition("ipfs://Qm2", "0x" + "11".repeat(32), "v2", r1, sig);
    await kernel.anchorEdition("ipfs://Qm3", "0x" + "22".repeat(32), "v3", r2, sig);

    // supersede(oldEditionId, newEditionId) — edition 1 superseded by edition 2
    await kernel.supersede(1, 2);

    const ed1 = await kernel.getEdition(1);
    expect(ed1.isCanonical).to.be.false;
  });

  it("should retract editions", async function () {
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const sig = "0x" + "00".repeat(65);
    await kernel.anchorEdition("ipfs://Qm2", "0x" + "ff".repeat(32), "Ed2", newRoots, sig);

    // retract(editionId, reason)
    await kernel.retract(1, "Factual errors discovered");

    const ed = await kernel.getEdition(1);
    expect(ed.isRetracted).to.be.true;
    expect(ed.retractionReason).to.equal("Factual errors discovered");
  });
});

// ══════════════════════════════════════════════════════════════════════
//  3. PUBLISHING KERNEL V2
// ══════════════════════════════════════════════════════════════════════

describe("PublishingKernelV2", function () {
  let kernelV2, anchorContract, owner, other;
  const roots = makeMerkleRoots();
  const editionRoot = roots[4]; // 0xee...ee

  async function deployV2(signer) {
    const anchorAddr = await anchorContract.getAddress();
    const sig = await signEditionRoot(signer, editionRoot);

    const PublishingKernelV2 = await ethers.getContractFactory("PublishingKernelV2");
    // constructor(title, ipfsCID, sha256Hash, MerkleRoots, genesisAnchor, predecessorKernel, authorSignature)
    const v2 = await PublishingKernelV2.deploy(
      "Test Book V2",
      "ipfs://QmGenV2",
      "0x" + "ff".repeat(32),
      roots,
      anchorAddr,
      ethers.ZeroAddress,  // no predecessor
      sig
    );
    await v2.waitForDeployment();
    return v2;
  }

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    // Deploy a LiteraryAnchor first
    const LiteraryAnchor = await ethers.getContractFactory("LiteraryAnchor");
    anchorContract = await LiteraryAnchor.deploy("V2 Test", "ipfs://QmAnchor", "0x" + "ff".repeat(32));
    await anchorContract.waitForDeployment();

    kernelV2 = await deployV2(owner);
  });

  it("should set author as deployer", async function () {
    expect(await kernelV2.author()).to.equal(owner.address);
  });

  it("should store genesis with verified signature", async function () {
    expect(await kernelV2.editionCount()).to.equal(1);
    const genesis = await kernelV2.genesis();
    expect(genesis.ipfsCID).to.equal("ipfs://QmGenV2");
  });

  it("should anchor edition with provenance", async function () {
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const newEditionRoot = newRoots[4];
    const sig = await signEditionRoot(owner, newEditionRoot);

    // anchorEditionWithProvenance(ipfsCID, sha256Hash, note, MerkleRoots, authorSignature, aiModel, promptSetHash)
    await kernelV2.anchorEditionWithProvenance(
      "ipfs://QmSigned",
      "0x" + "ab".repeat(32),
      "Provenance edition",
      newRoots,
      sig,
      "gpt-4",
      "0x" + "cc".repeat(32)
    );
    expect(await kernelV2.editionCount()).to.equal(2);
  });

  it("should reject invalid signatures", async function () {
    const newRoots = makeMerkleRoots(["11", "22", "33", "44", "55"]);
    const newEditionRoot = newRoots[4];
    // Sign with wrong signer
    const badSig = await signEditionRoot(other, newEditionRoot);

    await expect(
      kernelV2.anchorEdition(
        "ipfs://QmBad",
        "0x" + "ab".repeat(32),
        "Bad sig",
        newRoots,
        badSig
      )
    ).to.be.revertedWith("PKv2: invalid author signature");
  });

  it("should freeze an edition", async function () {
    // freezeEdition(editionId) — per-edition, not contract-wide
    await kernelV2.freezeEdition(0);
    const ed = await kernelV2.getEdition(0);
    expect(ed.isFrozen).to.be.true;
  });

  it("should reject operations on frozen edition", async function () {
    await kernelV2.freezeEdition(0);

    // Cannot set canonical on frozen edition
    await expect(
      kernelV2.setCanonical(0, false)
    ).to.be.revertedWith("PKv2: edition is frozen");
  });

  it("should propose and execute timelock retraction", async function () {
    // Propose retraction of edition 0
    await kernelV2.proposeRetraction(0, "Errata found");

    // Advance time past timelock (48 hours)
    await ethers.provider.send("evm_increaseTime", [48 * 3600 + 1]);
    await ethers.provider.send("evm_mine", []);

    await kernelV2.executeTimelock(0);

    const ed = await kernelV2.getEdition(0);
    expect(ed.isRetracted).to.be.true;
    expect(ed.retractionReason).to.equal("Errata found");
  });

  it("should reject premature timelock execution", async function () {
    await kernelV2.proposeRetraction(0, "Errata");

    await expect(
      kernelV2.executeTimelock(0)
    ).to.be.revertedWith("PKv2: timelock not expired");
  });

  it("should allow admin operations", async function () {
    await kernelV2.setAdmin(other.address);
    expect(await kernelV2.admin()).to.equal(other.address);

    // Admin can propose retraction
    await kernelV2.connect(other).proposeRetraction(0, "Admin retraction");
    expect(await kernelV2.timelockCount()).to.equal(1);
  });
});

// ══════════════════════════════════════════════════════════════════════
//  4. ROYALTY ROUTER
// ══════════════════════════════════════════════════════════════════════

describe("RoyaltyRouter", function () {
  let router, owner, payee1, payee2;

  beforeEach(async function () {
    [owner, payee1, payee2] = await ethers.getSigners();
    const RoyaltyRouter = await ethers.getContractFactory("RoyaltyRouter");
    // constructor(editionRef, wallets[], roles[], basisPoints[])
    router = await RoyaltyRouter.deploy(
      "Test Book",
      [payee1.address, payee2.address],
      ["Author", "Publisher"],
      [7000, 3000]
    );
    await router.waitForDeployment();
  });

  it("should set correct split percentages", async function () {
    const p1 = await router.getPayee(0);
    expect(p1.basisPoints).to.equal(7000);
    expect(p1.role).to.equal("Author");

    const p2 = await router.getPayee(1);
    expect(p2.basisPoints).to.equal(3000);
    expect(p2.role).to.equal("Publisher");
  });

  it("should reject splits that don't sum to 10000", async function () {
    const RoyaltyRouter = await ethers.getContractFactory("RoyaltyRouter");
    await expect(
      RoyaltyRouter.deploy(
        "Bad Split",
        [payee1.address, payee2.address],
        ["Author", "Publisher"],
        [5000, 3000]
      )
    ).to.be.revertedWith("RoyaltyRouter: basis points must sum to 10000");
  });

  it("should accept and auto-distribute payments", async function () {
    const routerAddr = await router.getAddress();

    // Send 1 ETH to the router — auto-distributes via receive()
    await owner.sendTransaction({
      to: routerAddr,
      value: ethers.parseEther("1.0"),
    });

    // Check balances using public mapping
    const bal1 = await router.balances(payee1.address);
    const bal2 = await router.balances(payee2.address);

    expect(bal1).to.equal(ethers.parseEther("0.7"));
    expect(bal2).to.equal(ethers.parseEther("0.3"));
  });

  it("should allow payees to withdraw", async function () {
    const routerAddr = await router.getAddress();

    await owner.sendTransaction({
      to: routerAddr,
      value: ethers.parseEther("1.0"),
    });

    const balBefore = await ethers.provider.getBalance(payee1.address);
    const tx = await router.connect(payee1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const balAfter = await ethers.provider.getBalance(payee1.address);

    expect(balAfter - balBefore + gasUsed).to.equal(ethers.parseEther("0.7"));
  });

  it("should handle recoupment waterfall", async function () {
    // setRecoupment(recipient, totalOwed, recoupBasisPoints)
    await router.setRecoupment(
      payee1.address,
      ethers.parseEther("0.5"),
      5000  // 50% of incoming goes to recoupment
    );

    const routerAddr = await router.getAddress();
    await owner.sendTransaction({
      to: routerAddr,
      value: ethers.parseEther("1.0"),
    });

    // Check that recoupment was applied
    const recoup = await router.getRecoupment();
    expect(recoup.recouped).to.equal(ethers.parseEther("0.5"));
    expect(recoup.completed).to.be.true;
  });

  it("should allow emergency sweep", async function () {
    const routerAddr = await router.getAddress();
    await owner.sendTransaction({
      to: routerAddr,
      value: ethers.parseEther("1.0"),
    });

    // Owner can sweep
    await router.emergencySweep();
    const contractBal = await ethers.provider.getBalance(routerAddr);
    expect(contractBal).to.equal(0);
  });
});

// ══════════════════════════════════════════════════════════════════════
//  5. AUTHOR IDENTITY
// ══════════════════════════════════════════════════════════════════════

describe("AuthorIdentity", function () {
  let identity, owner, other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const AuthorIdentity = await ethers.getContractFactory("AuthorIdentity");
    identity = await AuthorIdentity.deploy(
      "Test Author",
      "Testy",
      "T. Author",
      "Test Org",
      "example.com",
      "https://example.com/author"
    );
    await identity.waitForDeployment();
  });

  it("should set author as deployer", async function () {
    expect(await identity.author()).to.equal(owner.address);
  });

  it("should store identity", async function () {
    const id = await identity.getIdentity();
    expect(id.realName).to.equal("Test Author");
    expect(id.pseudonym).to.equal("T. Author");
    expect(id.domain).to.equal("example.com");
  });

  it("should register works", async function () {
    await identity.registerWork("Book One", "KDP", "B01234");
    expect(await identity.getBibliographyCount()).to.equal(1);

    const work = await identity.getWork(0);
    expect(work.title).to.equal("Book One");
    expect(work.platform).to.equal("KDP");
  });

  it("should register works in batch", async function () {
    await identity.registerWorksBatch(
      ["Book A", "Book B", "Book C"],
      ["KDP", "IngramSpark", "Draft2Digital"],
      ["A001", "B002", "C003"]
    );
    expect(await identity.getBibliographyCount()).to.equal(3);
  });

  it("should link contracts", async function () {
    await identity.linkContract(other.address, "PublishingKernel");
    expect(await identity.getLinkedContractCount()).to.equal(1);

    const linked = await identity.getLinkedContract(0);
    expect(linked.contractAddress).to.equal(other.address);
    expect(linked.role).to.equal("PublishingKernel");
  });

  it("should reject non-author operations", async function () {
    await expect(
      identity.connect(other).registerWork("Hack", "Evil", "XXX")
    ).to.be.revertedWith("Only the author");

    await expect(
      identity.connect(other).updateDomain("evil.com")
    ).to.be.revertedWith("Only the author");
  });

  it("should update domain and external URL", async function () {
    await identity.updateDomain("new-domain.com");
    await identity.updateExternalUrl("https://new-domain.com/author");

    const id = await identity.getIdentity();
    expect(id.domain).to.equal("new-domain.com");
    expect(id.externalAuthorUrl).to.equal("https://new-domain.com/author");
  });

  it("should return full bibliography", async function () {
    await identity.registerWork("A", "P1", "I1");
    await identity.registerWork("B", "P2", "I2");

    const bib = await identity.getFullBibliography();
    expect(bib.length).to.equal(2);
    expect(bib[0].title).to.equal("A");
    expect(bib[1].title).to.equal("B");
  });
});
