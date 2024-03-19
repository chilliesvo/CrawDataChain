// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20("ERC20Mock", "ERC20") {
    uint256 public lastId;

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
