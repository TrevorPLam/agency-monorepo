# f2-packages-i18n: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires multi-language support |
| **Minimum Consumers** | 1+ apps explicitly requesting i18n |
| **Dependencies** | next-i18next OR react-i18next, Next.js 16.2.3 |
| **Exit Criteria** | i18n package exported and used in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §2 — Next.js 16.2.3 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — i18n `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Conditional; most apps don't need internationalization

## Package Structure

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
└── README.md
```

## Locale Configuration

```typescript
// src/config.ts
export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'de', 'fr'],
  localePrefix: 'always', // or 'as-needed'
};

export type Locale = (typeof i18nConfig.locales)[number];
```

## Next.js Integration

### Middleware

```typescript
// apps/agency-website/middleware.ts
import { createI18nMiddleware } from '@agency/i18n';

export default createI18nMiddleware(i18nConfig);
```

### Layout

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

## Hreflang for SEO

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

## References

- [Sanity multilingual marketing demo](https://github.com/sanity-io/demo-marketing-site-nextjs)
- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
