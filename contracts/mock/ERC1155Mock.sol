// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC1155Mock is ERC1155("https://ipfs/.json") {
    uint256 public lastId;

    function mint(address _to, uint256 _amount) external {
        _mint(_to, ++lastId, _amount, "");
    }

    function mintBatch(address _to, uint256[] memory _amounts) external {
        for (uint256 i = 0; i < _amounts.length; ++i) {
            _mint(_to, ++lastId, _amounts[i], "");
        }
    }
}
