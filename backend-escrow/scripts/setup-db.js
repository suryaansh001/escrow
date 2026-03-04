import { sql } from '../src/config/db.js';

async function setupDatabase() {
  try {
    console.log('Setting up database tables...\n');

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Users table created successfully\n');

    // Create otp_requests table
    console.log('Creating otp_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS otp_requests (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
        is_used BOOLEAN DEFAULT FALSE,
        UNIQUE(email)
      )
    `;
    console.log('✓ OTP requests table created successfully\n');

    // Create indexes for better query performance
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_requests(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_requests(expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('✓ Indexes created successfully\n');

    console.log('✓ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
