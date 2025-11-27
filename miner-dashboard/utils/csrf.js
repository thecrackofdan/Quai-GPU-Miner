/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

const crypto = require('crypto');

// Store tokens in memory (in production, use Redis or session store)
const tokens = new Map();

/**
 * Generate CSRF token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create CSRF token middleware
 */
function csrfProtection(req, res, next) {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // Generate and store token for GET requests
        const token = generateToken();
        tokens.set(token, {
            createdAt: Date.now(),
            ip: req.ip
        });
        
        // Set token in response header
        res.setHeader('X-CSRF-Token', token);
        
        // Clean old tokens (older than 1 hour)
        const oneHourAgo = Date.now() - 3600000;
        for (const [t, data] of tokens.entries()) {
            if (data.createdAt < oneHourAgo) {
                tokens.delete(t);
            }
        }
        
        return next();
    }
    
    // For POST, PUT, DELETE, PATCH - verify token
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token) {
        return res.status(403).json({
            error: 'CSRF token missing',
            message: 'CSRF protection: token required'
        });
    }
    
    if (!tokens.has(token)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'CSRF protection: invalid token'
        });
    }
    
    // Verify IP matches (optional, can be disabled for load balancers)
    const tokenData = tokens.get(token);
    if (process.env.CSRF_STRICT_IP !== 'false' && tokenData.ip !== req.ip) {
        return res.status(403).json({
            error: 'CSRF token IP mismatch',
            message: 'CSRF protection: IP verification failed'
        });
    }
    
    // Token is valid, delete it (one-time use)
    tokens.delete(token);
    
    next();
}

module.exports = {
    csrfProtection,
    generateToken
};

