# QuaiMiner CORE OS - Linux Bootable Image

This directory contains all files needed to build a USB-bootable Linux operating system for Quai mining.

## Overview

QuaiMiner CORE OS is a minimal Linux distribution based on Ubuntu/Debian, optimized for:
- Solo mining Quai Network
- Multi-GPU support (NVIDIA & AMD)
- Remote web dashboard access
- USB bootable installation

## Structure

```
os-build/
├── boot/              # Boot configuration files
├── rootfs/            # Root filesystem structure
├── scripts/           # Build scripts
├── config/            # OS configuration files
└── iso/               # ISO generation files
```

## Building the Image

### Prerequisites

- Ubuntu 20.04+ or Debian 11+ (build host)
- 20GB+ free disk space
- Root/sudo access
- Internet connection

### Quick Build

```bash
cd os-build
sudo ./scripts/build-iso.sh
```

This will create a bootable ISO image in `output/quaiminer-core-os.iso`

### Building for USB

```bash
sudo ./scripts/build-usb.sh /dev/sdX
```

Replace `/dev/sdX` with your USB device (e.g., `/dev/sdb`)

## Features

- **Minimal OS**: ~2GB base system
- **Auto-start Dashboard**: Dashboard starts on boot
- **Network Access**: Accessible via IP address
- **GPU Support**: Pre-installed drivers for NVIDIA and AMD
- **Mining Ready**: Quai GPU Miner pre-installed
- **Persistent Storage**: Configurations saved to USB

## Remote Access

After booting, the dashboard is accessible at:
- `http://<rig-ip-address>:3000`
- Default credentials: `admin` / `admin`

## Documentation

See `docs/` for detailed build and deployment instructions.

