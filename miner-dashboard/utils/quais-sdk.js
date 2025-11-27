/**
 * Quais SDK Integration
 * Professional RPC client for Quai Network using Quais SDK (Ethers v6 based)
 * Handles multi-chain environment and hierarchical structure
 */

let QuaisProvider = null;
let ethers = null;
let logger = null;

// Try to load logger
try {
    logger = require('./winston-logger');
} catch (e) {
    try {
        logger = require('./logger');
    } catch (e2) {
        // No logger available
    }
}

// Try to load Quais SDK (optional - graceful degradation)
try {
    // Quais SDK is built on Ethers v6
    ethers = require('ethers');
    // Note: @quais/ethers may not be published yet, using ethers with Quai-specific config
    QuaisProvider = ethers.JsonRpcProvider;
} catch (error) {
    // SDK not available - will use fallback
    if (logger) {
        logger.warn('Ethers.js not available, using fallback RPC');
    }
}

class QuaisClient {
    constructor(rpcUrl = 'http://localhost:8545') {
        this.rpcUrl = rpcUrl;
        this.provider = null;
        this.chainId = null;
        this.currentChain = 'Prime'; // Default chain
        
        // Initialize provider if SDK available
        if (QuaisProvider && ethers) {
            try {
                this.provider = new QuaisProvider(rpcUrl);
                this.initialize();
            } catch (error) {
                logger?.warn('Quais SDK initialization failed, using fallback RPC');
            }
        }
    }

    /**
     * Initialize Quai Network connection
     */
    async initialize() {
        if (!this.provider) return;

        try {
            // Get network information
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);
            
            // Determine current chain from chainId
            this.currentChain = this.getChainFromId(this.chainId);
            
            logger?.info(`Quais SDK connected to ${this.currentChain} (Chain ID: ${this.chainId})`);
        } catch (error) {
            logger?.warn('Failed to initialize Quais SDK:', error.message);
        }
    }

    /**
     * Get chain name from chain ID
     * Quai Network uses specific chain IDs for Prime, Regions, and Zones
     */
    getChainFromId(chainId) {
        // Quai Network chain ID mapping
        const chainMap = {
            1: 'Prime',
            2: 'Cyprus',
            3: 'Paxos',
            4: 'Hydra',
            // Zones would have higher IDs
        };
        
        return chainMap[chainId] || 'Prime';
    }

    /**
     * Make RPC call using Quais SDK
     */
    async rpcCall(method, params = []) {
        if (this.provider) {
            try {
                // Use provider's RPC methods
                switch (method) {
                    case 'eth_blockNumber':
                        const blockNumber = await this.provider.getBlockNumber();
                        return { result: '0x' + blockNumber.toString(16) };
                    
                    case 'eth_getBalance':
                        const balance = await this.provider.getBalance(params[0], params[1] || 'latest');
                        return { result: balance.toString() };
                    
                    case 'eth_getBlockByNumber':
                        const block = await this.provider.getBlock(params[0], params[1] || false);
                        return { result: block };
                    
                    case 'net_peerCount':
                        // Fallback to direct RPC
                        return await this.directRpcCall(method, params);
                    
                    default:
                        // For other methods, use direct RPC
                        return await this.directRpcCall(method, params);
                }
            } catch (error) {
                logger?.error('Quais SDK RPC call failed:', error.message);
                // Fallback to direct RPC
                return await this.directRpcCall(method, params);
            }
        } else {
            // Fallback to direct RPC if SDK not available
            return await this.directRpcCall(method, params);
        }
    }

    /**
     * Direct RPC call (fallback)
     */
    async directRpcCall(method, params = []) {
        const fetch = globalThis.fetch || require('node-fetch');
        
        try {
            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: method,
                    params: params,
                    id: Date.now()
                }),
                timeout: 10000
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return { error: { message: error.message } };
        }
    }

    /**
     * Get current chain information
     */
    async getChainInfo() {
        try {
            const blockNumber = await this.rpcCall('eth_blockNumber', []);
            const peerCount = await this.rpcCall('net_peerCount', []);
            
            return {
                chain: this.currentChain,
                chainId: this.chainId,
                blockNumber: blockNumber.result ? parseInt(blockNumber.result, 16) : 0,
                peerCount: peerCount.result ? parseInt(peerCount.result, 16) : 0
            };
        } catch (error) {
            logger?.error('Failed to get chain info:', error.message);
            return null;
        }
    }

    /**
     * Get block information
     */
    async getBlock(blockNumber = 'latest') {
        return await this.rpcCall('eth_getBlockByNumber', [blockNumber, true]);
    }

    /**
     * Get account balance (QUAI)
     */
    async getBalance(address, blockNumber = 'latest') {
        return await this.rpcCall('eth_getBalance', [address, blockNumber]);
    }
}

module.exports = QuaisClient;

