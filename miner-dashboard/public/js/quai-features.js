/**
 * Quai Network Features Display
 * Highlights unique Quai Network features and value propositions
 */

class QuaiFeatures {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.init();
    }

    init() {
        this.createQuaiInfoPanel();
        this.addQuaiTooltips();
        this.updateQuaiMetrics();
    }

    /**
     * Create Quai Network information panel
     */
    createQuaiInfoPanel() {
        // Check if panel already exists
        if (document.getElementById('quaiInfoPanel')) return;

        const panel = document.createElement('div');
        panel.id = 'quaiInfoPanel';
        panel.className = 'quai-info-panel';
        panel.innerHTML = `
            <div class="quai-info-header">
                <h3>⚡ Quai Network</h3>
                <button class="quai-info-close" onclick="this.closest('.quai-info-panel').classList.toggle('collapsed')" title="Toggle panel">
                    <span class="collapse-icon">▼</span>
                </button>
            </div>
            <div class="quai-info-content">
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">🌐</div>
                    <div class="quai-feature-text">
                        <strong>Multi-Chain Architecture</strong>
                        <p>Prime, Regions, and Zones - mine across all chains simultaneously</p>
                    </div>
                </div>
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">🔗</div>
                    <div class="quai-feature-text">
                        <strong>Merged Mining</strong>
                        <p>Mine multiple chains at once for maximum rewards</p>
                    </div>
                </div>
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">⚡</div>
                    <div class="quai-feature-text">
                        <strong>ProgPoW Algorithm</strong>
                        <p>GPU-friendly mining algorithm optimized for modern hardware</p>
                    </div>
                </div>
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">🛡️</div>
                    <div class="quai-feature-text">
                        <strong>Decentralized</strong>
                        <p>Support network decentralization by running your own node</p>
                    </div>
                </div>
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">💰</div>
                    <div class="quai-feature-text">
                        <strong>100% Rewards</strong>
                        <p>Solo mining means you keep 100% of block rewards</p>
                    </div>
                </div>
                <div class="quai-feature-item">
                    <div class="quai-feature-icon">🔐</div>
                    <div class="quai-feature-text">
                        <strong>Privacy First</strong>
                        <p>No tracking, no data collection - your mining, your data</p>
                    </div>
                </div>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('.dashboard-header');
        if (header) {
            header.insertAdjacentElement('afterend', panel);
        }
    }

    /**
     * Add Quai Network tooltips to key elements
     */
    addQuaiTooltips() {
        // Add tooltips to network badges
        const miningMode = document.getElementById('miningMode');
        if (miningMode) {
            miningMode.setAttribute('data-tooltip', 
                'Solo mining means you mine directly to your own Quai node. You keep 100% of block rewards and support network decentralization.');
        }

        const mergedMiningStatus = document.getElementById('mergedMiningStatus');
        if (mergedMiningStatus) {
            mergedMiningStatus.setAttribute('data-tooltip',
                'Merged mining allows you to mine multiple Quai chains (Prime, Regions, Zones) simultaneously, maximizing your rewards.');
        }

        // Add tooltip to ProgPoW badge
        const progpowBadge = document.querySelector('.network-badge');
        if (progpowBadge && progpowBadge.textContent.includes('ProgPoW')) {
            progpowBadge.setAttribute('data-tooltip',
                'ProgPoW (Programmatic Proof-of-Work) is a GPU-friendly mining algorithm that resists ASIC mining, keeping mining decentralized.');
        }
    }

    /**
     * Update Quai Network specific metrics display
     */
    updateQuaiMetrics() {
        // This will be called when mining data updates
        if (this.dashboard && this.dashboard.miningData) {
            const data = this.dashboard.miningData;
            
            // Update chain information
            if (data.network && data.network.currentChain) {
                const chainInfo = document.getElementById('currentChainInfo');
                if (chainInfo) {
                    chainInfo.textContent = `Mining: ${data.network.currentChain}`;
                }
            }

            // Update merged mining status
            if (data.network && data.network.mergedMining) {
                const mergedStatus = document.getElementById('mergedMiningStatus');
                if (mergedStatus) {
                    mergedStatus.style.display = 'inline-block';
                    mergedStatus.textContent = `Merged Mining (${data.network.mergedMining.chains?.length || 0} chains)`;
                }
            }
        }
    }

    /**
     * Show Quai Network educational modal
     */
    showQuaiEducation() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>⚡ About Quai Network</h2>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="quai-education-section">
                        <h3>🌐 Multi-Chain Architecture</h3>
                        <p>Quai Network uses a unique multi-chain architecture with three levels:</p>
                        <ul>
                            <li><strong>Prime Chain:</strong> The main chain that coordinates all regions</li>
                            <li><strong>Regions:</strong> Intermediate chains that coordinate zones</li>
                            <li><strong>Zones:</strong> Individual chains that process transactions</li>
                        </ul>
                        <p>This architecture allows for massive scalability while maintaining decentralization.</p>
                    </div>

                    <div class="quai-education-section">
                        <h3>🔗 Merged Mining</h3>
                        <p>Quai Network supports merged mining, allowing you to mine multiple chains simultaneously:</p>
                        <ul>
                            <li>Mine Prime + Regions + Zones at the same time</li>
                            <li>Maximize your mining rewards</li>
                            <li>Support multiple chains with the same hardware</li>
                        </ul>
                    </div>

                    <div class="quai-education-section">
                        <h3>⚡ ProgPoW Algorithm</h3>
                        <p>Quai Network uses ProgPoW (Programmatic Proof-of-Work):</p>
                        <ul>
                            <li>GPU-friendly mining algorithm</li>
                            <li>Resists ASIC mining</li>
                            <li>Keeps mining decentralized</li>
                            <li>Optimized for modern GPUs</li>
                        </ul>
                    </div>

                    <div class="quai-education-section">
                        <h3>💰 Solo Mining Benefits</h3>
                        <p>Mining solo on Quai Network provides:</p>
                        <ul>
                            <li><strong>100% of Rewards:</strong> No pool fees, you keep everything</li>
                            <li><strong>Full Control:</strong> Your node, your rewards</li>
                            <li><strong>Network Support:</strong> Help decentralize the network</li>
                            <li><strong>Privacy:</strong> No pool tracking or data collection</li>
                        </ul>
                    </div>

                    <div class="quai-education-section">
                        <h3>🛡️ Privacy & Security</h3>
                        <p>Quai Network and Quai GPU Miner prioritize:</p>
                        <ul>
                            <li>No data collection</li>
                            <li>No tracking</li>
                            <li>Local storage only</li>
                            <li>Full user control</li>
                        </ul>
                    </div>

                    <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 2px solid var(--quai-primary);">
                        <p style="margin: 0; color: var(--text-primary);">
                            <strong>Learn More:</strong> 
                            <a href="https://docs.qu.ai" target="_blank" style="color: var(--quai-primary);">Quai Network Documentation</a> | 
                            <a href="https://qu.ai" target="_blank" style="color: var(--quai-primary);">Quai Network Website</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.QuaiFeatures = QuaiFeatures;
}

