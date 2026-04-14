# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.0] - 2025-04-13

### Added

- Initial ESLint flat config with package boundary enforcement
- TypeScript support with strict linting rules
- Package dependency flow enforcement: config -> core -> ui/data/auth/communication -> apps
- Prevention of cross-package `src/` imports and app-to-package imports
- Comprehensive README with usage instructions and troubleshooting guide
