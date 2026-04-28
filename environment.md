# Termux Environment Information

This document summarizes the environment, limitations, and resources available in this Termux instance on Android.

## System Overview
- **Operating System:** Android 15 (Linux kernel 5.4.295)
- **Architecture:** `aarch64` (ARMv8)
- **Device:** motorola moto g34 5G
- **CPU:** 8 cores (6x Cortex-A55 @ 1.8GHz, 2x Cortex-A78 @ 2.2GHz)
- **User ID:** 0 (within Termux container)

## Resources & Limitations
- **Storage:**
  - `/data`: ~111GB total, ~15GB available.
  - `/storage/emulated`: Shared storage access (if permitted).
  - `/tmp`: Available for temporary files.
- **Memory:** Total system RAM ~1.6G reported as tmpfs (Note: Android manages actual RAM).
- **Network:** Full outbound network access. Inbound access restricted by Android/firewalls.
- **Background Execution:** Subject to Android "Phantom Process Killer" (Termux version: `googleplay.2026.02.11`).

## Available Software & Tools
- **Package Manager:** `apt` / `pkg`
- **Shell:** Bash 5.3.9
- **VCS:** Git 2.54.0
- **Runtimes:**
  - Node.js: v25.8.2
  - NPM: 11.13.0
  - Python: 3.13.13
- **Compilers:**
  - Clang: 21.1.8 (Target: aarch64-unknown-linux-android30)
- **Termux-API:** Not installed (requires `pkg install termux-api` and the companion Android app).

## Environment Variables
- `HOME`: `/data/data/com.termux/files/home`
- `PREFIX`: `/data/data/com.termux/files/usr` (Termux base directory)
- `PATH`: Includes `/data/data/com.termux/files/usr/bin` and system paths.
- `LD_PRELOAD`: `/data/data/com.termux/files/usr/lib/libtermux-exec.so` (Hooks `execve` to handle shebangs).

## Notes
- The environment is a Linux-like prefix within the Android app's private data directory.
- Root access is NOT available by default to the rest of the Android system.
- Shared libraries and binaries are located under `$PREFIX/lib` and `$PREFIX/bin`.
