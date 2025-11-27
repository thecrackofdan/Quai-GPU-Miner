/**
 * Request ID Tracking
 * Adds unique request ID to each request for tracing
 */

const { randomBytes } = require('crypto');

/**
 * Generate unique request ID
 */
function generateRequestId() {
    return randomBytes(16).toString('hex');
}

/**
 * Request ID middleware
 */
function requestIdMiddleware(req, res, next) {
    // Get request ID from header or generate new one
    const requestId = req.get('X-Request-ID') || generateRequestId();
    
    // Add to request object
    req.id = requestId;
    
    // Add to response header
    res.setHeader('X-Request-ID', requestId);
    
    // Add to logger context if available
    if (req.logger || global.logger) {
        const logger = req.logger || global.logger;
        logger.addBreadcrumb = logger.addBreadcrumb || (() => {});
        logger.addBreadcrumb(`Request ${requestId}`, 'request', 'info', {
            method: req.method,
            path: req.path
        });
    }
    
    next();
}

module.exports = requestIdMiddleware;

