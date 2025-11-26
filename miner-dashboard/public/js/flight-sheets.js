/**
 * Flight Sheets - Pre-configured mining profiles
 * Similar to HiveOS flight sheets for quick profile switching
 */

class FlightSheets {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.sheets = [];
        this.activeSheet = null;
        this.init();
    }

    init() {
        this.loadFlightSheets();
    }

    /**
     * Load flight sheets from server
     */
    async loadFlightSheets() {
        try {
            const response = await fetch('/api/flight-sheets');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.sheets = data.sheets || [];
                    this.activeSheet = data.activeSheet || null;
                }
            }
        } catch (error) {
            console.error('Error loading flight sheets:', error);
        }
    }

    /**
     * Create a new flight sheet
     */
    async createSheet(name, config) {
        try {
            const response = await fetch('/api/flight-sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    config
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await this.loadFlightSheets();
                    return data.sheet;
                }
            }
        } catch (error) {
            console.error('Error creating flight sheet:', error);
            throw error;
        }
    }

    /**
     * Apply a flight sheet
     */
    async applySheet(sheetId) {
        const sheet = this.sheets.find(s => s.id === sheetId);
        if (!sheet) {
            throw new Error('Flight sheet not found');
        }

        try {
            // Apply configuration
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sheet.config)
            });
            
            if (response.ok) {
                this.activeSheet = sheetId;
                
                // Restart miner if needed
                if (sheet.config.autoRestart) {
                    await fetch('/api/miner/restart', { method: 'POST' });
                }
                
                if (typeof Toast !== 'undefined') {
                    Toast.success(`Flight sheet "${sheet.name}" applied`);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error applying flight sheet:', error);
            throw error;
        }
    }

    /**
     * Get default flight sheets
     */
    getDefaultSheets() {
        return [
            {
                name: 'High Performance',
                description: 'Maximum hash rate, higher power',
                config: {
                    mining: {
                        mode: 'solo',
                        mergedMining: { enabled: true, chains: [0, 1, 2, 3] }
                    },
                    gpu: {
                        powerLimit: 100,
                        coreClock: '+100',
                        memoryClock: '+500'
                    }
                }
            },
            {
                name: 'Efficient',
                description: 'Balanced performance and power',
                config: {
                    mining: {
                        mode: 'solo',
                        mergedMining: { enabled: false, chains: [0] }
                    },
                    gpu: {
                        powerLimit: 80,
                        coreClock: 0,
                        memoryClock: '+200'
                    }
                }
            },
            {
                name: 'Power Saving',
                description: 'Lower power, reduced hash rate',
                config: {
                    mining: {
                        mode: 'solo',
                        mergedMining: { enabled: false, chains: [0] }
                    },
                    gpu: {
                        powerLimit: 60,
                        coreClock: '-100',
                        memoryClock: 0
                    }
                }
            },
            {
                name: 'Pool Mining',
                description: 'Pool mining configuration',
                config: {
                    mining: {
                        mode: 'pool',
                        pool: 'official'
                    },
                    gpu: {
                        powerLimit: 85,
                        coreClock: 0,
                        memoryClock: '+300'
                    }
                }
            }
        ];
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.FlightSheets = FlightSheets;
}

