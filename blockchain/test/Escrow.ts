import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("Escrow", async function () {
  const { viem } = await network.connect();

  it("creates escrow and releases to seller", async function () {
    const [buyer, seller] = await viem.getWalletClients();
    const escrow = await viem.deployContract("Escrow", [buyer.account.address]);

    await escrow.write.createEscrow([seller.account.address, "Design delivery"], {
      account: buyer.account,
      value: parseEther("1"),
    });

    const escrowId = await escrow.read.nextEscrowId();
    const createdEscrow = await escrow.read.escrows([escrowId - 1n]);
    assert.equal(String(createdEscrow[1]).toLowerCase(), buyer.account.address.toLowerCase());
    assert.equal(String(createdEscrow[2]).toLowerCase(), seller.account.address.toLowerCase());

    await escrow.write.releaseFunds([escrowId - 1n], { account: buyer.account });
    const releasedEscrow = await escrow.read.escrows([escrowId - 1n]);
    assert.equal(Number(releasedEscrow[4]), 3); // Released
  });

  it("marks dispute and resolves by arbiter", async function () {
    const [arbiter, buyer, seller] = await viem.getWalletClients();
    const escrow = await viem.deployContract("Escrow", [arbiter.account.address]);

    await escrow.write.createEscrow([seller.account.address, "Batch delivery"], {
      account: buyer.account,
      value: parseEther("0.5"),
    });

    await escrow.write.raiseDispute([1n, "Delayed delivery"], {
      account: buyer.account,
    });
    await escrow.write.resolveDispute([1n, false], {
      account: arbiter.account,
    });

    const finalEscrow = await escrow.read.escrows([1n]);
    assert.equal(Number(finalEscrow[4]), 5); // ResolvedBuyer
  });
});
