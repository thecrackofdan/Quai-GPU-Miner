/**
 * Request Size Limit Middleware
 * Prevents oversized requests (DoS protection)
 */

const MAX_REQUEST_SIZE = process.env.MAX_REQUEST_SIZE || '1mb'; // Default 1MB

/**
 * Request size limit middleware
 */
function requestSizeLimit(req, res, next) {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10);
        const maxSize = parseSize(MAX_REQUEST_SIZE);
        
        if (sizeInBytes > maxSize) {
            return res.status(413).json({
                error: 'Request too large',
                message: `Request size exceeds maximum of ${MAX_REQUEST_SIZE}`,
                maxSize: MAX_REQUEST_SIZE
            });
        }
    }
    
    next();
}

/**
 * Parse size string to bytes
 */
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    
    const match = size.toLowerCase().match(/^(\d+)([a-z]+)$/);
    if (!match) {
        return 1024 * 1024; // Default 1MB
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    return value * (units[unit] || 1);
}

module.exports = requestSizeLimit;

