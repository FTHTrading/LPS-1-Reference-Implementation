// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PublishingKernel
 * @notice Literary Protocol Standard v1 (LPS-1) — On-chain publishing kernel.
 *
 * Stores full edition metadata with:
 *   - Merkle tree roots (manuscript, artifact, image, prompt, edition)
 *   - Author signature attestation
 *   - Edition lineage (supersession, canonicality, retraction)
 *   - License registry with territory/term/revenue-split references
 *   - AI provenance metadata (model, prompt hashes)
 *
 * @dev LPS-1 Reference Implementation.
 *      Designed to be deployed alongside a LiteraryAnchor contract.
 */
contract PublishingKernel {

    // ══════════════════════════════════════════════════════════════════════
    //  STRUCTS
    // ══════════════════════════════════════════════════════════════════════

    struct MerkleRoots {
        bytes32 manuscriptRoot;
        bytes32 artifactRoot;
        bytes32 imageRoot;
        bytes32 promptRoot;
        bytes32 editionRoot;   // H(manuscriptRoot || artifactRoot || imageRoot || promptRoot)
    }

    struct Edition {
        // Identity
        string  ipfsCID;
        string  sha256Hash;
        string  title;
        string  note;
        uint256 timestamp;

        // Merkle integrity
        MerkleRoots roots;

        // Lineage
        uint256 supersedesEdition; // 0 = none, otherwise edition index + 1
        bool    isCanonical;
        bool    isRetracted;
        string  retractionReason;

        // AI provenance
        string  aiModel;
        bytes32 promptSetHash;

        // Signature
        bytes   authorSignature;   // EIP-191 signature over editionRoot
    }

    struct License {
        uint256 editionId;
        address grantee;
        string  templateId;        // e.g., "CC-BY-NC-4.0", "exclusive-print"
        string  territory;         // ISO 3166 or "GLOBAL"
        uint256 termStart;
        uint256 termEnd;           // 0 = perpetual
        string  fieldsOfUse;       // "print", "digital", "audio", "all"
        address royaltyRouter;     // address of associated RoyaltyRouter
        bool    revoked;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════════

    address public immutable author;
    string  public title;
    address public immutable genesisAnchor;

    Edition[] public editions;
    License[] public licenses;

    mapping(uint256 => uint256[]) public editionLicenses;
    mapping(bytes32 => bool)      public anchoredRoots;

    // ══════════════════════════════════════════════════════════════════════
    //  EVENTS
    // ══════════════════════════════════════════════════════════════════════

    event EditionAnchored(
        uint256 indexed editionId,
        string  ipfsCID,
        bytes32 editionRoot,
        uint256 timestamp,
        string  note
    );

    event EditionSuperseded(
        uint256 indexed oldEditionId,
        uint256 indexed newEditionId
    );

    event EditionRetracted(
        uint256 indexed editionId,
        string  reason,
        uint256 timestamp
    );

    event CanonicalityChanged(
        uint256 indexed editionId,
        bool    isCanonical
    );

    event LicenseGranted(
        uint256 indexed licenseId,
        uint256 indexed editionId,
        address indexed grantee,
        string  templateId
    );

    event LicenseRevoked(
        uint256 indexed licenseId,
        uint256 timestamp
    );

    // ══════════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ══════════════════════════════════════════════════════════════════════

    modifier onlyAuthor() {
        require(msg.sender == author, "PublishingKernel: caller is not the author");
        _;
    }

    modifier editionExists(uint256 _editionId) {
        require(_editionId < editions.length, "PublishingKernel: edition does not exist");
        _;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @notice Deploy the PublishingKernel with a genesis edition.
     * @param _title             Work title
     * @param _ipfsCID           IPFS CID of the compiled manuscript
     * @param _sha256Hash        SHA-256 of the compiled manuscript
     * @param _roots             Merkle roots for the genesis edition
     * @param _genesisAnchor     Address of the original LiteraryAnchor contract
     * @param _authorSignature   EIP-191 signature over editionRoot
     */
    constructor(
        string memory _title,
        string memory _ipfsCID,
        string memory _sha256Hash,
        MerkleRoots memory _roots,
        address _genesisAnchor,
        bytes memory _authorSignature
    ) {
        author        = msg.sender;
        title         = _title;
        genesisAnchor = _genesisAnchor;

        Edition memory genesisEdition = Edition({
            ipfsCID:           _ipfsCID,
            sha256Hash:        _sha256Hash,
            title:             _title,
            note:              "Genesis - Literary Protocol Standard v1",
            timestamp:         block.timestamp,
            roots:             _roots,
            supersedesEdition: 0,
            isCanonical:       true,
            isRetracted:       false,
            retractionReason:  "",
            aiModel:           "",
            promptSetHash:     bytes32(0),
            authorSignature:   _authorSignature
        });

        editions.push(genesisEdition);
        anchoredRoots[_roots.editionRoot] = true;

        emit EditionAnchored(0, _ipfsCID, _roots.editionRoot, block.timestamp, genesisEdition.note);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EDITION MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @notice Anchor a new edition with full Merkle roots.
     */
    function anchorEdition(
        string calldata _ipfsCID,
        string calldata _sha256Hash,
        string calldata _note,
        MerkleRoots calldata _roots,
        bytes calldata _authorSignature
    ) external onlyAuthor returns (uint256 editionId) {
        require(!anchoredRoots[_roots.editionRoot], "PublishingKernel: edition root already anchored");

        editionId = editions.length;

        Edition memory newEdition = Edition({
            ipfsCID:           _ipfsCID,
            sha256Hash:        _sha256Hash,
            title:             title,
            note:              _note,
            timestamp:         block.timestamp,
            roots:             _roots,
            supersedesEdition: 0,
            isCanonical:       true,
            isRetracted:       false,
            retractionReason:  "",
            aiModel:           "",
            promptSetHash:     bytes32(0),
            authorSignature:   _authorSignature
        });

        editions.push(newEdition);
        anchoredRoots[_roots.editionRoot] = true;

        emit EditionAnchored(editionId, _ipfsCID, _roots.editionRoot, block.timestamp, _note);
    }

    /**
     * @notice Anchor an edition with AI provenance metadata.
     */
    function anchorEditionWithProvenance(
        string calldata _ipfsCID,
        string calldata _sha256Hash,
        string calldata _note,
        MerkleRoots calldata _roots,
        bytes calldata _authorSignature,
        string calldata _aiModel,
        bytes32 _promptSetHash
    ) external onlyAuthor returns (uint256 editionId) {
        require(!anchoredRoots[_roots.editionRoot], "PublishingKernel: edition root already anchored");

        editionId = editions.length;

        Edition memory newEdition = Edition({
            ipfsCID:           _ipfsCID,
            sha256Hash:        _sha256Hash,
            title:             title,
            note:              _note,
            timestamp:         block.timestamp,
            roots:             _roots,
            supersedesEdition: 0,
            isCanonical:       true,
            isRetracted:       false,
            retractionReason:  "",
            aiModel:           _aiModel,
            promptSetHash:     _promptSetHash,
            authorSignature:   _authorSignature
        });

        editions.push(newEdition);
        anchoredRoots[_roots.editionRoot] = true;

        emit EditionAnchored(editionId, _ipfsCID, _roots.editionRoot, block.timestamp, _note);
    }

    /**
     * @notice Declare that a new edition supersedes an older one.
     */
    function supersede(
        uint256 _oldEditionId,
        uint256 _newEditionId
    ) external onlyAuthor editionExists(_oldEditionId) editionExists(_newEditionId) {
        require(_newEditionId > _oldEditionId, "PublishingKernel: new must be after old");
        require(!editions[_oldEditionId].isRetracted, "PublishingKernel: cannot supersede retracted edition");

        editions[_newEditionId].supersedesEdition = _oldEditionId + 1;
        editions[_oldEditionId].isCanonical = false;

        emit EditionSuperseded(_oldEditionId, _newEditionId);
        emit CanonicalityChanged(_oldEditionId, false);
    }

    /**
     * @notice Retract an edition with a reason.
     */
    function retract(
        uint256 _editionId,
        string calldata _reason
    ) external onlyAuthor editionExists(_editionId) {
        require(!editions[_editionId].isRetracted, "PublishingKernel: already retracted");

        editions[_editionId].isRetracted       = true;
        editions[_editionId].isCanonical       = false;
        editions[_editionId].retractionReason  = _reason;

        emit EditionRetracted(_editionId, _reason, block.timestamp);
        emit CanonicalityChanged(_editionId, false);
    }

    /**
     * @notice Set canonicality of an edition.
     */
    function setCanonical(
        uint256 _editionId,
        bool _isCanonical
    ) external onlyAuthor editionExists(_editionId) {
        require(!editions[_editionId].isRetracted, "PublishingKernel: cannot canonicalize retracted edition");
        editions[_editionId].isCanonical = _isCanonical;
        emit CanonicalityChanged(_editionId, _isCanonical);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  LICENSE REGISTRY
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @notice Grant a license for an edition.
     */
    function grantLicense(
        uint256 _editionId,
        address _grantee,
        string calldata _templateId,
        string calldata _territory,
        uint256 _termStart,
        uint256 _termEnd,
        string calldata _fieldsOfUse,
        address _royaltyRouter
    ) external onlyAuthor editionExists(_editionId) returns (uint256 licenseId) {
        require(!editions[_editionId].isRetracted, "PublishingKernel: cannot license retracted edition");

        licenseId = licenses.length;

        licenses.push(License({
            editionId:     _editionId,
            grantee:       _grantee,
            templateId:    _templateId,
            territory:     _territory,
            termStart:     _termStart,
            termEnd:       _termEnd,
            fieldsOfUse:   _fieldsOfUse,
            royaltyRouter: _royaltyRouter,
            revoked:       false
        }));

        editionLicenses[_editionId].push(licenseId);
        emit LicenseGranted(licenseId, _editionId, _grantee, _templateId);
    }

    /**
     * @notice Revoke a license.
     */
    function revokeLicense(uint256 _licenseId) external onlyAuthor {
        require(_licenseId < licenses.length, "PublishingKernel: license does not exist");
        require(!licenses[_licenseId].revoked, "PublishingKernel: already revoked");

        licenses[_licenseId].revoked = true;
        emit LicenseRevoked(_licenseId, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  VIEWS
    // ══════════════════════════════════════════════════════════════════════

    function editionCount() external view returns (uint256) {
        return editions.length;
    }

    function licenseCount() external view returns (uint256) {
        return licenses.length;
    }

    function genesis() external view returns (Edition memory) {
        return editions[0];
    }

    function latest() external view returns (Edition memory) {
        return editions[editions.length - 1];
    }

    function getEdition(uint256 _id) external view editionExists(_id) returns (Edition memory) {
        return editions[_id];
    }

    function getLicense(uint256 _id) external view returns (License memory) {
        require(_id < licenses.length, "PublishingKernel: license does not exist");
        return licenses[_id];
    }

    function getEditionLicenses(uint256 _editionId) external view returns (uint256[] memory) {
        return editionLicenses[_editionId];
    }

    /// @notice Verify that an edition root has been anchored.
    function isAnchored(bytes32 _editionRoot) external view returns (bool) {
        return anchoredRoots[_editionRoot];
    }

    /// @notice Find the current canonical edition (latest non-retracted canonical).
    function canonicalEdition() external view returns (uint256 editionId, Edition memory edition) {
        for (uint256 i = editions.length; i > 0; i--) {
            if (editions[i - 1].isCanonical && !editions[i - 1].isRetracted) {
                return (i - 1, editions[i - 1]);
            }
        }
        revert("PublishingKernel: no canonical edition");
    }

    /// @notice Get all Merkle roots for an edition.
    function getEditionRoots(uint256 _editionId) external view editionExists(_editionId)
        returns (MerkleRoots memory)
    {
        return editions[_editionId].roots;
    }
}
