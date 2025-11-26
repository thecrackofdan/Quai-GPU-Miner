# Building QuaiMiner CORE OS

This guide explains how to build a USB-bootable Linux OS image for Quai mining.

## Prerequisites

### Build System Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+ (Linux only)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 20GB+ free space
- **Access**: Root/sudo privileges
- **Internet**: Required for downloading packages

### Required Packages

```bash
sudo apt-get update
sudo apt-get install -y \
    debootstrap \
    squashfs-tools \
    genisoimage \
    xorriso \
    syslinux \
    isolinux \
    grub-pc-bin \
    grub-efi-amd64-bin
```

## Building the ISO

### Step 1: Clone/Download Project

```bash
git clone <repository-url>
cd quaiminer-core-os/os-build
```

### Step 2: Copy Dashboard Files

Before building, ensure the dashboard is in the correct location:

```bash
# Copy dashboard to temp location for chroot
sudo cp -r ../miner-dashboard /tmp/quaiminer-dashboard
```

### Step 3: Build ISO

```bash
sudo ./scripts/build-iso.sh
```

This will:
1. Create a minimal Ubuntu base system
2. Install required packages
3. Copy QuaiMiner components
4. Generate bootable ISO image

**Output**: `output/quaiminer-core-os-1.0.0.iso`

### Step 4: Create Bootable USB

```bash
# List USB devices
lsblk

# Create bootable USB (replace /dev/sdX with your USB device)
sudo ./scripts/build-usb.sh /dev/sdX
```

**⚠️ WARNING**: This will erase all data on the USB device!

## Installation Methods

### Method 1: USB Boot (Recommended)

1. Boot from USB on mining rig
2. System will auto-configure on first boot
3. Dashboard accessible at `http://<rig-ip>:3000`

### Method 2: Install to Disk

1. Boot from USB
2. Select "Install to Disk" from GRUB menu
3. Follow installation wizard
4. System will persist on disk

## Post-Installation

### Accessing the Dashboard

After boot, the dashboard is accessible at:
- `http://<rig-ip-address>:3000`
- `http://localhost:3000` (from the rig itself)

### Default Credentials

- **Username**: `admin`
- **Password**: `admin`

**⚠️ Change these immediately after first login!**

### Finding the IP Address

From the rig:
```bash
hostname -I
```

Or check your router's DHCP client list.

## Customization

### Network Configuration

Edit `config/network-config.yaml` before building to set static IP:

```yaml
version: 2
ethernets:
  eth0:
    addresses:
      - 192.168.1.100/24
    gateway4: 192.168.1.1
    nameservers:
      addresses: [8.8.8.8, 8.8.4.4]
```

### Adding Custom Packages

Edit `scripts/build-iso.sh` and add packages to the `apt-get install` section.

## Troubleshooting

### Build Fails

- Ensure all prerequisites are installed
- Check disk space: `df -h`
- Verify internet connection
- Check logs in `output/` directory

### USB Won't Boot

- Verify ISO was written correctly: `file output/quaiminer-core-os-1.0.0.iso`
- Try different USB port (USB 2.0 recommended)
- Check BIOS/UEFI boot settings
- Verify USB device is not corrupted

### Dashboard Not Accessible

- Check firewall: `sudo ufw status`
- Verify service is running: `sudo systemctl status quaiminer-dashboard`
- Check logs: `sudo journalctl -u quaiminer-dashboard`
- Verify IP address: `hostname -I`

## Advanced Configuration

### Persistent Storage

The OS supports persistent storage on USB:
- Create a partition labeled `casper-rw`
- System will automatically use it for persistence

### Remote SSH Access

SSH is enabled by default:
- Username: `quaiminer`
- Password: `quaiminer`
- Port: 22

**⚠️ Change default passwords!**

## Building for Different Architectures

Currently supports:
- **amd64** (x86_64) - Standard desktop/server CPUs

Future support:
- **arm64** - ARM-based systems (Raspberry Pi, etc.)

## Size Optimization

The base ISO is ~2GB. To reduce size:
- Remove unnecessary packages in `build-iso.sh`
- Use compression options in `mksquashfs`
- Remove documentation and man pages

## Security Considerations

Before deploying:
1. Change all default passwords
2. Configure firewall rules
3. Set up SSH keys (disable password auth)
4. Update system packages
5. Configure SSL/TLS for dashboard (HTTPS)

## Support

For issues or questions:
- GitHub Issues: [Repository URL]
- Documentation: See `docs/` directory
- Logs: Check `/var/log/quaiminer/`

