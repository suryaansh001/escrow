import fs from "node:fs/promises";
import path from "node:path";
import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const arbiter =
    process.env.ESCROW_ARBITER_ADDRESS || deployer.account.address;

  const escrow = await viem.deployContract("Escrow", [arbiter]);
  const publicClient = await viem.getPublicClient();
  const chainId = Number(publicClient.chain?.id || process.env.BLOCKCHAIN_CHAIN_ID || 31337);

  const deployment = {
    contractName: "Escrow",
    network: network.name,
    chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.account.address,
    arbiter,
    address: escrow.address,
  };

  const targetPath = path.resolve(
    process.cwd(),
    "artifacts",
    "deployment.json",
  );
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(deployment, null, 2));

  const frontendTargetPath = path.resolve(
    process.cwd(),
    "..",
    "secure-escrow-hub",
    "src",
    "lib",
    "escrowDeployment.json",
  );
  await fs.mkdir(path.dirname(frontendTargetPath), { recursive: true });
  await fs.writeFile(frontendTargetPath, JSON.stringify(deployment, null, 2));

  const backendTargetPath = path.resolve(
    process.cwd(),
    "..",
    "backend-escrow",
    "modules",
    "escrow",
    "escrow.deployment.json",
  );
  await fs.mkdir(path.dirname(backendTargetPath), { recursive: true });
  await fs.writeFile(backendTargetPath, JSON.stringify(deployment, null, 2));

  console.log("Escrow deployed:", deployment);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});