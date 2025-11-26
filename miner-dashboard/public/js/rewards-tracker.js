/**
 * Rewards Tracker - Enhanced rewards calculation and tracking
 * Provides accurate reward estimates and historical tracking
 */

class RewardsTracker {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.rewardHistory = [];
        this.blockRewards = [];
        this.estimatedRewards = {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0
        };
        this.init();
    }

    init() {
        this.loadRewardHistory();
        this.startRewardTracking();
    }

    /**
     * Calculate estimated rewards based on hash rate
     */
    calculateEstimatedRewards(hashRate, networkDifficulty, blockReward, blockTime) {
        if (!hashRate || hashRate === 0 || !networkDifficulty || networkDifficulty === 0) {
            return {
                daily: 0,
                weekly: 0,
                monthly: 0,
                yearly: 0,
                timeToBlock: Infinity,
                blockProbability: 0
            };
        }

        // Convert hash rate to hashes per second
        const hashesPerSecond = hashRate * 1000000; // MH/s to H/s
        
        // Calculate probability of finding a block
        const networkHashRate = networkDifficulty / blockTime; // Approximate
        const probability = hashesPerSecond / networkHashRate;
        
        // Expected time to find a block (in seconds)
        const timeToBlock = probability > 0 ? 1 / probability : Infinity;
        
        // Calculate rewards
        const secondsPerDay = 86400;
        const blocksPerDay = secondsPerDay / blockTime;
        const expectedBlocksPerDay = blocksPerDay * probability;
        const dailyReward = expectedBlocksPerDay * blockReward;
        
        return {
            daily: dailyReward,
            weekly: dailyReward * 7,
            monthly: dailyReward * 30,
            yearly: dailyReward * 365,
            timeToBlock: timeToBlock,
            blockProbability: probability * 100, // As percentage
            expectedBlocksPerDay: expectedBlocksPerDay
        };
    }

    /**
     * Update reward estimates
     */
    updateRewardEstimates() {
        if (!this.dashboard || !this.dashboard.miningData) return;

        const data = this.dashboard.miningData;
        const network = data.network || {};
        
        const hashRate = data.hashRate || 0;
        const difficulty = network.difficulty || 1000000000;
        const blockReward = 2.0; // Default Quai block reward (adjust based on chain)
        const blockTime = network.blockTime || 10; // 10 seconds default
        
        this.estimatedRewards = this.calculateEstimatedRewards(
            hashRate,
            difficulty,
            blockReward,
            blockTime
        );

        this.updateRewardDisplay();
    }

    /**
     * Update reward display in UI
     */
    updateRewardDisplay() {
        // Update daily reward
        const dailyEl = document.getElementById('dailyReward');
        if (dailyEl) {
            dailyEl.textContent = this.estimatedRewards.daily.toFixed(6) + ' QUAI';
        }

        // Update weekly reward
        const weeklyEl = document.getElementById('weeklyReward');
        if (weeklyEl) {
            weeklyEl.textContent = this.estimatedRewards.weekly.toFixed(6) + ' QUAI';
        }

        // Update monthly reward
        const monthlyEl = document.getElementById('monthlyReward');
        if (monthlyEl) {
            monthlyEl.textContent = this.estimatedRewards.monthly.toFixed(6) + ' QUAI';
        }

        // Update time to block
        const timeToBlockEl = document.getElementById('timeToBlock');
        if (timeToBlockEl) {
            if (this.estimatedRewards.timeToBlock === Infinity) {
                timeToBlockEl.textContent = 'N/A';
            } else {
                const hours = Math.floor(this.estimatedRewards.timeToBlock / 3600);
                const days = Math.floor(hours / 24);
                if (days > 0) {
                    timeToBlockEl.textContent = `${days}d ${hours % 24}h`;
                } else {
                    timeToBlockEl.textContent = `${hours}h`;
                }
            }
        }

        // Update block probability
        const probabilityEl = document.getElementById('blockProbability');
        if (probabilityEl) {
            probabilityEl.textContent = this.estimatedRewards.blockProbability.toFixed(4) + '%';
        }
    }

    /**
     * Track actual block rewards
     */
    trackBlockReward(blockNumber, reward, chain) {
        const rewardEntry = {
            timestamp: Date.now(),
            blockNumber,
            reward,
            chain: chain || 'Prime',
            hashRate: this.dashboard?.miningData?.hashRate || 0
        };

        this.blockRewards.push(rewardEntry);
        this.rewardHistory.push(rewardEntry);

        // Keep only last 1000 entries
        if (this.rewardHistory.length > 1000) {
            this.rewardHistory.shift();
        }

        // Save to localStorage
        this.saveRewardHistory();
    }

    /**
     * Get total rewards
     */
    getTotalRewards() {
        return this.rewardHistory.reduce((sum, entry) => sum + (entry.reward || 0), 0);
    }

    /**
     * Get rewards by time period
     */
    getRewardsByPeriod(hours = 24) {
        const cutoff = Date.now() - (hours * 3600 * 1000);
        return this.rewardHistory
            .filter(entry => entry.timestamp >= cutoff)
            .reduce((sum, entry) => sum + (entry.reward || 0), 0);
    }

    /**
     * Save reward history
     */
    saveRewardHistory() {
        try {
            localStorage.setItem('rewardHistory', JSON.stringify(this.rewardHistory));
        } catch (error) {
            console.error('Error saving reward history:', error);
        }
    }

    /**
     * Load reward history
     */
    loadRewardHistory() {
        try {
            const saved = localStorage.getItem('rewardHistory');
            if (saved) {
                this.rewardHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading reward history:', error);
            this.rewardHistory = [];
        }
    }

    /**
     * Start reward tracking
     */
    startRewardTracking() {
        // Update estimates every 30 seconds
        setInterval(() => {
            this.updateRewardEstimates();
        }, 30000);

        // Initial update
        this.updateRewardEstimates();
    }

    /**
     * Get reward statistics
     */
    getRewardStats() {
        const total = this.getTotalRewards();
        const last24h = this.getRewardsByPeriod(24);
        const last7d = this.getRewardsByPeriod(168);
        const last30d = this.getRewardsByPeriod(720);

        return {
            total,
            last24h,
            last7d,
            last30d,
            blockCount: this.rewardHistory.length,
            averageReward: this.rewardHistory.length > 0 
                ? total / this.rewardHistory.length 
                : 0
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.RewardsTracker = RewardsTracker;
}

