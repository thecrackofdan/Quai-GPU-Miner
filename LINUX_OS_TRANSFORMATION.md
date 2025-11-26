# QuaiMiner CORE OS - Linux Bootable Transformation

## Overview

This project has been transformed into a **Linux-only, USB-bootable operating system** similar to HiveOS, designed specifically for Quai Network mining.

## Key Changes

### 1. Linux-Only Focus
- ✅ Removed Windows-specific code and dependencies
- ✅ All scripts are bash-based (Linux/Unix)
- ✅ Documentation updated for Linux-only
- ✅ Package.json updated (removed Windows OS entries)

### 2. Remote Dashboard Access
- ✅ Dashboard now listens on `0.0.0.0:3000` (all network interfaces)
- ✅ Automatically displays network IP addresses on startup
- ✅ Accessible from any device on the network
- ✅ Systemd service for auto-start on boot

### 3. Bootable OS Structure
- ✅ Created `os-build/` directory with complete OS build system
- ✅ ISO generation scripts (`build-iso.sh`)
- ✅ USB creation scripts (`build-usb.sh`)
- ✅ GRUB boot configuration
- ✅ Systemd services for auto-start

### 4. System Services
- ✅ `quaiminer-dashboard.service` - Auto-starts dashboard
- ✅ `quaiminer-miner.service` - Auto-starts miner
- ✅ `quaiminer-setup.service` - First boot configuration

## Directory Structure

```
os-build/
├── boot/                    # Boot configuration (GRUB)
│   └── grub/
│       └── grub.cfg
├── rootfs/                  # Root filesystem files
│   ├── etc/
│   │   ├── systemd/system/ # Systemd services
│   │   └── network/         # Network config
│   └── opt/
│       └── quaiminer-dashboard/
├── scripts/                 # Build scripts
│   ├── build-iso.sh        # ISO generation
│   ├── build-usb.sh        # USB creation
│   └── remove-windows-deps.sh
├── config/                  # OS configuration
│   └── network-config.yaml
└── docs/                    # Build documentation
    └── BUILD_INSTRUCTIONS.md
```

## Building the OS

### Quick Start

```bash
cd os-build
sudo ./scripts/build-iso.sh
```

This creates: `output/quaiminer-core-os-1.0.0.iso`

### Create Bootable USB

```bash
sudo ./scripts/build-usb.sh /dev/sdX
```

Replace `/dev/sdX` with your USB device.

## Features

### Remote Access
- Dashboard accessible at `http://<rig-ip>:3000`
- SSH access enabled (port 22)
- Network auto-configuration via DHCP

### Auto-Start Services
- Dashboard starts automatically on boot
- Miner can be configured to auto-start
- First-boot setup script runs automatically

### GPU Support
- Automatic GPU detection (NVIDIA/AMD)
- Driver installation on first boot
- Multi-GPU support

### Persistent Storage
- Configurations saved to USB (if persistent partition exists)
- Data survives reboots
- Settings persist across updates

## Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST BOOT!**

- Dashboard: `admin` / `admin`
- SSH: `quaiminer` / `quaiminer`
- Root: (disabled by default, use sudo)

## Network Configuration

### Automatic (DHCP)
By default, the OS uses DHCP for network configuration.

### Static IP
Edit `os-build/config/network-config.yaml` before building:

```yaml
version: 2
ethernets:
  eth0:
    addresses:
      - 192.168.1.100/24
    gateway4: 192.168.1.1
```

## Usage Workflow

1. **Build ISO** on development machine (Linux)
2. **Create USB** from ISO
3. **Boot mining rig** from USB
4. **Access dashboard** at `http://<rig-ip>:3000`
5. **Configure mining** via web interface
6. **Monitor** from any device on network

## Differences from HiveOS

| Feature | HiveOS | QuaiMiner CORE OS |
|---------|--------|-------------------|
| Mining Focus | Multiple coins | Quai Network only |
| Mining Mode | Pool mining | Solo mining |
| Node Required | No | Yes (own Quai node) |
| Fees | Pool fees | 0% (100% rewards) |
| Dashboard | Cloud-based | Local/Remote web |

## Security Considerations

Before deploying to production:

1. ✅ Change all default passwords
2. ✅ Configure firewall (UFW)
3. ✅ Set up SSH keys (disable password auth)
4. ✅ Enable HTTPS for dashboard (SSL/TLS)
5. ✅ Update system packages regularly
6. ✅ Configure fail2ban for SSH protection

## Next Steps

1. **Test Build**: Build ISO on Linux system
2. **Test Boot**: Boot from USB on test rig
3. **Verify Network**: Ensure dashboard is accessible
4. **Configure Mining**: Set up Quai node and miner
5. **Deploy**: Use on production mining rigs

## Documentation

- **Build Instructions**: `os-build/docs/BUILD_INSTRUCTIONS.md`
- **OS README**: `os-build/README.md`
- **Network Config**: `os-build/config/network-config.yaml`

## Support

For issues:
- Check logs: `journalctl -u quaiminer-dashboard`
- Verify network: `hostname -I`
- Check services: `systemctl status quaiminer-dashboard`

