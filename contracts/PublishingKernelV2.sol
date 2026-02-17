// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title PublishingKernelV2
 * @notice Literary Protocol Standard v2 (LPS-2) — Hardened Publishing Kernel.
 *
 * Upgrades PublishingKernel v1 with:
 *   - ECDSA signature enforcement (cryptographic author proof)
 *   - Cached canonical edition ID for O(1) lookup
 *   - CanonicalSnapshot event for immutable historical record
 *   - Edition freeze (seal) — no more modifications after freeze
 *   - Timelock on destructive operations (retract, revoke)
 *   - Optional admin role (multi-sig ready)
 *   - Predecessor kernel lineage (v1 → v2 chain)
 *
 * @dev LPS-1 Reference Implementation.
 */
contract PublishingKernelV2 {
    using ECDSA for bytes32;

    // ══════════════════════════════════════════════════════════════════════
    //  CONSTANTS
    // ══════════════════════════════════════════════════════════════════════

    uint256 public constant TIMELOCK_DURATION = 48 hours;
    uint256 public constant VERSION = 2;

    // ══════════════════════════════════════════════════════════════════════
    //  STRUCTS
    // ══════════════════════════════════════════════════════════════════════

    struct MerkleRoots {
        bytes32 manuscriptRoot;
        bytes32 artifactRoot;
        bytes32 imageRoot;
        bytes32 promptRoot;
        bytes32 editionRoot;
    }

    struct Edition {
        string  ipfsCID;
        string  sha256Hash;
        string  title;
        string  note;
        uint256 timestamp;
        MerkleRoots roots;
        uint256 supersedesEdition;
        bool    isCanonical;
        bool    isRetracted;
        string  retractionReason;
        string  aiModel;
        bytes32 promptSetHash;
        bytes   authorSignature;
        bool    isFrozen;
    }

    struct License {
        uint256 editionId;
        address grantee;
        string  templateId;
        string  territory;
        uint256 termStart;
        uint256 termEnd;
        string  fieldsOfUse;
        address royaltyRouter;
        bool    revoked;
    }

    struct TimelockAction {
        uint256 targetId;
        uint8   actionType;      // 0 = retract, 1 = revokeLicense
        string  reason;
        uint256 proposedAt;
        bool    executed;
        bool    cancelled;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════════

    address public immutable author;
    string  public title;
    address public immutable genesisAnchor;
    address public immutable predecessorKernel;

    address public admin;

    Edition[]        public editions;
    License[]        public licenses;
    TimelockAction[] public timelockActions;

    uint256 public canonicalEditionId;
    bool    public hasCanonical;

    mapping(uint256 => uint256[]) public editionLicenses;
    mapping(bytes32 => bool)      public anchoredRoots;

    // ══════════════════════════════════════════════════════════════════════
    //  EVENTS
    // ══════════════════════════════════════════════════════════════════════

    event EditionAnchored(uint256 indexed editionId, string ipfsCID, bytes32 editionRoot, uint256 timestamp, string note);
    event EditionSuperseded(uint256 indexed oldEditionId, uint256 indexed newEditionId);
    event EditionRetracted(uint256 indexed editionId, string reason, uint256 timestamp);
    event CanonicalityChanged(uint256 indexed editionId, bool isCanonical);
    event CanonicalSnapshot(uint256 indexed editionId, bytes32 editionRoot, string ipfsCID, string sha256Hash, uint256 timestamp);
    event EditionFrozen(uint256 indexed editionId, uint256 timestamp);
    event LicenseGranted(uint256 indexed licenseId, uint256 indexed editionId, address indexed grantee, string templateId);
    event LicenseRevoked(uint256 indexed licenseId, uint256 timestamp);
    event TimelockProposed(uint256 indexed actionId, uint8 actionType, uint256 targetId, uint256 executeAfter);
    event TimelockExecuted(uint256 indexed actionId);
    event TimelockCancelled(uint256 indexed actionId);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event SignatureVerified(uint256 indexed editionId, address signer, bytes32 editionRoot);

    // ══════════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ══════════════════════════════════════════════════════════════════════

    modifier onlyAuthor() {
        require(msg.sender == author, "PKv2: caller is not the author");
        _;
    }

    modifier onlyAuthorOrAdmin() {
        require(msg.sender == author || msg.sender == admin, "PKv2: caller is not author or admin");
        _;
    }

    modifier editionExists(uint256 _editionId) {
        require(_editionId < editions.length, "PKv2: edition does not exist");
        _;
    }

    modifier editionNotFrozen(uint256 _editionId) {
        require(!editions[_editionId].isFrozen, "PKv2: edition is frozen");
        _;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════

    constructor(
        string memory _title,
        string memory _ipfsCID,
        string memory _sha256Hash,
        MerkleRoots memory _roots,
        address _genesisAnchor,
        address _predecessorKernel,
        bytes memory _authorSignature
    ) {
        _verifySignature(_roots.editionRoot, _authorSignature, msg.sender);

        author            = msg.sender;
        admin             = msg.sender;
        title             = _title;
        genesisAnchor     = _genesisAnchor;
        predecessorKernel = _predecessorKernel;

        Edition memory genesisEdition = Edition({
            ipfsCID:           _ipfsCID,
            sha256Hash:        _sha256Hash,
            title:             _title,
            note:              "Genesis - Literary Protocol Standard v2",
            timestamp:         block.timestamp,
            roots:             _roots,
            supersedesEdition: 0,
            isCanonical:       true,
            isRetracted:       false,
            retractionReason:  "",
            aiModel:           "",
            promptSetHash:     bytes32(0),
            authorSignature:   _authorSignature,
            isFrozen:          false
        });

        editions.push(genesisEdition);
        anchoredRoots[_roots.editionRoot] = true;
        canonicalEditionId = 0;
        hasCanonical       = true;

        emit EditionAnchored(0, _ipfsCID, _roots.editionRoot, block.timestamp, genesisEdition.note);
        emit SignatureVerified(0, msg.sender, _roots.editionRoot);
        emit CanonicalSnapshot(0, _roots.editionRoot, _ipfsCID, _sha256Hash, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  INTERNAL
    // ══════════════════════════════════════════════════════════════════════

    function _verifySignature(bytes32 _hash, bytes memory _signature, address _expectedSigner) internal pure {
        bytes32 ethSignedHash = ECDSA.toEthSignedMessageHash(_hash);
        address recovered     = ECDSA.recover(ethSignedHash, _signature);
        require(recovered == _expectedSigner, "PKv2: invalid author signature");
    }

    function _updateCanonical(uint256 _editionId) internal {
        canonicalEditionId = _editionId;
        hasCanonical       = true;

        Edition storage ed = editions[_editionId];
        emit CanonicalSnapshot(_editionId, ed.roots.editionRoot, ed.ipfsCID, ed.sha256Hash, block.timestamp);
    }

    function _recalculateCanonical() internal {
        for (uint256 i = editions.length; i > 0; i--) {
            if (editions[i - 1].isCanonical && !editions[i - 1].isRetracted) {
                _updateCanonical(i - 1);
                return;
            }
        }
        hasCanonical = false;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EDITION MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    function anchorEdition(
        string calldata _ipfsCID,
        string calldata _sha256Hash,
        string calldata _note,
        MerkleRoots calldata _roots,
        bytes calldata _authorSignature
    ) external onlyAuthor returns (uint256 editionId) {
        require(!anchoredRoots[_roots.editionRoot], "PKv2: edition root already anchored");
        _verifySignature(_roots.editionRoot, _authorSignature, author);

        editionId = editions.length;

        editions.push(Edition({
            ipfsCID: _ipfsCID, sha256Hash: _sha256Hash, title: title, note: _note,
            timestamp: block.timestamp, roots: _roots, supersedesEdition: 0,
            isCanonical: true, isRetracted: false, retractionReason: "",
            aiModel: "", promptSetHash: bytes32(0), authorSignature: _authorSignature,
            isFrozen: false
        }));

        anchoredRoots[_roots.editionRoot] = true;
        _updateCanonical(editionId);

        emit EditionAnchored(editionId, _ipfsCID, _roots.editionRoot, block.timestamp, _note);
        emit SignatureVerified(editionId, author, _roots.editionRoot);
    }

    function anchorEditionWithProvenance(
        string calldata _ipfsCID,
        string calldata _sha256Hash,
        string calldata _note,
        MerkleRoots calldata _roots,
        bytes calldata _authorSignature,
        string calldata _aiModel,
        bytes32 _promptSetHash
    ) external onlyAuthor returns (uint256 editionId) {
        require(!anchoredRoots[_roots.editionRoot], "PKv2: edition root already anchored");
        _verifySignature(_roots.editionRoot, _authorSignature, author);

        editionId = editions.length;

        editions.push(Edition({
            ipfsCID: _ipfsCID, sha256Hash: _sha256Hash, title: title, note: _note,
            timestamp: block.timestamp, roots: _roots, supersedesEdition: 0,
            isCanonical: true, isRetracted: false, retractionReason: "",
            aiModel: _aiModel, promptSetHash: _promptSetHash,
            authorSignature: _authorSignature, isFrozen: false
        }));

        anchoredRoots[_roots.editionRoot] = true;
        _updateCanonical(editionId);

        emit EditionAnchored(editionId, _ipfsCID, _roots.editionRoot, block.timestamp, _note);
        emit SignatureVerified(editionId, author, _roots.editionRoot);
    }

    function supersede(uint256 _oldEditionId, uint256 _newEditionId)
        external onlyAuthor editionExists(_oldEditionId) editionExists(_newEditionId) editionNotFrozen(_oldEditionId)
    {
        require(_newEditionId > _oldEditionId, "PKv2: new must be after old");
        require(!editions[_oldEditionId].isRetracted, "PKv2: cannot supersede retracted edition");

        editions[_newEditionId].supersedesEdition = _oldEditionId + 1;
        editions[_oldEditionId].isCanonical = false;

        emit EditionSuperseded(_oldEditionId, _newEditionId);
        emit CanonicalityChanged(_oldEditionId, false);
        _recalculateCanonical();
    }

    function setCanonical(uint256 _editionId, bool _isCanonical)
        external onlyAuthor editionExists(_editionId) editionNotFrozen(_editionId)
    {
        require(!editions[_editionId].isRetracted, "PKv2: cannot canonicalize retracted edition");
        editions[_editionId].isCanonical = _isCanonical;
        emit CanonicalityChanged(_editionId, _isCanonical);

        if (_isCanonical) _updateCanonical(_editionId);
        else _recalculateCanonical();
    }

    function freezeEdition(uint256 _editionId) external onlyAuthor editionExists(_editionId) {
        require(!editions[_editionId].isFrozen, "PKv2: already frozen");
        editions[_editionId].isFrozen = true;
        emit EditionFrozen(_editionId, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  TIMELOCK
    // ══════════════════════════════════════════════════════════════════════

    function proposeRetraction(uint256 _editionId, string calldata _reason)
        external onlyAuthorOrAdmin editionExists(_editionId) editionNotFrozen(_editionId)
    {
        require(!editions[_editionId].isRetracted, "PKv2: already retracted");
        uint256 actionId = timelockActions.length;
        timelockActions.push(TimelockAction(_editionId, 0, _reason, block.timestamp, false, false));
        emit TimelockProposed(actionId, 0, _editionId, block.timestamp + TIMELOCK_DURATION);
    }

    function proposeRevocation(uint256 _licenseId) external onlyAuthorOrAdmin {
        require(_licenseId < licenses.length, "PKv2: license does not exist");
        require(!licenses[_licenseId].revoked, "PKv2: already revoked");
        uint256 actionId = timelockActions.length;
        timelockActions.push(TimelockAction(_licenseId, 1, "", block.timestamp, false, false));
        emit TimelockProposed(actionId, 1, _licenseId, block.timestamp + TIMELOCK_DURATION);
    }

    function executeTimelock(uint256 _actionId) external onlyAuthorOrAdmin {
        require(_actionId < timelockActions.length, "PKv2: action does not exist");
        TimelockAction storage action = timelockActions[_actionId];
        require(!action.executed, "PKv2: already executed");
        require(!action.cancelled, "PKv2: action was cancelled");
        require(block.timestamp >= action.proposedAt + TIMELOCK_DURATION, "PKv2: timelock not expired");

        action.executed = true;

        if (action.actionType == 0) {
            _executeRetraction(action.targetId, action.reason);
        } else {
            _executeLicenseRevocation(action.targetId);
        }
        emit TimelockExecuted(_actionId);
    }

    function cancelTimelock(uint256 _actionId) external onlyAuthor {
        require(_actionId < timelockActions.length, "PKv2: action does not exist");
        TimelockAction storage action = timelockActions[_actionId];
        require(!action.executed, "PKv2: already executed");
        require(!action.cancelled, "PKv2: already cancelled");
        action.cancelled = true;
        emit TimelockCancelled(_actionId);
    }

    function _executeRetraction(uint256 _editionId, string memory _reason) internal {
        require(!editions[_editionId].isRetracted, "PKv2: already retracted");
        require(!editions[_editionId].isFrozen, "PKv2: edition is frozen");
        editions[_editionId].isRetracted      = true;
        editions[_editionId].isCanonical      = false;
        editions[_editionId].retractionReason = _reason;
        emit EditionRetracted(_editionId, _reason, block.timestamp);
        emit CanonicalityChanged(_editionId, false);
        _recalculateCanonical();
    }

    function _executeLicenseRevocation(uint256 _licenseId) internal {
        require(!licenses[_licenseId].revoked, "PKv2: already revoked");
        licenses[_licenseId].revoked = true;
        emit LicenseRevoked(_licenseId, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  LICENSE REGISTRY
    // ══════════════════════════════════════════════════════════════════════

    function grantLicense(
        uint256 _editionId, address _grantee, string calldata _templateId,
        string calldata _territory, uint256 _termStart, uint256 _termEnd,
        string calldata _fieldsOfUse, address _royaltyRouter
    ) external onlyAuthor editionExists(_editionId) returns (uint256 licenseId) {
        require(!editions[_editionId].isRetracted, "PKv2: cannot license retracted edition");
        licenseId = licenses.length;
        licenses.push(License(_editionId, _grantee, _templateId, _territory, _termStart, _termEnd, _fieldsOfUse, _royaltyRouter, false));
        editionLicenses[_editionId].push(licenseId);
        emit LicenseGranted(licenseId, _editionId, _grantee, _templateId);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  ADMIN
    // ══════════════════════════════════════════════════════════════════════

    function setAdmin(address _newAdmin) external onlyAuthor {
        address old = admin;
        admin = _newAdmin;
        emit AdminTransferred(old, _newAdmin);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  VIEWS
    // ══════════════════════════════════════════════════════════════════════

    function editionCount() external view returns (uint256) { return editions.length; }
    function licenseCount() external view returns (uint256) { return licenses.length; }
    function timelockCount() external view returns (uint256) { return timelockActions.length; }
    function genesis() external view returns (Edition memory) { return editions[0]; }
    function latest() external view returns (Edition memory) { return editions[editions.length - 1]; }

    function getEdition(uint256 _id) external view editionExists(_id) returns (Edition memory) {
        return editions[_id];
    }

    function getLicense(uint256 _id) external view returns (License memory) {
        require(_id < licenses.length, "PKv2: license does not exist");
        return licenses[_id];
    }

    function getEditionLicenses(uint256 _editionId) external view returns (uint256[] memory) {
        return editionLicenses[_editionId];
    }

    function getTimelockAction(uint256 _id) external view returns (TimelockAction memory) {
        require(_id < timelockActions.length, "PKv2: action does not exist");
        return timelockActions[_id];
    }

    function isAnchored(bytes32 _editionRoot) external view returns (bool) {
        return anchoredRoots[_editionRoot];
    }

    function canonicalEdition() external view returns (uint256 editionId, Edition memory edition) {
        require(hasCanonical, "PKv2: no canonical edition");
        return (canonicalEditionId, editions[canonicalEditionId]);
    }

    function getEditionRoots(uint256 _editionId) external view editionExists(_editionId) returns (MerkleRoots memory) {
        return editions[_editionId].roots;
    }

    function verifySignature(bytes32 _editionRoot, bytes calldata _signature) external view returns (bool valid, address signer) {
        bytes32 ethSignedHash = ECDSA.toEthSignedMessageHash(_editionRoot);
        signer = ECDSA.recover(ethSignedHash, _signature);
        valid  = (signer == author);
    }
}
