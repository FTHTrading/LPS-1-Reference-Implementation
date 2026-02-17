// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AuthorIdentity
 * @notice On-chain author identity declaration for the Literary Protocol Standard.
 *
 * Establishes an immutable, verifiable link between:
 *   - A real-world identity
 *   - A pen name / pseudonym
 *   - A cryptographic wallet
 *   - A publishing bibliography
 *   - External domains and platforms
 *
 * This is a declaration contract — it holds no funds and performs no
 * token operations. Its sole purpose is to anchor provenance metadata
 * on-chain so that any protocol contract can reference it as the
 * authoritative identity source.
 *
 * @dev LPS-1 Reference Implementation.
 */
contract AuthorIdentity {

    // ══════════════════════════════════════════════════════════════════════
    //  STRUCTS
    // ══════════════════════════════════════════════════════════════════════

    struct Identity {
        string realName;
        string nickname;
        string pseudonym;
        string organization;
        string domain;
        string externalAuthorUrl;
    }

    struct PublishedWork {
        string  title;
        string  platform;
        string  identifier;
        uint256 registeredAt;
    }

    struct LinkedContract {
        address contractAddress;
        string  role;
        uint256 linkedAt;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════════

    address public immutable author;
    Identity public identity;

    PublishedWork[]  public bibliography;
    LinkedContract[] public linkedContracts;

    // ══════════════════════════════════════════════════════════════════════
    //  EVENTS
    // ══════════════════════════════════════════════════════════════════════

    event IdentityDeclared(address indexed author, string realName, string pseudonym, string domain);
    event WorkRegistered(uint256 indexed workIndex, string title, string platform);
    event ContractLinked(uint256 indexed linkIndex, address indexed contractAddress, string role);
    event IdentityUpdated(string field, string newValue);

    // ══════════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ══════════════════════════════════════════════════════════════════════

    modifier onlyAuthor() {
        require(msg.sender == author, "Only the author");
        _;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════

    constructor(
        string memory _realName,
        string memory _nickname,
        string memory _pseudonym,
        string memory _organization,
        string memory _domain,
        string memory _externalAuthorUrl
    ) {
        author = msg.sender;

        identity = Identity({
            realName:          _realName,
            nickname:          _nickname,
            pseudonym:         _pseudonym,
            organization:      _organization,
            domain:            _domain,
            externalAuthorUrl: _externalAuthorUrl
        });

        emit IdentityDeclared(msg.sender, _realName, _pseudonym, _domain);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  BIBLIOGRAPHY
    // ══════════════════════════════════════════════════════════════════════

    function registerWork(
        string calldata _title,
        string calldata _platform,
        string calldata _identifier
    ) external onlyAuthor {
        bibliography.push(PublishedWork({
            title:        _title,
            platform:     _platform,
            identifier:   _identifier,
            registeredAt: block.timestamp
        }));
        emit WorkRegistered(bibliography.length - 1, _title, _platform);
    }

    function registerWorksBatch(
        string[] calldata _titles,
        string[] calldata _platforms,
        string[] calldata _identifiers
    ) external onlyAuthor {
        require(
            _titles.length == _platforms.length && _titles.length == _identifiers.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < _titles.length; i++) {
            bibliography.push(PublishedWork({
                title:        _titles[i],
                platform:     _platforms[i],
                identifier:   _identifiers[i],
                registeredAt: block.timestamp
            }));
            emit WorkRegistered(bibliography.length - 1, _titles[i], _platforms[i]);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONTRACT LINKING
    // ══════════════════════════════════════════════════════════════════════

    function linkContract(address _contractAddress, string calldata _role) external onlyAuthor {
        require(_contractAddress != address(0), "Zero address");
        linkedContracts.push(LinkedContract({
            contractAddress: _contractAddress,
            role:            _role,
            linkedAt:        block.timestamp
        }));
        emit ContractLinked(linkedContracts.length - 1, _contractAddress, _role);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  IDENTITY UPDATES
    // ══════════════════════════════════════════════════════════════════════

    function updateDomain(string calldata _domain) external onlyAuthor {
        identity.domain = _domain;
        emit IdentityUpdated("domain", _domain);
    }

    function updateExternalUrl(string calldata _url) external onlyAuthor {
        identity.externalAuthorUrl = _url;
        emit IdentityUpdated("externalAuthorUrl", _url);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  VIEWS
    // ══════════════════════════════════════════════════════════════════════

    function getIdentity() external view returns (Identity memory) { return identity; }
    function getBibliographyCount() external view returns (uint256) { return bibliography.length; }
    function getLinkedContractCount() external view returns (uint256) { return linkedContracts.length; }

    function getWork(uint256 _index) external view returns (PublishedWork memory) {
        require(_index < bibliography.length, "Index out of bounds");
        return bibliography[_index];
    }

    function getLinkedContract(uint256 _index) external view returns (LinkedContract memory) {
        require(_index < linkedContracts.length, "Index out of bounds");
        return linkedContracts[_index];
    }

    function getFullBibliography() external view returns (PublishedWork[] memory) { return bibliography; }
    function getAllLinkedContracts() external view returns (LinkedContract[] memory) { return linkedContracts; }
}
