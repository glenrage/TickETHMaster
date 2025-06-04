// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenMetadataURIs;

    constructor(string memory name, string memory symbol, address initialOwner) ERC721(name, symbol) Ownable(initialOwner) {}

    function mintTicket(address to, string memory metadataURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenMetadataURI(tokenId, metadataURI);
        return tokenId;
    }

    function _setTokenMetadataURI(uint256 tokenId, string memory _metadataURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenMetadataURIs[tokenId] = _metadataURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        string memory storedURI = _tokenMetadataURIs[tokenId];
        // For absolute simplicity in this MVP, if no URI is set, return an empty string.
        // A more robust implementation might revert or return a default URI.
        return storedURI;
    }

    // The Ownable constructor sets the owner to the deployer.
    // We'll transfer ownership to EventManager in the deployment script.
}