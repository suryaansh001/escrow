import { sql } from "../../src/config/db.js";
import { getEscrowContractEvents } from "./blockchain.service.js";

const EVENT_STATE_MAP = {
  EscrowCreated: "created",
  EscrowReleased: "released",
  EscrowDisputed: "disputed",
  EscrowResolved: "resolved",
  EscrowCancelled: "cancelled",
};

export async function runEscrowSyncOnce() {
  await sql`
    CREATE TABLE IF NOT EXISTS chain_sync_cursor (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      last_processed_block BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO chain_sync_cursor (id, last_processed_block)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `;

  const cursor = await sql`
    SELECT last_processed_block
    FROM chain_sync_cursor
    WHERE id = 1
  `;

  const fromBlock = Number(cursor[0]?.last_processed_block || 0) + 1;
  const events = await getEscrowContractEvents(fromBlock, "latest");
  if (!events.length) return { synced: 0, lastProcessedBlock: fromBlock - 1 };

  let lastProcessed = fromBlock - 1;
  for (const event of events) {
    const onchainStatus = EVENT_STATE_MAP[event.eventName];
    if (!onchainStatus) continue;

    await sql`
      UPDATE escrows
      SET
        onchain_status = ${onchainStatus},
        state = CASE
          WHEN ${onchainStatus} = 'resolved' THEN state
          ELSE ${onchainStatus}::escrow_state
        END,
        updated_at = NOW()
      WHERE onchain_escrow_id = ${event.escrowId}
    `;

    lastProcessed = Math.max(lastProcessed, event.blockNumber);
  }

  await sql`
    INSERT INTO chain_sync_cursor (id, last_processed_block, updated_at)
    VALUES (1, ${lastProcessed}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      last_processed_block = EXCLUDED.last_processed_block,
      updated_at = NOW()
  `;

  return { synced: events.length, lastProcessedBlock: lastProcessed };
}

export function startEscrowSyncWorker(intervalMs = 20_000) {
  if (process.env.ESCROW_SYNC_ENABLED !== "true") {
    return () => {};
  }

  const run = async () => {
    try {
      const result = await runEscrowSyncOnce();
      if (result.synced > 0) {
        console.log("[escrow-sync] synced events:", result);
      }
    } catch (error) {
      console.error("[escrow-sync] failed:", error.message);
    }
  };

  run();
  const timer = setInterval(run, intervalMs);
  return () => clearInterval(timer);
}
