/**
 * Qi Token Integration
 * Energy-based stablecoin tied to real-world energy costs
 * Tracks Qi balance and provides conversion calculations
 */

const logger = require('./winston-logger') || require('./logger');

// Qi Token Contract Address (update with actual address from Quai Network)
const QI_TOKEN_ADDRESS = process.env.QI_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
const QI_TOKEN_DECIMALS = 18;

// ERC-20 ABI for balance queries
const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        type: 'function'
    }
];

class QiTokenTracker {
    constructor(rpcUrl, quaisClient = null) {
        this.rpcUrl = rpcUrl;
        this.quaisClient = quaisClient;
        this.tokenAddress = QI_TOKEN_ADDRESS;
        this.decimals = QI_TOKEN_DECIMALS;
        this.symbol = 'QI';
        
        // Energy cost tracking (for stablecoin calculations)
        this.energyCostPerKWh = 0.10; // Default $0.10/kWh
        this.qiToEnergyRatio = 1.0; // 1 QI = 1 kWh equivalent (adjust based on actual Qi economics)
    }

    /**
     * Get Qi token balance for an address
     */
    async getBalance(address) {
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            return { balance: '0', formatted: '0.00', usd: 0 };
        }

        try {
            // Use Quais SDK if available
            if (this.quaisClient && this.quaisClient.provider) {
                return await this.getBalanceViaSDK(address);
            } else {
                return await this.getBalanceViaRPC(address);
            }
        } catch (error) {
            logger?.error('Failed to get Qi balance:', error.message);
            return { balance: '0', formatted: '0.00', usd: 0, error: error.message };
        }
    }

    /**
     * Get balance using Quais SDK
     */
    async getBalanceViaSDK(address) {
        try {
            const ethers = require('ethers');
            const provider = this.quaisClient.provider;
            const contract = new ethers.Contract(this.tokenAddress, ERC20_ABI, provider);
            
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals().catch(() => this.decimals);
            const symbol = await contract.symbol().catch(() => this.symbol);
            
            const formatted = ethers.formatUnits(balance, decimals);
            const usd = this.calculateUSDValue(parseFloat(formatted));
            
            return {
                balance: balance.toString(),
                formatted: parseFloat(formatted).toFixed(4),
                usd: usd,
                symbol: symbol,
                decimals: decimals
            };
        } catch (error) {
            logger?.warn('SDK balance fetch failed, using RPC fallback');
            return await this.getBalanceViaRPC(address);
        }
    }

    /**
     * Get balance using direct RPC call
     */
    async getBalanceViaRPC(address) {
        try {
            // Encode function call: balanceOf(address)
            const functionSignature = '0x70a08231'; // balanceOf(address)
            const addressParam = address.slice(2).padStart(64, '0');
            const data = functionSignature + addressParam;

            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        to: this.tokenAddress,
                        data: data
                    }, 'latest'],
                    id: Date.now()
                })
            });

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error.message);
            }

            const balance = BigInt(result.result || '0x0');
            const formatted = (Number(balance) / Math.pow(10, this.decimals)).toFixed(4);
            const usd = this.calculateUSDValue(parseFloat(formatted));

            return {
                balance: balance.toString(),
                formatted: formatted,
                usd: usd,
                symbol: this.symbol,
                decimals: this.decimals
            };
        } catch (error) {
            logger?.error('RPC balance fetch failed:', error.message);
            return { balance: '0', formatted: '0.00', usd: 0, error: error.message };
        }
    }

    /**
     * Calculate USD value based on energy costs
     * Qi is tied to energy costs, so 1 QI ≈ 1 kWh of energy
     */
    calculateUSDValue(qiAmount) {
        return qiAmount * this.energyCostPerKWh * this.qiToEnergyRatio;
    }

    /**
     * Update energy cost (for stablecoin calculations)
     */
    setEnergyCost(costPerKWh) {
        this.energyCostPerKWh = costPerKWh;
    }

    /**
     * Get Qi conversion rate
     */
    getConversionRate() {
        return {
            qiToUSD: this.energyCostPerKWh * this.qiToEnergyRatio,
            energyCostPerKWh: this.energyCostPerKWh,
            ratio: this.qiToEnergyRatio
        };
    }

    /**
     * Calculate mining profitability in Qi terms
     */
    calculateMiningProfitability(hashRate, powerUsage, electricityCost) {
        // Calculate energy consumption
        const hoursPerDay = 24;
        const kwhPerDay = (powerUsage / 1000) * hoursPerDay;
        const energyCostPerDay = kwhPerDay * electricityCost;
        
        // Convert to Qi (assuming 1 QI = 1 kWh equivalent)
        const qiEquivalent = kwhPerDay;
        const qiValue = this.calculateUSDValue(qiEquivalent);
        
        return {
            energyConsumption: {
                kwhPerDay: kwhPerDay.toFixed(2),
                costPerDay: energyCostPerDay.toFixed(2)
            },
            qiEquivalent: {
                amount: qiEquivalent.toFixed(4),
                usdValue: qiValue.toFixed(2)
            },
            efficiency: {
                hashPerKwh: (hashRate / kwhPerDay).toFixed(2),
                hashPerQi: (hashRate / qiEquivalent).toFixed(2)
            }
        };
    }
}

module.exports = QiTokenTracker;

