import { sql } from "../../src/config/db.js";
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

export { updateuserProfile, verifyEmailChange };