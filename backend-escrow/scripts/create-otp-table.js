import { sql } from '../../src/config/db.js';

async function createOtpTable() {
  try {
    console.log('Creating OTP table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS otp_requests (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
        is_used BOOLEAN DEFAULT FALSE,
        UNIQUE(email),
        INDEX idx_email (email),
        INDEX idx_expires (expires_at)
      );
    `;
    
    console.log('✓ OTP table created successfully');
  } catch (error) {
    console.error('Error creating OTP table:', error);
    throw error;
  }
}

createOtpTable();
