/**
 * Secure Logger - Privacy-preserving logging utility
 * Prevents sensitive data from being logged
 */

const { sanitizeLogData, maskWalletAddress } = require('../middleware/security');
const { privacyLog, containsSensitiveData } = require('../middleware/privacy');

const NODE_ENV = process.env.NODE_ENV || 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info');

class SecureLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
    }

    /**
     * Log info message (sanitized)
     */
    info(message, data = null) {
        if (LOG_LEVEL === 'silent') return;
        
        const sanitized = data ? sanitizeLogData(data) : null;
        const logEntry = {
            level: 'info',
            message,
            data: sanitized,
            timestamp: new Date().toISOString()
        };
        
        this.addLog(logEntry);
        
        if (NODE_ENV === 'development' || LOG_LEVEL === 'debug') {
            console.log(`[INFO] ${message}`, sanitized || '');
        }
    }

    /**
     * Log error message (sanitized)
     */
    error(message, error = null) {
        const sanitized = error ? sanitizeLogData({
            message: error.message,
            stack: NODE_ENV === 'development' ? error.stack : undefined
        }) : null;
        
        const logEntry = {
            level: 'error',
            message,
            error: sanitized,
            timestamp: new Date().toISOString()
        };
        
        this.addLog(logEntry);
        console.error(`[ERROR] ${message}`, sanitized || '');
    }

    /**
     * Log warning message (sanitized)
     */
    warn(message, data = null) {
        if (LOG_LEVEL === 'silent') return;
        
        const sanitized = data ? sanitizeLogData(data) : null;
        const logEntry = {
            level: 'warn',
            message,
            data: sanitized,
            timestamp: new Date().toISOString()
        };
        
        this.addLog(logEntry);
        
        if (NODE_ENV === 'development' || LOG_LEVEL === 'debug') {
            console.warn(`[WARN] ${message}`, sanitized || '');
        }
    }

    /**
     * Log debug message (development only)
     */
    debug(message, data = null) {
        if (NODE_ENV !== 'development' && LOG_LEVEL !== 'debug') return;
        
        const sanitized = data ? sanitizeLogData(data) : null;
        const logEntry = {
            level: 'debug',
            message,
            data: sanitized,
            timestamp: new Date().toISOString()
        };
        
        this.addLog(logEntry);
        console.debug(`[DEBUG] ${message}`, sanitized || '');
    }

    /**
     * Add log entry (with rotation)
     */
    addLog(entry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest
        }
    }

    /**
     * Get recent logs
     */
    getLogs(level = null, limit = 100) {
        let filtered = this.logs;
        if (level) {
            filtered = this.logs.filter(log => log.level === level);
        }
        return filtered.slice(-limit);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Mask wallet address in message
     */
    maskWallet(message) {
        if (!message || typeof message !== 'string') return message;
        
        // Find and mask wallet addresses
        const walletPattern = /0x[a-fA-F0-9]{40}/g;
        return message.replace(walletPattern, (match) => maskWalletAddress(match));
    }
}

// Create singleton instance
const logger = new SecureLogger();

module.exports = logger;

