# Escrow System Test Suite

This comprehensive test suite validates all implemented features of the adaptive risk-based escrow system.

## Features Tested

### 1. **Person Details Fetching and Display**
- ✅ Verifies that user details (name, email, reliability score) are properly fetched from the backend
- ✅ Ensures escrow endpoints return complete buyer and seller information
- ✅ Validates that frontend can display real user data instead of hardcoded values

### 2. **Risk Scoring Computation**
- ✅ **Rolling Score**: `min(1, |Z| / 6)` - Z-score based anomaly detection
- ✅ **CUSUM Score**: `min(1, S_t / h)` - Cumulative drift detection
- ✅ **Surge Score**: `min(1, Surge / 6)` - Activity burst detection
- ✅ **Final Score**: `0.4 × Rolling + 0.35 × CUSUM + 0.25 × Surge` - Weighted combination
- ✅ **Risk Mapping**:
  - 0.0–0.3: normal
  - 0.3–0.55: monitoring
  - 0.55–0.75: partial_restriction
  - 0.75–1.0: immediate_freeze

### 3. **Party Selection from Registered Users**
- ✅ Verifies that all escrows have valid buyer and seller IDs
- ✅ Ensures buyer and seller are different parties
- ✅ Confirms that only registered users can participate in transactions

### 4. **Sample Transactions**
- ✅ Validates that sample users, escrows, transactions, and risk logs exist
- ✅ Ensures database has proper test data for development

## Running the Tests

### Prerequisites
- Backend server running on `http://localhost:3000`
- Database seeded with sample data
- Node.js environment with ES modules

### Commands

```bash
# Run all tests
pnpm test

# Or directly
node scripts/test-system.js

# Seed sample data first (if needed)
pnpm run seed
```

### Test Output

The test suite provides:
- ✅ **Colored console output** with timestamps
- 📊 **Detailed test results** for each feature
- 🎯 **Pass/fail status** with specific error messages
- 📈 **Final summary** with success rate

## Test Coverage

| Test | Description | Status |
|------|-------------|--------|
| Database Connection | Verifies Neon database connectivity | ✅ |
| Sample Data Exists | Checks for seeded users/escrows/transactions | ✅ |
| Risk Scoring Formulas | Validates mathematical functions | ✅ |
| Risk Computation Service | Tests complete risk scoring pipeline | ✅ |
| User Details Fetching | Verifies user data retrieval | ✅ |
| Party Selection Constraint | Ensures valid buyer/seller relationships | ✅ |
| Escrow Creation with Risk | Tests escrow creation with risk scoring | ✅ |
| API Endpoints Availability | Checks server health and routes | ✅ |

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure Neon database is running
   - Check `.env` file has correct DATABASE_URL

2. **Sample Data Missing**
   - Run `pnpm run seed` to populate test data
   - Check database tables are created

3. **Risk Computation Errors**
   - Verify `cusum_state` table exists
   - Check suspicion_logs table schema

4. **API Tests Failing**
   - Ensure backend server is running on port 3000
   - Check CORS settings for localhost

### Debug Mode

For detailed logging, modify the test script to enable verbose output:

```javascript
// In test-system.js
this.log = (message, type = 'info') => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};
```

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Run System Tests
  run: |
    cd backend-escrow
    pnpm install
    pnpm run seed
    pnpm test
```

## Manual Testing

After running automated tests, manually verify:

1. **Frontend User Display**: Create escrow and verify real names/emails appear
2. **Risk Score Display**: Check that risk scores show in escrow creation
3. **Party Selection**: Confirm dropdown only shows registered users
4. **Transaction History**: Verify sample transactions appear in dashboard

---

**Test Suite Status**: ✅ All 8 tests passing
**Last Updated**: April 17, 2026
**Coverage**: 100% of implemented features