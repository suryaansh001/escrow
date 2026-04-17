#!/usr/bin/env node

/**
 * Comprehensive Test Script for Escrow System
 * Tests all the implemented features:
 * 1. User details fetching and display
 * 2. Risk scoring computation with new formulas
 * 3. Party selection from registered users only
 * 4. Sample transactions functionality
 */

import { sql } from '../src/config/db.js';
import { computeRiskScores, rollingScore, cusumScore, surgeScore, finalScore } from '../modules/risk/risk.services.js';

const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';

class EscrowSystemTester {
    constructor() {
        this.testResults = [];
        this.authToken = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            info: '\x1b[36m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async runTest(testName, testFunction) {
        try {
            this.log(`Running test: ${testName}`, 'info');
            const result = await testFunction();
            this.testResults.push({ test: testName, status: 'PASS', result });
            this.log(`✓ ${testName} PASSED`, 'success');
            return result;
        } catch (error) {
            this.testResults.push({ test: testName, status: 'FAIL', error: error.message });
            this.log(`✗ ${testName} FAILED: ${error.message}`, 'error');
            throw error;
        }
    }

    async testDatabaseConnection() {
        await this.runTest('Database Connection', async () => {
            const result = await sql`SELECT 1 as test`;
            if (result[0].test !== 1) {
                throw new Error('Database connection failed');
            }
            return 'Database connected successfully';
        });
    }

    async testSampleDataExists() {
        await this.runTest('Sample Data Exists', async () => {
            // Check users
            const users = await sql`SELECT COUNT(*) as count FROM users`;
            if (users[0].count < 5) {
                throw new Error(`Expected at least 5 users, found ${users[0].count}`);
            }

            // Check escrows
            const escrows = await sql`SELECT COUNT(*) as count FROM escrows`;
            if (escrows[0].count < 4) {
                throw new Error(`Expected at least 4 escrows, found ${escrows[0].count}`);
            }

            // Check transactions
            const transactions = await sql`SELECT COUNT(*) as count FROM transactions`;
            if (transactions[0].count < 4) {
                throw new Error(`Expected at least 4 transactions, found ${transactions[0].count}`);
            }

            // Check suspicion logs
            const suspicionLogs = await sql`SELECT COUNT(*) as count FROM suspicion_logs`;
            if (suspicionLogs[0].count < 4) {
                throw new Error(`Expected at least 4 suspicion logs, found ${suspicionLogs[0].count}`);
            }

            return `Found ${users[0].count} users, ${escrows[0].count} escrows, ${transactions[0].count} transactions, ${suspicionLogs[0].count} suspicion logs`;
        });
    }

    async testRiskScoringFormulas() {
        await this.runTest('Risk Scoring Formulas', async () => {
            // Test rolling score
            const rolling1 = rollingScore(3);
            const rolling2 = rollingScore(6);
            const rolling3 = rollingScore(0);

            if (rolling1 !== 0.5) throw new Error(`Rolling score for Z=3 should be 0.5, got ${rolling1}`);
            if (rolling2 !== 1) throw new Error(`Rolling score for Z=6 should be 1, got ${rolling2}`);
            if (rolling3 !== 0) throw new Error(`Rolling score for Z=0 should be 0, got ${rolling3}`);

            // Test cusum score
            const cusum1 = cusumScore(2.5, 5);
            const cusum2 = cusumScore(5, 5);

            if (cusum1 !== 0.5) throw new Error(`CUSUM score for S_t=2.5, h=5 should be 0.5, got ${cusum1}`);
            if (cusum2 !== 1) throw new Error(`CUSUM score for S_t=5, h=5 should be 1, got ${cusum2}`);

            // Test surge score
            const surge1 = surgeScore(3);
            const surge2 = surgeScore(6);

            if (surge1 !== 0.5) throw new Error(`Surge score for surge=3 should be 0.5, got ${surge1}`);
            if (surge2 !== 1) throw new Error(`Surge score for surge=6 should be 1, got ${surge2}`);

            // Test final score
            const final = finalScore(3, 2.5, 5, 3);
            const expectedFinal = 0.4 * 0.5 + 0.35 * 0.5 + 0.25 * 0.5; // 0.5

            if (Math.abs(final - expectedFinal) > 0.001) {
                throw new Error(`Final score calculation incorrect. Expected ${expectedFinal}, got ${final}`);
            }

            return 'All risk scoring formulas working correctly';
        });
    }

    async testRiskComputationService() {
        await this.runTest('Risk Computation Service', async () => {
            // Get a user ID from sample data
            const users = await sql`SELECT id FROM users LIMIT 1`;
            if (users.length === 0) {
                throw new Error('No users found for risk computation test');
            }

            const userId = users[0].id;
            const testAmount = 50000;

            const riskScores = await computeRiskScores(userId, testAmount);

            // Verify structure
            const requiredFields = ['zScore', 'cusumValue', 'surgeRatio', 'finalScore', 'riskLevel', 'rollingScore', 'cusumScore', 'surgeScore'];
            for (const field of requiredFields) {
                if (!(field in riskScores)) {
                    throw new Error(`Missing field: ${field} in risk scores response`);
                }
            }

            // Verify ranges
            if (riskScores.finalScore < 0 || riskScores.finalScore > 1) {
                throw new Error(`Final score out of range: ${riskScores.finalScore}`);
            }

            const validLevels = ['normal', 'monitoring', 'partial_restriction', 'immediate_freeze'];
            if (!validLevels.includes(riskScores.riskLevel)) {
                throw new Error(`Invalid risk level: ${riskScores.riskLevel}`);
            }

            // Check if suspicion log was created
            const logs = await sql`SELECT COUNT(*) as count FROM suspicion_logs WHERE user_id = ${userId}`;
            if (logs[0].count === 0) {
                throw new Error('Suspicion log was not created');
            }

            return `Risk computation successful. Final Score: ${(riskScores.finalScore * 100).toFixed(1)}%, Level: ${riskScores.riskLevel}`;
        });
    }

    async testUserDetailsFetching() {
        await this.runTest('User Details Fetching', async () => {
            // Get an escrow with user details (look for one with valid names)
            const escrows = await sql`
                SELECT e.id, e.buyer_id, e.seller_id,
                       b.email as buyer_email, b.full_name as buyer_name,
                       s.email as seller_email, s.full_name as seller_name
                FROM escrows e
                JOIN users b ON e.buyer_id = b.id
                JOIN users s ON e.seller_id = s.id
                WHERE b.full_name IS NOT NULL AND s.full_name IS NOT NULL
                LIMIT 1
            `;

            if (escrows.length === 0) {
                throw new Error('No escrows found with complete user details');
            }

            const escrow = escrows[0];

            // Verify all user details are present
            const requiredFields = ['buyer_email', 'buyer_name', 'seller_email', 'seller_name'];
            for (const field of requiredFields) {
                if (!escrow[field]) {
                    throw new Error(`Missing user detail field: ${field}`);
                }
            }

            return `User details fetched correctly: Buyer ${escrow.buyer_name} (${escrow.buyer_email}), Seller ${escrow.seller_name} (${escrow.seller_email})`;
        });
    }

    async testPartySelectionConstraint() {
        await this.runTest('Party Selection Constraint', async () => {
            // Verify that all escrows have valid buyer and seller IDs that exist in users table
            const invalidEscrows = await sql`
                SELECT COUNT(*) as count FROM escrows e
                LEFT JOIN users b ON e.buyer_id = b.id
                LEFT JOIN users s ON e.seller_id = s.id
                WHERE b.id IS NULL OR s.id IS NULL
            `;

            if (invalidEscrows[0].count > 0) {
                throw new Error(`Found ${invalidEscrows[0].count} escrows with invalid buyer/seller IDs`);
            }

            // Verify that buyer and seller are different
            const samePartyEscrows = await sql`
                SELECT COUNT(*) as count FROM escrows WHERE buyer_id = seller_id
            `;

            if (samePartyEscrows[0].count > 0) {
                throw new Error(`Found ${samePartyEscrows[0].count} escrows where buyer and seller are the same`);
            }

            return 'All escrows have valid, different buyer and seller parties';
        });
    }

    async testEscrowCreationWithRisk() {
        await this.runTest('Escrow Creation with Risk Scoring', async () => {
            // Get two different users
            const users = await sql`SELECT id FROM users LIMIT 2`;
            if (users.length < 2) {
                throw new Error('Need at least 2 users for escrow creation test');
            }

            const buyerId = users[0].id;
            const sellerId = users[1].id;
            const testAmount = 25000;

            // Create escrow (this should trigger risk computation)
            const newEscrow = await sql`
                INSERT INTO escrows (buyer_id, seller_id, amount, description, state, buyer_r_at_creation, suspicion_f_at_lock)
                VALUES (${buyerId}, ${sellerId}, ${testAmount}, 'Test escrow for risk scoring', 'created',
                        (SELECT reliability_score FROM users WHERE id = ${buyerId}),
                        0.0)
                RETURNING id
            `;

            const escrowId = newEscrow[0].id;

            // Compute risk scores
            const riskScores = await computeRiskScores(buyerId, testAmount, escrowId);

            // Update escrow with computed risk score
            await sql`
                UPDATE escrows SET suspicion_f_at_lock = ${riskScores.finalScore}
                WHERE id = ${escrowId}
            `;

            // Verify the escrow was created with risk score
            const escrow = await sql`
                SELECT suspicion_f_at_lock FROM escrows WHERE id = ${escrowId}
            `;

            if (Math.abs(escrow[0].suspicion_f_at_lock - riskScores.finalScore) > 0.001) {
                throw new Error(`Risk score was not properly stored in escrow. Expected: ${riskScores.finalScore}, Got: ${escrow[0].suspicion_f_at_lock}`);
            }

            // Clean up test escrow
            await sql`DELETE FROM suspicion_logs WHERE transaction_id = ${escrowId}`;
            await sql`DELETE FROM escrows WHERE id = ${escrowId}`;

            return `Escrow created successfully with risk score: ${(riskScores.finalScore * 100).toFixed(1)}%`;
        });
    }

    async testAPIEndpoints() {
        await this.runTest('API Endpoints Availability', async () => {
            // Test health check
            const healthResponse = await fetch(`${BASE_URL}/healthz`);
            if (!healthResponse.ok) {
                throw new Error('Health check endpoint not responding');
            }

            // Note: Other endpoints require authentication, so we can't test them without login
            // But we can verify the server is running and routes are registered

            return 'API endpoints are accessible';
        });
    }

    async generateTestReport() {
        console.log('\n' + '='.repeat(60));
        console.log('ESCROW SYSTEM TEST REPORT');
        console.log('='.repeat(60));

        const passed = this.testResults.filter(t => t.status === 'PASS').length;
        const failed = this.testResults.filter(t => t.status === 'FAIL').length;
        const total = this.testResults.length;

        console.log(`\nTest Results: ${passed}/${total} PASSED, ${failed} FAILED\n`);

        this.testResults.forEach(test => {
            const status = test.status === 'PASS' ? '✓' : '✗';
            console.log(`${status} ${test.test}`);
            if (test.result) {
                console.log(`   Result: ${test.result}`);
            }
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
            console.log('');
        });

        console.log('='.repeat(60));

        if (failed === 0) {
            console.log('🎉 ALL TESTS PASSED! The escrow system is working correctly.');
        } else {
            console.log('❌ Some tests failed. Please review the errors above.');
        }

        console.log('='.repeat(60));
    }

    async runAllTests() {
        try {
            this.log('Starting Escrow System Tests...', 'info');

            await this.testDatabaseConnection();
            await this.testSampleDataExists();
            await this.testRiskScoringFormulas();
            await this.testRiskComputationService();
            await this.testUserDetailsFetching();
            await this.testPartySelectionConstraint();
            await this.testEscrowCreationWithRisk();
            await this.testAPIEndpoints();

            this.log('All tests completed!', 'success');

        } catch (error) {
            this.log(`Test suite failed: ${error.message}`, 'error');
        } finally {
            await this.generateTestReport();
            process.exit(this.testResults.some(t => t.status === 'FAIL') ? 1 : 0);
        }
    }
}

// Run the tests
const tester = new EscrowSystemTester();
tester.runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});