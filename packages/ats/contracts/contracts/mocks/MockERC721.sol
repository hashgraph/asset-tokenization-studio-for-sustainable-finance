// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';

/**
 * @title MockERC721
 * @notice Mock ERC721 token for environmental assets testing
 */
contract MockERC721 is ERC721 {
    uint256 private _nextTokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _nextTokenId = 1;
    }

    function mint(address to) external returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId++;
        _mint(to, tokenId);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}