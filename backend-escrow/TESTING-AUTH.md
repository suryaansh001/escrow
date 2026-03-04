# OTP Authentication Testing with cURL

## Prerequisites
- Server running: `node src/server.js`
- cURL installed
- Database connection working

## Manual Testing Steps

### 1. Generate OTP
```bash
curl -X POST http://localhost:3000/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'
```

**Expected Response:**
```json
{
  "message": "OTP generated and sent to email"
}
```

### 2. Get OTP from Database (for testing)
Since email sending might not be configured, retrieve OTP from DB:
```bash
psql $DATABASE_URL -c "SELECT otp FROM OTP WHERE email='testuser@example.com';"
```

Or using SQL directly in node:
```bash
node -e "import { sql } from './src/config/db.js'; (async () => { 
  const result = await sql\`SELECT otp FROM OTP WHERE email='testuser@example.com'\`; 
  console.log(result[0]); 
})()"
```

### 3. Register with OTP
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"SecurePass123!",
    "otp":"123456"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "email": "testuser@example.com"
  }
}
```

### 4. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Quick Test Script
Run the interactive bash script:
```bash
chmod +x scripts/test-auth-curl.sh
./scripts/test-auth-curl.sh
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| Connection refused | Ensure server is running: `node src/server.js` |
| OTP not found | Generate new OTP first |
| Invalid OTP | Check if OTP matches exactly |
| User already exists | Use different email or delete from DB |
| Password validation failed | Check bcrypt comparison in login |
