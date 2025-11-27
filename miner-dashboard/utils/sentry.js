/**
 * Sentry Error Tracking Integration
 * Optional error tracking for production monitoring
 */

let Sentry = null;
let isInitialized = false;

/**
 * Initialize Sentry (if DSN is provided)
 */
function initSentry() {
    // Only initialize if DSN is provided and Sentry package is available
    const SENTRY_DSN = process.env.SENTRY_DSN;
    
    if (!SENTRY_DSN) {
        return false; // Sentry is optional
    }
    
    try {
        Sentry = require('@sentry/node');
        
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: process.env.NODE_ENV || 'production',
            tracesSampleRate: 0.1, // 10% of transactions
            beforeSend(event, hint) {
                // Sanitize sensitive data before sending
                if (event.request) {
                    // Remove sensitive headers
                    if (event.request.headers) {
                        delete event.request.headers.authorization;
                        delete event.request.headers.cookie;
                    }
                    
                    // Sanitize request body
                    if (event.request.data) {
                        const sensitiveKeys = ['password', 'apiKey', 'token', 'secret', 'privateKey', 'wallet'];
                        sensitiveKeys.forEach(key => {
                            if (event.request.data[key]) {
                                event.request.data[key] = '***REDACTED***';
                            }
                        });
                    }
                }
                
                return event;
            }
        });
        
        isInitialized = true;
        return true;
    } catch (error) {
        // Sentry package not installed - that's OK, it's optional
        return false;
    }
}

/**
 * Capture exception
 */
function captureException(error, context = {}) {
    if (!isInitialized || !Sentry) {
        return;
    }
    
    try {
        Sentry.withScope((scope) => {
            // Add context
            if (context.user) {
                scope.setUser({ id: context.user });
            }
            if (context.tags) {
                Object.entries(context.tags).forEach(([key, value]) => {
                    scope.setTag(key, value);
                });
            }
            if (context.extra) {
                scope.setExtras(context.extra);
            }
            
            Sentry.captureException(error);
        });
    } catch (err) {
        // Silently fail if Sentry has issues
        console.error('Sentry capture failed:', err.message);
    }
}

/**
 * Capture message
 */
function captureMessage(message, level = 'info', context = {}) {
    if (!isInitialized || !Sentry) {
        return;
    }
    
    try {
        Sentry.withScope((scope) => {
            if (context.tags) {
                Object.entries(context.tags).forEach(([key, value]) => {
                    scope.setTag(key, value);
                });
            }
            if (context.extra) {
                scope.setExtras(context.extra);
            }
            
            Sentry.captureMessage(message, level);
        });
    } catch (err) {
        // Silently fail if Sentry has issues
        console.error('Sentry capture failed:', err.message);
    }
}

/**
 * Set user context
 */
function setUser(userId, email = null) {
    if (!isInitialized || !Sentry) {
        return;
    }
    
    try {
        Sentry.setUser({
            id: userId,
            email: email
        });
    } catch (err) {
        // Silently fail
    }
}

/**
 * Add breadcrumb
 */
function addBreadcrumb(message, category = 'default', level = 'info', data = {}) {
    if (!isInitialized || !Sentry) {
        return;
    }
    
    try {
        Sentry.addBreadcrumb({
            message,
            category,
            level,
            data
        });
    } catch (err) {
        // Silently fail
    }
}

// Auto-initialize if DSN is provided
if (process.env.SENTRY_DSN) {
    initSentry();
}

module.exports = {
    initSentry,
    captureException,
    captureMessage,
    setUser,
    addBreadcrumb,
    isInitialized: () => isInitialized
};

