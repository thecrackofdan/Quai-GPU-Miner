/**
 * Staking UI - User interface for staking management
 */

class StakingUI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.stakingManager = dashboard.stakingManager;
        this.init();
    }

    init() {
        this.createStakingModal();
        this.setupEventListeners();
    }

    /**
     * Create staking details modal
     */
    createStakingModal() {
        if (document.getElementById('stakingModal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'stakingModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>💰 SOAP Staking Management</h2>
                    <button class="modal-close" id="closeStakingModal" aria-label="Close staking modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="stakingError" class="error-message" style="display: none; margin-bottom: 1rem;"></div>
                    <div id="stakingSuccess" class="success-message" style="display: none; margin-bottom: 1rem;"></div>

                    <!-- Staking Overview -->
                    <div class="staking-overview" style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--quai-primary);">Staking Overview</h3>
                        <div class="staking-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="staking-stat-card" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Total Staked</div>
                                <div class="stat-value" id="totalStakedValue" style="font-size: 1.5rem; font-weight: bold; color: var(--quai-primary);">0.00 QUAI</div>
                            </div>
                            <div class="staking-stat-card" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Daily Rewards</div>
                                <div class="stat-value" id="totalDailyRewards" style="font-size: 1.5rem; font-weight: bold; color: var(--quai-primary);">0.00 QUAI</div>
                            </div>
                            <div class="staking-stat-card" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                                <div class="stat-label" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Average APY</div>
                                <div class="stat-value" id="averageAPY" style="font-size: 1.5rem; font-weight: bold; color: var(--quai-primary);">0.00%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Chain-Specific Staking -->
                    <div class="chain-staking-section">
                        <h3 style="margin-bottom: 1rem; color: var(--quai-primary);">Chain Staking Details</h3>
                        <div id="chainStakingList" style="margin-bottom: 2rem;">
                            <!-- Chain staking cards will be rendered here -->
                        </div>
                    </div>

                    <!-- Stake Tokens Form -->
                    <div class="stake-form-section" style="border-top: 1px solid var(--border-color); padding-top: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--quai-primary);">Stake Tokens</h3>
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary);">Select Chain:</label>
                                <select id="stakeChainSelect" class="currency-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-dark); color: var(--text-primary);">
                                    <option value="">Select a chain...</option>
                                    <option value="prime">Prime (QUAI)</option>
                                    <option value="cyprus">Cyprus (QI)</option>
                                    <option value="paxos">Paxos (QI)</option>
                                    <option value="hydra">Hydra (QI)</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary);">Amount to Stake:</label>
                                <input type="number" id="stakeAmount" placeholder="0.00" step="0.01" min="0" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-dark); color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary);">Lockup Period:</label>
                                <select id="stakeLockupDays" class="currency-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-dark); color: var(--text-primary);">
                                    <option value="7">7 days (1.0x rewards)</option>
                                    <option value="30">30 days (1.1x rewards)</option>
                                    <option value="90">90 days (1.25x rewards)</option>
                                    <option value="180">180 days (1.5x rewards)</option>
                                    <option value="365">365 days (2.0x rewards)</option>
                                </select>
                                <p class="setting-hint" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                                    Longer lockup periods provide higher reward multipliers
                                </p>
                            </div>
                            <button class="btn-primary" id="submitStakeBtn" style="width: 100%; margin-top: 1rem;">Stake Tokens</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const modal = document.getElementById('stakingModal');
        const closeBtn = document.getElementById('closeStakingModal');
        const submitBtn = document.getElementById('submitStakeBtn');

        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        if (submitBtn) {
            submitBtn.onclick = () => this.handleStake();
        }

        // Close on outside click
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    /**
     * Show staking modal
     */
    show() {
        const modal = document.getElementById('stakingModal');
        if (modal) {
            modal.style.display = 'block';
            this.loadStakingData();
        }
    }

    /**
     * Load and display staking data
     */
    async loadStakingData() {
        if (!this.stakingManager) return;

        await this.stakingManager.loadStakingData();
        this.renderStakingData();
    }

    /**
     * Render staking data
     */
    renderStakingData() {
        if (!this.stakingManager) return;

        const balances = this.stakingManager.stakingBalances;
        const rewards = this.stakingManager.stakingRewards;

        // Calculate totals
        let totalStaked = 0;
        let totalDailyRewards = 0;
        let totalAPY = 0;
        let chainCount = 0;

        for (const chainId in balances) {
            const balance = balances[chainId];
            const reward = rewards[chainId] || {};
            totalStaked += balance.staked || 0;
            totalDailyRewards += reward.daily || 0;
            if (reward.apy) {
                totalAPY += reward.apy;
                chainCount++;
            }
        }

        const avgAPY = chainCount > 0 ? totalAPY / chainCount : 0;

        // Update overview
        const totalStakedEl = document.getElementById('totalStakedValue');
        const totalRewardsEl = document.getElementById('totalDailyRewards');
        const avgAPYEl = document.getElementById('averageAPY');

        if (totalStakedEl) totalStakedEl.textContent = `${this.formatAmount(totalStaked)} QUAI`;
        if (totalRewardsEl) totalRewardsEl.textContent = `${this.formatAmount(totalDailyRewards)} QUAI`;
        if (avgAPYEl) avgAPYEl.textContent = `${avgAPY.toFixed(2)}%`;

        // Render chain-specific staking
        this.renderChainStaking();
    }

    /**
     * Render chain-specific staking cards
     */
    renderChainStaking() {
        const container = document.getElementById('chainStakingList');
        if (!container || !this.stakingManager) return;

        const balances = this.stakingManager.stakingBalances;
        const rewards = this.stakingManager.stakingRewards;
        const lockups = this.stakingManager.lockupPeriods;

        if (Object.keys(balances).length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>No staking positions yet. Stake tokens to start earning rewards!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = Object.keys(balances).map(chainId => {
            const balance = balances[chainId];
            const reward = rewards[chainId] || {};
            const lockup = lockups[chainId] || {};

            const daysRemaining = lockup.daysRemaining || 0;
            const unlockDate = lockup.unlockDate ? new Date(lockup.unlockDate).toLocaleDateString() : 'N/A';
            const multiplier = lockup.rewardMultiplier || 1.0;

            return `
                <div class="chain-staking-card" style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h4 style="margin: 0; color: var(--quai-primary);">${this.getChainName(chainId)}</h4>
                            <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">Chain ID: ${chainId}</p>
                        </div>
                        <span class="staking-badge" style="background: var(--quai-primary); color: #000; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                            ${multiplier.toFixed(2)}x Rewards
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Staked</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-primary);">${this.formatAmount(balance.staked || 0)}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Daily Rewards</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: var(--quai-primary);">${this.formatAmount(reward.daily || 0)}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">APY</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-primary);">${(reward.apy || 0).toFixed(2)}%</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Days Remaining</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: ${daysRemaining > 0 ? 'var(--text-primary)' : 'var(--quai-primary)'};">
                                ${daysRemaining > 0 ? daysRemaining : 'Unlocked'}
                            </div>
                        </div>
                    </div>
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Unlock Date: ${unlockDate}
                            </div>
                            ${daysRemaining === 0 ? `
                                <button class="btn-secondary" onclick="window.stakingUI.unstake('${chainId}', ${balance.locked || 0})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                                    Unstake
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Handle stake submission
     */
    async handleStake() {
        const chainId = document.getElementById('stakeChainSelect')?.value;
        const amount = parseFloat(document.getElementById('stakeAmount')?.value);
        const lockupDays = parseInt(document.getElementById('stakeLockupDays')?.value);

        if (!chainId || !amount || !lockupDays) {
            this.showError('Please fill in all fields');
            return;
        }

        if (amount <= 0) {
            this.showError('Amount must be greater than 0');
            return;
        }

        const success = await this.stakingManager.stakeTokens(chainId, amount, lockupDays);
        if (success) {
            this.showSuccess('Tokens staked successfully!');
            await this.loadStakingData();
            // Clear form
            document.getElementById('stakeAmount').value = '';
        }
    }

    /**
     * Unstake tokens
     */
    async unstake(chainId, amount) {
        if (!confirm(`Unstake ${amount} QUAI from ${this.getChainName(chainId)}?`)) {
            return;
        }

        const success = await this.stakingManager.unstakeTokens(chainId, amount);
        if (success) {
            this.showSuccess('Tokens unstaked successfully!');
            await this.loadStakingData();
        }
    }

    /**
     * Get chain name from ID
     */
    getChainName(chainId) {
        const names = {
            'prime': 'Prime',
            'cyprus': 'Cyprus',
            'paxos': 'Paxos',
            'hydra': 'Hydra'
        };
        return names[chainId] || chainId;
    }

    /**
     * Format amount
     */
    formatAmount(amount) {
        if (amount === 0) return '0.00';
        if (amount < 0.01) return amount.toFixed(6);
        return amount.toFixed(2);
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = document.getElementById('stakingError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successEl = document.getElementById('stakingSuccess');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.StakingUI = StakingUI;
}

