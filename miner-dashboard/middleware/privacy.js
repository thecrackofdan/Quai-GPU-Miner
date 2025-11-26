/**
 * Privacy Middleware
 * Ensures user privacy and data protection
 */

/**
 * Remove sensitive data from responses
 */
function sanitizeResponse(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }
    
    const sensitiveKeys = ['password', 'apiKey', 'token', 'secret', 'privateKey'];
    const sanitized = { ...data };
    
    for (const key of sensitiveKeys) {
        if (sanitized[key]) {
            delete sanitized[key];
        }
    }
    
    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeResponse(value);
        }
    }
    
    return sanitized;
}

/**
 * Privacy-preserving logging
 */
function privacyLog(message, data) {
    const sanitized = sanitizeResponse(data);
    console.log(message, sanitized);
}

/**
 * Mask wallet addresses in logs (show only first 6 and last 4 chars)
 */
function maskWalletAddress(address) {
    if (!address || typeof address !== 'string' || address.length < 10) {
        return '***';
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Check if data contains sensitive information
 */
function containsSensitiveData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    const sensitivePatterns = [
        /password/i,
        /api[_-]?key/i,
        /token/i,
        /secret/i,
        /private[_-]?key/i,
        /wallet/i,
        /0x[a-fA-F0-9]{40}/ // Ethereum/Quai address
    ];
    
    const dataStr = JSON.stringify(data);
    return sensitivePatterns.some(pattern => pattern.test(dataStr));
}

/**
 * Privacy headers for responses
 */
function privacyHeaders(req, res, next) {
    // Add privacy headers
    res.setHeader('X-Privacy-Policy', 'No data collection, no tracking');
    res.setHeader('X-Data-Retention', 'Local only');
    
    next();
}

module.exports = {
    sanitizeResponse,
    privacyLog,
    maskWalletAddress,
    containsSensitiveData,
    privacyHeaders
};

