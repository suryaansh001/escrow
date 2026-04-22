import { BrowserProvider, Contract, parseEther, getAddress, isAddress } from "ethers";
import { escrowAbi } from "./escrowAbi";
import deployment from "./escrowDeployment.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const contractAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || deployment?.address;
const expectedChainId = Number(import.meta.env.VITE_ESCROW_CHAIN_ID || deployment?.chainId || 11155111);

function getEthereum() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required for on-chain escrow operations");
  }
  return window.ethereum;
}

export async function connectWallet() {
  const ethereum = getEthereum();
  const provider = new BrowserProvider(ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== expectedChainId) {
    throw new Error(`Wrong network. Please switch to chain ID ${expectedChainId}.`);
  }
  return { provider, signer, address: await signer.getAddress() };
}

function getContract(signer: Awaited<ReturnType<typeof connectWallet>>["signer"]) {
  if (!contractAddress) {
    throw new Error("Missing VITE_ESCROW_CONTRACT_ADDRESS");
  }
  return new Contract(contractAddress, escrowAbi, signer);
}

export async function createEscrowOnChain(params: {
  sellerAddress: string;
  amountInInr: number;
  terms: string;
}) {
  // Trim whitespace from the address
  const trimmedAddress = params.sellerAddress.trim();

  // Validate seller address is a proper hex address (prevents ENS lookup on local chains)
  if (!isAddress(trimmedAddress)) {
    console.error("Invalid address received:", JSON.stringify(trimmedAddress), "length:", trimmedAddress.length);
    throw new Error(`Invalid seller wallet address "${trimmedAddress}". Please enter a valid Ethereum address (0x followed by 40 hex characters).`);
  }
  // Normalize to checksummed address — this avoids ethers trying ENS resolution
  const normalizedSeller = getAddress(trimmedAddress);

  const { signer } = await connectWallet();
  const contract = getContract(signer);

  // Temporary assumption for prototype: INR entered by user maps 1:1 to test ETH decimals.
  const tx = await contract.createEscrow(
    normalizedSeller,
    params.terms,
    { value: parseEther(String(params.amountInInr)) },
  );
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber };
}
