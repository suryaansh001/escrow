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

## Project structure 

blockchain
│
├── contracts
│ └── Escrow.sol
│
├── scripts
│ └── deploy.js
│
├── test
│
├── hardhat.config.ts
└── package.json


## Development Workflow

1. Write smart contracts in Solidity
2. Compile using Hardhat
3. Deploy contracts locally for testing
4. Later deploy to Ethereum testnet (Sepolia)

## Future Work

Planned improvements include:

- Integrate the decay functions
- Escrow state management
- Dispute resolution mechanisms
- Integration with backend APIs
- Testnet deployment
