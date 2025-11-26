# Quick Ubuntu Compatibility Check

## ✅ Yes, QuaiMiner CORE runs on the latest Ubuntu!

**Supported Ubuntu Versions:**
- ✅ **Ubuntu 24.04 LTS (Noble Numbat)** - Latest, fully supported
- ✅ **Ubuntu 22.04 LTS (Jammy Jellyfish)** - Fully supported
- ✅ **Ubuntu 20.04 LTS (Focal Fossa)** - Fully supported

## 🚀 Quick Start on Latest Ubuntu

1. **Check your version:**
   ```bash
   lsb_release -a
   ```

2. **Run the automated setup:**
   ```bash
   chmod +x quick_amd_setup.sh
   ./quick_amd_setup.sh
   ```

   The script automatically detects your Ubuntu version and installs the correct drivers!

3. **Or use QuaiMiner OS:**
   ```bash
   cd quaiminer-os
   sudo ./install.sh
   ```

## 📋 What's Different on Latest Ubuntu?

### Ubuntu 24.04 / 22.04
- **Mesa drivers** are recommended (easier installation)
- AMDGPU Pro also available if you need maximum performance
- All scripts automatically detect and adapt

### Ubuntu 20.04
- Uses AMDGPU Pro 22.40 (original supported version)
- Fully tested and stable

## ✅ Verification

After installation:
```bash
clinfo
```

You should see your GPU with OpenCL support.

## 📚 More Information

- See [UBUNTU_VERSION_SUPPORT.md](UBUNTU_VERSION_SUPPORT.md) for detailed compatibility info
- See [README.md](README.md) for full setup instructions

