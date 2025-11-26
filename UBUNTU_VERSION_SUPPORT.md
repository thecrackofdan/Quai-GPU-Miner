# Ubuntu Version Support

## ✅ Supported Ubuntu Versions

QuaiMiner CORE supports **Ubuntu 20.04 LTS, 22.04 LTS, and 24.04 LTS** (latest).

### Latest Ubuntu Support (24.04 LTS)

The project has been updated to automatically detect and support the latest Ubuntu versions:

- **Ubuntu 24.04 LTS (Noble Numbat)** ✅ - Fully supported
- **Ubuntu 22.04 LTS (Jammy Jellyfish)** ✅ - Fully supported  
- **Ubuntu 20.04 LTS (Focal Fossa)** ✅ - Fully supported

## 🔧 Automatic Version Detection

All installation scripts now automatically detect your Ubuntu version and use the appropriate drivers and packages:

- **AMD Drivers**: Automatically selects correct driver version for your Ubuntu release
- **Package Repositories**: Uses appropriate repositories for your version
- **Dependencies**: Installs version-compatible packages

## 📦 Installation Methods by Ubuntu Version

### Ubuntu 24.04 LTS (Latest)

**Recommended Method: Mesa Drivers (Easiest)**
```bash
sudo apt update
sudo apt install -y mesa-opencl-icd opencl-headers clinfo
```

**Alternative: AMD Official Drivers**
- Uses latest AMDGPU Pro drivers compatible with Ubuntu 24.04
- Automatically detected by installation scripts

### Ubuntu 22.04 LTS

**Recommended Method: Mesa Drivers**
```bash
sudo apt update
sudo apt install -y mesa-opencl-icd opencl-headers clinfo
```

**Alternative: AMD Official Drivers**
- AMDGPU Pro 22.40+ compatible
- Automatically detected by installation scripts

### Ubuntu 20.04 LTS

**Recommended Method: AMDGPU Pro 22.40**
- Original supported version
- All scripts fully tested on this version

## 🚀 Quick Start on Latest Ubuntu

1. **Check your Ubuntu version:**
   ```bash
   lsb_release -a
   ```

2. **Run the automated setup:**
   ```bash
   chmod +x quick_amd_setup.sh
   ./quick_amd_setup.sh
   ```

   The script will automatically:
   - Detect your Ubuntu version
   - Install appropriate drivers
   - Configure OpenCL
   - Set up environment variables

3. **Or use QuaiMiner OS installer:**
   ```bash
   cd quaiminer-os
   sudo ./install.sh
   ```

## 🔍 Verification

After installation, verify OpenCL works:

```bash
clinfo
```

You should see your GPU listed with OpenCL support.

## 📝 Notes

- **Mesa drivers** are recommended for Ubuntu 22.04+ as they're easier to install and maintain
- **AMDGPU Pro drivers** provide better performance but require more setup
- All scripts now automatically adapt to your Ubuntu version
- Node.js dashboard works on all supported Ubuntu versions

## 🆘 Troubleshooting

If you encounter issues:

1. **Check Ubuntu version compatibility:**
   ```bash
   lsb_release -a
   ```

2. **Try Mesa drivers first** (easiest):
   ```bash
   sudo apt install -y mesa-opencl-icd opencl-headers clinfo
   ```

3. **Check GPU detection:**
   ```bash
   lspci | grep -i amd
   ```

4. **Verify OpenCL:**
   ```bash
   clinfo
   ```

For more help, see `amd_opencl_troubleshooting.md`.

