/**
 * PoEM (Proof-of-Entropy-Minima) Optimizer
 * Optimizes mining for Quai Network's PoEM consensus mechanism
 * 
 * PoEM is Quai's unique consensus that combines:
 * - Proof of Work (ProgPoW)
 * - Entropy minimization
 * - Multi-chain coordination
 */

const logger = require('./winston-logger') || require('./logger');

class PoEMOptimizer {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.entropyHistory = [];
        this.difficultyHistory = [];
        this.chainEntropy = {};
        
        // PoEM-specific parameters
        this.entropyWindow = 100; // Blocks to track for entropy
        this.optimalDifficulty = null;
        this.recommendedChain = 'Prime'; // Start with Prime
    }

    /**
     * Track entropy for PoEM optimization
     */
    async trackEntropy() {
        try {
            // Get recent block data
            const blocks = await this.getRecentBlocks(10);
            
            // Calculate entropy metrics
            const entropy = this.calculateEntropy(blocks);
            
            // Update history
            this.entropyHistory.push({
                timestamp: Date.now(),
                entropy: entropy,
                blockNumber: blocks[blocks.length - 1]?.number || 0
            });
            
            // Keep only recent history
            if (this.entropyHistory.length > this.entropyWindow) {
                this.entropyHistory.shift();
            }
            
            return entropy;
        } catch (error) {
            logger?.error('Failed to track entropy:', error.message);
            return null;
        }
    }

    /**
     * Calculate entropy from block data
     * Lower entropy = better mining opportunity
     */
    calculateEntropy(blocks) {
        if (!blocks || blocks.length === 0) return null;
        
        // Calculate entropy based on block timing variance
        const timestamps = blocks.map(b => parseInt(b.timestamp, 16));
        const intervals = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
        }
        
        // Calculate variance (entropy measure)
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
        
        return {
            mean: mean,
            variance: variance,
            entropy: Math.sqrt(variance), // Standard deviation as entropy measure
            stability: variance < 5 ? 'high' : variance < 15 ? 'medium' : 'low'
        };
    }

    /**
     * Get recent blocks for entropy calculation
     */
    async getRecentBlocks(count = 10) {
        try {
            const fetch = globalThis.fetch || require('node-fetch');
            const blocks = [];
            
            // Get latest block number
            const blockNumberResponse = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: Date.now()
                })
            });
            
            const blockNumberData = await blockNumberResponse.json();
            const latestBlock = parseInt(blockNumberData.result, 16);
            
            // Get recent blocks
            for (let i = 0; i < count && i < latestBlock; i++) {
                const blockHex = '0x' + (latestBlock - i).toString(16);
                
                const blockResponse = await fetch(this.rpcUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_getBlockByNumber',
                        params: [blockHex, false],
                        id: Date.now()
                    })
                });
                
                const blockData = await blockResponse.json();
                if (blockData.result) {
                    blocks.push(blockData.result);
                }
            }
            
            return blocks.reverse(); // Oldest to newest
        } catch (error) {
            logger?.error('Failed to get recent blocks:', error.message);
            return [];
        }
    }

    /**
     * Optimize mining parameters for PoEM
     */
    async optimizeMining() {
        try {
            // Track current entropy
            const entropy = await this.trackEntropy();
            
            if (!entropy) {
                return {
                    optimized: false,
                    message: 'Unable to calculate entropy'
                };
            }
            
            // Analyze entropy history
            const avgEntropy = this.entropyHistory.length > 0
                ? this.entropyHistory.reduce((sum, e) => sum + e.entropy.entropy, 0) / this.entropyHistory.length
                : entropy.entropy;
            
            // Determine optimal chain based on entropy
            const optimalChain = this.determineOptimalChain(entropy);
            
            // Calculate recommended difficulty
            const recommendedDifficulty = this.calculateOptimalDifficulty(entropy);
            
            return {
                optimized: true,
                currentEntropy: entropy,
                averageEntropy: avgEntropy,
                recommendedChain: optimalChain,
                recommendedDifficulty: recommendedDifficulty,
                stability: entropy.stability,
                recommendations: this.getRecommendations(entropy)
            };
        } catch (error) {
            logger?.error('PoEM optimization failed:', error.message);
            return {
                optimized: false,
                error: error.message
            };
        }
    }

    /**
     * Determine optimal chain based on entropy
     */
    determineOptimalChain(entropy) {
        // Lower entropy = better mining opportunity
        // Prime typically has lower entropy (more stable)
        if (entropy.stability === 'high') {
            return 'Prime';
        } else if (entropy.stability === 'medium') {
            return 'Cyprus'; // Region chains
        } else {
            return 'Prime'; // Default to Prime for stability
        }
    }

    /**
     * Calculate optimal difficulty for PoEM
     */
    calculateOptimalDifficulty(entropy) {
        // Adjust difficulty based on entropy
        // Lower entropy = can handle higher difficulty
        const baseDifficulty = 1000000;
        
        if (entropy.stability === 'high') {
            return baseDifficulty * 1.2; // Increase difficulty for stable chains
        } else if (entropy.stability === 'medium') {
            return baseDifficulty * 1.0; // Standard difficulty
        } else {
            return baseDifficulty * 0.8; // Lower difficulty for unstable chains
        }
    }

    /**
     * Get optimization recommendations
     */
    getRecommendations(entropy) {
        const recommendations = [];
        
        if (entropy.stability === 'high') {
            recommendations.push('High stability detected - optimal for mining');
            recommendations.push('Consider increasing hash rate for better rewards');
        } else if (entropy.stability === 'low') {
            recommendations.push('Low stability detected - network may be adjusting');
            recommendations.push('Consider waiting for stability before major operations');
        }
        
        if (entropy.variance > 20) {
            recommendations.push('High variance in block times - network may be under load');
        }
        
        return recommendations;
    }

    /**
     * Get PoEM statistics
     */
    getStatistics() {
        return {
            entropyHistory: this.entropyHistory.length,
            averageEntropy: this.entropyHistory.length > 0
                ? this.entropyHistory.reduce((sum, e) => sum + e.entropy.entropy, 0) / this.entropyHistory.length
                : 0,
            recommendedChain: this.recommendedChain,
            optimalDifficulty: this.optimalDifficulty
        };
    }
}

module.exports = PoEMOptimizer;

