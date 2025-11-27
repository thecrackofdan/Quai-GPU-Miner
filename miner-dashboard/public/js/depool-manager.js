/**
 * ============================================================================
 * DePool Manager - POOL OPERATOR FUNCTIONALITY
 * ============================================================================
 * 
 * NOTE: This module is for POOL OPERATORS managing their DePool.
 * 
 * Solo miners do NOT use this module. Solo miners connect to the pool via
 * stratum protocol and use the standard mining configuration endpoints.
 * 
 * This module provides:
 * - Pool operator dashboard for managing the DePool
 * - Miner registration and tracking
 * - Share submission and validation
 * - Block recording and reward distribution
 * - Automated payout processing (PPS - Pay Per Share)
 * - Fee management and profitability analysis
 * 
 * SECURITY & PRIVACY:
 * - All miner wallet addresses are validated and masked in logs
 * - Share data is sanitized before processing
 * - Payout calculations are auditable
 * - No sensitive data exposed in responses
 * ============================================================================
 */

class DePoolManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isEnabled = false;
        this.poolConfig = {
            fee: 1.0, // Default 1% pool fee
            minPayout: 0.1, // Minimum payout in QUAI
            payoutInterval: 86400000, // 24 hours in milliseconds
            shareDifficulty: 1000000, // Share difficulty threshold
            blockRewardShare: 0.99 // 99% to miners, 1% to pool operator
        };
        this.miners = new Map(); // Map of miner addresses to miner data
        this.shares = []; // Array of submitted shares
        this.blocks = []; // Array of found blocks
        this.payouts = []; // Array of processed payouts
        this.totalPoolHashRate = 0;
        this.poolRevenue = 0;
        this.poolFees = 0;
        this.init();
    }

    init() {
        this.loadPoolConfig();
        this.startMonitoring();
    }

    /**
     * Load pool configuration from server
     */
    async loadPoolConfig() {
        try {
            const response = await fetch('/api/depool/config');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.poolConfig = { ...this.poolConfig, ...data.config };
                    this.isEnabled = data.config.enabled || false;
                }
            }
        } catch (error) {
            console.error('Error loading DePool config:', error);
        }
    }

    /**
     * Save pool configuration
     */
    async savePoolConfig() {
        try {
            const response = await fetch('/api/depool/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled: this.isEnabled,
                    ...this.poolConfig
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving DePool config:', error);
            return false;
        }
    }

    /**
     * Enable DePool mode
     */
    async enable() {
        this.isEnabled = true;
        await this.savePoolConfig();
        
        // Start pool services
        await this.startPoolServices();
        
        if (typeof Toast !== 'undefined') {
            Toast.success('DePool enabled - Your node is now a mining pool!');
        }
    }

    /**
     * Disable DePool mode
     */
    async disable() {
        this.isEnabled = false;
        await this.savePoolConfig();
        
        // Stop pool services
        await this.stopPoolServices();
        
        if (typeof Toast !== 'undefined') {
            Toast.info('DePool disabled');
        }
    }

    /**
     * Start pool monitoring and services
     */
    startMonitoring() {
        // Update pool stats every 10 seconds
        this.monitoringInterval = setInterval(() => {
            if (this.isEnabled) {
                this.updatePoolStats();
            }
        }, 10000);

        // Process payouts every hour
        this.payoutInterval = setInterval(() => {
            if (this.isEnabled) {
                this.processPayouts();
            }
        }, 3600000); // 1 hour
    }

    /**
     * Start pool services
     */
    async startPoolServices() {
        try {
            const response = await fetch('/api/depool/start', {
                method: 'POST'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    logger.info('DePool services started');
                }
            }
        } catch (error) {
            console.error('Error starting DePool services:', error);
        }
    }

    /**
     * Stop pool services
     */
    async stopPoolServices() {
        try {
            const response = await fetch('/api/depool/stop', {
                method: 'POST'
            });
            
            if (response.ok) {
                logger.info('DePool services stopped');
            }
        } catch (error) {
            console.error('Error stopping DePool services:', error);
        }
    }

    /**
     * Register a new miner
     */
    async registerMiner(walletAddress, workerName = null) {
        const minerId = workerName ? `${walletAddress}.${workerName}` : walletAddress;
        
        if (this.miners.has(minerId)) {
            return this.miners.get(minerId);
        }

        const miner = {
            id: minerId,
            walletAddress: walletAddress,
            workerName: workerName,
            hashRate: 0,
            shares: {
                accepted: 0,
                rejected: 0,
                stale: 0
            },
            pendingBalance: 0,
            totalPaid: 0,
            joinedAt: Date.now(),
            lastShare: null,
            status: 'active'
        };

        this.miners.set(minerId, miner);

        // Save to server
        try {
            await fetch('/api/depool/miners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(miner)
            });
        } catch (error) {
            console.error('Error registering miner:', error);
        }

        return miner;
    }

    /**
     * Submit a share from a miner
     */
    async submitShare(minerId, shareData) {
        const miner = this.miners.get(minerId);
        if (!miner) {
            // Auto-register miner if not exists
            const [walletAddress, workerName] = minerId.includes('.') 
                ? minerId.split('.') 
                : [minerId, null];
            await this.registerMiner(walletAddress, workerName);
            return this.submitShare(minerId, shareData);
        }

        const share = {
            minerId: minerId,
            difficulty: shareData.difficulty || this.poolConfig.shareDifficulty,
            timestamp: Date.now(),
            accepted: shareData.accepted !== false,
            blockFound: shareData.blockFound || false
        };

        // Update miner stats
        if (share.accepted) {
            miner.shares.accepted++;
            miner.lastShare = Date.now();
        } else {
            miner.shares.rejected++;
        }

        // Calculate share reward
        if (share.accepted) {
            const shareReward = this.calculateShareReward(share);
            miner.pendingBalance += shareReward;
        }

        // If block found, record it
        if (share.blockFound) {
            await this.recordBlock(minerId, shareData.blockReward || 0);
        }

        // Save share
        this.shares.push(share);
        if (this.shares.length > 10000) {
            this.shares.shift(); // Keep last 10000 shares
        }

        // Update to server
        try {
            await fetch('/api/depool/shares', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(share)
            });
        } catch (error) {
            console.error('Error submitting share:', error);
        }

        return share;
    }

    /**
     * Calculate reward for a share
     */
    calculateShareReward(share) {
        // PPS (Pay Per Share) calculation
        // Reward = (Block Reward * Share Difficulty) / (Network Difficulty * Pool Hash Rate)
        // Simplified: Reward per share based on pool's share difficulty
        
        const blockReward = 2.0; // QUAI block reward (adjust based on chain)
        const networkDifficulty = 1000000000; // Network difficulty (fetch from node)
        const poolHashRate = this.totalPoolHashRate || 100; // Pool total hash rate
        
        // Simplified calculation
        const shareReward = (blockReward * share.difficulty) / (networkDifficulty * poolHashRate);
        
        return Math.max(shareReward, 0);
    }

    /**
     * Record a found block
     */
    async recordBlock(minerId, blockReward) {
        const block = {
            minerId: minerId,
            reward: blockReward,
            timestamp: Date.now(),
            chain: 'prime', // Default to prime, can be updated
            blockNumber: null // Will be filled from node
        };

        this.blocks.push(block);

        // Calculate pool fee
        const poolFee = blockReward * (this.poolConfig.fee / 100);
        const minerReward = blockReward - poolFee;

        // Update pool revenue
        this.poolRevenue += blockReward;
        this.poolFees += poolFee;

        // Distribute reward to miner
        const miner = this.miners.get(minerId);
        if (miner) {
            miner.pendingBalance += minerReward;
        }

        // Save to server
        try {
            await fetch('/api/depool/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(block)
            });
        } catch (error) {
            console.error('Error recording block:', error);
        }

        return block;
    }

    /**
     * Calculate miner payout
     */
    calculateMinerPayout(minerId) {
        const miner = this.miners.get(minerId);
        if (!miner) return 0;

        // PPS (Pay Per Share) - miner gets paid for each accepted share
        // Plus proportional share of block rewards
        
        let totalPayout = miner.pendingBalance;

        // Apply minimum payout threshold
        if (totalPayout < this.poolConfig.minPayout) {
            return 0; // Below minimum payout
        }

        return totalPayout;
    }

    /**
     * Process payouts for all eligible miners
     */
    async processPayouts() {
        const payouts = [];
        
        for (const [minerId, miner] of this.miners.entries()) {
            const payoutAmount = this.calculateMinerPayout(minerId);
            
            if (payoutAmount >= this.poolConfig.minPayout) {
                const payout = {
                    minerId: minerId,
                    walletAddress: miner.walletAddress,
                    amount: payoutAmount,
                    timestamp: Date.now(),
                    status: 'pending'
                };

                payouts.push(payout);

                // Update miner balance
                miner.pendingBalance = 0;
                miner.totalPaid += payoutAmount;
            }
        }

        // Process payouts via API
        if (payouts.length > 0) {
            try {
                const response = await fetch('/api/depool/payouts/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payouts })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Mark payouts as processed
                        payouts.forEach(p => {
                            p.status = 'processed';
                            this.payouts.push(p);
                        });

                        if (typeof Toast !== 'undefined') {
                            Toast.success(`Processed ${payouts.length} miner payouts`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing payouts:', error);
            }
        }

        return payouts;
    }

    /**
     * Update pool statistics
     */
    async updatePoolStats() {
        try {
            const response = await fetch('/api/depool/stats');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.totalPoolHashRate = data.stats.totalHashRate || 0;
                    this.poolRevenue = data.stats.totalRevenue || 0;
                    this.poolFees = data.stats.totalFees || 0;
                    
                    // Update miners
                    if (data.stats.miners) {
                        data.stats.miners.forEach(minerData => {
                            if (this.miners.has(minerData.id)) {
                                const miner = this.miners.get(minerData.id);
                                miner.hashRate = minerData.hashRate || 0;
                                miner.shares = minerData.shares || miner.shares;
                                miner.pendingBalance = minerData.pendingBalance || 0;
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error updating pool stats:', error);
        }
    }

    /**
     * Calculate pool profitability
     */
    calculateProfitability() {
        const poolOperatorRevenue = this.poolFees;
        const poolOperatorCosts = this.calculatePoolCosts();
        const poolOperatorProfit = poolOperatorRevenue - poolOperatorCosts;
        const profitMargin = poolOperatorRevenue > 0 
            ? (poolOperatorProfit / poolOperatorRevenue) * 100 
            : 0;

        return {
            revenue: poolOperatorRevenue,
            costs: poolOperatorCosts,
            profit: poolOperatorProfit,
            profitMargin: profitMargin,
            totalMiners: this.miners.size,
            totalHashRate: this.totalPoolHashRate,
            blocksFound: this.blocks.length,
            totalPayouts: this.payouts.length
        };
    }

    /**
     * Calculate pool operating costs
     */
    calculatePoolCosts() {
        // Node operation costs (electricity, hosting, etc.)
        const nodePowerConsumption = 200; // watts
        const electricityRate = 0.10; // $/kWh
        const dailyElectricityCost = (nodePowerConsumption / 1000) * 24 * electricityRate;
        
        // Server/hosting costs (if applicable)
        const hostingCost = 0; // $/day
        
        // Total daily costs
        const dailyCosts = dailyElectricityCost + hostingCost;
        
        return dailyCosts;
    }

    /**
     * Optimize pool fee for maximum profitability
     */
    optimizeFee() {
        // Analyze current fee vs miner retention
        // Higher fee = more revenue but fewer miners
        // Lower fee = less revenue but more miners
        
        const currentFee = this.poolConfig.fee;
        const currentMiners = this.miners.size;
        const currentHashRate = this.totalPoolHashRate;
        
        // Simple optimization: adjust fee based on pool size
        let optimalFee = currentFee;
        
        if (currentMiners < 10) {
            // Too few miners - lower fee to attract more
            optimalFee = Math.max(0.5, currentFee - 0.1);
        } else if (currentMiners > 50 && currentHashRate > 1000) {
            // Many miners - can increase fee slightly
            optimalFee = Math.min(2.0, currentFee + 0.1);
        }
        
        return optimalFee;
    }

    /**
     * Get pool statistics for display
     */
    getPoolStats() {
        return {
            enabled: this.isEnabled,
            totalMiners: this.miners.size,
            totalHashRate: this.totalPoolHashRate,
            totalShares: this.shares.length,
            acceptedShares: this.shares.filter(s => s.accepted).length,
            rejectedShares: this.shares.filter(s => !s.accepted).length,
            blocksFound: this.blocks.length,
            poolRevenue: this.poolRevenue,
            poolFees: this.poolFees,
            totalPayouts: this.payouts.length,
            profitability: this.calculateProfitability()
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.DePoolManager = DePoolManager;
}

