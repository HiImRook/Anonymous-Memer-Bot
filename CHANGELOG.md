## [1.1.0] - 2026-02-21

### Added
- Global concurrency cap (3 concurrent renders)
- Immediate rejection with "try again soon" when at capacity
- Fetch timeout with AbortController (15 seconds)
- File size guard (25MB max, checked before fetch)

### Changed
- Removed unused GuildMessages and MessageContent intents

# Changelog

## [1.0.0] - 2026-02-20

### Added
- Initial release
- /memer slash command with image upload
- Top or bottom text box placement
- Black or white box with automatic contrast text
- 20 font options
- Text auto-scales and wraps to fit box
- Shift+Enter support for line breaks
- In-memory session management with automatic cleanup
- Clean PNG output with no source metadata
