/**
 * Database Health Check Utilities
 * Monitors database performance and health
 */

const db = require('../database');

let queryStats = {
    totalQueries: 0,
    slowQueries: [],
    errors: 0,
    lastCheck: null
};

const SLOW_QUERY_THRESHOLD = 100; // milliseconds

/**
 * Execute query with performance tracking
 */
function executeQuery(query, params = []) {
    const startTime = Date.now();
    queryStats.totalQueries++;
    
    try {
        const result = db.prepare(query).all(...params);
        const duration = Date.now() - startTime;
        
        if (duration > SLOW_QUERY_THRESHOLD) {
            queryStats.slowQueries.push({
                query: query.substring(0, 100), // First 100 chars
                duration,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 50 slow queries
            if (queryStats.slowQueries.length > 50) {
                queryStats.slowQueries.shift();
            }
        }
        
        return result;
    } catch (error) {
        queryStats.errors++;
        throw error;
    }
}

/**
 * Get database health status
 */
function getHealthStatus() {
    const dbSize = db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get();
    
    return {
        status: 'healthy',
        totalQueries: queryStats.totalQueries,
        slowQueries: queryStats.slowQueries.length,
        errors: queryStats.errors,
        averageQueryTime: queryStats.slowQueries.length > 0
            ? queryStats.slowQueries.reduce((a, b) => a + b.duration, 0) / queryStats.slowQueries.length
            : 0,
        databaseSize: dbSize?.size || 0,
        lastCheck: new Date().toISOString()
    };
}

/**
 * Get slow queries
 */
function getSlowQueries(limit = 10) {
    return queryStats.slowQueries.slice(-limit);
}

/**
 * Reset stats
 */
function resetStats() {
    queryStats = {
        totalQueries: 0,
        slowQueries: [],
        errors: 0,
        lastCheck: new Date().toISOString()
    };
}

module.exports = {
    executeQuery,
    getHealthStatus,
    getSlowQueries,
    resetStats,
    queryStats
};

