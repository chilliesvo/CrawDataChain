// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Mock is ERC721("ERC721Mock", "ERC721") {
    uint256 public lastId;

    function mint(address _to, uint256 _amount) external {
        for (uint256 i = 0; i < _amount; ++i) {
            _mint(_to, ++lastId);
        }
    }
}
