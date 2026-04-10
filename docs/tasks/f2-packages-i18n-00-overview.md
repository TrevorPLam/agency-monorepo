# f2-packages-i18n: Internationalization Package

## Purpose
Create a shared internationalization package when two or more sites need shared locale routing, dictionaries, or hreflang logic. The multilingual marketing-site pattern is visible in current Sanity reference material.

## Dependencies
- `00-foundation` - Root scaffolding
- `20-core-types` - Shared types
- `30-ui-theme` - RTL layout support

## Scope

### Package Structure
```
packages/i18n/
├── src/
│   ├── index.ts
│   ├── config.ts             # Locale configuration
│   ├── routing.ts            # Next.js i18n routing
│   ├── dictionaries/         # Translation files
│   │   ├── en.json
│   │   ├── es.json
│   │   └── de.json
│   ├── components/
│   │   ├── LocaleSwitcher.tsx
│   │   └── TranslationProvider.tsx
│   └── utils/
│       ├── hreflang.ts       # SEO hreflang generation
│       └── rtl.ts              # RTL detection
├── package.json
└── 01-config-biome-migration-50-ref-quickstart.md
```

### Locale Configuration

```typescript
// src/config.ts
export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'de', 'fr'],
  localePrefix: 'always', // or 'as-needed'
};

export type Locale = (typeof i18nConfig.locales)[number];
```

### Next.js Integration

```typescript
// apps/agency-website/middleware.ts
import { createI18nMiddleware } from '@agency/i18n';

export default createI18nMiddleware(i18nConfig);
```

```typescript
// apps/agency-website/app/[locale]/layout.tsx
import { TranslationProvider } from '@agency/i18n';

export default async function RootLayout({
  children,
  params: { locale },
}) {
  const dictionary = await getDictionary(locale);
  
  return (
    <TranslationProvider locale={locale} dictionary={dictionary}>
      <html lang={locale} dir={getTextDirection(locale)}>
        {children}
      </html>
    </TranslationProvider>
  );
}
```

### Hreflang for SEO

```typescript
// src/utils/hreflang.ts
export function generateHreflang(
  pathname: string,
  locales: string[],
  defaultLocale: string
) {
  return locales.map((locale) => ({
    rel: 'alternate',
    hrefLang: locale,
    href: `/${locale}${pathname}`,
  }));
}
```

## Build Condition

**Build conditionally** - Add this package when:
- Two or more sites need shared i18n infrastructure
- Multilingual content becomes a requirement
- Shared translation dictionaries needed
- hreflang SEO compliance required

**Don't build when:**
- Single-language sites only
- Each site handles i18n independently
- No near-term internationalization plans

## References

- [Sanity multilingual marketing demo](https://github.com/sanity-io/demo-marketing-site-nextjs)
- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
