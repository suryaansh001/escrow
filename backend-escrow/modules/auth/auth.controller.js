import bcrypt from 'bcrypt';
import { sql } from '../../src/config/db.js';
import { jwtSign } from '../utils/jwt.js';
import emailjs from '@emailjs/nodejs';
import { registerValidation, loginValidation } from './auth.validator.js';
import { generateOtp } from './auth.helpers.js';

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

async function register(req, res) {
    try {
        const body = req.body;
        const { error } = registerValidation(body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        const isValidOtp = await verifyOtp(body.email, body.otp);
        if (!isValidOtp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        
        const hashedPassword = await bcrypt.hash(body.password, 10);
        
        const newUser = await sql`
            INSERT INTO users (email, password_hash, full_name, phone) 
            VALUES (${body.email}, ${hashedPassword}, ${body.name || null}, ${body.phone || null}) 
            RETURNING id, email
        `;
        
        await sql`
            UPDATE otp_requests 
            SET is_used = true 
            WHERE email = ${body.email} AND otp = ${body.otp}
        `;
        
        if (newUser.length === 0) {
            return res.status(400).json({ error: 'Failed to create user' });
        }
        
        res.status(201).json({ user: newUser[0] });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}   

async function login(req, res) {
    try {
        const body = req.body;
        const { error } = loginValidation(body);
        if (error) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const user = await sql`SELECT * FROM users WHERE email = ${body.email}`;
        if (user.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const validPassword = await bcrypt.compare(body.password, user[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = jwtSign({ id: user[0].id, email: user[0].email, phone: user[0].phone });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function otpgeneration(req, res) {
    try {
        const body = req.body;
        if (!body.email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const otp = generateOtp();
        
        await sql`
            INSERT INTO otp_requests (email, phone, otp, is_used) 
            VALUES (${body.email}, ${body.phone_number || null}, ${otp}, false) 
            ON CONFLICT (email) DO UPDATE SET 
              otp = EXCLUDED.otp,
              phone = EXCLUDED.phone,
              is_used = false,
              created_at = CURRENT_TIMESTAMP,
              expires_at = (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
        `;
        
        try {
            await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, {
                passcode: otp,
                email: body.email
            });
            console.log(`✓ OTP sent to ${body.email}: ${otp}`);
            return res.status(200).json({ message: 'OTP generated and sent to email' });
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError.message);
            return res.status(200).json({ message: 'OTP generated (email delivery failed)', otp: otp });
        }
    } catch (error) {
        console.error('Error during OTP generation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifyOtp(email, otp) {
    try {
        const record = await sql`
            SELECT * FROM otp_requests 
            WHERE email = ${email} 
            AND otp = ${otp}
            AND is_used = false
            AND expires_at > CURRENT_TIMESTAMP
        `;
        return record.length > 0;
    } catch (error) {
        console.error('Error during OTP verification:', error);
        throw new Error('Internal server error');
    }
}

export { register, login, otpgeneration, verifyOtp };