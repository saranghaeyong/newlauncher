# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Quick Access Panel** — Three pill buttons (Inputs | WiFi | Settings) in top-right corner
- **Greeting system** — "GOOD MORNING", "GOOD AFTERNOON", "GOOD EVENING" based on time of day
- **Live WiFi SSID display** — Shows currently connected network name in pill
- **Improved D-pad navigation** — Left/Right now switches between app grid and quick panel
- **Back button support** — Returns from quick panel focus to app grid
- **Performance optimizations** — Cached DP values, reduced allocations, efficient clock handler

### Changed
- **Redesigned layout** — Quick pills positioned next to clock at top-right
- **Enhanced visual feedback** — Better selected state with red border and accent bar
- **Updated navigation hints** — Footer text reflects new panel-switching behavior
- **Improved scroll calculation** — More accurate viewport adjustments

### Fixed
- **Fixed Inputs pill crash** — Removed invalid `ACTION_INPUT_SOURCE_SETTINGS` constant
- **Fixed compilation errors** — Resolved all Java type and method resolution issues
- **Fixed lint violations** — Addressed API level compatibility warnings
- **Fixed resource leaks** — Properly clean up Handler callbacks on destroy

### Optimized
- **Reduced APK size** — 17,873 bytes (~17.5 KB) after R8 minification
- **Eliminated unnecessary allocations** — Pre-compute string measurements during layout
- **Cached frequently-used values** — DP conversions, font sizes, layout metrics
- **Optimized draw loop** — Minimize object creation in `onDraw()`

---

## [1.0.0] — Initial development build

- Create native Java Android TV home activity
- Dark minimal interface with red accent and clock/date
- Discover Leanback apps, with launcher-activity fallback
- Support D-pad navigation and launching apps with OK/Enter
- Release minification (R8) and resource shrinking enabled
- Add Gradle wrapper for reproducible builds
- Add GitHub Actions workflow to build and upload release APK artifact

### Technical Details
- **Package**: `com.newlauncher.tv`
- **Min SDK**: 21 (Android 5.0 Lollipop)
- **Target SDK**: 35 (Android 15)
- **Compile SDK**: 35
- **AGP Version**: 8.7.3
- **Gradle Version**: 8.9
- **Java Version**: 17

---

## Version History

| Version | Date | APK Size | Key Changes |
|---------|------|----------|-------------|
| 1.0.0 | 2024-11-11 | ~17 KB | Initial release with basic launcher functionality |
| 1.1.0 | 2024-11-11 | ~18 KB | Added quick access panel, greetings, WiFi display |

---

## Future Roadmap

### Planned Features
- [ ] App search functionality
- [ ] App pinning/favorites
- [ ] Multiple page support
- [ ] Custom wallpaper support
- [ ] Widget support (weather, news, calendar)
- [ ] Theme customization (colors, fonts)
- [ ] Keyboard shortcut support
- [ ] Remote control mapping configuration

### Performance Goals
- [ ] Maintain APK size under 20 KB
- [ ] Optimize rendering for 4K displays
- [ ] Reduce memory footprint further
- [ ] Implement lazy loading for icons

### Compatibility Goals
- [ ] Test on more TV brands (Samsung, LG webOS via bridge)
- [ ] Support Android TV Go edition
- [ ] Optimize for low-memory devices (512MB RAM)
- [ ] Test with screen readers and accessibility features
