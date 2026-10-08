// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EnvironmentalAssetMock is ERC721 {
    uint256 private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        ++_tokenIdCounter;
        _mint(to, tokenId);
        return tokenId;
    }

    function approveFor(address to, uint256 tokenId) public virtual returns (bool) {
        _approve(to, tokenId);
        return true;
    }
}
