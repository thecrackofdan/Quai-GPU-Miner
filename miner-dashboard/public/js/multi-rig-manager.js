/**
 * Multi-Rig Manager - Remote management of multiple mining rigs
 * Competitive with HiveOS multi-rig features
 */

class MultiRigManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.rigs = [];
        this.selectedRig = null;
        this.updateInterval = 10000; // 10 seconds
        this.init();
    }

    init() {
        this.loadRigs();
        this.setupUI();
        if (this.rigs.length > 0) {
            this.startMonitoring();
        }
    }

    /**
     * Load rigs from server
     */
    async loadRigs() {
        try {
            const response = await fetch('/api/rigs');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.rigs = data.rigs || [];
                    this.renderRigList();
                }
            }
        } catch (error) {
            console.error('Error loading rigs:', error);
        }
    }

    /**
     * Setup UI
     */
    setupUI() {
        // Create multi-rig widget if it doesn't exist
        if (!document.getElementById('multiRigWidget')) {
            this.createMultiRigWidget();
        }
    }

    /**
     * Create multi-rig widget
     */
    createMultiRigWidget() {
        const widget = document.createElement('div');
        widget.id = 'multiRigWidget';
        widget.className = 'multi-rig-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <h3>🏭 Multi-Rig Management</h3>
                <button class="btn-secondary" id="addRigBtn">+ Add Rig</button>
            </div>
            <div id="rigList" class="rig-list">
                <!-- Rigs will be rendered here -->
            </div>
        `;
        
        // Insert into dashboard (find appropriate location)
        const container = document.querySelector('.dashboard-container') || document.body;
        container.appendChild(widget);
        
        // Setup add rig button
        const addBtn = document.getElementById('addRigBtn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddRigModal();
        }
    }

    /**
     * Render rig list
     */
    renderRigList() {
        const container = document.getElementById('rigList');
        if (!container) return;
        
        if (this.rigs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No rigs configured. Click "Add Rig" to get started.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.rigs.map(rig => `
            <div class="rig-card ${rig.status === 'online' ? 'online' : 'offline'}" data-rig-id="${rig.id}">
                <div class="rig-header">
                    <div class="rig-info">
                        <h4>${rig.name}</h4>
                        <span class="rig-status ${rig.status}">${rig.status}</span>
                    </div>
                    <div class="rig-actions">
                        <button class="btn-icon" onclick="window.multiRigManager.selectRig('${rig.id}')" title="Select">
                            👁️
                        </button>
                        <button class="btn-icon" onclick="window.multiRigManager.editRig('${rig.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="window.multiRigManager.removeRig('${rig.id}')" title="Remove">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="rig-stats">
                    <div class="stat">
                        <span class="stat-label">Hash Rate</span>
                        <span class="stat-value">${this.formatHashRate(rig.hashRate || 0)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">GPUs</span>
                        <span class="stat-value">${rig.gpuCount || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Temp</span>
                        <span class="stat-value">${rig.avgTemp || 0}°C</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${rig.powerUsage || 0}W</span>
                    </div>
                </div>
                <div class="rig-controls">
                    <button class="btn-small" onclick="window.multiRigManager.controlRig('${rig.id}', 'start')">Start</button>
                    <button class="btn-small" onclick="window.multiRigManager.controlRig('${rig.id}', 'stop')">Stop</button>
                    <button class="btn-small" onclick="window.multiRigManager.controlRig('${rig.id}', 'restart')">Restart</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Start monitoring all rigs
     */
    startMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        
        this.monitorInterval = setInterval(() => {
            this.updateRigStatuses();
        }, this.updateInterval);
        
        // Initial update
        this.updateRigStatuses();
    }

    /**
     * Update status for all rigs
     */
    async updateRigStatuses() {
        for (const rig of this.rigs) {
            try {
                const response = await fetch(`/api/rigs/${rig.id}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        Object.assign(rig, data.status);
                    }
                }
            } catch (error) {
                rig.status = 'offline';
            }
        }
        
        this.renderRigList();
    }

    /**
     * Control a rig remotely
     */
    async controlRig(rigId, action) {
        try {
            const response = await fetch(`/api/rigs/${rigId}/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (typeof Toast !== 'undefined') {
                        Toast.success(`Rig ${action} command sent`);
                    }
                    // Refresh status
                    setTimeout(() => this.updateRigStatuses(), 2000);
                }
            }
        } catch (error) {
            console.error('Error controlling rig:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to control rig');
            }
        }
    }

    /**
     * Select a rig to view details
     */
    selectRig(rigId) {
        this.selectedRig = rigId;
        // Switch dashboard view to selected rig
        if (this.dashboard) {
            this.dashboard.switchToRig(rigId);
        }
    }

    /**
     * Show add rig modal
     */
    showAddRigModal() {
        // Implementation for adding new rig
        const name = prompt('Enter rig name:');
        if (name) {
            this.addRig(name);
        }
    }

    /**
     * Add a new rig
     */
    async addRig(name, ip, port = 3000) {
        try {
            const response = await fetch('/api/rigs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ip, port })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await this.loadRigs();
                    if (typeof Toast !== 'undefined') {
                        Toast.success('Rig added successfully');
                    }
                }
            }
        } catch (error) {
            console.error('Error adding rig:', error);
        }
    }

    /**
     * Format hash rate
     */
    formatHashRate(hashRate) {
        if (hashRate >= 1000) return (hashRate / 1000).toFixed(2) + ' GH/s';
        return hashRate.toFixed(2) + ' MH/s';
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.MultiRigManager = MultiRigManager;
}

