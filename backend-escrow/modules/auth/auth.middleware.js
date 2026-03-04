import jwt from 'jsonwebtoken';
import { jwtVerify } from '../utils/jwt.js';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwtVerify(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export { authMiddleware };