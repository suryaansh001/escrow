import { sql } from '../src/config/db.js';

async function seedSampleData() {
  try {
    console.log('Seeding sample data...\n');

    // Create sample users
    console.log('Creating sample users...');
    const users = [
      { email: 'buyer1@example.com', password: '$2b$10$hashedpassword1', full_name: 'Alice Johnson', reliability_score: 0.8 },
      { email: 'buyer2@example.com', password: '$2b$10$hashedpassword2', full_name: 'Bob Smith', reliability_score: 0.6 },
      { email: 'seller1@example.com', password: '$2b$10$hashedpassword3', full_name: 'Carol Williams', reliability_score: 0.9 },
      { email: 'seller2@example.com', password: '$2b$10$hashedpassword4', full_name: 'David Brown', reliability_score: 0.7 },
      { email: 'admin@example.com', password: '$2b$10$hashedpassword5', full_name: 'Admin User', reliability_score: 1.0 }
    ];

    for (const user of users) {
      await sql`
        INSERT INTO users (email, password_hash, full_name, reliability_score, kyc_status, bank_verified)
        VALUES (${user.email}, ${user.password}, ${user.full_name}, ${user.reliability_score}, 'verified', true)
        ON CONFLICT (email) DO NOTHING
      `;
    }
    console.log('✓ Sample users created\n');

    // Get user IDs
    const userRecords = await sql`SELECT id, email FROM users`;
    const userMap = Object.fromEntries(userRecords.map(u => [u.email, u.id]));

    // Create sample escrows
    console.log('Creating sample escrows...');
    const escrows = [
      {
        buyer_id: userMap['buyer1@example.com'],
        seller_id: userMap['seller1@example.com'],
        amount: 50000,
        description: 'Website development project',
        state: 'released'
      },
      {
        buyer_id: userMap['buyer2@example.com'],
        seller_id: userMap['seller2@example.com'],
        amount: 25000,
        description: 'Graphic design services',
        state: 'locked'
      },
      {
        buyer_id: userMap['buyer1@example.com'],
        seller_id: userMap['seller2@example.com'],
        amount: 75000,
        description: 'Mobile app development',
        state: 'funded'
      },
      {
        buyer_id: userMap['buyer2@example.com'],
        seller_id: userMap['seller1@example.com'],
        amount: 15000,
        description: 'Consulting services',
        state: 'created'
      }
    ];

    for (const escrow of escrows) {
      await sql`
        INSERT INTO escrows (buyer_id, seller_id, amount, description, state, buyer_r_at_creation, seller_r_at_creation)
        VALUES (
          ${escrow.buyer_id}, ${escrow.seller_id}, ${escrow.amount}, ${escrow.description}, ${escrow.state},
          (SELECT reliability_score FROM users WHERE id = ${escrow.buyer_id}),
          (SELECT reliability_score FROM users WHERE id = ${escrow.seller_id})
        )
      `;
    }
    console.log('✓ Sample escrows created\n');

    // Create sample transactions
    console.log('Creating sample transactions...');
    const escrowRecords = await sql`SELECT id, buyer_id, seller_id, amount FROM escrows ORDER BY created_at DESC LIMIT 4`;

    for (const escrow of escrowRecords) {
      await sql`
        INSERT INTO transactions (user_id, escrow_id, type, status, amount)
        VALUES (${escrow.buyer_id}, ${escrow.id}, 'escrow_lock', 'completed', ${escrow.amount})
      `;
    }
    console.log('✓ Sample transactions created\n');

    // Create sample suspicion logs
    console.log('Creating sample suspicion logs...');
    for (const escrow of escrowRecords) {
      const zScore = Math.random() * 4 - 2; // Random Z-score between -2 and 2
      const cusumValue = Math.random() * 10; // Random CUSUM value
      const surgeRatio = Math.random() * 2; // Random surge ratio
      const fScore = 0.4 * Math.min(1, Math.abs(zScore) / 6) + 0.35 * Math.min(1, cusumValue / 5) + 0.25 * Math.min(1, surgeRatio / 6);

      await sql`
        INSERT INTO suspicion_logs (
          user_id, transaction_id, z_score, cusum_value, surge_ratio, f_score,
          action, window_mean, window_stddev, avg_daily_txn, txn_24h_volume
        ) VALUES (
          ${escrow.buyer_id}, ${escrow.id}, ${zScore}, ${cusumValue}, ${surgeRatio}, ${fScore},
          'normal', ${escrow.amount * 0.8}, ${escrow.amount * 0.2}, 1, ${escrow.amount}
        )
      `;
    }
    console.log('✓ Sample suspicion logs created\n');

    console.log('✓ Sample data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding sample data:', error.message);
    process.exit(1);
  }
}

seedSampleData();