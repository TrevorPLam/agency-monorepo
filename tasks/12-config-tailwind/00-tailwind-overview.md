# 12-config-tailwind: Tailwind CSS Configuration

## Purpose
Provide shared Tailwind CSS theme configuration using v4 CSS-first approach with `@theme` directives.

## Dependencies
- None (external Tailwind dependency only)
- Consumed by: UI packages and apps

## Scope
This package provides:
- CSS-based theme tokens (v4 approach)
- Design token CSS custom properties
- Tailwind v4 `@theme` configuration

## Critical Notes
- Tailwind v4 uses CSS-first configuration, not JavaScript presets
- The `presets` API was removed in v4
- Use `@import` and `@source` directives instead

## Next Steps
1. UI theme package imports this base configuration
2. Apps extend the theme with their own customizations
