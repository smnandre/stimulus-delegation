# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-26

### Added
- New function-based API for more intuitive initialization: `useDelegation(this)`
- Automatic cleanup when controllers disconnect, eliminating the need for manual `undelegateAll()` calls
- Support for event delegation on text nodes
- Improved error handling for null event targets
- Comprehensive test coverage for edge cases

### Changed
- Improved TypeScript typings for better IDE support
- Updated documentation to reflect new function-based approach
- Enhanced unit test examples in README

### Fixed
- Event delegation now properly handles text nodes inside target elements
- Graceful handling of null event targets
- Improved TypeScript compatibility for disconnect method

## [1.0.0] - Initial Release

### Added
- Initial implementation with mixin-based API
- Event delegation capabilities for Stimulus controllers
- Support for method chaining
- TypeScript integration
