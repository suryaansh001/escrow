// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    enum EscrowStatus {
        None,
        Created,
        Delivered,
        Released,
        Disputed,
        ResolvedBuyer,
        ResolvedSeller,
        Cancelled
    }

    struct EscrowDeal {
        uint256 id;
        address buyer;
        address seller;
        uint256 amountWei;
        EscrowStatus status;
        uint256 createdAt;
        string terms;
    }

    address public owner;
    address public arbiter;
    uint256 public nextEscrowId;

    mapping(uint256 => EscrowDeal) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amountWei,
        string terms
    );
    event EscrowDelivered(uint256 indexed escrowId, address indexed buyer);
    event EscrowReleased(uint256 indexed escrowId, address indexed recipient, uint256 amountWei);
    event EscrowDisputed(uint256 indexed escrowId, address indexed raisedBy, string reason);
    event EscrowResolved(uint256 indexed escrowId, address indexed winner, uint256 amountWei);
    event EscrowCancelled(uint256 indexed escrowId);

    error InvalidSeller();
    error InvalidAmount();
    error EscrowNotFound();
    error Unauthorized();
    error InvalidState();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != arbiter) revert Unauthorized();
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        if (escrows[escrowId].status == EscrowStatus.None) revert EscrowNotFound();
        _;
    }

    constructor(address _arbiter) {
        owner = msg.sender;
        arbiter = _arbiter;
        nextEscrowId = 1;
    }

    function setArbiter(address newArbiter) external onlyOwner {
        if (newArbiter == address(0)) revert Unauthorized();
        arbiter = newArbiter;
    }

    function createEscrow(address seller, string calldata terms) external payable returns (uint256 escrowId) {
        if (seller == address(0) || seller == msg.sender) revert InvalidSeller();
        if (msg.value == 0) revert InvalidAmount();

        escrowId = nextEscrowId++;
        escrows[escrowId] = EscrowDeal({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            amountWei: msg.value,
            status: EscrowStatus.Created,
            createdAt: block.timestamp,
            terms: terms
        });

        emit EscrowCreated(escrowId, msg.sender, seller, msg.value, terms);
    }

    function markDelivered(uint256 escrowId) external escrowExists(escrowId) {
        EscrowDeal storage escrow = escrows[escrowId];
        if (msg.sender != escrow.seller) revert Unauthorized();
        if (escrow.status != EscrowStatus.Created) revert InvalidState();

        escrow.status = EscrowStatus.Delivered;
        emit EscrowDelivered(escrowId, escrow.buyer);
    }

    function releaseFunds(uint256 escrowId) external escrowExists(escrowId) {
        EscrowDeal storage escrow = escrows[escrowId];
        if (msg.sender != escrow.buyer && msg.sender != arbiter) revert Unauthorized();
        if (escrow.status != EscrowStatus.Created && escrow.status != EscrowStatus.Delivered) revert InvalidState();

        escrow.status = EscrowStatus.Released;
        uint256 amount = escrow.amountWei;
        escrow.amountWei = 0;

        payable(escrow.seller).transfer(amount);
        emit EscrowReleased(escrowId, escrow.seller, amount);
    }

    function raiseDispute(uint256 escrowId, string calldata reason) external escrowExists(escrowId) {
        EscrowDeal storage escrow = escrows[escrowId];
        if (msg.sender != escrow.buyer && msg.sender != escrow.seller) revert Unauthorized();
        if (escrow.status != EscrowStatus.Created && escrow.status != EscrowStatus.Delivered) revert InvalidState();

        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }

    function resolveDispute(uint256 escrowId, bool releaseToSeller) external escrowExists(escrowId) onlyArbiter {
        EscrowDeal storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Disputed) revert InvalidState();

        uint256 amount = escrow.amountWei;
        escrow.amountWei = 0;

        if (releaseToSeller) {
            escrow.status = EscrowStatus.ResolvedSeller;
            payable(escrow.seller).transfer(amount);
            emit EscrowResolved(escrowId, escrow.seller, amount);
        } else {
            escrow.status = EscrowStatus.ResolvedBuyer;
            payable(escrow.buyer).transfer(amount);
            emit EscrowResolved(escrowId, escrow.buyer, amount);
        }
    }

    function cancelEscrow(uint256 escrowId) external escrowExists(escrowId) {
        EscrowDeal storage escrow = escrows[escrowId];
        if (msg.sender != escrow.buyer) revert Unauthorized();
        if (escrow.status != EscrowStatus.Created) revert InvalidState();

        escrow.status = EscrowStatus.Cancelled;
        uint256 amount = escrow.amountWei;
        escrow.amountWei = 0;
        payable(escrow.buyer).transfer(amount);

        emit EscrowCancelled(escrowId);
    }
}