/**
 * Input Validation Middleware
 * Validates and sanitizes user input for security
 */

const validator = require('validator');

/**
 * Validate wallet address format
 */
function validateWalletAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    // Ethereum/Quai address format: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 1000) {
    if (typeof input !== 'string') {
        return '';
    }
    // Remove null bytes and trim
    let sanitized = input.replace(/\0/g, '').trim();
    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
}

/**
 * Validate URL
 */
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    // Allow http, https, and stratum protocols
    const protocols = ['http', 'https', 'stratum', 'stratum+tcp'];
    
    // Check for stratum protocol (custom format)
    if (url.startsWith('stratum://') || url.startsWith('stratum+tcp://')) {
        try {
            const parsed = url.replace(/^stratum\+?tcp?:\/\//, 'http://');
            const urlObj = new URL(parsed);
            return urlObj.hostname.length > 0;
        } catch {
            return false;
        }
    }
    
    // Standard URL validation
    return isValidUrl(url, ['http', 'https']);
}

/**
 * Validate numeric input
 */
function validateNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        return false;
    }
    return num >= min && num <= max;
}

/**
 * Validate integer input
 */
function validateInteger(value, min = -Infinity, max = Infinity) {
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num)) {
        return false;
    }
    return num >= min && num <= max;
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj, depth = 0) {
    if (depth > 10) { // Prevent deep recursion
        return {};
    }
    
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj !== 'object') {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, depth + 1));
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Sanitize key
        const safeKey = sanitizeString(key, 100);
        if (safeKey) {
            sanitized[safeKey] = sanitizeObject(value, depth + 1);
        }
    }
    
    return sanitized;
}

/**
 * Validate mining configuration
 */
function validateMiningConfig(config) {
    if (!config || typeof config !== 'object') {
        return { valid: false, error: 'Invalid configuration object' };
    }
    
    // Validate mining mode
    if (config.mode && !['solo', 'pool'].includes(config.mode)) {
        return { valid: false, error: 'Invalid mining mode' };
    }
    
    // Validate merged mining
    if (config.mergedMining) {
        if (typeof config.mergedMining.enabled !== 'boolean') {
            return { valid: false, error: 'Invalid merged mining enabled flag' };
        }
        
        if (config.mergedMining.chains && !Array.isArray(config.mergedMining.chains)) {
            return { valid: false, error: 'Invalid chains array' };
        }
        
        // Validate chain IDs are integers
        if (config.mergedMining.chains) {
            for (const chainId of config.mergedMining.chains) {
                if (!validateInteger(chainId, 0, 12)) {
                    return { valid: false, error: 'Invalid chain ID' };
                }
            }
        }
    }
    
    return { valid: true };
}

/**
 * Validate GPU settings
 */
function validateGPUSettings(settings) {
    if (!settings || typeof settings !== 'object') {
        return { valid: false, error: 'Invalid GPU settings' };
    }
    
    // Validate power limit
    if (settings.powerLimit !== undefined) {
        if (!validateNumber(settings.powerLimit, -100, 100)) {
            return { valid: false, error: 'Power limit must be between -100 and 100' };
        }
    }
    
    // Validate clock speeds
    if (settings.coreClock !== undefined) {
        if (!validateNumber(settings.coreClock, -1000, 1000)) {
            return { valid: false, error: 'Core clock offset must be between -1000 and 1000' };
        }
    }
    
    if (settings.memoryClock !== undefined) {
        if (!validateNumber(settings.memoryClock, -1000, 1000)) {
            return { valid: false, error: 'Memory clock offset must be between -1000 and 1000' };
        }
    }
    
    // Validate fan speed
    if (settings.fanSpeed !== undefined) {
        if (!validateInteger(settings.fanSpeed, 0, 100)) {
            return { valid: false, error: 'Fan speed must be between 0 and 100' };
        }
    }
    
    return { valid: true };
}

/**
 * Middleware to validate request body
 */
function validateRequestBody(validationRules) {
    return (req, res, next) => {
        try {
            const errors = [];
            
            for (const [field, rules] of Object.entries(validationRules)) {
                const value = req.body[field];
                
                if (rules.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field} is required`);
                    continue;
                }
                
                if (value !== undefined && value !== null) {
                    if (rules.type && typeof value !== rules.type) {
                        errors.push(`${field} must be of type ${rules.type}`);
                    }
                    
                    if (rules.validate && !rules.validate(value)) {
                        errors.push(`${field} validation failed`);
                    }
                    
                    if (rules.sanitize) {
                        req.body[field] = rules.sanitize(value);
                    }
                }
            }
            
            if (errors.length > 0) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    errors 
                });
            }
            
            next();
        } catch (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                message: error.message 
            });
        }
    };
}

module.exports = {
    validateWalletAddress,
    sanitizeString,
    validateUrl,
    validateNumber,
    validateInteger,
    sanitizeObject,
    validateMiningConfig,
    validateGPUSettings,
    validateRequestBody
};

