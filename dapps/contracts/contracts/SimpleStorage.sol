// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    // STATE
    address public owner;
    uint256 public value;
    string public message;

    // EVENTS
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event ValueUpdated(uint256 oldValue, uint256 newValue);

    // MODIFIER
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner);
    }

    // FUNCTION
    function setValue(uint256 _newValue) public onlyOwner {
        uint256 old = value;
        value = _newValue;
        emit ValueUpdated(old, _newValue);
    }

    function setMessage(string calldata _msg) public onlyOwner {
        message = _msg;
    }
}
