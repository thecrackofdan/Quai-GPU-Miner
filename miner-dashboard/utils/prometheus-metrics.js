/**
 * Prometheus Metrics Endpoint
 * Exposes metrics in Prometheus format for monitoring
 */

let metrics = {
    httpRequestsTotal: 0,
    httpRequestDuration: [],
    errorsTotal: 0,
    activeConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0
};

/**
 * Record HTTP request
 */
function recordRequest(method, path, statusCode, duration) {
    metrics.httpRequestsTotal++;
    metrics.httpRequestDuration.push(duration);
    
    // Keep only last 1000 durations
    if (metrics.httpRequestDuration.length > 1000) {
        metrics.httpRequestDuration.shift();
    }
}

/**
 * Record error
 */
function recordError(type) {
    metrics.errorsTotal++;
}

/**
 * Get Prometheus format metrics
 */
function getPrometheusMetrics() {
    const memUsage = process.memoryUsage();
    const avgDuration = metrics.httpRequestDuration.length > 0
        ? metrics.httpRequestDuration.reduce((a, b) => a + b, 0) / metrics.httpRequestDuration.length
        : 0;
    
    return `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.httpRequestsTotal}

# HELP http_request_duration_seconds Average HTTP request duration
# TYPE http_request_duration_seconds gauge
http_request_duration_seconds ${avgDuration / 1000}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${metrics.errorsTotal}

# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}
nodejs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}
nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}
nodejs_memory_usage_bytes{type="external"} ${memUsage.external}

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${process.uptime()}

# HELP nodejs_active_connections Active connections
# TYPE nodejs_active_connections gauge
nodejs_active_connections ${metrics.activeConnections}
`;
}

/**
 * Middleware to track requests
 */
function requestTrackingMiddleware(req, res, next) {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        recordRequest(req.method, req.path, res.statusCode, duration);
        
        if (res.statusCode >= 400) {
            recordError('http_error');
        }
    });
    
    next();
}

module.exports = {
    recordRequest,
    recordError,
    getPrometheusMetrics,
    requestTrackingMiddleware,
    metrics
};

