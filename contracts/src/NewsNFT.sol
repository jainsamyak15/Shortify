// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NewsNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;
    mapping(uint256 => string) public newsSummaries;

    constructor() ERC721("NewsNFT", "NNEWS") Ownable(msg.sender) {}

    function mintNewsNFT(string memory _newsSummary, string memory _metadataURI) external {
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _metadataURI);
        newsSummaries[tokenId] = _newsSummary;
        
        nextTokenId++;
    }

    function getNewsSummary(uint256 tokenId) external view returns (string memory) {
        return newsSummaries[tokenId];
    }
}
