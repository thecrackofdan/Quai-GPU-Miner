/**
 * Request Timing Middleware
 * Tracks request duration for performance monitoring
 */

function requestTimingMiddleware(req, res, next) {
    const startTime = Date.now();
    const startCpu = process.cpuUsage();
    
    // Store timing data in request object
    req._startTime = startTime;
    req._startCpu = startCpu;
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const cpuUsage = process.cpuUsage(startCpu);
        
        // Log slow requests
        if (duration > 1000) {
            if (req.logger || global.logger) {
                const logger = req.logger || global.logger;
                logger.warn('Slow request detected', {
                    path: req.path,
                    method: req.method,
                    duration: `${duration}ms`,
                    cpuUser: `${cpuUsage.user / 1000}ms`,
                    cpuSystem: `${cpuUsage.system / 1000}ms`
                });
            }
        }
        
        // Add timing header
        res.setHeader('X-Response-Time', `${duration}ms`);
    });
    
    next();
}

module.exports = requestTimingMiddleware;

