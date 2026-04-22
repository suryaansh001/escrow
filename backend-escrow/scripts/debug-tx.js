import { JsonRpcProvider, Interface, getAddress } from "ethers";
import escrowAbi from "../modules/escrow/escrow.abi.json" with { type: "json" };

async function main() {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const blockNumber = await provider.getBlockNumber();
  console.log("Current block:", blockNumber);

  for (let i = blockNumber; i >= Math.max(0, blockNumber - 10); i--) {
    const block = await provider.getBlock(i, true);
    for (const txHash of block.transactions) {
      console.log("Tx:", txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) continue;
      console.log("Logs count:", receipt.logs.length);
      for (const log of receipt.logs) {
        console.log("Log address:", log.address);
        try {
          const iface = new Interface(escrowAbi);
          const parsed = iface.parseLog(log);
          console.log("Parsed:", parsed?.name);
        } catch (e) {
          console.log("Parse error:", e.message);
        }
      }
    }
  }
}

main().catch(console.error);
