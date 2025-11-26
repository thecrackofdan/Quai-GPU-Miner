/**
 * Pool Manager - Quai Network Mining Pools
 * Handles pool selection, configuration, and monitoring
 */

class PoolManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.pools = this.loadPoolList();
        this.currentPool = null;
        this.poolStats = null;
        this.init();
    }

    init() {
        this.loadCurrentPool();
        this.setupUI();
    }

    /**
     * Load list of available pools
     */
    loadPoolList() {
        return [
            {
                id: 'solo',
                name: 'Solo Mining (Your Node)',
                url: 'stratum://localhost:3333',
                fee: 0,
                feePercent: '0%',
                mining: 'Quai Network (All Chains)',
                payout: 'When block found',
                minPayout: 'Block reward',
                uptime: '99.9%',
                recommended: false,
                description: 'Mine directly to your own Quai node. 100% of rewards, no fees. Requires running Quai node.',
                features: [
                    '100% of rewards',
                    'No fees',
                    'Supports decentralization',
                    'Full control'
                ],
                requirements: ['Quai node running', 'Stratum proxy enabled']
            },
            {
                id: 'official',
                name: 'Quai Network Official Pool',
                url: 'stratum+tcp://pool.quai.network:3333',
                fee: 0.5,
                feePercent: '0.5%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Daily',
                minPayout: '0.1 QUAI',
                uptime: '99.9%',
                recommended: true,
                description: 'Official Quai Network mining pool. Low fees, reliable infrastructure, official support.',
                features: [
                    'Lowest fee (0.5%)',
                    'Official support',
                    'High uptime',
                    'Fast payouts'
                ],
                requirements: []
            },
            {
                id: 'quaiminer',
                name: 'QuaiMiner Pool',
                url: 'stratum+tcp://pool.quaiminer.io:3333',
                fee: 1.0,
                feePercent: '1.0%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Daily',
                minPayout: '0.05 QUAI',
                uptime: '99.5%',
                recommended: false,
                description: 'Community-run mining pool with active support and detailed statistics.',
                features: [
                    'Community support',
                    'Detailed statistics',
                    'Active development',
                    'Multi-chain support'
                ],
                requirements: []
            },
            {
                id: 'quaihash',
                name: 'QuaiHash Pool',
                url: 'stratum+tcp://pool.quaihash.com:3333',
                fee: 1.5,
                feePercent: '1.5%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Weekly',
                minPayout: '0.2 QUAI',
                uptime: '99.0%',
                recommended: false,
                description: 'Established mining pool with good uptime and regular payouts.',
                features: [
                    'Established pool',
                    'Good uptime',
                    'Regular payouts'
                ],
                requirements: []
            }
        ];
    }

    /**
     * Load current pool configuration
     */
    async loadCurrentPool() {
        try {
            const response = await fetch('/api/miner/config');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    const poolUrl = data.config.miner?.stratum || data.config.stratum;
                    if (poolUrl) {
                        this.currentPool = this.pools.find(p => 
                            poolUrl.includes(p.url.replace('stratum+tcp://', '').split(':')[0]) ||
                            (p.id === 'solo' && poolUrl.includes('localhost'))
                        ) || { url: poolUrl, name: 'Custom Pool' };
                    }
                }
            }
        } catch (error) {
            console.error('Error loading pool config:', error);
        }
    }

    /**
     * Setup UI elements
     */
    setupUI() {
        // Pool selection will be integrated into settings/modal
        this.createPoolSelectionUI();
    }

    /**
     * Create pool selection interface
     */
    createPoolSelectionUI() {
        // This will be called when pool selection modal is opened
    }

    /**
     * Get recommended pool based on hash rate
     */
    getRecommendedPool(hashRate) {
        if (hashRate < 20) {
            return this.pools.find(p => p.id === 'quaiminer');
        } else if (hashRate < 100) {
            return this.pools.find(p => p.id === 'official');
        } else {
            return this.pools.find(p => p.id === 'solo');
        }
    }

    /**
     * Calculate effective hash rate with pool fee
     */
    calculateEffectiveHashRate(hashRate, poolFee) {
        return hashRate * (1 - poolFee / 100);
    }

    /**
     * Estimate daily earnings
     */
    estimateDailyEarnings(hashRate, poolFee, networkHashRate, blockReward) {
        const effectiveHashRate = this.calculateEffectiveHashRate(hashRate, poolFee);
        const share = effectiveHashRate / networkHashRate;
        const blocksPerDay = 86400 / 10; // Assuming 10s block time
        return share * blocksPerDay * blockReward;
    }

    /**
     * Switch to a pool
     */
    async switchPool(poolId, walletAddress, workerName = '') {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }

        try {
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stratum: pool.url,
                    wallet: walletAddress,
                    worker: workerName || 'rig1'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.currentPool = pool;
                    return { success: true, pool: pool };
                }
            }
            throw new Error('Failed to switch pool');
        } catch (error) {
            console.error('Error switching pool:', error);
            throw error;
        }
    }

    /**
     * Get pool statistics
     */
    async fetchPoolStats(poolUrl) {
        // Fetch pool statistics from pool's API
        // This would need to be implemented per pool
        try {
            // Example: Some pools provide API endpoints
            const apiUrl = poolUrl.replace('stratum+tcp://', 'http://').replace(':3333', ':8080');
            const response = await fetch(`${apiUrl}/api/stats`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching pool stats:', error);
        }
        return null;
    }

    /**
     * Compare pools
     */
    comparePools(hashRate) {
        return this.pools.map(pool => {
            const effectiveHashRate = this.calculateEffectiveHashRate(hashRate, pool.fee);
            return {
                ...pool,
                effectiveHashRate,
                feeCost: hashRate - effectiveHashRate,
                recommendation: this.getRecommendedPool(hashRate)?.id === pool.id
            };
        });
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.PoolManager = PoolManager;
}

