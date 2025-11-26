/**
 * Advanced Alert Manager - Multi-channel alerting system
 * Supports Email, SMS, Telegram, Discord, and Push notifications
 */

class AlertManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.alertChannels = {
            email: { enabled: false },
            sms: { enabled: false },
            telegram: { enabled: false },
            discord: { enabled: false },
            push: { enabled: false }
        };
        this.alertRules = [];
        this.alertHistory = [];
        this.init();
    }

    init() {
        this.loadAlertSettings();
        this.setupDefaultRules();
        this.startMonitoring();
    }

    /**
     * Load alert settings from server
     */
    async loadAlertSettings() {
        try {
            const response = await fetch('/api/alerts/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.alertChannels = data.settings?.channels || this.alertChannels;
                    this.alertRules = data.settings?.rules || [];
                }
            }
        } catch (error) {
            console.error('Error loading alert settings:', error);
        }
    }

    /**
     * Setup default alert rules
     */
    setupDefaultRules() {
        if (this.alertRules.length === 0) {
            this.alertRules = [
                {
                    id: 'hash-rate-drop',
                    name: 'Hash Rate Drop',
                    condition: 'hashRate < (average * 0.8)',
                    enabled: true,
                    channels: ['email', 'telegram'],
                    cooldown: 300000 // 5 minutes
                },
                {
                    id: 'high-temperature',
                    name: 'High Temperature',
                    condition: 'temperature > 80',
                    enabled: true,
                    channels: ['email', 'telegram', 'discord'],
                    cooldown: 600000 // 10 minutes
                },
                {
                    id: 'miner-crash',
                    name: 'Miner Crash',
                    condition: 'isMining === false && wasMining === true',
                    enabled: true,
                    channels: ['email', 'sms', 'telegram', 'discord'],
                    cooldown: 0
                },
                {
                    id: 'block-found',
                    name: 'Block Found',
                    condition: 'blocksFound > previousBlocksFound',
                    enabled: true,
                    channels: ['email', 'telegram', 'push'],
                    cooldown: 0
                },
                {
                    id: 'gpu-failure',
                    name: 'GPU Failure',
                    condition: 'gpuHashRate === 0 && gpuTemp > 0',
                    enabled: true,
                    channels: ['email', 'sms', 'telegram'],
                    cooldown: 0
                }
            ];
        }
    }

    /**
     * Start monitoring for alerts
     */
    startMonitoring() {
        setInterval(() => {
            this.checkAlerts();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Check all alert rules
     */
    async checkAlerts() {
        if (!this.dashboard || !this.dashboard.miningData) return;

        const data = this.dashboard.miningData;
        
        for (const rule of this.alertRules) {
            if (!rule.enabled) continue;
            
            // Check cooldown
            const lastTrigger = this.alertHistory.find(h => h.ruleId === rule.id);
            if (lastTrigger && (Date.now() - lastTrigger.timestamp) < rule.cooldown) {
                continue;
            }
            
            // Evaluate condition
            if (this.evaluateCondition(rule.condition, data)) {
                await this.triggerAlert(rule, data);
            }
        }
    }

    /**
     * Evaluate alert condition - SECURE VERSION (no eval)
     */
    evaluateCondition(condition, data) {
        try {
            // SECURITY: Use safe expression parser instead of eval
            // Parse condition safely without eval
            const context = {
                hashRate: data.hashRate || 0,
                temperature: data.gpus?.[0]?.temperature || 0,
                isMining: data.isMining || false,
                blocksFound: data.blocksFound || 0,
                average: this.calculateAverage('hashRate'),
                previousBlocksFound: this.getPreviousValue('blocksFound'),
                gpuHashRate: data.gpus?.[0]?.hashRate || 0,
                gpuTemp: data.gpus?.[0]?.temperature || 0,
                wasMining: this.getPreviousValue('isMining')
            };
            
            // SECURITY: Safe condition evaluation without eval
            // Only allow simple comparisons: <, >, <=, >=, ===, !==
            const safeCondition = this.sanitizeCondition(condition);
            if (!safeCondition) {
                console.warn('Unsafe condition detected, skipping:', condition);
                return false;
            }
            
            // Use SafeEvaluator for secure expression evaluation
            if (typeof SafeEvaluator !== 'undefined') {
                const evaluator = new SafeEvaluator();
                return evaluator.evaluateComparison(safeCondition, context);
            }
            
            // Fallback: Manual evaluation for simple cases
            // Replace variables with values
            let expression = safeCondition;
            Object.keys(context).forEach(key => {
                // SECURITY: Only replace if key is a valid identifier
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
                    const value = context[key];
                    // SECURITY: Only replace with numeric values
                    if (typeof value === 'number' && isFinite(value)) {
                        const regex = new RegExp(`\\b${key}\\b`, 'g');
                        expression = expression.replace(regex, value.toString());
                    }
                }
            });
            
            // SECURITY: Final validation - only numbers, operators, parentheses
            const cleaned = expression.replace(/\s/g, '');
            if (!/^[0-9+\-*/().<>=!&|]+$/.test(cleaned)) {
                console.warn('[AlertManager] Invalid expression after processing:', expression);
                return false;
            }
            
            // SECURITY: Use Function constructor with additional validation
            try {
                // Double-check: no function calls, no eval, no require
                if (/[a-zA-Z]/.test(cleaned.replace(/Math\.(abs|min|max|floor|ceil|round)/g, ''))) {
                    console.warn('[AlertManager] Expression contains non-numeric content:', expression);
                    return false;
                }
                
                const func = new Function('return ' + expression);
                const result = func();
                
                // Validate result is boolean or number
                if (typeof result === 'boolean' || (typeof result === 'number' && isFinite(result))) {
                    return Boolean(result);
                }
                
                return false;
            } catch (error) {
                console.error('[AlertManager] Error evaluating condition:', error);
                return false;
            }
        } catch (error) {
            console.error('Error evaluating condition:', error);
            return false;
        }
    }

    /**
     * Sanitize condition to prevent code injection
     */
    sanitizeCondition(condition) {
        // Only allow safe operators and variable names
        // Remove any potentially dangerous code
        const safePattern = /^[\w\s<>=!&|().+-]+$/;
        
        // Remove any function calls, brackets, quotes, etc.
        const cleaned = condition
            .replace(/[\[\]{}'";]/g, '') // Remove dangerous characters
            .replace(/function|eval|exec|script/gi, '') // Remove dangerous keywords
            .trim();
        
        if (!safePattern.test(cleaned)) {
            return null; // Unsafe condition
        }
        
        // Only allow specific operators
        const allowedOperators = ['<', '>', '<=', '>=', '===', '!==', '==', '!=', '&&', '||'];
        const hasAllowedOperator = allowedOperators.some(op => cleaned.includes(op));
        
        if (!hasAllowedOperator) {
            return null; // No valid operator
        }
        
        return cleaned;
    }

    /**
     * Trigger an alert
     */
    async triggerAlert(rule, data) {
        const message = this.formatAlertMessage(rule, data);
        
        // Send to all enabled channels
        for (const channel of rule.channels) {
            if (this.alertChannels[channel]?.enabled) {
                await this.sendAlert(channel, rule.name, message);
            }
        }
        
        // Log alert
        this.alertHistory.push({
            ruleId: rule.id,
            timestamp: Date.now(),
            message: message
        });
        
        // Keep only last 100 alerts
        if (this.alertHistory.length > 100) {
            this.alertHistory.shift();
        }
    }

    /**
     * Send alert to specific channel
     */
    async sendAlert(channel, title, message) {
        try {
            const response = await fetch('/api/alerts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel,
                    title,
                    message
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`Alert sent via ${channel}:`, title);
                }
            }
        } catch (error) {
            console.error(`Error sending alert via ${channel}:`, error);
        }
    }

    /**
     * Format alert message
     */
    formatAlertMessage(rule, data) {
        const timestamp = new Date().toLocaleString();
        return `[${timestamp}] ${rule.name}\n\n` +
               `Hash Rate: ${data.hashRate || 0} MH/s\n` +
               `Temperature: ${data.gpus?.[0]?.temperature || 0}°C\n` +
               `Status: ${data.isMining ? 'Mining' : 'Stopped'}\n` +
               `GPUs: ${data.gpus?.length || 0}`;
    }

    /**
     * Calculate average for metric
     */
    calculateAverage(metric) {
        // Get recent values from dashboard
        if (this.dashboard && this.dashboard.runningAverages) {
            const values = this.dashboard.runningAverages[metric] || [];
            if (values.length > 0) {
                return values.reduce((a, b) => a + b, 0) / values.length;
            }
        }
        return 0;
    }

    /**
     * Get previous value
     */
    getPreviousValue(metric) {
        // Store previous values
        if (!this.previousValues) {
            this.previousValues = {};
        }
        return this.previousValues[metric] || 0;
    }

    /**
     * Update previous values
     */
    updatePreviousValues(data) {
        if (!this.previousValues) {
            this.previousValues = {};
        }
        this.previousValues.isMining = data.isMining;
        this.previousValues.blocksFound = data.blocksFound || 0;
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.AlertManager = AlertManager;
}

