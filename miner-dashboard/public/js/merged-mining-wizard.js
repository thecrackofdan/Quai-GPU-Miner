/**
 * Merged Mining Configuration Wizard
 * Guided setup for merged mining with wallet addresses for all chains
 */

class MergedMiningWizard {
    constructor() {
        this.step = 1;
        this.totalSteps = 4;
        this.walletAddresses = {
            prime: '',
            regions: {
                cyprus: '',
                paxos: '',
                hydra: ''
            },
            zones: {
                cyprus1: '',
                cyprus2: '',
                cyprus3: '',
                paxos1: '',
                paxos2: '',
                paxos3: '',
                hydra1: '',
                hydra2: '',
                hydra3: ''
            }
        };
        this.selectedChains = {
            prime: true,
            cyprus: false,
            paxos: false,
            hydra: false,
            cyprus1: false,
            cyprus2: false,
            cyprus3: false,
            paxos1: false,
            paxos2: false,
            paxos3: false,
            hydra1: false,
            hydra2: false,
            hydra3: false
        };
        this.init();
    }

    init() {
        this.createWizardModal();
        this.loadExistingConfig();
    }

    /**
     * Create the wizard modal
     */
    createWizardModal() {
        // Check if modal already exists
        if (document.getElementById('mergedMiningWizardModal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'mergedMiningWizardModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>🔗 Merged Mining Configuration Wizard</h2>
                    <button class="modal-close" id="closeMergedMiningWizard" aria-label="Close wizard">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Progress Indicator -->
                    <div class="wizard-progress" style="margin-bottom: 2rem;">
                        <div class="progress-bar" style="height: 4px; background: var(--bg-dark); border-radius: 2px; overflow: hidden;">
                            <div id="wizardProgressBar" style="height: 100%; background: var(--quai-primary); width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                            <span>Step <span id="currentStep">1</span> of <span id="totalSteps">4</span></span>
                            <span id="stepTitle">Introduction</span>
                        </div>
                    </div>

                    <!-- Step 1: Introduction -->
                    <div class="wizard-step" id="step1" style="display: block;">
                        <h3 style="margin-bottom: 1rem;">What is Merged Mining?</h3>
                        <p style="margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.6;">
                            Merged mining allows you to mine multiple Quai Network chains simultaneously, 
                            maximizing your rewards across Prime, Regions, and Zones.
                        </p>
                        <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 0.5rem; color: var(--quai-primary);">Chain Hierarchy:</h4>
                            <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                                <li><strong>Prime</strong> (Level 0) - Main coordination chain</li>
                                <li><strong>Regions</strong> (Level 1) - Cyprus, Paxos, Hydra</li>
                                <li><strong>Zones</strong> (Level 2) - 3 zones per region (9 total)</li>
                            </ul>
                        </div>
                        <div style="background: var(--warning-color); color: #000; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <strong>⚠️ Important:</strong> You need a QI wallet address for each chain you want to mine. 
                            You can use the same address for multiple chains, or different addresses for better organization.
                        </div>
                        <p style="color: var(--text-secondary);">
                            This wizard will guide you through:
                        </p>
                        <ol style="margin-left: 1.5rem; color: var(--text-secondary);">
                            <li>Selecting which chains to mine</li>
                            <li>Entering wallet addresses for each chain</li>
                            <li>Reviewing your configuration</li>
                            <li>Generating and saving the config file</li>
                        </ol>
                    </div>

                    <!-- Step 2: Chain Selection -->
                    <div class="wizard-step" id="step2" style="display: none;">
                        <h3 style="margin-bottom: 1rem;">Select Chains to Mine</h3>
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                            Choose which chains you want to include in merged mining. 
                            You can select Prime, Regions, and Zones independently.
                        </p>
                        
                        <!-- Prime Chain -->
                        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 2px solid var(--quai-primary);">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="chain-prime" checked style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                                <div>
                                    <strong style="color: var(--quai-primary); font-size: 1.1rem;">Prime Chain</strong>
                                    <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                                        Level 0 - Main coordination chain (Recommended)
                                    </p>
                                </div>
                            </label>
                        </div>

                        <!-- Regions -->
                        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--text-primary);">Regions (Level 1)</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                            ${['cyprus', 'paxos', 'hydra'].map(region => `
                                <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" id="chain-${region}" style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                                        <div>
                                            <strong style="text-transform: capitalize;">${region}</strong>
                                            <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">
                                                Region ${region === 'cyprus' ? '1' : region === 'paxos' ? '2' : '3'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Zones -->
                        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--text-primary);">Zones (Level 2)</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                            ${['cyprus1', 'cyprus2', 'cyprus3', 'paxos1', 'paxos2', 'paxos3', 'hydra1', 'hydra2', 'hydra3'].map(zone => {
                                const region = zone.replace(/\d+/, '');
                                const zoneNum = zone.replace(/\D+/, '');
                                return `
                                    <div style="background: var(--bg-card); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
                                        <label style="display: flex; align-items: center; cursor: pointer;">
                                            <input type="checkbox" id="chain-${zone}" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                                            <div>
                                                <strong style="text-transform: capitalize; font-size: 0.9rem;">${region} ${zoneNum}</strong>
                                                <p style="margin: 2px 0 0 0; color: var(--text-secondary); font-size: 0.75rem;">
                                                    ${region === 'cyprus' ? 'Region 1' : region === 'paxos' ? 'Region 2' : 'Region 3'}, Zone ${zoneNum}
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">
                                <strong>Tip:</strong> You can select all chains for maximum rewards, or start with just Prime and a few regions/zones.
                            </p>
                        </div>
                    </div>

                    <!-- Step 3: Wallet Addresses -->
                    <div class="wizard-step" id="step3" style="display: none;">
                        <h3 style="margin-bottom: 1rem;">Enter Wallet Addresses</h3>
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                            Enter QI wallet addresses for each selected chain. You can use the same address for multiple chains.
                        </p>
                        
                        <div id="walletInputs" style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
                            <!-- Wallet inputs will be dynamically generated based on selected chains -->
                        </div>

                        <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="useSameAddress" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                    Use the same address for all chains
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Step 4: Review & Generate -->
                    <div class="wizard-step" id="step4" style="display: none;">
                        <h3 style="margin-bottom: 1rem;">Review Configuration</h3>
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                            Review your merged mining configuration before generating the config file.
                        </p>
                        
                        <div id="configReview" style="background: var(--bg-dark); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                            <!-- Configuration review will be displayed here -->
                        </div>

                        <div id="wizardError" class="error-message" style="display: none; margin-bottom: 1rem;"></div>
                        <div id="wizardSuccess" class="success-message" style="display: none; margin-bottom: 1rem;"></div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div style="display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                        <button class="btn-secondary" id="wizardPrevBtn" style="display: none;">← Previous</button>
                        <div style="flex: 1;"></div>
                        <button class="btn-primary" id="wizardNextBtn">Next →</button>
                        <button class="btn-primary" id="wizardFinishBtn" style="display: none;">Generate Config</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const modal = document.getElementById('mergedMiningWizardModal');
        const closeBtn = document.getElementById('closeMergedMiningWizard');
        const prevBtn = document.getElementById('wizardPrevBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        const finishBtn = document.getElementById('wizardFinishBtn');
        const useSameAddress = document.getElementById('useSameAddress');

        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        if (prevBtn) {
            prevBtn.onclick = () => this.previousStep();
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextStep();
        }

        if (finishBtn) {
            finishBtn.onclick = () => this.generateConfig();
        }

        if (useSameAddress) {
            useSameAddress.onchange = (e) => this.handleUseSameAddress(e.target.checked);
        }

        // Chain selection checkboxes
        ['prime', 'cyprus', 'paxos', 'hydra', 'cyprus1', 'cyprus2', 'cyprus3', 'paxos1', 'paxos2', 'paxos3', 'hydra1', 'hydra2', 'hydra3'].forEach(chain => {
            const checkbox = document.getElementById(`chain-${chain}`);
            if (checkbox) {
                checkbox.onchange = (e) => {
                    this.selectedChains[chain] = e.target.checked;
                    if (this.step === 3) {
                        this.updateWalletInputs();
                    }
                };
            }
        });
    }

    /**
     * Load existing configuration
     */
    async loadExistingConfig() {
        try {
            const response = await fetch('/api/miner/config');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    const mergedMining = data.config.mining?.mergedMining;
                    if (mergedMining && mergedMining.enabled) {
                        // Load existing config
                        this.selectedChains = mergedMining.chains || {};
                        this.walletAddresses = mergedMining.wallets || this.walletAddresses;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading existing config:', error);
        }
    }

    /**
     * Show the wizard
     */
    show() {
        const modal = document.getElementById('mergedMiningWizardModal');
        if (modal) {
            modal.style.display = 'block';
            this.step = 1;
            this.updateStep();
        }
    }

    /**
     * Close the wizard
     */
    close() {
        const modal = document.getElementById('mergedMiningWizardModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Update step display
     */
    updateStep() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepEl = document.getElementById(`step${i}`);
            if (stepEl) stepEl.style.display = 'none';
        }

        // Show current step
        const currentStepEl = document.getElementById(`step${this.step}`);
        if (currentStepEl) currentStepEl.style.display = 'block';

        // Update progress
        const progressBar = document.getElementById('wizardProgressBar');
        if (progressBar) {
            progressBar.style.width = `${(this.step / this.totalSteps) * 100}%`;
        }

        // Update step info
        const currentStepSpan = document.getElementById('currentStep');
        const stepTitle = document.getElementById('stepTitle');
        if (currentStepSpan) currentStepSpan.textContent = this.step;
        
        const titles = {
            1: 'Introduction',
            2: 'Chain Selection',
            3: 'Wallet Addresses',
            4: 'Review & Generate'
        };
        if (stepTitle) stepTitle.textContent = titles[this.step] || '';

        // Update buttons
        const prevBtn = document.getElementById('wizardPrevBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        const finishBtn = document.getElementById('wizardFinishBtn');

        if (prevBtn) prevBtn.style.display = this.step > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.step < this.totalSteps ? 'block' : 'none';
        if (finishBtn) finishBtn.style.display = this.step === this.totalSteps ? 'block' : 'none';

        // Update step-specific content
        if (this.step === 2) {
            this.updateChainCheckboxes();
        } else if (this.step === 3) {
            this.updateWalletInputs();
        } else if (this.step === 4) {
            this.updateReview();
        }
    }

    /**
     * Update chain checkboxes based on selection
     */
    updateChainCheckboxes() {
        Object.keys(this.selectedChains).forEach(chain => {
            const checkbox = document.getElementById(`chain-${chain}`);
            if (checkbox) {
                checkbox.checked = this.selectedChains[chain];
            }
        });
    }

    /**
     * Update wallet inputs based on selected chains
     */
    updateWalletInputs() {
        const container = document.getElementById('walletInputs');
        if (!container) return;

        const selectedChains = Object.keys(this.selectedChains).filter(chain => this.selectedChains[chain]);
        
        if (selectedChains.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No chains selected. Please go back and select at least one chain.</p>';
            return;
        }

        container.innerHTML = selectedChains.map(chain => {
            const label = this.getChainLabel(chain);
            const currentValue = this.getWalletAddress(chain);
            return `
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">
                        ${label}:
                    </label>
                    <input 
                        type="text" 
                        id="wallet-${chain}" 
                        value="${currentValue}"
                        placeholder="0x..." 
                        style="width: 100%; padding: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;"
                        onchange="window.mergedMiningWizard.setWalletAddress('${chain}', this.value)"
                    />
                </div>
            `;
        }).join('');
    }

    /**
     * Get chain label for display
     */
    getChainLabel(chain) {
        const labels = {
            prime: 'Prime Chain (Level 0)',
            cyprus: 'Cyprus Region (Level 1)',
            paxos: 'Paxos Region (Level 1)',
            hydra: 'Hydra Region (Level 1)',
            cyprus1: 'Cyprus Zone 1 (Level 2)',
            cyprus2: 'Cyprus Zone 2 (Level 2)',
            cyprus3: 'Cyprus Zone 3 (Level 2)',
            paxos1: 'Paxos Zone 1 (Level 2)',
            paxos2: 'Paxos Zone 2 (Level 2)',
            paxos3: 'Paxos Zone 3 (Level 2)',
            hydra1: 'Hydra Zone 1 (Level 2)',
            hydra2: 'Hydra Zone 2 (Level 2)',
            hydra3: 'Hydra Zone 3 (Level 2)'
        };
        return labels[chain] || chain;
    }

    /**
     * Get wallet address for chain
     */
    getWalletAddress(chain) {
        if (chain === 'prime') {
            return this.walletAddresses.prime || '';
        } else if (['cyprus', 'paxos', 'hydra'].includes(chain)) {
            return this.walletAddresses.regions[chain] || '';
        } else {
            return this.walletAddresses.zones[chain] || '';
        }
    }

    /**
     * Set wallet address for chain
     */
    setWalletAddress(chain, address) {
        if (chain === 'prime') {
            this.walletAddresses.prime = address;
        } else if (['cyprus', 'paxos', 'hydra'].includes(chain)) {
            this.walletAddresses.regions[chain] = address;
        } else {
            this.walletAddresses.zones[chain] = address;
        }
    }

    /**
     * Handle "use same address" checkbox
     */
    handleUseSameAddress(checked) {
        if (!checked) return;

        const selectedChains = Object.keys(this.selectedChains).filter(chain => this.selectedChains[chain]);
        if (selectedChains.length === 0) return;

        // Get first wallet input value
        const firstInput = document.getElementById(`wallet-${selectedChains[0]}`);
        if (!firstInput || !firstInput.value) {
            if (typeof Toast !== 'undefined') {
                Toast.warning('Please enter an address in the first field first');
            }
            return;
        }

        const address = firstInput.value;
        
        // Set all inputs to same value
        selectedChains.forEach(chain => {
            const input = document.getElementById(`wallet-${chain}`);
            if (input) {
                input.value = address;
                this.setWalletAddress(chain, address);
            }
        });
    }

    /**
     * Previous step
     */
    previousStep() {
        if (this.step > 1) {
            this.step--;
            this.updateStep();
        }
    }

    /**
     * Next step
     */
    nextStep() {
        if (this.step === 2) {
            // Validate at least one chain selected
            const selectedCount = Object.values(this.selectedChains).filter(v => v).length;
            if (selectedCount === 0) {
                if (typeof Toast !== 'undefined') {
                    Toast.error('Please select at least one chain to mine');
                } else {
                    alert('Please select at least one chain to mine');
                }
                return;
            }
        } else if (this.step === 3) {
            // Validate all selected chains have wallet addresses
            const selectedChains = Object.keys(this.selectedChains).filter(chain => this.selectedChains[chain]);
            const missing = selectedChains.filter(chain => {
                const address = this.getWalletAddress(chain);
                return !address || address.trim() === '';
            });

            if (missing.length > 0) {
                if (typeof Toast !== 'undefined') {
                    Toast.error(`Please enter wallet addresses for: ${missing.map(c => this.getChainLabel(c)).join(', ')}`);
                } else {
                    alert(`Please enter wallet addresses for all selected chains`);
                }
                return;
            }
        }

        if (this.step < this.totalSteps) {
            this.step++;
            this.updateStep();
        }
    }

    /**
     * Update review display
     */
    updateReview() {
        const container = document.getElementById('configReview');
        if (!container) return;

        const selectedChains = Object.keys(this.selectedChains).filter(chain => this.selectedChains[chain]);
        
        container.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--quai-primary);">Selected Chains (${selectedChains.length})</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                ${selectedChains.map(chain => `
                    <div style="background: var(--bg-card); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color);">
                        <strong style="display: block; margin-bottom: 4px;">${this.getChainLabel(chain)}</strong>
                        <code style="font-size: 0.75rem; color: var(--text-secondary); word-break: break-all;">
                            ${this.getWalletAddress(chain)}
                        </code>
                    </div>
                `).join('')}
            </div>
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 6px; border-left: 3px solid var(--quai-primary);">
                <strong>Configuration Summary:</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                    <li>Merged mining: <strong style="color: var(--success-color);">Enabled</strong></li>
                    <li>Chains to mine: <strong>${selectedChains.length}</strong></li>
                    <li>Prime chain: <strong>${this.selectedChains.prime ? 'Yes' : 'No'}</strong></li>
                    <li>Regions: <strong>${['cyprus', 'paxos', 'hydra'].filter(r => this.selectedChains[r]).length}</strong></li>
                    <li>Zones: <strong>${['cyprus1', 'cyprus2', 'cyprus3', 'paxos1', 'paxos2', 'paxos3', 'hydra1', 'hydra2', 'hydra3'].filter(z => this.selectedChains[z]).length}</strong></li>
                </ul>
            </div>
        `;
    }

    /**
     * Generate and save configuration
     */
    async generateConfig() {
        const errorEl = document.getElementById('wizardError');
        const successEl = document.getElementById('wizardSuccess');
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';

        try {
            // Build chain IDs array
            const chainIds = [];
            if (this.selectedChains.prime) chainIds.push(0);
            if (this.selectedChains.cyprus) chainIds.push(1);
            if (this.selectedChains.paxos) chainIds.push(2);
            if (this.selectedChains.hydra) chainIds.push(3);
            // Zones would need specific chain IDs - for now using region-based IDs
            // In actual implementation, zones have specific chain IDs

            // Build merged mining config
            const mergedMiningConfig = {
                enabled: true,
                chains: chainIds,
                wallets: this.walletAddresses,
                selectedChains: this.selectedChains
            };

            // Save configuration
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mining: {
                        mergedMining: mergedMiningConfig
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (successEl) {
                        successEl.textContent = 'Merged mining configuration saved successfully!';
                        successEl.style.display = 'block';
                    }

                    if (typeof Toast !== 'undefined') {
                        Toast.success('Merged mining configuration saved!');
                    }

                    // Download config file
                    this.downloadConfigFile(mergedMiningConfig);

                    // Close wizard after delay
                    setTimeout(() => {
                        this.close();
                        // Reload page or update dashboard
                        if (window.location.reload) {
                            window.location.reload();
                        }
                    }, 2000);
                } else {
                    throw new Error(data.error || 'Failed to save configuration');
                }
            } else {
                throw new Error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error generating config:', error);
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to generate configuration';
                errorEl.style.display = 'block';
            }
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to save configuration: ' + error.message);
            }
        }
    }

    /**
     * Download config file
     */
    downloadConfigFile(config) {
        const configJson = JSON.stringify(config, null, 2);
        const blob = new Blob([configJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged-mining-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize wizard on page load
if (typeof window !== 'undefined') {
    window.MergedMiningWizard = MergedMiningWizard;
    
    // Create global instance
    document.addEventListener('DOMContentLoaded', () => {
        window.mergedMiningWizard = new MergedMiningWizard();
    });
}

