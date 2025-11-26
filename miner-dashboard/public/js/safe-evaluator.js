/**
 * Safe Expression Evaluator
 * Evaluates mathematical and comparison expressions safely without eval()
 * 
 * SECURITY: This is a safer alternative to eval() and Function() constructor
 * Only allows numeric comparisons and basic math operations
 */

class SafeEvaluator {
    constructor() {
        // Allowed operators and functions
        this.allowedOperators = ['+', '-', '*', '/', '%', '(', ')', '<', '>', '<=', '>=', '==', '!=', '&&', '||', '!'];
        this.allowedFunctions = ['Math.abs', 'Math.min', 'Math.max', 'Math.floor', 'Math.ceil', 'Math.round'];
    }

    /**
     * Validate expression contains only safe characters
     */
    validateExpression(expression) {
        if (!expression || typeof expression !== 'string') {
            return false;
        }

        // Remove whitespace
        const cleaned = expression.replace(/\s/g, '');
        
        // Check for dangerous patterns
        const dangerousPatterns = [
            /eval\s*\(/i,
            /function\s*\(/i,
            /new\s+Function/i,
            /setTimeout/i,
            /setInterval/i,
            /document\./i,
            /window\./i,
            /require\s*\(/i,
            /import\s+/i,
            /\.exec\s*\(/i,
            /\.call\s*\(/i,
            /\.apply\s*\(/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(cleaned)) {
                return false;
            }
        }

        // Only allow: numbers, operators, parentheses, variable names (alphanumeric + underscore)
        // Variable names must be replaced with values before evaluation
        const safePattern = /^[0-9+\-*/().<>=!&|_\s]+$/;
        if (!safePattern.test(cleaned)) {
            return false;
        }

        return true;
    }

    /**
     * Replace variables with values
     */
    replaceVariables(expression, context) {
        if (!context || typeof context !== 'object') {
            return expression;
        }

        let result = expression;
        
        // Sort keys by length (longest first) to avoid partial replacements
        const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);
        
        for (const key of sortedKeys) {
            // Only replace if key is a valid identifier
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
                const value = context[key];
                // Ensure value is a number
                if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    result = result.replace(regex, value.toString());
                }
            }
        }

        return result;
    }

    /**
     * Evaluate safe expression
     */
    evaluate(expression, context = {}) {
        try {
            // Step 1: Validate expression
            if (!this.validateExpression(expression)) {
                console.warn('[SafeEvaluator] Invalid expression:', expression);
                return false;
            }

            // Step 2: Replace variables with values
            let processedExpression = this.replaceVariables(expression, context);

            // Step 3: Final validation after variable replacement
            if (!this.validateExpression(processedExpression)) {
                console.warn('[SafeEvaluator] Expression invalid after variable replacement:', processedExpression);
                return false;
            }

            // Step 4: Use a safe evaluation method
            // Instead of Function constructor, use a parser or manual evaluation
            // For now, we'll use a very restricted Function constructor with additional checks
            
            // Remove all whitespace for final check
            const cleaned = processedExpression.replace(/\s/g, '');
            
            // Final safety check: only numbers, operators, and parentheses
            if (!/^[0-9+\-*/().<>=!&|]+$/.test(cleaned)) {
                console.warn('[SafeEvaluator] Final validation failed:', cleaned);
                return false;
            }

            // Use Function constructor as last resort (still safer than eval)
            // This is only for mathematical expressions, no function calls
            try {
                const func = new Function('return ' + processedExpression);
                const result = func();
                
                // Validate result is a boolean or number
                if (typeof result === 'boolean' || (typeof result === 'number' && isFinite(result))) {
                    return result;
                }
                
                return false;
            } catch (error) {
                console.warn('[SafeEvaluator] Evaluation error:', error.message);
                return false;
            }
        } catch (error) {
            console.error('[SafeEvaluator] Unexpected error:', error);
            return false;
        }
    }

    /**
     * Evaluate comparison expression (returns boolean)
     */
    evaluateComparison(expression, context = {}) {
        const result = this.evaluate(expression, context);
        return typeof result === 'boolean' ? result : Boolean(result);
    }
}

// Export singleton instance
if (typeof window !== 'undefined') {
    window.SafeEvaluator = SafeEvaluator;
    window.safeEvaluator = new SafeEvaluator();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeEvaluator;
}

