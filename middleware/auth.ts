import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../lib/jwt';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(403).json({ 
                message: 'Authentication required. Please provide a valid token.' 
            });
        }

        // Check if header starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ 
                message: 'Invalid authorization format. Use: Bearer <token>' 
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (!token) {
            return res.status(403).json({ 
                message: 'Token is required' 
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(403).json({ 
                message: 'Invalid or expired token' 
            });
        }

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ 
            message: 'Authentication failed' 
        });
    }
};
