const { JsonRpcProvider, Contract } = require('ethers');
const escrowAbi = require('./backend-escrow/modules/escrow/escrow.abi.json');

async function main() {
  const provider = new JsonRpcProvider('http://127.0.0.1:8545');
  const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  
  console.log("Connecting to local blockchain...");
  
  const blockNum = await provider.getBlockNumber();
  console.log(`Current Block Number: ${blockNum}`);

  const contract = new Contract(contractAddress, escrowAbi, provider);
  
  try {
    // Assuming escrow ID 1 was created
    console.log("Fetching Escrow #1 from the smart contract...");
    const escrow1 = await contract.escrows(1);
    
    console.log("\n--- Escrow #1 On-Chain Data ---");
    console.log(`Buyer:  ${escrow1.buyer}`);
    console.log(`Seller: ${escrow1.seller}`);
    console.log(`Amount: ${escrow1.amountWei.toString()} Wei`);
    console.log(`Terms:  ${escrow1.terms}`);
    console.log(`Status: ${escrow1.status.toString()}`); // 1 = created
    console.log("-------------------------------\n");
  } catch (err) {
    console.log("Escrow #1 not found or error reading from contract. Have you created a transaction yet?");
  }
}

main().catch(console.error);
