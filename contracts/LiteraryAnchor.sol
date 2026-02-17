// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LiteraryAnchor
 * @notice Minimal on-chain anchor for a literary work.
 *         Stores IPFS CID, SHA-256 hash, and author wallet with timestamp.
 *         Supports version history for subsequent editions.
 *
 *         This is not a token. This is not a speculation instrument.
 *         This is proof-of-origin for a literary work.
 *
 * @dev LPS-1 Reference Implementation
 *      Part of the Literary Protocol Standard.
 */
contract LiteraryAnchor {

    // ══════════════════════════════════════════════════════════════════════
    //  STRUCTS
    // ══════════════════════════════════════════════════════════════════════

    struct Edition {
        string  ipfsCID;
        string  sha256Hash;
        uint256 timestamp;
        string  title;
        string  note;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════════

    address public immutable author;
    string  public title;

    Edition[] public editions;

    // ══════════════════════════════════════════════════════════════════════
    //  EVENTS
    // ══════════════════════════════════════════════════════════════════════

    event EditionAnchored(
        uint256 indexed editionIndex,
        string  ipfsCID,
        string  sha256Hash,
        uint256 timestamp
    );

    // ══════════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ══════════════════════════════════════════════════════════════════════

    modifier onlyAuthor() {
        require(msg.sender == author, "Only the author can anchor editions");
        _;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @notice Deploy with the genesis edition.
     * @param _title      The title of the literary work.
     * @param _ipfsCID    The IPFS Content Identifier for the genesis manuscript.
     * @param _sha256Hash The SHA-256 hash of the compiled manuscript.
     */
    constructor(
        string memory _title,
        string memory _ipfsCID,
        string memory _sha256Hash
    ) {
        author = msg.sender;
        title  = _title;

        editions.push(Edition({
            ipfsCID:    _ipfsCID,
            sha256Hash: _sha256Hash,
            timestamp:  block.timestamp,
            title:      _title,
            note:       "Genesis Edition"
        }));

        emit EditionAnchored(0, _ipfsCID, _sha256Hash, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EDITION MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @notice Anchor a new edition or revision.
     * @param _ipfsCID    New IPFS CID.
     * @param _sha256Hash New SHA-256 hash.
     * @param _note       Description of this edition.
     */
    function anchorEdition(
        string calldata _ipfsCID,
        string calldata _sha256Hash,
        string calldata _note
    ) external onlyAuthor {
        uint256 index = editions.length;

        editions.push(Edition({
            ipfsCID:    _ipfsCID,
            sha256Hash: _sha256Hash,
            timestamp:  block.timestamp,
            title:      title,
            note:       _note
        }));

        emit EditionAnchored(index, _ipfsCID, _sha256Hash, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  VIEWS
    // ══════════════════════════════════════════════════════════════════════

    /// @notice Get the genesis (first) edition.
    function genesis() external view returns (Edition memory) {
        return editions[0];
    }

    /// @notice Get the latest edition.
    function latest() external view returns (Edition memory) {
        return editions[editions.length - 1];
    }

    /// @notice Total number of anchored editions.
    function editionCount() external view returns (uint256) {
        return editions.length;
    }
}
