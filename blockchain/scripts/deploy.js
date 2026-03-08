const hre = require("hardhat");

async function main() {

  const Escrow = await hre.ethers.getContractFactory("Escrow");

  const escrow = await Escrow.deploy(
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333"
  );

  await escrow.waitForDeployment();

  console.log("Escrow deployed to:", escrow.target);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});