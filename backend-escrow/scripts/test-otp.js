import { sql } from '../src/config/db.js';

async function testOtpLogic() {
  try {
    console.log('🧪 Testing OTP Logic...\n');

    // Test 1: Insert OTP
    console.log('Test 1: Inserting OTP...');
    const testEmail = 'sharmadev0042@gmail.com';
    const testOtp = '123456';
    
    await sql`
      INSERT INTO OTP (email, otp) 
      VALUES (${testEmail}, ${testOtp}) 
      ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp
    `;
    console.log('✓ OTP inserted successfully\n');

    // Test 2: Retrieve OTP
    console.log('Test 2: Retrieving OTP...');
    const record = await sql`SELECT * FROM OTP WHERE email = ${testEmail}`;
    console.log('✓ Retrieved record:', record[0], '\n');

    // Test 3: Verify OTP (correct OTP)
    console.log('Test 3: Verifying correct OTP...');
    const correctRecord = await sql`SELECT * FROM OTP WHERE email = ${testEmail} AND otp = ${testOtp}`;
    console.log('✓ Correct OTP verification:', correctRecord.length > 0 ? 'PASS' : 'FAIL', '\n');

    // Test 4: Verify OTP (incorrect OTP)
    console.log('Test 4: Verifying incorrect OTP...');
    const incorrectRecord = await sql`SELECT * FROM OTP WHERE email = ${testEmail} AND otp = '999999'`;
    console.log('✓ Incorrect OTP verification:', incorrectRecord.length === 0 ? 'PASS' : 'FAIL', '\n');

    // Test 5: Clean up
    console.log('Test 5: Cleaning up test data...');
    await sql`DELETE FROM OTP WHERE email = ${testEmail}`;
    console.log('✓ Test data deleted\n');

    console.log('✅ All OTP tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during OTP testing:', error);
    process.exit(1);
  }
}

testOtpLogic();
