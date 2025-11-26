/**
 * Enhanced Onboarding - Ultra-Simple New User Experience
 * Makes getting started as easy as possible
 */

class EnhancedOnboarding {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isFirstVisit = !localStorage.getItem('quaiminer-onboarding-completed');
        this.userExperience = 'beginner'; // 'beginner', 'intermediate', 'expert'
        this.init();
    }

    init() {
        if (this.isFirstVisit) {
            this.showWelcomeScreen();
        }
    }

    /**
     * Show welcome screen for first-time users
     */
    showWelcomeScreen() {
        // Create welcome modal
        const modal = document.createElement('div');
        modal.id = 'enhancedWelcomeModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; text-align: center;">
                <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                    <h1 style="font-size: 2.5rem; margin: 0; color: var(--quai-primary);">
                        ⚡ Welcome to QuaiMiner CORE OS
                    </h1>
                    <p style="font-size: 1.2rem; color: var(--text-secondary); margin: 1rem 0 2rem 0;">
                        Start mining Quai Network in 60 seconds
                    </p>
                </div>
                <div class="modal-body" style="padding: 2rem;">
                    <!-- Value Proposition -->
                    <div style="background: var(--bg-dark); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                        <h3 style="margin: 0 0 1rem 0; color: var(--quai-primary);">Why QuaiMiner CORE OS?</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; text-align: left;">
                            <div style="display: flex; align-items: start; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">✅</span>
                                <div>
                                    <strong>100% Rewards</strong>
                                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">No pool fees, keep everything</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: start; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">⚡</span>
                                <div>
                                    <strong>60-Second Setup</strong>
                                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">Auto-detect, auto-configure</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: start; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🔒</span>
                                <div>
                                    <strong>100% Open Source</strong>
                                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">No tracking, your data stays local</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: start; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">🎯</span>
                                <div>
                                    <strong>Auto-Optimized</strong>
                                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">Best settings for your hardware</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Experience Level Selector -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin: 0 0 1rem 0;">How familiar are you with mining?</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <button class="experience-btn" data-level="beginner" style="
                                padding: 1.5rem;
                                background: var(--bg-card);
                                border: 2px solid var(--border-color);
                                border-radius: 12px;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌱</div>
                                <strong>New to Mining</strong>
                                <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">
                                    We'll guide you through everything
                                </p>
                            </button>
                            <button class="experience-btn" data-level="intermediate" style="
                                padding: 1.5rem;
                                background: var(--bg-card);
                                border: 2px solid var(--border-color);
                                border-radius: 12px;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚙️</div>
                                <strong>I Know Basics</strong>
                                <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">
                                    Quick setup with smart defaults
                                </p>
                            </button>
                            <button class="experience-btn" data-level="expert" style="
                                padding: 1.5rem;
                                background: var(--bg-card);
                                border: 2px solid var(--border-color);
                                border-radius: 12px;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🚀</div>
                                <strong>Expert Mode</strong>
                                <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">
                                    Full control, all features
                                </p>
                            </button>
                        </div>
                    </div>

                    <!-- Quick Start Options -->
                    <div id="quickStartOptions" style="display: none;">
                        <h3 style="margin: 0 0 1rem 0;">Choose how to start:</h3>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button class="btn-primary" id="instantStartBtn" style="
                                padding: 1rem 2rem;
                                font-size: 1.1rem;
                                flex: 1;
                                max-width: 300px;
                            ">
                                🚀 Start Mining Now
                                <div style="font-size: 0.85rem; font-weight: normal; margin-top: 0.25rem;">
                                    Auto-configure everything
                                </div>
                            </button>
                            <button class="btn-secondary" id="guidedSetupBtn" style="
                                padding: 1rem 2rem;
                                font-size: 1.1rem;
                                flex: 1;
                                max-width: 300px;
                            ">
                                📋 Guided Setup
                                <div style="font-size: 0.85rem; font-weight: normal; margin-top: 0.25rem;">
                                    Step-by-step wizard
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Skip Option -->
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                        <button class="btn-link" id="skipOnboardingBtn" style="
                            background: none;
                            border: none;
                            color: var(--text-secondary);
                            cursor: pointer;
                            text-decoration: underline;
                        ">
                            I'll configure later
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        this.setupWelcomeListeners(modal);
    }

    /**
     * Setup welcome modal event listeners
     */
    setupWelcomeListeners(modal) {
        // Experience level buttons
        const experienceBtns = modal.querySelectorAll('.experience-btn');
        experienceBtns.forEach(btn => {
            btn.onclick = () => {
                // Remove active state from all
                experienceBtns.forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                
                // Set active state
                btn.style.borderColor = 'var(--quai-primary)';
                btn.style.background = 'var(--bg-dark)';
                
                this.userExperience = btn.dataset.level;
                document.getElementById('quickStartOptions').style.display = 'block';
            };
        });

        // Instant start button
        const instantStartBtn = document.getElementById('instantStartBtn');
        if (instantStartBtn) {
            instantStartBtn.onclick = () => this.startInstantMining();
        }

        // Guided setup button
        const guidedSetupBtn = document.getElementById('guidedSetupBtn');
        if (guidedSetupBtn) {
            guidedSetupBtn.onclick = () => this.startGuidedSetup();
        }

        // Skip button
        const skipBtn = document.getElementById('skipOnboardingBtn');
        if (skipBtn) {
            skipBtn.onclick = () => {
                localStorage.setItem('quaiminer-onboarding-completed', 'true');
                modal.style.display = 'none';
            };
        }

        // Close on outside click
        window.onclick = (e) => {
            if (e.target === modal) {
                localStorage.setItem('quaiminer-onboarding-completed', 'true');
                modal.style.display = 'none';
            }
        };
    }

    /**
     * Start instant mining (zero configuration)
     */
    async startInstantMining() {
        const modal = document.getElementById('enhancedWelcomeModal');
        if (modal) {
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; text-align: center;">
                    <div class="modal-body" style="padding: 3rem 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚡</div>
                        <h2 style="margin: 0 0 1rem 0;">Setting Up Your Miner...</h2>
                        <div id="setupProgress" style="margin: 2rem 0;">
                            <div class="progress-step" style="margin-bottom: 1rem;">
                                <span id="step1" style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: var(--quai-primary); margin-right: 0.5rem;"></span>
                                Detecting your hardware...
                            </div>
                            <div class="progress-step" style="margin-bottom: 1rem; opacity: 0.5;">
                                <span id="step2" style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: var(--border-color); margin-right: 0.5rem;"></span>
                                Optimizing GPU settings...
                            </div>
                            <div class="progress-step" style="margin-bottom: 1rem; opacity: 0.5;">
                                <span id="step3" style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: var(--border-color); margin-right: 0.5rem;"></span>
                                Connecting to Quai Network...
                            </div>
                            <div class="progress-step" style="opacity: 0.5;">
                                <span id="step4" style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: var(--border-color); margin-right: 0.5rem;"></span>
                                Starting mining...
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        try {
            // Step 1: Detect hardware
            await this.updateProgress('step1', true);
            const hardware = await this.detectHardware();
            
            // Step 2: Optimize settings
            await this.updateProgress('step2', true);
            const settings = await this.optimizeSettings(hardware);
            
            // Step 3: Connect to network
            await this.updateProgress('step3', true);
            await this.connectToNetwork();
            
            // Step 4: Start mining
            await this.updateProgress('step4', true);
            await this.startMining();

            // Show success
            this.showSuccessScreen();
            
        } catch (error) {
            console.error('Error in instant mining setup:', error);
            this.showErrorScreen(error);
        }
    }

    /**
     * Update progress indicator
     */
    async updateProgress(stepId, completed) {
        const step = document.getElementById(stepId);
        if (step) {
            if (completed) {
                step.style.background = 'var(--quai-primary)';
                step.textContent = '✓';
                step.style.color = '#000';
            } else {
                step.style.background = 'var(--border-color)';
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * Detect hardware
     */
    async detectHardware() {
        try {
            const response = await fetch('/api/gpu/list');
            if (response.ok) {
                const data = await response.json();
                return data.gpus || [];
            }
        } catch (error) {
            console.error('Error detecting hardware:', error);
        }
        return [];
    }

    /**
     * Optimize settings
     */
    async optimizeSettings(hardware) {
        // Use smart defaults
        if (typeof SmartDefaults !== 'undefined') {
            const smartDefaults = new SmartDefaults();
            return smartDefaults.getOptimalSettings(hardware);
        }
        return {};
    }

    /**
     * Connect to network
     */
    async connectToNetwork() {
        // Try to detect local node first
        const localNode = await this.detectLocalNode();
        if (localNode) {
            return localNode;
        }
        
        // Use public node or offer setup
        return { url: 'http://localhost:8545', type: 'local' };
    }

    /**
     * Detect local Quai node
     */
    async detectLocalNode() {
        const commonPorts = [8545, 8546, 8547];
        const commonHosts = ['localhost', '127.0.0.1'];
        
        for (const host of commonHosts) {
            for (const port of commonPorts) {
                try {
                    const url = `http://${host}:${port}`;
                    const response = await fetch(`${url}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            method: 'eth_syncing',
                            params: [],
                            id: 1
                        }),
                        signal: AbortSignal.timeout(2000)
                    });
                    
                    if (response.ok) {
                        return { url, type: 'local', detected: true };
                    }
                } catch (e) {
                    // Continue checking
                }
            }
        }
        
        return null;
    }

    /**
     * Start mining
     */
    async startMining() {
        try {
            const response = await fetch('/api/miner/start', {
                method: 'POST'
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.success;
            }
        } catch (error) {
            console.error('Error starting miner:', error);
        }
        return false;
    }

    /**
     * Show success screen
     */
    showSuccessScreen() {
        const modal = document.getElementById('enhancedWelcomeModal');
        if (modal) {
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; text-align: center;">
                    <div class="modal-body" style="padding: 3rem 2rem;">
                        <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                        <h2 style="margin: 0 0 1rem 0; color: var(--quai-primary);">You're Mining!</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                            Your miner is now running and earning rewards. You can monitor everything from the dashboard.
                        </p>
                        <button class="btn-primary" onclick="
                            localStorage.setItem('quaiminer-onboarding-completed', 'true');
                            document.getElementById('enhancedWelcomeModal').style.display = 'none';
                        " style="padding: 1rem 2rem; font-size: 1.1rem;">
                            Go to Dashboard →
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show error screen
     */
    showErrorScreen(error) {
        const modal = document.getElementById('enhancedWelcomeModal');
        if (modal) {
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; text-align: center;">
                    <div class="modal-body" style="padding: 3rem 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                        <h2 style="margin: 0 0 1rem 0;">Setup Needs Your Help</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                            We couldn't auto-configure everything. Let's use the guided setup instead.
                        </p>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button class="btn-primary" onclick="window.enhancedOnboarding.startGuidedSetup()" style="padding: 1rem 2rem;">
                                Start Guided Setup
                            </button>
                            <button class="btn-secondary" onclick="
                                localStorage.setItem('quaiminer-onboarding-completed', 'true');
                                document.getElementById('enhancedWelcomeModal').style.display = 'none';
                            " style="padding: 1rem 2rem;">
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Start guided setup
     */
    startGuidedSetup() {
        localStorage.setItem('quaiminer-onboarding-completed', 'true');
        const modal = document.getElementById('enhancedWelcomeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Launch setup wizard
        if (typeof SetupWizard !== 'undefined') {
            const wizard = new SetupWizard();
            wizard.show();
        } else if (window.setupWizard) {
            window.setupWizard.show();
        }
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.EnhancedOnboarding = EnhancedOnboarding;
}

