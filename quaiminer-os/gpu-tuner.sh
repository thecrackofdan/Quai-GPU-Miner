#!/bin/bash

# GPU Fine-Tuning Script
# Allows manual override of auto-detected optimal GPU settings

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="/etc/quaiminer"
GPU_CONFIG="$CONFIG_DIR/gpu-settings.json"

# Load GPU settings
load_gpu_settings() {
    if [ -f "$GPU_CONFIG" ]; then
        cat "$GPU_CONFIG"
    else
        echo "{}"
    fi
}

# Save GPU settings
save_gpu_settings() {
    echo "$1" > "$GPU_CONFIG"
}

# Apply settings to GPU
apply_gpu_settings() {
    local gpu_id=$1
    local core_clock=$2
    local memory_clock=$3
    local power_limit=$4
    local fan_speed=$5
    
    # Detect GPU vendor
    if lspci | grep -i "nvidia" > /dev/null; then
        apply_nvidia_settings "$gpu_id" "$core_clock" "$memory_clock" "$power_limit" "$fan_speed"
    elif lspci | grep -i "radeon\|amd" > /dev/null; then
        apply_amd_settings "$gpu_id" "$core_clock" "$memory_clock" "$power_limit" "$fan_speed"
    else
        echo "❌ Unknown GPU vendor"
        exit 1
    fi
}

# Apply NVIDIA settings
apply_nvidia_settings() {
    local gpu_id=$1
    local core_clock=$2
    local memory_clock=$3
    local power_limit=$4
    local fan_speed=$5
    
    # Use nvidia-smi
    if command -v nvidia-smi &> /dev/null; then
        if [ -n "$power_limit" ]; then
            nvidia-smi -i "$gpu_id" -pl "$power_limit" 2>/dev/null || true
        fi
        
        # Core and memory clocks require persistence mode
        if [ -n "$core_clock" ] || [ -n "$memory_clock" ]; then
            nvidia-smi -i "$gpu_id" -lgc "$core_clock" 2>/dev/null || true
            nvidia-smi -i "$gpu_id" -lgm "$memory_clock" 2>/dev/null || true
        fi
        
        # Fan speed
        if [ -n "$fan_speed" ]; then
            nvidia-smi -i "$gpu_id" -pl "$power_limit" --fan-control=1 2>/dev/null || true
            # Fan control requires additional tools
        fi
    fi
}

# Apply AMD settings
apply_amd_settings() {
    local gpu_id=$1
    local core_clock=$2
    local memory_clock=$3
    local power_limit=$4
    local fan_speed=$5
    
    # Use rocm-smi or amdgpu
    if command -v rocm-smi &> /dev/null; then
        if [ -n "$core_clock" ]; then
            rocm-smi -d "$gpu_id" --setsclk "$core_clock" 2>/dev/null || true
        fi
        if [ -n "$memory_clock" ]; then
            rocm-smi -d "$gpu_id" --setmclk "$memory_clock" 2>/dev/null || true
        fi
        if [ -n "$power_limit" ]; then
            rocm-smi -d "$gpu_id" --setpoweroverdrive "$power_limit" 2>/dev/null || true
        fi
    elif [ -f "/sys/class/drm/card${gpu_id}/device/pp_dpm_sclk" ]; then
        # Direct sysfs access (requires root)
        if [ -n "$core_clock" ]; then
            echo "$core_clock" > "/sys/class/drm/card${gpu_id}/device/pp_dpm_sclk" 2>/dev/null || true
        fi
    fi
}

# Get optimal settings for GPU
get_optimal_settings() {
    local gpu_id=$1
    local gpu_model=$2
    local vendor=$3
    
    # Base settings
    local core_clock=0
    local memory_clock=0
    local power_limit=0
    local fan_speed=50
    
    if [ "$vendor" = "AMD" ]; then
        # AMD-specific optimal settings
        if echo "$gpu_model" | grep -i "590" > /dev/null; then
            core_clock=1545
            memory_clock=2000
            power_limit=-20
            fan_speed=60
        elif echo "$gpu_model" | grep -i "580\|570" > /dev/null; then
            core_clock=1450
            memory_clock=2000
            power_limit=-15
            fan_speed=65
        fi
    elif [ "$vendor" = "NVIDIA" ]; then
        # NVIDIA-specific optimal settings
        if echo "$gpu_model" | grep -i "3060\|3070\|3080" > /dev/null; then
            core_clock=0
            memory_clock=1000
            power_limit=70
            fan_speed=70
        fi
    fi
    
    echo "{\"coreClock\":$core_clock,\"memoryClock\":$memory_clock,\"powerLimit\":$power_limit,\"fanSpeed\":$fan_speed}"
}

# Main function
main() {
    case "${1:-}" in
        apply)
            if [ $# -lt 6 ]; then
                echo "Usage: $0 apply <gpu_id> <core_clock> <memory_clock> <power_limit> <fan_speed>"
                exit 1
            fi
            apply_gpu_settings "$2" "$3" "$4" "$5" "$6"
            ;;
        optimal)
            if [ $# -lt 4 ]; then
                echo "Usage: $0 optimal <gpu_id> <gpu_model> <vendor>"
                exit 1
            fi
            get_optimal_settings "$2" "$3" "$4"
            ;;
        reset)
            if [ $# -lt 4 ]; then
                echo "Usage: $0 reset <gpu_id> <gpu_model> <vendor>"
                exit 1
            fi
            optimal=$(get_optimal_settings "$2" "$3" "$4")
            core_clock=$(echo "$optimal" | grep -o '"coreClock":[0-9-]*' | cut -d: -f2)
            memory_clock=$(echo "$optimal" | grep -o '"memoryClock":[0-9-]*' | cut -d: -f2)
            power_limit=$(echo "$optimal" | grep -o '"powerLimit":[0-9-]*' | cut -d: -f2)
            fan_speed=$(echo "$optimal" | grep -o '"fanSpeed":[0-9-]*' | cut -d: -f2)
            apply_gpu_settings "$2" "$core_clock" "$memory_clock" "$power_limit" "$fan_speed"
            ;;
        *)
            echo "GPU Fine-Tuning Script"
            echo "Usage: $0 {apply|optimal|reset} [args]"
            echo ""
            echo "Commands:"
            echo "  apply <gpu_id> <core> <memory> <power> <fan>  - Apply custom settings"
            echo "  optimal <gpu_id> <model> <vendor>            - Get optimal settings"
            echo "  reset <gpu_id> <model> <vendor>              - Reset to optimal"
            exit 1
            ;;
    esac
}

main "$@"

