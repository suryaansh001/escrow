# Blockchain Module – Adaptive Escrow System

This module implements the blockchain layer of the Adaptive Escrow System using Ethereum smart contracts.

## Technology Stack

- **Ethereum** – blockchain platform for decentralized escrow transactions
- **Solidity** – programming language for smart contracts
- **Hardhat** – development environment for compiling, testing, and deploying contracts
- **Ethers.js** – interaction layer between the application backend and smart contracts

## Current Implementation

The blockchain module currently includes:

- Initial escrow smart contract (`escrow.sol`)
- Hardhat development environment
- Deployment script for local testing (`deploy.js`)

The escrow smart contract manages:

- Buyer and seller addresses
- Fund custody within the smart contract
- Conditional release of funds
