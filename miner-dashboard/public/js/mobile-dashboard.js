/**
 * Mobile Dashboard - Remote Access for Quai GPU Miner
 * Optimized for mobile devices and remote access
 */

class MobileDashboard {
    constructor() {
        this.serverUrl = this.getServerUrl();
        this.updateInterval = 5000;
        this.updateTimer = null;
        this.currentSection = 'dashboard';
        this.miningData = {
            hashRate: 0,
            acceptedShares: 0,
            temperature: 0,
            powerUsage: 0,
            isMining: false,
            uptime: 0,
            blocksFound: 0,
            gpus: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.loadServerUrl();
        this.startUpdates();
        this.updateStatus('connecting');
    }

    /**
     * Get server URL from localStorage or detect
     */
    getServerUrl() {
        // Try to detect if on same network
        const savedUrl = localStorage.getItem('mobileServerUrl');
        if (savedUrl) {
            return savedUrl;
        }
        
        // Default to current host if accessing from same network
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return `${window.location.protocol}//${window.location.host}`;
        }
        
        // Default fallback
        return 'http://localhost:3000';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Menu toggle
        const menuBtn = document.getElementById('menuBtn');
        const menuCloseBtn = document.getElementById('menuCloseBtn');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('menuOverlay');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleMenu());
        }

        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', () => this.toggleMenu());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.toggleMenu());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Mining controls
        const startBtn = document.getElementById('mobileStartMiningBtn');
        const stopBtn = document.getElementById('mobileStopMiningBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startMining());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopMining());
        }

        // Settings
        const saveServerBtn = document.getElementById('mobileSaveServerBtn');
        if (saveServerBtn) {
            saveServerBtn.addEventListener('click', () => this.saveServerUrl());
        }

        const updateIntervalSelect = document.getElementById('mobileUpdateInterval');
        if (updateIntervalSelect) {
            updateIntervalSelect.addEventListener('change', (e) => {
                this.updateInterval = parseInt(e.target.value);
                this.restartUpdates();
            });
        }

        // Quick actions
        const restartBtn = document.getElementById('mobileRestartBtn');
        const viewLogsBtn = document.getElementById('mobileViewLogsBtn');
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartMiner());
        }
        
        if (viewLogsBtn) {
            viewLogsBtn.addEventListener('click', () => this.viewLogs());
        }
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        // Footer navigation
        const footerBtns = document.querySelectorAll('.mobile-footer-btn');
        footerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.showSection(section);
                
                // Update active state
                footerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Menu navigation
        const menuItems = document.querySelectorAll('.mobile-menu-item[data-section]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
                this.toggleMenu();
            });
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu && overlay) {
            menu.classList.toggle('open');
            overlay.classList.toggle('open');
        }
    }

    /**
     * Show section
     */
    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.mobile-section').forEach(s => {
            s.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
        }
    }

    /**
     * Start data updates
     */
    startUpdates() {
        this.updateData();
        this.updateTimer = setInterval(() => {
            this.updateData();
        }, this.updateInterval);
    }

    /**
     * Restart updates with new interval
     */
    restartUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.startUpdates();
    }

    /**
     * Update data from server
     */
    async updateData() {
        try {
            const response = await fetch(`${this.serverUrl}/api/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            this.miningData = data;
            this.updateUI();
            this.updateStatus('active');
        } catch (error) {
            console.error('Error updating data:', error);
            this.updateStatus('error');
            this.showToast('Connection error. Check server URL in settings.', 'error');
        }
    }

    /**
     * Update UI with latest data
     */
    updateUI() {
        // Update stats
        const hashRateEl = document.getElementById('mobileHashRate');
        if (hashRateEl) {
            hashRateEl.textContent = (this.miningData.hashRate || 0).toFixed(2);
        }

        const sharesEl = document.getElementById('mobileShares');
        if (sharesEl) {
            sharesEl.textContent = this.miningData.acceptedShares || 0;
        }

        const tempEl = document.getElementById('mobileTemp');
        if (tempEl && this.miningData.gpus && this.miningData.gpus.length > 0) {
            const avgTemp = this.miningData.gpus.reduce((sum, gpu) => sum + (gpu.temperature || 0), 0) / this.miningData.gpus.length;
            tempEl.textContent = `${avgTemp.toFixed(0)}°`;
        }

        const powerEl = document.getElementById('mobilePower');
        if (powerEl) {
            powerEl.textContent = (this.miningData.powerUsage || 0).toFixed(0);
        }

        // Update mining status
        const miningStatusText = document.getElementById('miningStatusText');
        const startBtn = document.getElementById('mobileStartMiningBtn');
        const stopBtn = document.getElementById('mobileStopMiningBtn');

        if (this.miningData.isMining) {
            if (miningStatusText) miningStatusText.textContent = 'Running';
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'block';
        } else {
            if (miningStatusText) miningStatusText.textContent = 'Stopped';
            if (startBtn) startBtn.style.display = 'block';
            if (stopBtn) stopBtn.style.display = 'none';
        }

        // Update uptime
        const uptimeEl = document.getElementById('mobileUptime');
        if (uptimeEl && this.miningData.uptime) {
            uptimeEl.textContent = this.formatUptime(this.miningData.uptime);
        }

        // Update blocks found
        const blocksEl = document.getElementById('mobileBlocksFound');
        if (blocksEl) {
            blocksEl.textContent = this.miningData.blocksFound || 0;
        }

        // Update mining mode
        const modeEl = document.getElementById('mobileMiningMode');
        if (modeEl) {
            modeEl.textContent = this.miningData.miningMode || 'Solo';
        }

        // Update GPUs
        this.updateGPUs();

        // Update network info
        this.updateNetworkInfo();
    }

    /**
     * Update GPU display
     */
    updateGPUs() {
        const overview = document.getElementById('mobileGPUOverview');
        const list = document.getElementById('mobileGPUList');

        if (!this.miningData.gpus || this.miningData.gpus.length === 0) {
            if (overview) overview.innerHTML = '<div class="mobile-loading">No GPUs detected</div>';
            if (list) list.innerHTML = '<div class="mobile-loading">No GPUs detected</div>';
            return;
        }

        // Update overview (first 2 GPUs)
        if (overview) {
            const gpusToShow = this.miningData.gpus.slice(0, 2);
            overview.innerHTML = gpusToShow.map((gpu, idx) => `
                <div class="mobile-gpu-card" style="margin-bottom: 12px;">
                    <div class="mobile-gpu-card-header">
                        <h4>GPU ${idx + 1}</h4>
                        <span style="color: var(--quai-primary); font-weight: 600;">${(gpu.hashRate || 0).toFixed(2)} MH/s</span>
                    </div>
                    <div class="mobile-gpu-stats">
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Temp</div>
                            <div class="mobile-gpu-stat-value">${(gpu.temperature || 0).toFixed(0)}°</div>
                        </div>
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Power</div>
                            <div class="mobile-gpu-stat-value">${(gpu.powerUsage || 0).toFixed(0)}W</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update full list
        if (list) {
            list.innerHTML = this.miningData.gpus.map((gpu, idx) => `
                <div class="mobile-gpu-card">
                    <div class="mobile-gpu-card-header">
                        <h4>GPU ${idx + 1}: ${gpu.name || 'Unknown'}</h4>
                    </div>
                    <div class="mobile-gpu-stats">
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Hash Rate</div>
                            <div class="mobile-gpu-stat-value">${(gpu.hashRate || 0).toFixed(2)} MH/s</div>
                        </div>
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Temperature</div>
                            <div class="mobile-gpu-stat-value">${(gpu.temperature || 0).toFixed(0)}°C</div>
                        </div>
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Power</div>
                            <div class="mobile-gpu-stat-value">${(gpu.powerUsage || 0).toFixed(0)}W</div>
                        </div>
                        <div class="mobile-gpu-stat">
                            <div class="mobile-gpu-stat-label">Fan</div>
                            <div class="mobile-gpu-stat-value">${(gpu.fanSpeed || 0)}%</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    /**
     * Update network information
     */
    updateNetworkInfo() {
        if (this.miningData.network) {
            const nodeStatus = document.getElementById('mobileNodeStatus');
            const blockHeight = document.getElementById('mobileBlockHeight');
            const networkHashRate = document.getElementById('mobileNetworkHashRate');
            const peerCount = document.getElementById('mobilePeerCount');

            if (nodeStatus) {
                nodeStatus.textContent = this.miningData.network.nodeSynced ? 'Synced' : 'Syncing';
                nodeStatus.style.color = this.miningData.network.nodeSynced ? 'var(--success)' : 'var(--warning)';
            }

            if (blockHeight) {
                blockHeight.textContent = this.miningData.network.blockHeight || 0;
            }

            if (networkHashRate) {
                networkHashRate.textContent = `${((this.miningData.network.networkHashRate || 0) / 1000000).toFixed(2)} MH/s`;
            }

            if (peerCount) {
                peerCount.textContent = this.miningData.network.peerCount || 0;
            }
        }
    }

    /**
     * Update status indicator
     */
    updateStatus(status) {
        const statusDot = document.getElementById('mobileStatusDot');
        const statusText = document.getElementById('mobileStatusText');

        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'active') {
                statusDot.classList.add('active');
            } else if (status === 'error') {
                statusDot.classList.add('error');
            }
        }

        if (statusText) {
            const statusMessages = {
                connecting: 'Connecting...',
                active: 'Connected',
                error: 'Connection Error'
            };
            statusText.textContent = statusMessages[status] || 'Unknown';
        }
    }

    /**
     * Start mining
     */
    async startMining() {
        try {
            const response = await fetch(`${this.serverUrl}/api/miner/start`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showToast('Mining started', 'success');
                this.updateData();
            } else {
                throw new Error('Failed to start mining');
            }
        } catch (error) {
            this.showToast('Error starting miner: ' + error.message, 'error');
        }
    }

    /**
     * Stop mining
     */
    async stopMining() {
        try {
            const response = await fetch(`${this.serverUrl}/api/miner/stop`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showToast('Mining stopped', 'success');
                this.updateData();
            } else {
                throw new Error('Failed to stop mining');
            }
        } catch (error) {
            this.showToast('Error stopping miner: ' + error.message, 'error');
        }
    }

    /**
     * Restart miner
     */
    async restartMiner() {
        try {
            await this.stopMining();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.startMining();
            this.showToast('Miner restarted', 'success');
        } catch (error) {
            this.showToast('Error restarting miner: ' + error.message, 'error');
        }
    }

    /**
     * View logs
     */
    viewLogs() {
        window.open(`${this.serverUrl}/api/miner/logs`, '_blank');
    }

    /**
     * Save server URL
     */
    saveServerUrl() {
        const urlInput = document.getElementById('mobileServerUrl');
        if (urlInput) {
            const url = urlInput.value.trim();
            if (url) {
                localStorage.setItem('mobileServerUrl', url);
                this.serverUrl = url;
                this.showToast('Server URL saved', 'success');
                this.updateData();
            }
        }
    }

    /**
     * Load server URL
     */
    loadServerUrl() {
        const urlInput = document.getElementById('mobileServerUrl');
        if (urlInput) {
            urlInput.value = this.serverUrl;
        }
    }

    /**
     * Refresh data
     */
    refresh() {
        this.updateData();
        this.showToast('Refreshing...', 'info');
    }

    /**
     * Format uptime
     */
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('mobileToastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.style.borderColor = type === 'error' ? 'var(--error)' : 
                                  type === 'success' ? 'var(--success)' : 
                                  'var(--quai-primary)';
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileDashboard = new MobileDashboard();
    });
} else {
    window.mobileDashboard = new MobileDashboard();
}

