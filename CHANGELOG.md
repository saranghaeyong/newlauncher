# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Proper D-pad grid navigation** — Left/Right moves between columns, Up/Down moves between rows
- **MENU key for panel access** — Deliberate navigation route to quick panel (Inputs/WiFi/Settings)
- **Fixed navigation bugs** — No longer jumps to panels when pressing RIGHT on last app
- **Intent-based app launching** — Uses explicit ComponentName for reliable launches
- **HashSet deduplication** — O(1) duplicate detection during app discovery
- **Proper clock lifecycle** — Starts on resume, stops on pause, cleans up on destroy
- **Correct date pattern** — Uses `EEEE, d MMMM yyyy` for full weekday/month/year
- **Wi-Fi label truncation** — Long SSIDs truncated with ellipsis to prevent overlap
- **Enhanced focus states** — Better visual feedback with red border and accent bar
- **Improved scroll calculation** — Consistent viewport with proper clamping
- **Empty grid row handling** — Safely handles incomplete final rows

### Changed
- **Navigation model** — Grid uses columnar navigation, panels accessed via MENU key
- **Performance optimizations** — Reduced allocations in onDraw(), pre-computed layouts
- **Code organization** — Extracted AppItem to include activity name for explicit launching
- **Documentation** — Comprehensive README with testing checklist and compatibility notes

### Fixed
- **D-pad LEFT/RIGHT behavior** — Now correctly navigates columns instead of switching panels
- **Clock callback leak** — Handler properly cleaned up onPause/onDestroy
- **Deprecated Date.getHours()** — Using Calendar for hour extraction
- **Scroll boundary issues** — Correct max scroll calculation prevents overshoot
- **Card overflow prevention** — Clips draw area to prevent overlap with header/footer
- **Duplicate app detection** — Uses LinkedHashMap for O(1) lookups instead of O(n²)
- **Wi-Fi permission handling** — Graceful fallback when SSID access unavailable
- **Build compatibility** — Fixed Color.argb() calls for proper 4-parameter usage

### Optimized
- **APK size maintained** — Still under 20 KB after optimizations
- **Memory efficiency** — Reduced temporary object creation in hot paths
- **Rendering performance** — Cached DP values, minimized Paint state changes
- **Layout recalibration** — Efficient recalculation on orientation/size changes

---

## [1.0.0] — Initial release

### Added
- Native Java Android TV home launcher
- Black/red cinematic theme with Deadpool-inspired aesthetics
- Live digital clock with AM/PM and date display
- Greeting system (Good Morning/Afternoon/Evening)
- App discovery via CATEGORY_LEANBACK_LAUNCHER with LAUNCHER fallback
- D-pad navigation (basic implementation)
- OK/Enter to launch applications
- Quick access pills (Inputs, WiFi, Settings) in top-right corner
- Install/uninstall monitoring via BroadcastReceiver
- Responsive layout for 720p/1080p/4K displays
- R8 minification and resource shrinking
- Gradle wrapper for reproducible builds
- GitHub Actions CI/CD pipeline

### Technical Details
- **Package**: `com.newlauncher.tv`
- **Min SDK**: 21 (Android 5.0 Lollipop)
- **Target SDK**: 35 (Android 15)
- **Compile SDK**: 35
- **AGP Version**: 8.7.3
- **Gradle Version**: 8.9
- **Java Version**: 17
- **APK Size**: ~18 KB (compressed)

---

## Version History

| Version | Date | APK Size | Key Changes |
|---------|------|----------|-------------|
| 1.0.0 | 2024-11-11 | ~18 KB | Initial release with basic launcher functionality |
| 1.1.0 | 2024-11-11 | ~18 KB | Fixed navigation, improved scrolling, added proper lifecycle management |

---

## Future Roadmap

### Planned Features
- [ ] App search with fuzzy matching
- [ ] App pinning/favorites with SharedPreferences persistence
- [ ] Multiple page support (horizontal swipe between pages)
- [ ] Custom wallpaper support (stored in internal storage)
- [ ] Widget support for leanback-compatible widgets
- [ ] Theme customization (color accents, card styles)
- [ ] Keyboard shortcut configuration
- [ ] Remote control mapping editor
- [ ] Last-used app tracking and quick access row

### Performance Goals
- [ ] Maintain APK size under 20 KB
- [ ] Optimize icon loading with bitmap caching
- [ ] Reduce memory footprint for low-RAM devices (512MB)
- [ ] Implement virtualization for 100+ app lists
- [ ] Optimize for 4K@60fps rendering

### Compatibility Goals
- [ ] Test on more TV brands (Samsung Tizen bridge, LG webOS)
- [ ] Support Android TV Go edition (reduced feature set)
- [ ] Test with screen readers and accessibility features
- [ ] Validate on Android 15 (API 35) edge cases

### Quality Goals
- [ ] Add unit tests for navigation logic
- [ ] Implement instrumentation tests with Android Emulator
- [ ] Add performance benchmarks and regression tests
- [ ] Create automated APK size tracking
- [ ] Add code coverage reporting

---

## Testing Matrix

| Platform | Status | Notes |
|----------|--------|-------|
| Linux Mint 22.3 (Build) | ✅ Verified | JDK 21, AGP 8.7.3, Gradle 8.9 |
| Android Emulator (API 35) | ⚠️ Pending | Requires AVD setup |
| TCL Android TV | ⚠️ Pending | Physical device testing needed |
| Sony Android TV | ⚠️ Pending | OEM-specific testing needed |
| Amazon Fire TV | ⚠️ Pending | Modified Android compatibility |

---

## Known Limitations

1. **Physical TV testing not completed** — Build verified, runtime behavior needs TV testing
2. **OEM restrictions vary** — Some manufacturers block third-party launchers
3. **No persistent favorites** — Session-only navigation state
4. **Limited widget support** — Cannot launch non-launcher activities reliably
5. **No app filtering** — Shows all launchable apps without categorization

---

## Credits

- **Developer**: saranghaeyong
- **Design Inspiration**: Deadpool cinematic aesthetic
- **Testing**: Automated build verification only
- **Community**: Android TV developer documentation

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.*
