import { sql } from "../../src/config/db.js";
import bcrypt from 'bcrypt';
import { info, error as _error } from "../../src/utils/logger.js";
import { validateEmail, validatePhoneNumber } from "../../src/utils/validation.js";
import { sendOtp } from "../../src/utils/otp.js";
import { verifyOtp } from "../auth/auth.controller.js";
import { generateOtp } from "../auth/auth.helpers.js";

async function updateuserProfile(req, res) {
    try {
        const userId = req.user.id;
        const { email, phone_number } = req.body;

        if (!email && !phone_number) {
            return res.status(400).json({ error: 'At least one field (email or phone number) is required. Name cannot be updated as it is fetched from Aadhaar/PAN records.' });
        }
        const userData = await sql`SELECT * FROM users WHERE id = ${userId}`;
        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update phone number if provided
        if (phone_number) {
            validatePhoneNumber(phone_number);
            await sql`
                UPDATE users 
                SET phone_number = ${phone_number} 
                WHERE id = ${userId}
            `;
        }

        // Handle email update with OTP verification
        if (email) {
            validateEmail(email);
            // Check if the new email is already taken by another user
            const existingUser = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${userId}`;
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email is already in use by another account' });
            }
            const otp = generateOtp();
            
            // Store OTP in database
            await sql`
                INSERT INTO otp_requests (email, otp, is_used) 
                VALUES (${email}, ${otp}, false) 
                ON CONFLICT (email) DO UPDATE SET 
                  otp = EXCLUDED.otp,
                  is_used = false,
                  created_at = CURRENT_TIMESTAMP,
                  expires_at = (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
            `;
            
            await sendOtp(email, otp);
            return res.status(200).json({ message: 'OTP sent to the new email address. Please verify to complete the email update.' });
        }

        const updatedUser = await sql`
            SELECT id, full_name, email, phone_number FROM users WHERE id = ${userId}
        `;

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser[0] });
    } catch (error) {
        _error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifyEmailChange(req, res) {
    try {
        const userId = req.user.id;
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const isValidOtp = await verifyOtp(email, otp);
        if (!isValidOtp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        const updatedUser = await sql`
            UPDATE users 
            SET email = ${email} 
            WHERE id = ${userId} 
            RETURNING id, email, full_name, phone_number
        `;

        if (updatedUser.length === 0) {
            return res.status(400).json({ error: 'Failed to update email' });
        }

        // Mark OTP as used
        await sql`
            UPDATE otp_requests 
            SET is_used = true 
            WHERE email = ${email} AND otp = ${otp}
        `;

        res.status(200).json({ message: 'Email updated successfully', user: updatedUser[0] });
    } catch (error) {
        _error('Error verifying email change:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function setSecurityPin(req, res) {
    try {
        const userId = req.user.id;
        const { pin } = req.body;

        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            return res.status(400).json({ error: 'Security PIN must be exactly 6 digits' });
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        await sql`
            UPDATE users
            SET security_pin_hash = ${hashedPin}, updated_at = NOW()
            WHERE id = ${userId}
        `;

        info(`Security PIN set for user ${userId}`);
        return res.status(200).json({ message: 'Security PIN set successfully' });
    } catch (error) {
        console.error('Error setting security PIN:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifySecurityPin(req, res) {
    try {
        const userId = req.user.id;
        const { pin } = req.body;

        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            return res.status(400).json({ error: 'Security PIN must be exactly 6 digits' });
        }

        const userData = await sql`SELECT security_pin_hash FROM users WHERE id = ${userId}`;
        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!userData[0].security_pin_hash) {
            return res.status(400).json({ error: 'Security PIN not set' });
        }

        const isValidPin = await bcrypt.compare(pin, userData[0].security_pin_hash);
        if (!isValidPin) {
            return res.status(401).json({ error: 'Invalid security PIN' });
        }

        return res.status(200).json({ message: 'Security PIN verified successfully' });
    } catch (error) {
        console.error('Error verifying security PIN:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateSecurityPin(req, res) {
    try {
        const userId = req.user.id;
        const { currentPin, newPin } = req.body;

        if (!currentPin || !newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
            return res.status(400).json({ error: 'Both current and new PINs must be exactly 6 digits' });
        }

        const userData = await sql`SELECT security_pin_hash FROM users WHERE id = ${userId}`;
        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!userData[0].security_pin_hash) {
            return res.status(400).json({ error: 'Security PIN not set' });
        }

        const isValidCurrentPin = await bcrypt.compare(currentPin, userData[0].security_pin_hash);
        if (!isValidCurrentPin) {
            return res.status(401).json({ error: 'Current security PIN is incorrect' });
        }

        const hashedNewPin = await bcrypt.hash(newPin, 10);

        await sql`
            UPDATE users
            SET security_pin_hash = ${hashedNewPin}, updated_at = NOW()
            WHERE id = ${userId}
        `;

        info(`Security PIN updated for user ${userId}`);
        return res.status(200).json({ message: 'Security PIN updated successfully' });
    } catch (error) {
        console.error('Error updating security PIN:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export { updateuserProfile, verifyEmailChange, setSecurityPin, verifySecurityPin, updateSecurityPin };

/**
 * POST /settings/kyc-verify
 * Simulated KYC approval:
 *  - Sets kyc_status = 'verified'
 *  - Sets bank_verified = true (simulating bank link in the same step)
 *  - Sets reliability_score = 0.5 (r_base per the math model)
 *  - Logs the change to reliability_history
 */
export async function verifyKyc(req, res) {
    try {
        const userId = req.user.id;

        // Get current score for history log
        const current = await sql`
            SELECT reliability_score, kyc_status FROM users WHERE id = ${userId}
        `;
        if (current.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If already verified, just return success — idempotent
        if (current[0].kyc_status === 'verified') {
            return res.status(200).json({
                success: true,
                message: 'KYC already verified',
                reliability_score: parseFloat(current[0].reliability_score),
                kyc_status: 'verified',
            });
        }

        const prevScore = parseFloat(current[0].reliability_score);
        const newScore = 0.5; // r_base from system_config

        // Update user: mark KYC verified, set base reliability score
        await sql`
            UPDATE users
            SET
                kyc_status        = 'verified',
                kyc_verified_at   = NOW(),
                bank_verified     = TRUE,
                bank_verified_at  = NOW(),
                reliability_score = ${newScore},
                updated_at        = NOW()
            WHERE id = ${userId}
        `;

        // Log the score change to reliability_history (best-effort)
        try {
            await sql`
                INSERT INTO reliability_history
                    (user_id, r_previous, r_new, change_reason, alpha)
                VALUES
                    (${userId}, ${prevScore}, ${newScore}, 'kyc_verified', 0)
            `;
        } catch (_) {
            // reliability_history may not exist — non-fatal
        }

        return res.status(200).json({
            success: true,
            message: 'KYC verified successfully. Reliability score set to 0.5.',
            reliability_score: newScore,
            kyc_status: 'verified',
        });
    } catch (error) {
        console.error('KYC verify error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}