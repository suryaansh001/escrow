#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}=== OTP Auth Flow Testing ===${NC}\n"

# Test 1: Generate OTP
echo -e "${BLUE}Step 1: Generating OTP${NC}"
echo "curl -X POST $BASE_URL/auth/otp -H 'Content-Type: application/json' -d '{\"email\":\"suryaanshsharma@jklu.edu.in\"}'"
curl -X POST "$BASE_URL/auth/otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"suryaanshsharma@jklu.edu.in"}' \
  -w "\n\n"

echo -e "${BLUE}Check your email for OTP (or check database)${NC}\n"
echo -e "${BLUE}Step 1.5: Get OTP from database (for testing)${NC}"
echo "psql \$DATABASE_URL -c \"SELECT otp FROM OTP WHERE email='suryaanshsharma@jklu.edu.in';\""
echo -e "${RED}Note: Replace with your actual OTP from database${NC}\n"

# Test 2: Register with OTP
echo -e "${BLUE}Step 2: Register with OTP${NC}"
echo "curl -X POST $BASE_URL/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"suryaanshsharma@jklu.edu.in\",\"password\":\"SecurePass123!\",\"otp\":\"<YOUR_OTP>\"}'"
read -p "Enter the OTP you received: " OTP

curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"suryaanshsharma@jklu.edu.in\",\"password\":\"SecurePass123!\",\"otp\":\"$OTP\"}" \
  -w "\n\n"

# Test 3: Login
echo -e "${BLUE}Step 3: Login${NC}"
echo "curl -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"suryaanshsharma@jklu.edu.in\",\"password\":\"SecurePass123!\"}'"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"suryaanshsharma@jklu.edu.in","password":"SecurePass123!"}' \
  -w "\n\n"

echo -e "${GREEN}=== Testing Complete ===${NC}\n"
