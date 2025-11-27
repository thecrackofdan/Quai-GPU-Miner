/**
 * Debug Logger
 * Enhanced logging with debug levels and request tracking
 */

const logger = require('./winston-logger') || require('./logger');

const DEBUG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    VERBOSE: 4
};

let currentLevel = process.env.DEBUG_LEVEL 
    ? parseInt(process.env.DEBUG_LEVEL, 10) 
    : (process.env.NODE_ENV === 'development' ? DEBUG_LEVELS.DEBUG : DEBUG_LEVELS.INFO);

/**
 * Set debug level
 */
function setDebugLevel(level) {
    if (typeof level === 'string') {
        currentLevel = DEBUG_LEVELS[level.toUpperCase()] || DEBUG_LEVELS.INFO;
    } else {
        currentLevel = level;
    }
}

/**
 * Log with level check
 */
function log(level, message, data = {}) {
    if (level <= currentLevel) {
        const levelNames = ['error', 'warn', 'info', 'debug', 'verbose'];
        const levelName = levelNames[level] || 'info';
        logger[levelName](message, data);
    }
}

/**
 * Debug logging functions
 */
const debug = {
    error: (msg, data) => log(DEBUG_LEVELS.ERROR, msg, data),
    warn: (msg, data) => log(DEBUG_LEVELS.WARN, msg, data),
    info: (msg, data) => log(DEBUG_LEVELS.INFO, msg, data),
    debug: (msg, data) => log(DEBUG_LEVELS.DEBUG, msg, data),
    verbose: (msg, data) => log(DEBUG_LEVELS.VERBOSE, msg, data),
    setLevel: setDebugLevel,
    getLevel: () => currentLevel
};

module.exports = debug;

