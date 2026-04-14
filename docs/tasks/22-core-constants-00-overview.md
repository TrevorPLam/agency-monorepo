# 22-core-constants: Constants, Enums, and Error Codes

## Purpose

Centralize all enums, error codes, route key maps, and fixed configuration values. Never use "magic strings" scattered across multiple apps. Replace TypeScript enums with const assertions for better type safety and tree-shaking.

## Dependencies

- **Required**: `20-core-types`
- **Followed by**: `23-core-hooks`
- **Consumed by**: All packages and apps

## Scope

This package contains:
- Route constants with const assertion for type safety
- Error codes with HTTP status mapping
- Invoice state machine with valid transitions
- Performance-optimized validation utilities using Set

## Constraints

- **No TypeScript enums**: Use `as const` objects only
- **O(1) validation**: Use Set for constant lookups
- **Type inference**: Derive types from const assertions
- **Tree-shakable**: No side effects, minimal bundle impact

## Success Criteria

- [ ] All enums converted to const assertions
- [ ] Set-based validation for O(1) lookups
- [ ] State machine transitions validated at compile time
- [ ] <1ms for constant validation
- [ ] <1KB memory overhead per constant set

## Exit Criteria

Package published to workspace with:
- All constants validated
- Type inference verified
- Performance benchmarks met
- README documentation complete

## Next Steps

1. Implement `23-core-hooks` — React hooks with React 19.2
