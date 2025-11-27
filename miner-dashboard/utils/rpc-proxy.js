/**
 * RPC Proxy with Quais SDK Integration
 * Enhanced RPC proxy that uses Quais SDK when available
 */

const QuaisClient = require('./quais-sdk');

class RPCProxy {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.quaisClient = new QuaisClient(rpcUrl);
    }

    /**
     * Proxy RPC call using Quais SDK or fallback
     */
    async proxyCall(method, params = []) {
        try {
            // Use Quais SDK if available
            if (this.quaisClient.provider) {
                return await this.quaisClient.rpcCall(method, params);
            } else {
                // Fallback to direct RPC
                return await this.directRpcCall(method, params);
            }
        } catch (error) {
            logger?.error('RPC proxy call failed:', error.message);
            // Fallback to direct RPC
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
     * Get chain information
     */
    async getChainInfo() {
        return await this.quaisClient.getChainInfo();
    }
}

module.exports = RPCProxy;

