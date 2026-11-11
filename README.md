# NewLauncher

A minimal, native Android TV home launcher. NewLauncher is designed for television screens and remote control first: a quiet dark interface, a simple clock/date header, and a grid of installed TV apps.

## Project goals

- Native Android application (Java; no web runtime).
- Android TV / Google TV home-screen entry point.
- D-pad navigation and OK/Enter to launch apps.
- Minimal dark UI with a restrained red accent.
- No analytics, advertisements, accounts, network calls, or third-party runtime libraries.
- Release build uses R8 and resource shrinking.

## Current implementation

The first implementation discovers apps that expose Android TV's Leanback launcher category. If none are found, it falls back to standard launcher activities. It displays their labels and icons and launches the selected app.

This is an intentionally small foundation. It does not yet provide app pinning, settings shortcuts, Wi-Fi controls, app hiding, favorites, custom wallpapers, or a settings screen.

## Requirements

- JDK 17
- Gradle 8.9
- Android SDK Platform 35
- Android TV device or emulator running Android 5.0 (API 21) or newer

## Build

```bash
gradle --no-daemon :app:assembleRelease
```

APK output:

`app/build/outputs/apk/release/app-release.apk`

The CI APK is signed with the Android debug key so it can be installed for testing. Do not distribute it as a production release; configure a private signing key for public releases.

## Install with ADB

Connect to the TV with USB debugging / network debugging enabled:

```bash
adb connect TV_IP:5555
adb install -r app/build/outputs/apk/release/app-release.apk
```

Open NewLauncher from the TV's app list, then choose it as the Home app if Android TV offers a launcher chooser. Device manufacturers may restrict changing the default launcher.

## Build on GitHub

Every push to `main` and every pull request runs the Android build workflow. The generated APK is uploaded as the `NewLauncher-release-apk` workflow artifact for 14 days. Open **Actions → Android build → latest run → Artifacts** to download it.

## APK size

The project is configured for code/resource shrinking and has no third-party runtime dependencies. APK size depends on Android Gradle Plugin, SDK and platform packaging. The sub-1 MB target is not guaranteed; the workflow reports the actual size so it can be measured rather than claimed without a build.

## Compatibility notes

- The app requests the HOME, DEFAULT and LEANBACK_LAUNCHER categories.
- Android TV firmware can impose vendor-specific restrictions on third-party launchers.
- The app does not replace or uninstall the stock launcher.
- QUERY_ALL_PACKAGES is used because an app launcher must enumerate installed launchable apps. Distribution through Google Play is subject to Play's package-visibility policy.

## License

No license has been selected yet. Add a license before accepting external contributions or redistributing the project.
