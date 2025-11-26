# Quick Start - Building QuaiMiner CORE OS

## Prerequisites

- **Linux system** (Ubuntu 20.04+ or Debian 11+)
- **20GB+ free disk space**
- **Root/sudo access**
- **Internet connection**

## Build Steps

### 1. Install Build Dependencies

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

### 2. Prepare Dashboard Files

```bash
# From project root
cd os-build
sudo cp -r ../miner-dashboard /tmp/quaiminer-dashboard
```

### 3. Build ISO

```bash
sudo ./scripts/build-iso.sh
```

**Output**: `output/quaiminer-core-os-1.0.0.iso`

### 4. Create Bootable USB

```bash
# List USB devices
lsblk

# Create USB (replace /dev/sdX with your device)
sudo ./scripts/build-usb.sh /dev/sdX
```

## Using the OS

1. **Boot** mining rig from USB
2. **Wait** for first-boot setup (auto-configures)
3. **Find IP**: Check router or run `hostname -I` on rig
4. **Access**: Open `http://<rig-ip>:3000` in browser
5. **Login**: `admin` / `admin` (change immediately!)

## Default Access

- **Dashboard**: `http://<rig-ip>:3000`
- **SSH**: `quaiminer` / `quaiminer` (port 22)
- **Root**: Use `sudo` (password: `quaiminer`)

## Next Steps

- Change all default passwords
- Configure mining settings
- Set up Quai node connection
- Monitor from any device on network

For detailed instructions, see `docs/BUILD_INSTRUCTIONS.md`

