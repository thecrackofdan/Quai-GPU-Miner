/**
 * DePool UI - User interface for DePool management
 */

class DePoolUI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.depoolManager = dashboard.depoolManager;
        this.init();
    }

    init() {
        this.createDePoolModal();
        this.setupEventListeners();
    }

    /**
     * Create DePool management modal
     */
    createDePoolModal() {
        if (document.getElementById('depoolModal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'depoolModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>🏊 DePool Management</h2>
                    <button class="modal-close" id="closeDePoolModal" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- DePool Status -->
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3>DePool Status</h3>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <span>Enable DePool</span>
                                <input type="checkbox" id="depoolEnableToggle" style="width: 20px; height: 20px;">
                            </label>
                        </div>
                        <div id="depoolStatusWidget" style="background: var(--bg-dark); padding: 1rem; border-radius: 8px;">
                            <p style="color: var(--text-secondary);">DePool is disabled</p>
                        </div>
                    </div>

                    <!-- Pool Configuration -->
                    <div style="margin-bottom: 2rem;">
                        <h3>Pool Configuration</h3>
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px;">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">
                                    Pool Fee (%)
                                    <input type="number" id="depoolFee" min="0" max="5" step="0.1" 
                                           style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                                </label>
                                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                    Fee charged to miners (recommended: 0.5-2.0%)
                                </p>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">
                                    Minimum Payout (QUAI)
                                    <input type="number" id="depoolMinPayout" min="0.01" step="0.01" 
                                           style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                                </label>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">
                                    Payout Interval (hours)
                                    <input type="number" id="depoolPayoutInterval" min="1" step="1" 
                                           style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                                </label>
                            </div>
                            <button class="btn-primary" id="saveDepoolConfigBtn" style="width: 100%;">
                                Save Configuration
                            </button>
                        </div>
                    </div>

                    <!-- Pool Statistics -->
                    <div style="margin-bottom: 2rem;">
                        <h3>Pool Statistics</h3>
                        <div id="depoolStatsWidget" style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Total Miners</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;" id="depoolTotalMiners">0</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Total Hash Rate</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;" id="depoolTotalHashRate">0 MH/s</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Blocks Found</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;" id="depoolBlocksFound">0</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Pool Revenue</div>
                                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--success-color);" id="depoolRevenue">0 QUAI</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Pool Fees</div>
                                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--quai-primary);" id="depoolFees">0 QUAI</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Profit Margin</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;" id="depoolProfitMargin">0%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Miners List -->
                    <div style="margin-bottom: 2rem;">
                        <h3>Connected Miners</h3>
                        <div id="depoolMinersList" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; max-height: 400px; overflow-y: auto;">
                            <p style="color: var(--text-secondary);">No miners connected</p>
                        </div>
                    </div>

                    <!-- Profitability Analysis -->
                    <div style="margin-bottom: 2rem;">
                        <h3>Profitability Analysis</h3>
                        <div id="depoolProfitabilityWidget" style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Daily Revenue</div>
                                    <div style="font-size: 1.2rem; font-weight: 600; color: var(--success-color);" id="depoolDailyRevenue">$0.00</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Daily Costs</div>
                                    <div style="font-size: 1.2rem; font-weight: 600; color: var(--error-color);" id="depoolDailyCosts">$0.00</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Daily Profit</div>
                                    <div style="font-size: 1.2rem; font-weight: 600;" id="depoolDailyProfit">$0.00</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Monthly Profit</div>
                                    <div style="font-size: 1.2rem; font-weight: 600;" id="depoolMonthlyProfit">$0.00</div>
                                </div>
                            </div>
                            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                <button class="btn-secondary" id="optimizeFeeBtn" style="width: 100%;">
                                    Optimize Fee for Maximum Profitability
                                </button>
                            </div>
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
        const modal = document.getElementById('depoolModal');
        const closeBtn = document.getElementById('closeDePoolModal');
        const enableToggle = document.getElementById('depoolEnableToggle');
        const saveConfigBtn = document.getElementById('saveDepoolConfigBtn');
        const optimizeFeeBtn = document.getElementById('optimizeFeeBtn');

        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        if (enableToggle) {
            enableToggle.onchange = async (e) => {
                if (e.target.checked) {
                    await this.depoolManager.enable();
                } else {
                    await this.depoolManager.disable();
                }
                this.updateUI();
            };
        }

        if (saveConfigBtn) {
            saveConfigBtn.onclick = async () => {
                const fee = parseFloat(document.getElementById('depoolFee').value);
                const minPayout = parseFloat(document.getElementById('depoolMinPayout').value);
                const payoutInterval = parseFloat(document.getElementById('depoolPayoutInterval').value);

                this.depoolManager.poolConfig.fee = fee;
                this.depoolManager.poolConfig.minPayout = minPayout;
                this.depoolManager.poolConfig.payoutInterval = payoutInterval * 3600000; // Convert to milliseconds

                await this.depoolManager.savePoolConfig();

                if (typeof Toast !== 'undefined') {
                    Toast.success('DePool configuration saved');
                }
            };
        }

        if (optimizeFeeBtn) {
            optimizeFeeBtn.onclick = () => {
                const optimalFee = this.depoolManager.optimizeFee();
                document.getElementById('depoolFee').value = optimalFee;
                
                if (typeof Toast !== 'undefined') {
                    Toast.info(`Recommended fee: ${optimalFee}%`);
                }
            };
        }

        // Update UI periodically
        setInterval(() => {
            if (modal.style.display !== 'none') {
                this.updateUI();
            }
        }, 10000); // Every 10 seconds
    }

    /**
     * Show DePool modal
     */
    show() {
        const modal = document.getElementById('depoolModal');
        if (modal) {
            modal.style.display = 'block';
            this.updateUI();
        }
    }

    /**
     * Update UI with current data
     */
    updateUI() {
        if (!this.depoolManager) return;

        const stats = this.depoolManager.getPoolStats();
        const profitability = stats.profitability;

        // Update status
        const statusWidget = document.getElementById('depoolStatusWidget');
        if (statusWidget) {
            statusWidget.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Status</div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: ${stats.enabled ? 'var(--success-color)' : 'var(--text-secondary)'};">
                            ${stats.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Stratum Endpoint</div>
                        <div style="font-size: 0.9rem; font-family: monospace; margin-top: 4px;">
                            stratum://YOUR_NODE_IP:3333
                        </div>
                    </div>
                </div>
            `;
        }

        // Update toggle
        const enableToggle = document.getElementById('depoolEnableToggle');
        if (enableToggle) {
            enableToggle.checked = stats.enabled;
        }

        // Update config inputs
        const feeInput = document.getElementById('depoolFee');
        const minPayoutInput = document.getElementById('depoolMinPayout');
        const payoutIntervalInput = document.getElementById('depoolPayoutInterval');
        
        if (feeInput) feeInput.value = this.depoolManager.poolConfig.fee;
        if (minPayoutInput) minPayoutInput.value = this.depoolManager.poolConfig.minPayout;
        if (payoutIntervalInput) payoutIntervalInput.value = this.depoolManager.poolConfig.payoutInterval / 3600000;

        // Update statistics
        const totalMiners = document.getElementById('depoolTotalMiners');
        const totalHashRate = document.getElementById('depoolTotalHashRate');
        const blocksFound = document.getElementById('depoolBlocksFound');
        const revenue = document.getElementById('depoolRevenue');
        const fees = document.getElementById('depoolFees');
        const profitMargin = document.getElementById('depoolProfitMargin');

        if (totalMiners) totalMiners.textContent = stats.totalMiners;
        if (totalHashRate) totalHashRate.textContent = `${(stats.totalHashRate / 1000000).toFixed(2)} MH/s`;
        if (blocksFound) blocksFound.textContent = stats.blocksFound;
        if (revenue) revenue.textContent = `${stats.poolRevenue.toFixed(4)} QUAI`;
        if (fees) fees.textContent = `${stats.poolFees.toFixed(4)} QUAI`;
        if (profitMargin) profitMargin.textContent = `${profitability.profitMargin.toFixed(1)}%`;

        // Update profitability
        const dailyRevenue = document.getElementById('depoolDailyRevenue');
        const dailyCosts = document.getElementById('depoolDailyCosts');
        const dailyProfit = document.getElementById('depoolDailyProfit');
        const monthlyProfit = document.getElementById('depoolMonthlyProfit');

        if (dailyRevenue) dailyRevenue.textContent = `$${profitability.revenue.toFixed(2)}`;
        if (dailyCosts) dailyCosts.textContent = `$${profitability.costs.toFixed(2)}`;
        if (dailyProfit) dailyProfit.textContent = `$${profitability.profit.toFixed(2)}`;
        if (monthlyProfit) monthlyProfit.textContent = `$${(profitability.profit * 30).toFixed(2)}`;

        // Update miners list
        this.updateMinersList();
    }

    /**
     * Update miners list
     */
    updateMinersList() {
        const minersList = document.getElementById('depoolMinersList');
        if (!minersList || !this.depoolManager) return;

        const miners = Array.from(this.depoolManager.miners.values());
        
        if (miners.length === 0) {
            minersList.innerHTML = '<p style="color: var(--text-secondary);">No miners connected</p>';
            return;
        }

        minersList.innerHTML = `
            <div style="display: grid; gap: 0.5rem;">
                ${miners.map(miner => `
                    <div style="background: var(--bg-dark); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 0.5rem;">
                                    ${miner.workerName ? `${miner.walletAddress.substring(0, 8)}...${miner.walletAddress.substring(miner.walletAddress.length - 6)}.${miner.workerName}` : miner.walletAddress.substring(0, 16) + '...'}
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                    Hash Rate: ${(miner.hashRate / 1000000).toFixed(2)} MH/s
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                    Shares: ${miner.shares.accepted} accepted, ${miner.shares.rejected} rejected
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">Pending</div>
                                <div style="font-weight: 600; color: var(--quai-primary);">
                                    ${miner.pendingBalance.toFixed(4)} QUAI
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                                    Total Paid: ${miner.totalPaid.toFixed(4)} QUAI
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.DePoolUI = DePoolUI;
}

