// Interactive Setup Wizard for New Miners
class SetupWizard {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: 'Welcome to Quai GPU Miner!',
                content: `
                    <div class="wizard-content">
                        <h3>🎉 Ready to Start Solo Mining?</h3>
                        <p>This wizard will guide you through setting up Quai GPU Miner in just a few steps.</p>
                        <div class="wizard-benefits">
                            <div class="benefit-item">✅ 100% of your rewards (no pool fees)</div>
                            <div class="benefit-item">✅ Full control over your mining</div>
                            <div class="benefit-item">✅ Support network decentralization</div>
                            <div class="benefit-item">✅ Easy setup in minutes</div>
                        </div>
                        <p><strong>Estimated time: 5-10 minutes</strong></p>
                    </div>
                `,
                canSkip: false
            },
            {
                title: 'Check Prerequisites',
                content: `
                    <div class="wizard-content">
                        <h3>What You'll Need:</h3>
                        <div class="prerequisites-list">
                            <div class="prereq-item">
                                <input type="checkbox" id="prereq-gpu">
                                <label for="prereq-gpu">AMD or NVIDIA GPU</label>
                            </div>
                            <div class="prereq-item">
                                <input type="checkbox" id="prereq-node">
                                <label for="prereq-node">Quai Network node (or we'll help you set one up)</label>
                            </div>
                            <div class="prereq-item">
                                <input type="checkbox" id="prereq-internet">
                                <label for="prereq-internet">Stable internet connection</label>
                            </div>
                            <div class="prereq-item">
                                <input type="checkbox" id="prereq-power">
                                <label for="prereq-power">Adequate power supply</label>
                            </div>
                        </div>
                        <p class="wizard-hint">✅ Check all that apply, then click Next</p>
                    </div>
                `,
                canSkip: false,
                validate: () => {
                    const checked = document.querySelectorAll('#wizardModal input[type="checkbox"]:checked').length;
                    return checked >= 2;
                }
            },
            {
                title: 'Choose Your Path',
                content: `
                    <div class="wizard-content">
                        <h3>How would you like to start?</h3>
                        <div class="path-options">
                            <div class="path-card" data-path="testnet">
                                <h4>🧪 Testnet Practice</h4>
                                <p>Learn on testnet first - no risk, real experience</p>
                                <ul>
                                    <li>Practice mining safely</li>
                                    <li>Test your setup</li>
                                    <li>Learn the system</li>
                                </ul>
                            </div>
                            <div class="path-card" data-path="mainnet">
                                <h4>⚡ Mainnet Mining</h4>
                                <p>Start mining on mainnet immediately</p>
                                <ul>
                                    <li>Real rewards</li>
                                    <li>Full features</li>
                                    <li>Production ready</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                canSkip: false
            },
            {
                title: 'Node Configuration',
                content: `
                    <div class="wizard-content">
                        <h3>Configure Your Quai Node</h3>
                        <p>You'll need a Quai Network node running. Choose an option:</p>
                        <div class="node-options">
                            <div class="node-option">
                                <input type="radio" name="node-setup" id="node-existing" value="existing">
                                <label for="node-existing">
                                    <strong>I already have a node</strong>
                                    <span>Enter your node's RPC URL</span>
                                </label>
                                <input type="text" id="node-rpc-url" placeholder="http://localhost:8545" style="display: none;">
                            </div>
                            <div class="node-option">
                                <input type="radio" name="node-setup" id="node-new" value="new">
                                <label for="node-new">
                                    <strong>I need to set up a node</strong>
                                    <span>We'll guide you through it</span>
                                </label>
                            </div>
                        </div>
                    </div>
                `,
                canSkip: false
            },
            {
                title: 'GPU Setup',
                content: `
                    <div class="wizard-content">
                        <h3>GPU Configuration</h3>
                        <p>Detect and configure your GPU:</p>
                        <div id="gpu-detection">
                            <button class="btn-primary" id="detect-gpu-btn">🔍 Detect GPU</button>
                            <div id="gpu-results" style="margin-top: 1rem; display: none;">
                                <p>GPU Detected: <span id="detected-gpu"></span></p>
                                <p>Status: <span id="gpu-status"></span></p>
                            </div>
                        </div>
                        <div class="wizard-hint">
                            💡 For AMD GPUs, we'll help you install drivers automatically
                        </div>
                    </div>
                `,
                canSkip: true
            },
            {
                title: 'Final Configuration',
                content: `
                    <div class="wizard-content">
                        <h3>Almost Done!</h3>
                        <p>Review your configuration:</p>
                        <div id="config-review">
                            <div class="review-item">
                                <strong>Network:</strong> <span id="review-network">-</span>
                            </div>
                            <div class="review-item">
                                <strong>Node RPC:</strong> <span id="review-rpc">-</span>
                            </div>
                            <div class="review-item">
                                <strong>GPU:</strong> <span id="review-gpu">-</span>
                            </div>
                        </div>
                        <div class="wizard-actions-final">
                            <button class="btn-primary" id="start-mining-btn">🚀 Start Mining!</button>
                        </div>
                    </div>
                `,
                canSkip: false
            }
        ];
        this.init();
    }
    
    init() {
        this.createWizardModal();
        this.attachEventListeners();
    }
    
    createWizardModal() {
        const modal = document.createElement('div');
        modal.id = 'wizardModal';
        modal.className = 'wizard-modal';
        modal.innerHTML = `
            <div class="wizard-modal-content">
                <div class="wizard-header">
                    <h2 id="wizard-title">Setup Wizard</h2>
                    <button class="wizard-close" id="wizard-close-btn">&times;</button>
                </div>
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="wizard-progress"></div>
                    </div>
                    <span id="wizard-step-indicator">Step 1 of ${this.steps.length}</span>
                </div>
                <div class="wizard-body" id="wizard-body">
                    <!-- Content will be inserted here -->
                </div>
                <div class="wizard-footer">
                    <button class="btn-secondary" id="wizard-prev" style="display: none;">← Previous</button>
                    <button class="btn-secondary" id="wizard-skip" style="display: none;">Skip</button>
                    <button class="btn-primary" id="wizard-next">Next →</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.updateStep();
    }
    
    attachEventListeners() {
        const nextBtn = document.getElementById('wizard-next');
        const prevBtn = document.getElementById('wizard-prev');
        const skipBtn = document.getElementById('wizard-skip');
        const closeBtn = document.getElementById('wizard-close-btn');
        
        nextBtn.onclick = () => this.nextStep();
        prevBtn.onclick = () => this.prevStep();
        skipBtn.onclick = () => this.nextStep();
        closeBtn.onclick = () => this.close();
        
        // Path selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.path-card')) {
                const path = e.target.closest('.path-card').dataset.path;
                this.selectedPath = path;
                document.querySelectorAll('.path-card').forEach(card => {
                    card.classList.remove('selected');
                });
                e.target.closest('.path-card').classList.add('selected');
            }
        });
        
        // Node setup radio
        document.addEventListener('change', (e) => {
            if (e.target.name === 'node-setup') {
                const rpcInput = document.getElementById('node-rpc-url');
                if (e.target.value === 'existing') {
                    rpcInput.style.display = 'block';
                } else {
                    rpcInput.style.display = 'none';
                }
            }
        });
        
        // GPU detection
        const detectBtn = document.getElementById('detect-gpu-btn');
        if (detectBtn) {
            detectBtn.onclick = () => this.detectGPU();
        }
        
        // Start mining
        const startBtn = document.getElementById('start-mining-btn');
        if (startBtn) {
            startBtn.onclick = () => this.startMining();
        }
    }
    
    show() {
        const modal = document.getElementById('wizardModal');
        if (modal) {
            modal.style.display = 'flex';
            this.currentStep = 0;
            this.updateStep();
        }
    }
    
    close() {
        const modal = document.getElementById('wizardModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    updateStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        document.getElementById('wizard-title').textContent = step.title;
        document.getElementById('wizard-body').innerHTML = step.content;
        document.getElementById('wizard-step-indicator').textContent = 
            `Step ${this.currentStep + 1} of ${this.steps.length}`;
        document.getElementById('wizard-progress').style.width = 
            `${((this.currentStep + 1) / this.steps.length) * 100}%`;
        
        // Update buttons
        document.getElementById('wizard-prev').style.display = 
            this.currentStep > 0 ? 'block' : 'none';
        document.getElementById('wizard-skip').style.display = 
            step.canSkip ? 'block' : 'none';
        document.getElementById('wizard-next').textContent = 
            this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next →';
        
        // Re-attach event listeners for new content
        this.attachEventListeners();
    }
    
    nextStep() {
        const step = this.steps[this.currentStep];
        if (step.validate && !step.validate()) {
            alert('Please complete this step before continuing');
            return;
        }
        
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStep();
        } else {
            this.complete();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }
    
    async detectGPU() {
        const resultsDiv = document.getElementById('gpu-results');
        const detectedGpu = document.getElementById('detected-gpu');
        const gpuStatus = document.getElementById('gpu-status');
        
        resultsDiv.style.display = 'block';
        detectedGpu.textContent = 'Detecting...';
        gpuStatus.textContent = 'Please wait...';
        
        try {
            // Try to detect GPU via API
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                if (data.gpus && data.gpus.length > 0) {
                    detectedGpu.textContent = data.gpus[0].name || 'GPU Detected';
                    gpuStatus.textContent = '✅ Ready';
                } else {
                    detectedGpu.textContent = 'No GPU detected';
                    gpuStatus.textContent = '⚠️ Check GPU connection';
                }
            }
        } catch (error) {
            detectedGpu.textContent = 'Detection failed';
            gpuStatus.textContent = '❌ Error: ' + error.message;
        }
    }
    
    startMining() {
        // Collect configuration
        const config = {
            network: this.selectedPath || 'mainnet',
            nodeRpc: document.getElementById('node-rpc-url')?.value || 'http://localhost:8545',
            gpu: document.getElementById('detected-gpu')?.textContent || 'Unknown'
        };
        
        // Save configuration
        localStorage.setItem('quaiminer-wizard-config', JSON.stringify(config));
        
        // Close wizard
        this.close();
        
        // Show success message
        alert('✅ Setup complete! Your configuration has been saved. You can now start mining!');
        
        // Optionally redirect to dashboard or start mining
        if (typeof dashboard !== 'undefined') {
            // Auto-configure dashboard
            console.log('Configuration saved:', config);
        }
    }
    
    complete() {
        this.startMining();
    }
}

// Auto-show wizard for first-time users
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const hasCompletedWizard = localStorage.getItem('quaiminer-wizard-completed');
        if (!hasCompletedWizard) {
            setTimeout(() => {
                const wizard = new SetupWizard();
                wizard.show();
            }, 2000);
        }
    });
}

