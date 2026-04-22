import { JsonRpcProvider, Interface, getAddress } from "ethers";
import escrowAbi from "./escrow.abi.json" with { type: "json" };

const providerUrl = process.env.BLOCKCHAIN_RPC_URL;
const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
const configuredChainId = Number(process.env.BLOCKCHAIN_CHAIN_ID || 0);

if (!providerUrl || !contractAddress) {
  console.warn(
    "Blockchain service is not fully configured. Set BLOCKCHAIN_RPC_URL and ESCROW_CONTRACT_ADDRESS.",
  );
}

const provider = providerUrl ? new JsonRpcProvider(providerUrl) : null;
const iface = new Interface(escrowAbi);

const statusMap = {
  0: "none",
  1: "created",
  2: "delivered",
  3: "released",
  4: "disputed",
  5: "resolved_buyer",
  6: "resolved_seller",
  7: "cancelled",
};

function ensureConfigured() {
  if (!provider || !contractAddress) {
    throw new Error("Blockchain provider or contract address is missing");
  }
}

export async function verifyEscrowCreateTx(txHash) {
  ensureConfigured();
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Create transaction not confirmed on chain");
  }

  const normalizedContract = getAddress(contractAddress);
  const createdLog = receipt.logs
    .filter((log) => getAddress(log.address) === normalizedContract)
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === "EscrowCreated");

  if (!createdLog) {
    throw new Error("EscrowCreated event not found in transaction");
  }

  return {
    escrowId: Number(createdLog.args.escrowId),
    buyerAddress: createdLog.args.buyer,
    sellerAddress: createdLog.args.seller,
    amountWei: createdLog.args.amountWei.toString(),
    blockNumber: Number(receipt.blockNumber),
    chainId: configuredChainId,
    contractAddress,
  };
}

export async function verifyEscrowEventTx(txHash, expectedEventName) {
  ensureConfigured();
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction not confirmed on chain");
  }

  const normalizedContract = getAddress(contractAddress);
  const parsedLog = receipt.logs
    .filter((log) => getAddress(log.address) === normalizedContract)
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === expectedEventName);

  if (!parsedLog) {
    throw new Error(`${expectedEventName} event not found in transaction`);
  }

  return { escrowId: Number(parsedLog.args.escrowId), blockNumber: Number(receipt.blockNumber) };
}

export async function readOnChainEscrow(escrowId) {
  ensureConfigured();
  const contract = new (await import("ethers")).Contract(contractAddress, escrowAbi, provider);
  const data = await contract.escrows(escrowId);
  return {
    escrowId: Number(data.id),
    buyer: data.buyer,
    seller: data.seller,
    amountWei: data.amountWei.toString(),
    onchainStatus: statusMap[Number(data.status)] || "unknown",
    createdAt: Number(data.createdAt),
    terms: data.terms,
  };
}

export async function getEscrowContractEvents(fromBlock, toBlock = "latest") {
  ensureConfigured();
  const normalizedContract = getAddress(contractAddress);
  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: normalizedContract,
  });

  return logs
    .map((log) => {
      try {
        const parsed = iface.parseLog(log);
        return {
          eventName: parsed.name,
          escrowId: Number(parsed.args.escrowId),
          txHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
