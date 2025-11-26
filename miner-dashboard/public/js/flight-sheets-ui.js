/**
 * Flight Sheets UI - User interface for flight sheets management
 */

class FlightSheetsUI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.flightSheets = dashboard.flightSheets;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFlightSheets();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const openBtn = document.getElementById('openFlightSheetsBtn');
        const closeBtn = document.getElementById('closeFlightSheetsBtn');
        const addBtn = document.getElementById('addFlightSheetBtn');
        const modal = document.getElementById('flightSheetsModal');

        if (openBtn && modal) {
            openBtn.onclick = () => {
                modal.style.display = 'block';
                this.loadFlightSheets();
            };
        }

        if (closeBtn && modal) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        if (addBtn) {
            addBtn.onclick = () => this.showCreateSheetModal();
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
     * Load flight sheets
     */
    async loadFlightSheets() {
        try {
            const response = await fetch('/api/flight-sheets');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.renderFlightSheets(data.sheets || [], data.activeSheet);
                }
            }
        } catch (error) {
            console.error('Error loading flight sheets:', error);
        }
    }

    /**
     * Render flight sheets list
     */
    renderFlightSheets(sheets, activeSheetId) {
        const container = document.getElementById('flightSheetsList');
        const activeName = document.getElementById('activeFlightSheetName');
        
        if (activeName) {
            const activeSheet = sheets.find(s => s.id === activeSheetId);
            activeName.textContent = activeSheet ? activeSheet.name : 'None';
        }

        if (!container) return;

        if (sheets.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>No flight sheets configured.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Create a profile to quickly switch between mining configurations.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sheets.map(sheet => {
            const isActive = sheet.id === activeSheetId;
            return `
                <div class="flight-sheet-card" style="
                    background: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 2px solid ${isActive ? 'var(--quai-primary)' : 'var(--border-color)'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h4 style="margin: 0; color: ${isActive ? 'var(--quai-primary)' : 'var(--text-primary)'};">
                                ${sheet.name}
                                ${isActive ? '<span style="font-size: 0.75rem; color: var(--success-color);">(Active)</span>' : ''}
                            </h4>
                            ${sheet.description ? `<p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">${sheet.description}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${!isActive ? `<button class="btn-small" onclick="window.flightSheetsUI.applySheet('${sheet.id}')">Apply</button>` : ''}
                            <button class="btn-small" onclick="window.flightSheetsUI.editSheet('${sheet.id}')">Edit</button>
                            <button class="btn-small btn-danger" onclick="window.flightSheetsUI.deleteSheet('${sheet.id}')">Delete</button>
                        </div>
                    </div>
                    <div style="background: var(--bg-dark); padding: 1rem; border-radius: 6px; font-size: 0.85rem;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
                            <div><strong>Mode:</strong> ${sheet.config?.mining?.mode || 'solo'}</div>
                            <div><strong>Merged Mining:</strong> ${sheet.config?.mining?.mergedMining?.enabled ? 'Yes' : 'No'}</div>
                            <div><strong>Power Limit:</strong> ${sheet.config?.gpu?.powerLimit || 'Default'}%</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Apply a flight sheet
     */
    async applySheet(sheetId) {
        try {
            const response = await fetch(`/api/flight-sheets/${sheetId}/apply`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (typeof Toast !== 'undefined') {
                        Toast.success('Flight sheet applied successfully!');
                    }
                    await this.loadFlightSheets();
                }
            } else {
                throw new Error('Failed to apply flight sheet');
            }
        } catch (error) {
            console.error('Error applying flight sheet:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to apply flight sheet');
            }
        }
    }

    /**
     * Show create sheet modal
     */
    showCreateSheetModal() {
        const name = prompt('Enter flight sheet name:');
        if (!name) return;

        const description = prompt('Enter description (optional):') || '';

        // Get current configuration as base
        const currentConfig = {
            mining: {
                mode: 'solo',
                mergedMining: { enabled: false, chains: [0] }
            },
            gpu: {
                powerLimit: 85,
                coreClock: 0,
                memoryClock: 0
            }
        };

        this.createSheet(name, description, currentConfig);
    }

    /**
     * Create a new flight sheet
     */
    async createSheet(name, description, config) {
        try {
            if (this.flightSheets) {
                const sheet = await this.flightSheets.createSheet(name, { ...config, description });
                if (typeof Toast !== 'undefined') {
                    Toast.success('Flight sheet created!');
                }
                await this.loadFlightSheets();
                return sheet;
            }
        } catch (error) {
            console.error('Error creating flight sheet:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to create flight sheet');
            }
        }
    }

    /**
     * Edit a flight sheet
     */
    editSheet(sheetId) {
        // Open miner config modal with sheet's config pre-filled
        const modal = document.getElementById('minerConfigModal');
        if (modal) {
            modal.style.display = 'block';
            // Load sheet config into form
            // (Implementation would load config into miner config form)
        }
    }

    /**
     * Delete a flight sheet
     */
    async deleteSheet(sheetId) {
        if (!confirm('Are you sure you want to delete this flight sheet?')) {
            return;
        }

        try {
            const response = await fetch(`/api/flight-sheets/${sheetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (typeof Toast !== 'undefined') {
                    Toast.success('Flight sheet deleted');
                }
                await this.loadFlightSheets();
            } else {
                throw new Error('Failed to delete flight sheet');
            }
        } catch (error) {
            console.error('Error deleting flight sheet:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to delete flight sheet');
            }
        }
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.FlightSheetsUI = FlightSheetsUI;
}

