/**
 * Quai Network Metrics - Quai-specific data points and profitability calculations
 * Includes SOAP upgrade features, LMT/LMR, merged mining, and chain-specific metrics
 */

const logger = require('./logger');

class QuaiMetrics {
    constructor(nodeRpcUrl = 'http://localhost:8545') {
        this.nodeRpcUrl = nodeRpcUrl;
        this.fetch = null;
        
        // Initialize fetch
        if (typeof globalThis.fetch === 'function') {
            this.fetch = globalThis.fetch;
        } else {
            try {
                this.fetch = require('node-fetch');
            } catch (e) {
                logger.warn('Fetch not available for Quai metrics');
            }
        }

        // Quai-specific constants
        this.chainRewards = {
            Prime: 1.0,
            Cyprus: 0.8,
            Paxos: 0.8,
            Hydra: 0.8,
            'Zone-0': 0.6,
            'Zone-1': 0.6,
            'Zone-2': 0.6,
            'Zone-3': 0.6
        };

        // SOAP staking multipliers
        this.soapStakingMultipliers = {
            7: 1.05,    // 7 days: 5% bonus
            30: 1.15,   // 30 days: 15% bonus
            90: 1.30,   // 90 days: 30% bonus
            180: 1.50,  // 180 days: 50% bonus
            365: 2.0    // 365 days: 100% bonus
        };

        // LMT/LMR data
        this.lmtLmrData = {
            liquidBalance: 0,
            lockedBalance: 0,
            stakingRewards: 0,
            lockupPeriod: 0
        };
    }

    /**
     * Get comprehensive Quai mining metrics
     */
    async getMiningMetrics(hashRate, powerUsage, electricityCost = 0.10) {
        try {
            const networkData = await this.getNetworkData();
            const chainData = await this.getChainData();
            const soapData = await this.getSOAPData();
            
            const metrics = {
                // Basic mining metrics
                hashRate: hashRate,
                powerUsage: powerUsage,
                electricityCost: electricityCost,
                
                // Network data
                network: networkData,
                
                // Chain-specific profitability
                chainProfitability: this.calculateChainProfitability(hashRate, chainData),
                
                // SOAP features
                soap: soapData,
                
                // Combined profitability (mining + staking)
                totalProfitability: this.calculateTotalProfitability(
                    hashRate,
                    powerUsage,
                    electricityCost,
                    chainData,
                    soapData
                ),
                
                // LMT/LMR data
                lmtLmr: this.lmtLmrData,
                
                // Merged mining potential
                mergedMining: this.calculateMergedMiningPotential(hashRate, chainData),
                
                // Estimated earnings
                earnings: this.calculateEarnings(hashRate, chainData, soapData),
                
                // Efficiency metrics
                efficiency: {
                    hashPerWatt: hashRate / powerUsage,
                    profitPerWatt: 0, // Calculated below
                    roi: 0 // Calculated below
                }
            };

            // Calculate profit per watt
            if (metrics.totalProfitability.dailyProfit > 0) {
                metrics.efficiency.profitPerWatt = metrics.totalProfitability.dailyProfit / powerUsage;
            }

            // Calculate ROI (simplified)
            const dailyRevenue = metrics.totalProfitability.dailyRevenue;
            const dailyCost = metrics.totalProfitability.dailyCost;
            if (dailyRevenue > 0) {
                metrics.efficiency.roi = ((dailyRevenue - dailyCost) / dailyCost) * 100;
            }

            return metrics;
        } catch (error) {
            logger.error('Error getting Quai mining metrics:', error);
            return this.getDefaultMetrics(hashRate, powerUsage, electricityCost);
        }
    }

    /**
     * Get network-wide data
     */
    async getNetworkData() {
        try {
            if (!this.fetch) return this.getDefaultNetworkData();

            // Get network hash rate, difficulty, block time from node
            const response = await this.fetch(this.nodeRpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                const blockNumber = parseInt(data.result, 16);
                
                return {
                    blockHeight: blockNumber,
                    networkHashRate: 0, // Would need additional RPC calls
                    averageBlockTime: 10, // Quai target block time
                    difficulty: 0, // Would need additional RPC calls
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            logger.error('Error fetching network data:', error);
        }

        return this.getDefaultNetworkData();
    }

    /**
     * Get chain-specific data
     */
    async getChainData() {
        // This would fetch difficulty for each chain
        // For now, return structure
        return {
            Prime: { difficulty: 0, blockTime: 10, reward: this.chainRewards.Prime },
            Cyprus: { difficulty: 0, blockTime: 10, reward: this.chainRewards.Cyprus },
            Paxos: { difficulty: 0, blockTime: 10, reward: this.chainRewards.Paxos },
            Hydra: { difficulty: 0, blockTime: 10, reward: this.chainRewards.Hydra },
            'Zone-0': { difficulty: 0, blockTime: 10, reward: this.chainRewards['Zone-0'] },
            'Zone-1': { difficulty: 0, blockTime: 10, reward: this.chainRewards['Zone-1'] },
            'Zone-2': { difficulty: 0, blockTime: 10, reward: this.chainRewards['Zone-2'] },
            'Zone-3': { difficulty: 0, blockTime: 10, reward: this.chainRewards['Zone-3'] }
        };
    }

    /**
     * Get SOAP-specific data
     */
    async getSOAPData() {
        return {
            enabled: false, // Would check if SOAP is active
            stakingEnabled: false,
            stakedAmount: 0,
            lockupDays: 0,
            rewardMultiplier: 1.0,
            mergeMiningEnabled: false,
            ravencoinRewards: 0,
            totalSOAPRewards: 0
        };
    }

    /**
     * Calculate profitability for each chain
     */
    calculateChainProfitability(hashRate, chainData) {
        const profitability = {};
        
        for (const [chain, data] of Object.entries(chainData)) {
            if (data.difficulty > 0) {
                // Simplified profitability: reward / difficulty * hashRate
                const baseProfitability = (data.reward / data.difficulty) * hashRate;
                profitability[chain] = {
                    base: baseProfitability,
                    daily: baseProfitability * 8640, // Blocks per day (86400 seconds / 10 second blocks)
                    weekly: baseProfitability * 60480,
                    monthly: baseProfitability * 259200
                };
            } else {
                profitability[chain] = {
                    base: 0,
                    daily: 0,
                    weekly: 0,
                    monthly: 0
                };
            }
        }

        return profitability;
    }

    /**
     * Calculate total profitability including SOAP staking
     */
    calculateTotalProfitability(hashRate, powerUsage, electricityCost, chainData, soapData) {
        // Get most profitable chain
        const chainProfits = this.calculateChainProfitability(hashRate, chainData);
        let maxProfit = 0;
        let bestChain = 'Prime';
        
        for (const [chain, profit] of Object.entries(chainProfits)) {
            if (profit.daily > maxProfit) {
                maxProfit = profit.daily;
                bestChain = chain;
            }
        }

        // Base mining revenue
        const dailyMiningRevenue = maxProfit;
        
        // SOAP staking bonus
        let stakingBonus = 0;
        if (soapData.stakingEnabled && soapData.stakedAmount > 0) {
            const multiplier = this.soapStakingMultipliers[soapData.lockupDays] || 1.0;
            stakingBonus = dailyMiningRevenue * (multiplier - 1.0);
        }

        // Merge mining bonus (if enabled)
        let mergeMiningBonus = 0;
        if (soapData.mergeMiningEnabled) {
            mergeMiningBonus = soapData.ravencoinRewards || 0;
        }

        // Total revenue
        const dailyRevenue = dailyMiningRevenue + stakingBonus + mergeMiningBonus;
        
        // Costs
        const dailyCost = (powerUsage / 1000) * 24 * electricityCost;
        
        // Profit
        const dailyProfit = dailyRevenue - dailyCost;

        return {
            chain: bestChain,
            dailyRevenue,
            dailyCost,
            dailyProfit,
            monthlyProfit: dailyProfit * 30,
            yearlyProfit: dailyProfit * 365,
            stakingBonus,
            mergeMiningBonus,
            miningRevenue: dailyMiningRevenue
        };
    }

    /**
     * Calculate merged mining potential
     */
    calculateMergedMiningPotential(hashRate, chainData) {
        // Calculate potential if mining multiple chains simultaneously
        const chains = Object.keys(chainData);
        let totalPotential = 0;
        
        // Simplified: assume can mine 2-3 chains simultaneously
        const topChains = Object.entries(this.calculateChainProfitability(hashRate, chainData))
            .sort((a, b) => b[1].daily - a[1].daily)
            .slice(0, 3);
        
        topChains.forEach(([chain, profit]) => {
            totalPotential += profit.daily * 0.8; // 80% efficiency when merged mining
        });

        return {
            enabled: false,
            potentialDaily: totalPotential,
            chains: topChains.map(([chain]) => chain),
            efficiency: 0.8 // 80% hash rate per chain when merged
        };
    }

    /**
     * Calculate estimated earnings
     */
    calculateEarnings(hashRate, chainData, soapData) {
        const chainProfits = this.calculateChainProfitability(hashRate, chainData);
        const bestChain = Object.entries(chainProfits)
            .sort((a, b) => b[1].daily - a[1].daily)[0];
        
        const baseEarnings = bestChain[1].daily;
        const stakingBonus = soapData.stakingEnabled ? baseEarnings * 0.15 : 0; // Example 15%
        const mergeBonus = soapData.mergeMiningEnabled ? (soapData.ravencoinRewards || 0) : 0;

        return {
            daily: baseEarnings + stakingBonus + mergeBonus,
            weekly: (baseEarnings + stakingBonus + mergeBonus) * 7,
            monthly: (baseEarnings + stakingBonus + mergeBonus) * 30,
            yearly: (baseEarnings + stakingBonus + mergeBonus) * 365,
            breakdown: {
                mining: baseEarnings,
                staking: stakingBonus,
                mergeMining: mergeBonus
            }
        };
    }

    /**
     * Get default metrics when data unavailable
     */
    getDefaultMetrics(hashRate, powerUsage, electricityCost) {
        return {
            hashRate,
            powerUsage,
            electricityCost,
            network: this.getDefaultNetworkData(),
            chainProfitability: {},
            soap: { enabled: false },
            totalProfitability: {
                dailyRevenue: 0,
                dailyCost: (powerUsage / 1000) * 24 * electricityCost,
                dailyProfit: 0
            },
            efficiency: {
                hashPerWatt: hashRate / powerUsage,
                profitPerWatt: 0,
                roi: 0
            }
        };
    }

    /**
     * Get default network data
     */
    getDefaultNetworkData() {
        return {
            blockHeight: 0,
            networkHashRate: 0,
            averageBlockTime: 10,
            difficulty: 0,
            timestamp: Date.now()
        };
    }

    /**
     * Update LMT/LMR data
     */
    updateLMTLMR(data) {
        this.lmtLmrData = { ...this.lmtLmrData, ...data };
    }

    /**
     * Get SOAP staking multiplier for lockup period
     */
    getStakingMultiplier(lockupDays) {
        // Find closest match
        const periods = Object.keys(this.soapStakingMultipliers).map(Number).sort((a, b) => a - b);
        let closest = periods[0];
        
        for (const period of periods) {
            if (period <= lockupDays) {
                closest = period;
            } else {
                break;
            }
        }
        
        return this.soapStakingMultipliers[closest] || 1.0;
    }
}

module.exports = QuaiMetrics;

