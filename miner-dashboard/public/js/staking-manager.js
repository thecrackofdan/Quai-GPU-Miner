/**
 * Staking Manager - SOAP Protocol Staking Integration
 * Manages staking balances, lockup periods, and rewards
 */

class StakingManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.stakingBalances = {};
        this.stakingRewards = {};
        this.lockupPeriods = {};
        this.updateInterval = 30000; // 30 seconds
        this.init();
    }

    init() {
        this.loadStakingData();
        this.startAutoUpdate();
    }

    /**
     * Load staking data from server
     */
    async loadStakingData() {
        try {
            const response = await fetch('/api/staking/balances');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.stakingBalances = data.balances || {};
                    this.stakingRewards = data.rewards || {};
                    this.lockupPeriods = data.lockupPeriods || {};
                    this.updateUI();
                }
            }
        } catch (error) {
            console.error('Error loading staking data:', error);
        }
    }

    /**
     * Get staking balance for a specific chain
     */
    getStakingBalance(chainId) {
        return this.stakingBalances[chainId] || {
            staked: 0,
            available: 0,
            locked: 0,
            totalRewards: 0,
            pendingRewards: 0
        };
    }

    /**
     * Get staking rewards for a specific chain
     */
    getStakingRewards(chainId) {
        return this.stakingRewards[chainId] || {
            daily: 0,
            weekly: 0,
            monthly: 0,
            total: 0,
            apy: 0
        };
    }

    /**
     * Get lockup period info for a specific chain
     */
    getLockupPeriod(chainId) {
        return this.lockupPeriods[chainId] || {
            period: 0,
            daysRemaining: 0,
            unlockDate: null,
            rewardMultiplier: 1.0
        };
    }

    /**
     * Calculate total staking rewards across all chains
     */
    getTotalStakingRewards() {
        let total = 0;
        for (const chainId in this.stakingRewards) {
            total += this.stakingRewards[chainId].daily || 0;
        }
        return total;
    }

    /**
     * Calculate combined profitability (mining + staking)
     */
    calculateCombinedProfitability(chainId, miningRewards, stakingRewards) {
        const staking = this.getStakingRewards(chainId);
        const combinedDaily = (miningRewards || 0) + (staking.daily || 0);
        
        return {
            mining: miningRewards || 0,
            staking: staking.daily || 0,
            combined: combinedDaily,
            stakingAPY: staking.apy || 0,
            stakingMultiplier: this.getLockupPeriod(chainId).rewardMultiplier || 1.0
        };
    }

    /**
     * Start auto-update interval
     */
    startAutoUpdate() {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
        }
        
        this.updateIntervalId = setInterval(() => {
            this.loadStakingData();
        }, this.updateInterval);
    }

    /**
     * Stop auto-update
     */
    stopAutoUpdate() {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = null;
        }
    }

    /**
     * Update UI with staking data
     */
    updateUI() {
        // Update staking widget if it exists
        const widget = document.getElementById('stakingWidget');
        if (widget) {
            this.renderStakingWidget(widget);
        }

        // Update profit optimizer with staking data
        if (this.dashboard && this.dashboard.profitOptimizer) {
            this.dashboard.profitOptimizer.updateStakingData(this.stakingRewards);
        }
    }

    /**
     * Render staking widget
     */
    renderStakingWidget(container) {
        const totalStaked = Object.values(this.stakingBalances).reduce((sum, balance) => {
            return sum + (balance.staked || 0);
        }, 0);

        const totalRewards = Object.values(this.stakingRewards).reduce((sum, rewards) => {
            return sum + (rewards.daily || 0);
        }, 0);

        container.innerHTML = `
            <div class="staking-summary">
                <h3>💰 Staking Overview</h3>
                <div class="staking-stats">
                    <div class="staking-stat">
                        <span class="label">Total Staked:</span>
                        <span class="value">${this.formatAmount(totalStaked)} QUAI</span>
                    </div>
                    <div class="staking-stat">
                        <span class="label">Daily Rewards:</span>
                        <span class="value">${this.formatAmount(totalRewards)} QUAI</span>
                    </div>
                </div>
                <button class="btn-secondary" id="viewStakingDetailsBtn" style="margin-top: 1rem; width: 100%;">
                    View Staking Details
                </button>
            </div>
        `;

        // Add click handler
        const detailsBtn = document.getElementById('viewStakingDetailsBtn');
        if (detailsBtn) {
            detailsBtn.onclick = () => this.showStakingDetails();
        }
    }

    /**
     * Show staking details modal
     */
    showStakingDetails() {
        // This will be implemented in staking-ui.js
        if (window.stakingUI) {
            window.stakingUI.show();
        }
    }

    /**
     * Format amount for display
     */
    formatAmount(amount) {
        if (amount === 0) return '0.00';
        if (amount < 0.01) return amount.toFixed(6);
        return amount.toFixed(2);
    }

    /**
     * Stake tokens
     */
    async stakeTokens(chainId, amount, lockupDays) {
        try {
            const response = await fetch('/api/staking/stake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId,
                    amount,
                    lockupDays
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await this.loadStakingData();
                    if (typeof Toast !== 'undefined') {
                        Toast.success(`Staked ${amount} QUAI for ${lockupDays} days`);
                    }
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error staking tokens:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to stake tokens');
            }
            return false;
        }
    }

    /**
     * Unstake tokens (if lockup period expired)
     */
    async unstakeTokens(chainId, amount) {
        try {
            const response = await fetch('/api/staking/unstake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId,
                    amount
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await this.loadStakingData();
                    if (typeof Toast !== 'undefined') {
                        Toast.success(`Unstaked ${amount} QUAI`);
                    }
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error unstaking tokens:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to unstake tokens');
            }
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StakingManager;
}

