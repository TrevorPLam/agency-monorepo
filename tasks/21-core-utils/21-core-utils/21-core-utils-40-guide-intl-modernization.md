# Guide: Modern Intl API Patterns for Core Utils

## Purpose
Update utility functions to use modern Intl API patterns with proper fallbacks, locale-aware design, and performance optimization for 2026 standards.

## Core Patterns

### 1. Locale-Aware Design
All utility functions must accept optional locale parameter with sensible defaults:

```ts
// Instead of this:
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US');
}

// Use this:
export function formatDate(
  date: Date, 
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    // Graceful fallback for older browsers or invalid locales
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
```

### 2. Currency Formatting with Exchange Rates
Modern currency utilities should support multiple currencies and exchange rate awareness:

```ts
interface CurrencyOptions {
  locale?: string;
  currency?: string;
  exchangeRate?: number;
  roundingMode?: 'halfEven' | 'halfOdd' | 'floor' | 'ceil';
}

export function formatCurrency(
  amount: number,
  options: CurrencyOptions = {}
): string {
  const { 
    locale = 'en-US', 
    currency = 'USD',
    exchangeRate = 1,
    roundingMode = 'halfEven'
  } = options;

  const adjustedAmount = amount * (exchangeRate || 1);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      roundingMode,
      minimumFractionDigits: 2
    }).format(adjustedAmount);
  } catch (error) {
    // Fallback for older environments
    return adjustedAmount.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    });
  }
}
```

### 3. Relative Time Formatting with Multiple Locales
Enhanced relative time formatting with locale-specific patterns:

```ts
interface RelativeTimeOptions {
  locale?: string;
  numeric?: boolean;
  style?: 'long' | 'short' | 'narrow';
}

export function formatRelativeTime(
  date: Date,
  options: RelativeTimeOptions = {}
): string {
  const { locale = 'en-US', numeric = false, style = 'long' } = options;
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric, style });
    
    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.abs(diffMs) / 1000;
    const diffMinutes = Math.abs(diffSeconds) / 60;
    const diffHours = Math.abs(diffMinutes) / 60;
    const diffDays = Math.abs(diffHours) / 24;
    
    if (Math.abs(diffDays) < 1) {
      return rtf.format(-diffSeconds, 'second');
    } else if (Math.abs(diffHours) < 1) {
      return rtf.format(-diffMinutes, 'minute');
    } else if (Math.abs(diffDays) < 7) {
      return rtf.format(-diffHours, 'hour');
    } else {
      return rtf.format(-diffDays, 'day');
    }
  } catch (error) {
    // Fallback for older browsers
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  }
}
```

### 4. Number Formatting with Locale Support
Advanced number formatting for different locales:

```ts
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    // Fallback for basic formatting
    return value.toLocaleString(locale);
  }
}
```

### 5. Performance-Optimized String Utilities
Modern string utilities with Unicode awareness and performance optimization:

```ts
// Unicode-aware string manipulation
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...',
  locale?: string
): string {
  // Use Intl.Segmenter for proper Unicode handling
  if (locale && 'Intl.Segmenter' in window) {
    try {
      const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
      const segments = segmenter.segment(text);
      
      if (segments.length > maxLength) {
        let truncated = '';
        let length = 0;
        for (const segment of segments) {
          if (length + segment.length > maxLength) {
            truncated += suffix;
            break;
          }
          truncated += segment;
          length += segment.length;
        }
        return truncated;
      }
    } catch (error) {
      // Fallback to simple substring
      return text.length > maxLength ? text.substring(0, maxLength - suffix.length) + suffix : text;
    }
  }
  
  // Fallback for environments without Intl.Segmenter
  return text.length > maxLength ? text.substring(0, maxLength - suffix.length) + suffix : text;
}

// Performance-optimized string helpers
export function capitalizeWords(text: string, locale?: string): string {
  const words = text.split(/\s+/);
  
  if (locale && locale.startsWith('tr')) {
    // Turkish special case
    return words.map((word, index) => 
      index === 0 ? word.toLocaleUpperCase(locale) : word.toLocaleLowerCase(locale)
    ).join(' ');
  }
  
  return words.map(word => 
    word.charAt(0).toLocaleUpperCase(locale) + word.slice(1).toLocaleLowerCase(locale)
  ).join(' ');
}
```

### 6. Validation with Modern Patterns
Enhanced validation utilities using modern browser APIs:

```ts
// Modern email validation with Intl support
export function isValidEmailIntl(email: string, locale?: string): boolean {
  try {
    // Use modern email validation if available
    if ('emailValidator' in window && window.emailValidator) {
      return window.emailValidator.validate(email);
    }
  } catch (error) {
    // Fallback to regex with locale awareness
    const emailRegex = locale === 'tr' 
      ? /^[a-zA-ZÇĞİçşöüı]+@[a-zA-ZÇĞİçşöüı]+\.[a-zA-Z]{2,}$/
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(email);
  }
}

// URL validation with IDN support
export function isValidUrlModern(url: string): boolean {
  try {
    // Handle Internationalized Domain Names
    const url = new URL(url);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    // Fallback for invalid URLs
    try {
      return Boolean(url);
    } catch {
        return false;
      }
  }
}
```

## Testing Strategies

### Performance Testing
Benchmark critical utilities for performance regression:

```ts
describe('Intl utilities performance', () => {
  it('formatDate should be performant', () => {
    const iterations = 10000;
    const date = new Date();
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      formatDate(date, 'en-US');
    }
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should be under 100ms for 10k calls
  });
});
```

### Locale Testing
Test utilities across different locales:

```ts
const locales = ['en-US', 'fr-FR', 'de-DE', 'ja-JP', 'ar-SA', 'tr-TR'];

describe.each(locales)('locale support', (locale) => {
  it(`should format date correctly for ${locale}`, () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, locale);
    expect(result).toMatch(/2024|Jan|15/); // Should contain locale-appropriate month name
  });
});
```

## Migration Guide

### From Legacy Utilities
Update existing utility functions to modern patterns:

```ts
// Before (Legacy)
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`; // Manual formatting
}

// After (Modern)
export function formatCurrency(amount: number, options: CurrencyOptions = {}): string {
  return formatCurrency(amount, { ...options, locale: 'en-US' });
}
```

### Performance Considerations

1. **Lazy Loading**: Load locale data on-demand
2. **Memoization**: Cache Intl formatters for repeated use
3. **Feature Detection**: Use feature detection for Intl API availability
4. **Graceful Degradation**: Provide sensible fallbacks for older browsers

## Bundle Optimization

### Tree Shaking
Structure utilities for optimal tree-shaking:

```ts
// src/date.ts - Individual exports
export { formatDate, formatRelativeTime, isValidDate } from './date';

// src/string.ts - Individual exports  
export { slugify, capitalize, truncateText, isValidEmailIntl, isValidUrlModern } from './string';

// src/currency.ts - Individual exports
export { formatCurrency, parseCurrency, formatNumber } from './currency';

// src/validation.ts - Individual exports
export { emailSchema, urlSchema, slugSchema, validateEmail, validateUrl, validateSlug } from './validation';

// src/index.ts - Re-export for tree-shaking
export * from './date';
export * from './string';
export * from './currency';
export * from './validation';
```

### Bundle Size Impact
Target under 1KB gzipped for the entire utils package through:
- Individual function exports
- Minimal external dependencies
- Efficient string manipulation algorithms
- Lazy loading of locale-specific features
