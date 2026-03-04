-- Migration: 002_create_otp_requests_table
-- Description: Create otp_requests table for OTP-based authentication

CREATE TABLE IF NOT EXISTS otp_requests (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  otp VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
  is_used BOOLEAN DEFAULT FALSE,
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_requests(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_is_used ON otp_requests(is_used);
