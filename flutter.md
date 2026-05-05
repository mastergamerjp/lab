# Flutter Development on Termux (2026)

This document details the setup, configuration, and usage of the Flutter development environment within this Termux instance.

## 🚀 Overview
Due to the lack of official Google support for Android as a development host, this environment uses **PRoot Distro** to run a **Debian (arm64)** container. This provides the `glibc` environment required by the Dart SDK and Flutter engine while maintaining near-native performance.

---

## 🛠️ Setup Process Summary

### 1. Containerization
- **Tool:** `proot-distro`
- **Distribution:** Debian Trixie (arm64)
- **Base Command:** `pkg install proot-distro && proot-distro install debian`

### 2. Core Dependencies
The following packages were installed inside the container:
- **Runtimes:** OpenJDK 21 (Headless)
- **Build Tools:** `git`, `curl`, `wget`, `unzip`, `xz-utils`, `cmake`, `ninja-build`, `pkg-config`
- **Libraries:** `libglu1-mesa`, `libgtk-3-dev`, `mesa-utils`

### 3. SDK Installation
- **Flutter SDK:** Cloned from the stable branch into `~/development/flutter`.
- **Android SDK:**
    - Command Line Tools downloaded and extracted to `~/Android/sdk/cmdline-tools/latest`.
    - Platforms 34 & 36 and Platform-Tools installed via `sdkmanager`.

### 4. Native ARM64 Tooling (Critical)
Standard Android SDK binaries are often x86_64. To ensure compatibility, native ARM64 binaries were installed from Debian repositories and symlinked:
- **Packages:** `android-sdk-platform-tools`, `android-sdk-build-tools`
- **Symlinks:** Created in `~/Android/sdk/platform-tools/` and `~/Android/sdk/build-tools/` to point to `/usr/bin/adb` and other native tools.

---

## ⚙️ Environment Configuration

The following paths were added to `~/.bashrc` inside the Debian container:

```bash
export ANDROID_HOME=$HOME/Android/sdk
export PATH=$PATH:$HOME/development/flutter/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

---

## 📖 Usage Guide

### 1. Entering the Environment
From any Termux session, run:
```bash
proot-distro login debian
```

### 2. Connecting a Device
Since emulators are not supported, use **Wireless Debugging**:
1. Enable **Wireless Debugging** in your phone's Developer Options.
2. Inside the container, connect to your device:
   ```bash
   adb connect <device_ip>:<port>
   ```
3. Verify connection:
   ```bash
   flutter devices
   ```

### 3. Developing and Running
- **Create Project:** `flutter create my_app`
- **Run App:** `flutter run`
- **Doctor Check:** `flutter doctor`

---

## ⚠️ Important Notes & Troubleshooting

### Android 15 Phantom Process Killer
Android 15 may kill heavy Gradle builds. If your build crashes unexpectedly:
- Use a "Keep Alive" notification in Termux.
- If you have ADB access to the device from a PC, run:
  ```bash
  /system/bin/device_config put activity_manager max_phantom_processes 2147483647
  ```

### Graphical Interface (UI)
- **Web Development:** Flutter Web is fully supported and can be previewed in your Android browser.
- **Linux Desktop:** To run Linux desktop apps, use **Termux-X11** with an X server app.
- **IDE:** You can use `vim`, `nano`, or install `code-server` (VS Code) inside Termux to code via a browser.

### License Acceptance
If prompted for licenses, run:
```bash
flutter doctor --android-licenses
```
