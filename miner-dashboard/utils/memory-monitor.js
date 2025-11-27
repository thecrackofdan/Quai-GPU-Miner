/**
 * Memory Monitor
 * Tracks memory usage and detects leaks
 */

let memoryHistory = [];
const MAX_HISTORY = 100;

/**
 * Record current memory usage
 */
function recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    
    memoryHistory.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
        external: memUsage.external
    });
    
    // Keep only last MAX_HISTORY entries
    if (memoryHistory.length > MAX_HISTORY) {
        memoryHistory.shift();
    }
}

/**
 * Check for memory leaks
 */
function checkMemoryLeak() {
    if (memoryHistory.length < 10) {
        return null; // Not enough data
    }
    
    const recent = memoryHistory.slice(-10);
    const older = memoryHistory.slice(-20, -10);
    
    if (older.length === 0) {
        return null;
    }
    
    const recentAvg = recent.reduce((sum, m) => sum + m.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.heapUsed, 0) / older.length;
    
    const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (growth > 20) { // 20% growth indicates potential leak
        return {
            detected: true,
            growthPercent: growth.toFixed(2),
            recentAvg: Math.round(recentAvg / 1024 / 1024), // MB
            olderAvg: Math.round(olderAvg / 1024 / 1024) // MB
        };
    }
    
    return { detected: false };
}

/**
 * Get memory statistics
 */
function getMemoryStats() {
    const current = process.memoryUsage();
    const avg = memoryHistory.length > 0
        ? memoryHistory.reduce((sum, m) => sum + m.heapUsed, 0) / memoryHistory.length
        : current.heapUsed;
    
    return {
        current: {
            heapUsed: Math.round(current.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(current.heapTotal / 1024 / 1024), // MB
            rss: Math.round(current.rss / 1024 / 1024) // MB
        },
        average: Math.round(avg / 1024 / 1024), // MB
        history: memoryHistory.length,
        leakCheck: checkMemoryLeak()
    };
}

// Record memory usage every 30 seconds
if (typeof setInterval !== 'undefined') {
    setInterval(recordMemoryUsage, 30000);
    recordMemoryUsage(); // Initial recording
}

module.exports = {
    recordMemoryUsage,
    checkMemoryLeak,
    getMemoryStats,
    memoryHistory
};

