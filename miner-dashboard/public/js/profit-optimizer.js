/**
 * Profit Optimizer - Auto-switching between Quai Network chains for maximum rewards
 * Leverages Quai's unique multi-chain architecture with different difficulties and rewards
 */

class ProfitOptimizer {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isEnabled = false;
        this.checkInterval = 300000; // 5 minutes
        this.chainData = {};
        this.currentBestChain = null;
        this.switchHistory = [];
        this.optimizationStrategy = 'profitability'; // 'profitability', 'stability', 'balanced'
        this.minSwitchThreshold = 0.05; // 5% minimum improvement to switch
        this.init();
    }

    init() {
        this.loadSettings();
        this.initializeChainData();
        if (this.isEnabled) {
            this.start();
        }
    }

    /**
     * Initialize chain data structure
     */
    initializeChainData() {
        // Quai Network chain structure
        this.chains = {
            prime: {
                id: 0,
                name: 'Prime',
                level: 0,
                token: 'QUAI',
                enabled: true
            },
            cyprus: {
                id: 1,
                name: 'Cyprus',
                level: 1,
                token: 'QI',
                enabled: false
            },
            paxos: {
                id: 2,
                name: 'Paxos',
                level: 1,
                token: 'QI',
                enabled: false
            },
            hydra: {
                id: 3,
                name: 'Hydra',
                level: 1,
                token: 'QI',
                enabled: false
            },
            // Zones would be added here
            cyprus1: { id: 4, name: 'Cyprus Zone 1', level: 2, token: 'QI', enabled: false },
            cyprus2: { id: 5, name: 'Cyprus Zone 2', level: 2, token: 'QI', enabled: false },
            cyprus3: { id: 6, name: 'Cyprus Zone 3', level: 2, token: 'QI', enabled: false },
            paxos1: { id: 7, name: 'Paxos Zone 1', level: 2, token: 'QI', enabled: false },
            paxos2: { id: 8, name: 'Paxos Zone 2', level: 2, token: 'QI', enabled: false },
            paxos3: { id: 9, name: 'Paxos Zone 3', level: 2, token: 'QI', enabled: false },
            hydra1: { id: 10, name: 'Hydra Zone 1', level: 2, token: 'QI', enabled: false },
            hydra2: { id: 11, name: 'Hydra Zone 2', level: 2, token: 'QI', enabled: false },
            hydra3: { id: 12, name: 'Hydra Zone 3', level: 2, token: 'QI', enabled: false }
        };
    }

    /**
     * Load optimizer settings
     */
    async loadSettings() {
        try {
            const response = await fetch('/api/optimizer/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.isEnabled = data.settings?.enabled || false;
                    this.optimizationStrategy = data.settings?.strategy || 'profitability';
                    this.minSwitchThreshold = data.settings?.minSwitchThreshold || 0.05;
                    this.checkInterval = data.settings?.checkInterval || 300000;
                }
            }
        } catch (error) {
            console.error('Error loading optimizer settings:', error);
        }
    }

    /**
     * Start profit optimization
     */
    start() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.isEnabled = true;
        this.checkProfitability();
        this.intervalId = setInterval(() => this.checkProfitability(), this.checkInterval);
        
        if (typeof Toast !== 'undefined') {
            Toast.success('Profit optimizer started');
        }
    }

    /**
     * Stop profit optimization
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isEnabled = false;
        
        if (typeof Toast !== 'undefined') {
            Toast.info('Profit optimizer stopped');
        }
    }

    /**
     * Check profitability across all chains
     */
    async checkProfitability() {
        try {
            // Fetch difficulty and reward data for all chains
            const chainMetrics = await this.fetchChainMetrics();
            
            // Calculate profitability for each chain
            const profitability = this.calculateProfitability(chainMetrics);
            
            // Find best chain
            const bestChain = this.findBestChain(profitability);
            
            // Switch if better chain found
            if (bestChain && this.shouldSwitch(bestChain)) {
                await this.switchToChain(bestChain);
            }
            
            // Update UI
            this.updateProfitabilityDisplay(profitability);
            
        } catch (error) {
            console.error('Error checking profitability:', error);
        }
    }

    /**
     * Fetch metrics for all chains
     */
    async fetchChainMetrics() {
        const metrics = {};
        
        // Fetch from node RPC for each chain
        for (const [chainKey, chain] of Object.entries(this.chains)) {
            if (!chain.enabled) continue;
            
            try {
                // Get difficulty, block reward, network hash rate for this chain
                // Pass chainKey (e.g., "prime", "cyprus") instead of chain.id for staking data lookup
                const response = await fetch('/api/chain/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chainId: chain.id, chainKey: chainKey })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    metrics[chainKey] = {
                        difficulty: data.difficulty || 0,
                        blockReward: data.blockReward || 0,
                        networkHashRate: data.networkHashRate || 0,
                        blockTime: data.blockTime || 10,
                        price: data.price || 0, // Token price if available
                        stakingAPY: data.stakingAPY || 0,
                        stakingRewards: data.stakingRewards || 0,
                        ...data
                    };
                }
            } catch (error) {
                console.error(`Error fetching metrics for ${chainKey}:`, error);
            }
        }
        
        return metrics;
    }

    /**
     * Calculate profitability for each chain (including staking rewards)
     */
    calculateProfitability(chainMetrics) {
        const profitability = {};
        const userHashRate = this.getUserHashRate();
        
        // Get staking data if available
        const stakingData = this.stakingData || {};
        
        for (const [chainKey, metrics] of Object.entries(chainMetrics)) {
            const chain = this.chains[chainKey];
            if (!chain || !metrics.difficulty || !metrics.blockReward) continue;
            
            // Calculate expected blocks per day
            const blocksPerDay = (86400 / metrics.blockTime);
            
            // Calculate share of network
            const networkShare = userHashRate / metrics.networkHashRate;
            
            // Calculate expected mining rewards per day
            const expectedMiningRewards = networkShare * blocksPerDay * metrics.blockReward;
            
            // Get staking rewards for this chain (from staking manager or metrics)
            const stakingRewards = metrics.stakingRewards || stakingData[chainKey]?.daily || 0;
            const stakingAPY = metrics.stakingAPY || stakingData[chainKey]?.apy || 0;
            
            // Calculate combined rewards (mining + staking)
            const expectedCombinedRewards = expectedMiningRewards + stakingRewards;
            
            // Calculate profitability score (rewards per MH/s per day)
            const miningProfitabilityScore = expectedMiningRewards / (userHashRate || 1);
            const combinedProfitabilityScore = expectedCombinedRewards / (userHashRate || 1);
            
            // Factor in token price if available
            const miningValueScore = miningProfitabilityScore * (metrics.price || 1);
            const combinedValueScore = combinedProfitabilityScore * (metrics.price || 1);
            
            // Calculate staking contribution percentage
            const stakingContribution = stakingRewards > 0 
                ? (stakingRewards / expectedCombinedRewards) * 100 
                : 0;
            
            profitability[chainKey] = {
                chain: chain,
                expectedMiningRewards: expectedMiningRewards,
                expectedStakingRewards: stakingRewards,
                expectedCombinedRewards: expectedCombinedRewards,
                miningProfitabilityScore: miningProfitabilityScore,
                combinedProfitabilityScore: combinedProfitabilityScore,
                miningValueScore: miningValueScore,
                combinedValueScore: combinedValueScore, // Use combined for auto-selection
                valueScore: combinedValueScore, // Default to combined for backward compatibility
                networkShare: networkShare,
                blocksPerDay: blocksPerDay,
                difficulty: metrics.difficulty,
                blockReward: metrics.blockReward,
                price: metrics.price || 0,
                stakingAPY: stakingAPY,
                stakingContribution: stakingContribution,
                hasStaking: stakingRewards > 0
            };
        }
        
        return profitability;
    }

    /**
     * Update staking data from staking manager
     */
    updateStakingData(stakingRewards) {
        this.stakingData = stakingRewards;
        // Recalculate profitability if optimizer is running
        if (this.isEnabled) {
            this.checkProfitability();
        }
    }

    /**
     * Get user's current hash rate
     */
    getUserHashRate() {
        if (this.dashboard && this.dashboard.miningData) {
            return this.dashboard.miningData.hashRate || 0;
        }
        return 0;
    }

    /**
     * Find best chain based on optimization strategy (considers staking + mining)
     */
    findBestChain(profitability) {
        if (Object.keys(profitability).length === 0) return null;
        
        let bestChain = null;
        let bestScore = -Infinity;
        
        for (const [chainKey, data] of Object.entries(profitability)) {
            let score = 0;
            
            // Use combined value score (mining + staking) for auto-selection
            const baseScore = data.combinedValueScore || data.valueScore;
            
            switch (this.optimizationStrategy) {
                case 'profitability':
                    // Prioritize combined profitability (mining + staking)
                    score = baseScore;
                    // Bonus for chains with staking (if enabled)
                    if (data.hasStaking && data.stakingContribution > 0) {
                        score *= (1 + (data.stakingContribution / 100) * 0.1); // 10% bonus for staking
                    }
                    break;
                case 'stability':
                    // Prefer chains with lower difficulty variance, but still consider staking
                    score = baseScore * (1 - (data.difficulty / 1000000000)); // Simplified
                    if (data.hasStaking) {
                        score *= 1.05; // 5% bonus for staking stability
                    }
                    break;
                case 'balanced':
                    // Balance between profitability and stability, with staking consideration
                    score = baseScore * 0.7 + (data.networkShare * 1000) * 0.3;
                    if (data.hasStaking) {
                        score *= 1.08; // 8% bonus for balanced approach with staking
                    }
                    break;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestChain = chainKey;
            }
        }
        
        return bestChain;
    }

    /**
     * Determine if should switch chains
     */
    shouldSwitch(newChain) {
        if (!this.currentBestChain) return true;
        if (newChain === this.currentBestChain) return false;
        
        const currentProfitability = this.chainData[this.currentBestChain]?.valueScore || 0;
        const newProfitability = this.chainData[newChain]?.valueScore || 0;
        
        // Only switch if improvement is above threshold
        const improvement = (newProfitability - currentProfitability) / currentProfitability;
        return improvement >= this.minSwitchThreshold;
    }

    /**
     * Switch to a different chain
     */
    async switchToChain(chainKey) {
        const chain = this.chains[chainKey];
        if (!chain) return;
        
        try {
            // Update merged mining config to focus on this chain
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mining: {
                        mergedMining: {
                            enabled: true,
                            chains: [chain.id],
                            autoSwitched: true,
                            switchedAt: Date.now(),
                            previousChain: this.currentBestChain
                        }
                    }
                })
            });
            
            if (response.ok) {
                const previousChain = this.currentBestChain;
                this.currentBestChain = chainKey;
                
                // Log switch
                this.switchHistory.push({
                    from: previousChain,
                    to: chainKey,
                    timestamp: Date.now(),
                    reason: 'Profitability optimization'
                });
                
                if (typeof Toast !== 'undefined') {
                    Toast.success(`Switched to ${chain.name} for better profitability`);
                }
                
                // Restart miner if needed
                await this.restartMiner();
            }
        } catch (error) {
            console.error('Error switching chain:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to switch chain');
            }
        }
    }

    /**
     * Restart miner to apply new chain
     */
    async restartMiner() {
        try {
            const response = await fetch('/api/miner/restart', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to restart miner');
            }
        } catch (error) {
            console.error('Error restarting miner:', error);
        }
    }

    /**
     * Update profitability display in UI
     */
    updateProfitabilityDisplay(profitability) {
        this.chainData = profitability;
        
        // Update profitability widget if it exists
        const widget = document.getElementById('profitabilityWidget');
        if (widget) {
            this.renderProfitabilityWidget(widget, profitability);
        }
    }

    /**
     * Render profitability widget (shows mining + staking)
     */
    renderProfitabilityWidget(container, profitability) {
        const sorted = Object.entries(profitability)
            .sort((a, b) => (b[1].combinedValueScore || b[1].valueScore) - (a[1].combinedValueScore || a[1].valueScore));
        
        container.innerHTML = `
            <div class="profitability-list">
                ${sorted.map(([chainKey, data], index) => {
                    const isCurrent = chainKey === this.currentBestChain;
                    const hasStaking = data.hasStaking && data.expectedStakingRewards > 0;
                    const combinedRewards = data.expectedCombinedRewards || data.expectedRewards;
                    
                    return `
                        <div class="profitability-item ${isCurrent ? 'active' : ''}" style="
                            background: var(--bg-card);
                            padding: 1rem;
                            border-radius: 8px;
                            margin-bottom: 0.5rem;
                            border: 2px solid ${isCurrent ? 'var(--quai-primary)' : 'var(--border-color)'};
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="color: ${isCurrent ? 'var(--quai-primary)' : 'var(--text-primary)'};">
                                        ${data.chain.name} ${isCurrent ? '← Current' : ''}
                                        ${hasStaking ? '💰' : ''}
                                    </strong>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                        ${data.chain.token} • Difficulty: ${this.formatNumber(data.difficulty)}
                                        ${hasStaking ? ` • Staking APY: ${(data.stakingAPY || 0).toFixed(2)}%` : ''}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--success-color);">
                                        ${this.formatReward(combinedRewards)} ${data.chain.token}/day
                                    </div>
                                    ${hasStaking ? `
                                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                                            Mining: ${this.formatReward(data.expectedMiningRewards)} + 
                                            Staking: ${this.formatReward(data.expectedStakingRewards)}
                                        </div>
                                    ` : ''}
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                                        Score: ${(data.combinedValueScore || data.valueScore).toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Format number for display
     */
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    /**
     * Format reward for display
     */
    formatReward(reward) {
        if (reward >= 1) return reward.toFixed(4);
        if (reward >= 0.01) return reward.toFixed(6);
        return reward.toFixed(8);
    }

    /**
     * Get optimization statistics
     */
    getStats() {
        return {
            enabled: this.isEnabled,
            currentChain: this.currentBestChain,
            switchCount: this.switchHistory.length,
            lastSwitch: this.switchHistory[this.switchHistory.length - 1] || null,
            chainData: this.chainData
        };
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.ProfitOptimizer = ProfitOptimizer;
}

