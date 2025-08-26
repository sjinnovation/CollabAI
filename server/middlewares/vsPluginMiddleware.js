import { verifyToken } from '../utils/vsPluginValidation.js';

/**
 * Middleware to authenticate requests using a Bearer token.
 * 
 * It checks for the presence of an `Authorization` header, verifies the JWT,
 * and attaches the decoded user info to `req.user` for downstream handlers.
 * If the token is missing, malformed, or invalid, it returns an appropriate error response.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Callback to pass control to the next middleware
 */
const vsPluginMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and follows the "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    try {
        // Extract token from header
        const token = authHeader.split(' ')[1];

        // Verify and decode token using utility function
        const decoded = verifyToken(token);

        // Attach decoded user data to the request object
        req.user = decoded;

        // Continue to next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification error:', error);

        // Respond with 403 if token is invalid or expired
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export default vsPluginMiddleware;
