/**
 * Performance Profiler
 * Profiles function execution time
 */

const profiles = new Map();

/**
 * Profile a function
 */
function profile(fn, name) {
    return function(...args) {
        const start = process.hrtime.bigint();
        const result = fn.apply(this, args);
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        if (!profiles.has(name)) {
            profiles.set(name, []);
        }
        
        profiles.get(name).push({
            duration,
            timestamp: Date.now()
        });
        
        // Keep only last 100 measurements
        const measurements = profiles.get(name);
        if (measurements.length > 100) {
            measurements.shift();
        }
        
        return result;
    };
}

/**
 * Get profile statistics
 */
function getProfileStats(name) {
    const measurements = profiles.get(name);
    if (!measurements || measurements.length === 0) {
        return null;
    }
    
    const durations = measurements.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
        name,
        count: measurements.length,
        average: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        total: durations.reduce((a, b) => a + b, 0).toFixed(2)
    };
}

/**
 * Get all profiles
 */
function getAllProfiles() {
    const result = {};
    for (const name of profiles.keys()) {
        result[name] = getProfileStats(name);
    }
    return result;
}

/**
 * Clear profiles
 */
function clearProfiles() {
    profiles.clear();
}

module.exports = {
    profile,
    getProfileStats,
    getAllProfiles,
    clearProfiles
};

