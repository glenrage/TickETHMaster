// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import ERC721URIStorage, which itself inherits ERC721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Inherit from ERC721URIStorage and Ownable.
// ERC721URIStorage handles the necessary ERC721 functionalities and overrides.
contract TicketNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    )
        ERC721(name, symbol) // Call the ERC721 constructor (ERC721URIStorage is an ERC721)
        Ownable(initialOwner) // Call the Ownable constructor
    {}

    function mintTicket(
        address to,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI); // Use _setTokenURI from ERC721URIStorage
        return tokenId;
    }

    // We don't need to explicitly override _burn, tokenURI, or supportsInterface here
    // if we are just using the standard ERC721URIStorage behavior.
    // ERC721URIStorage already provides correct implementations for these,
    // inheriting from and overriding ERC721 where necessary.

    // If you *did* need to customize them further, you would then override them
    // from ERC721URIStorage, and those functions in ERC721URIStorage *are* virtual.
    // For example, if ERC721URIStorage had a virtual _burn:
    // function _burn(uint256 tokenId) internal virtual override {
    //     super._burn(tokenId);
    //     // Your custom logic
    // }
    // But for now, we don't need this.
}
