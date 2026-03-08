// SPDX-License-Identifier: MIT
// Escrow smart contract for adaptive escrow system
// The intital Structure, more features will be added later
pragma solidity ^0.8.20;


contract Escrow {

    //address of buyer initiationg escrow
    address public buyer;
    //address of seller recieving funds
    address public seller;
    //neutral party responsible for dispute resolution
    address public arbiter;

    bool public fundsReleased;

    constructor(address _buyer, address _seller, address _arbiter) {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
    }

    function releaseFunds() public {
        require(msg.sender == arbiter, "Only arbiter can release funds");

        payable(seller).transfer(address(this).balance);
    }

    receive() external payable {}
}