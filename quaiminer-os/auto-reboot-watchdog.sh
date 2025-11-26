#!/bin/bash

# Auto-Reboot Watchdog Script
# Monitors miner health and automatically reboots on issues

set -e

CONFIG_FILE="/etc/quaiminer/config.json"
LOG_FILE="/var/log/quaiminer/watchdog.log"
CHECK_INTERVAL=60  # Check every 60 seconds
MAX_TEMP=85        # Maximum GPU temperature
MIN_HASHRATE=1     # Minimum hash rate (MH/s)
NETWORK_CHECK=true # Enable network connectivity check

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_miner_running() {
    if systemctl is-active --quiet quaiminer; then
        return 0
    else
        return 1
    fi
}

check_gpu_temperature() {
    # Check GPU temperature using nvidia-smi or rocm-smi
    if command -v nvidia-smi &> /dev/null; then
        local temp=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits | head -1)
        if [ -n "$temp" ] && [ "$temp" -gt "$MAX_TEMP" ]; then
            log "⚠️  GPU temperature too high: ${temp}°C (max: ${MAX_TEMP}°C)"
            return 1
        fi
    elif command -v rocm-smi &> /dev/null; then
        local temp=$(rocm-smi -t | grep -oP 'Temperature:\s+\K\d+' | head -1)
        if [ -n "$temp" ] && [ "$temp" -gt "$MAX_TEMP" ]; then
            log "⚠️  GPU temperature too high: ${temp}°C (max: ${MAX_TEMP}°C)"
            return 1
        fi
    fi
    return 0
}

check_hash_rate() {
    # Check hash rate via miner API or logs
    # This is a simplified check - in production, query actual miner API
    if [ -f "/var/log/quaiminer/miner.log" ]; then
        local hashrate=$(grep -oP 'Hashrate:\s+\K[\d.]+' /var/log/quaiminer/miner.log | tail -1 || echo "0")
        if [ -n "$hashrate" ] && (( $(echo "$hashrate < $MIN_HASHRATE" | bc -l) )); then
            log "⚠️  Hash rate too low: ${hashrate} MH/s (min: ${MIN_HASHRATE} MH/s)"
            return 1
        fi
    fi
    return 0
}

check_network() {
    if [ "$NETWORK_CHECK" = true ]; then
        # Check if node RPC is accessible
        local rpc_url=$(jq -r '.node.rpcUrl' "$CONFIG_FILE" 2>/dev/null || echo "")
        if [ -n "$rpc_url" ]; then
            if ! curl -s --max-time 5 "$rpc_url" > /dev/null 2>&1; then
                log "⚠️  Network connectivity issue: Cannot reach node RPC"
                return 1
            fi
        fi
    fi
    return 0
}

restart_miner() {
    log "🔄 Restarting miner..."
    systemctl restart quaiminer
    sleep 10
    
    if check_miner_running; then
        log "✅ Miner restarted successfully"
        return 0
    else
        log "❌ Miner failed to restart, rebooting system..."
        return 1
    fi
}

reboot_system() {
    log "🔄 System reboot triggered due to persistent issues"
    # Send alert before reboot (if alert system available)
    systemctl reboot
}

main() {
    log "🚀 Watchdog started"
    
    local consecutive_failures=0
    local max_failures=3
    
    while true; do
        local issues_found=0
        
        # Check miner is running
        if ! check_miner_running; then
            log "⚠️  Miner is not running"
            issues_found=1
        fi
        
        # Check GPU temperature
        if ! check_gpu_temperature; then
            issues_found=1
        fi
        
        # Check hash rate
        if ! check_hash_rate; then
            issues_found=1
        fi
        
        # Check network
        if ! check_network; then
            issues_found=1
        fi
        
        if [ $issues_found -eq 1 ]; then
            consecutive_failures=$((consecutive_failures + 1))
            log "⚠️  Issues detected (${consecutive_failures}/${max_failures})"
            
            if [ $consecutive_failures -ge $max_failures ]; then
                # Try restarting miner first
                if ! restart_miner; then
                    # If restart fails, reboot system
                    reboot_system
                    exit 1
                fi
                consecutive_failures=0
            fi
        else
            consecutive_failures=0
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# Run main function
main "$@"

