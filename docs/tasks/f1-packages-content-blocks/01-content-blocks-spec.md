# f1-packages-content-blocks: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | CMS requires reusable content block schemas |
| **Minimum Consumers** | 1+ apps using CMS with structured content |
| **Dependencies** | Sanity OR Contentful SDK, TypeScript 6.0 |
| **Exit Criteria** | Content blocks exported and used in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit CMS need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Content blocks `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Conditional; only needed with CMS-based structured content

## Package Structure

```
packages/content-blocks/
├── src/
│   ├── index.ts
│   ├── schemas/              # Sanity block schemas
│   │   ├── hero.ts
│   │   ├── features.ts
│   │   ├── testimonials.ts
│   │   ├── cta.ts
│   │   └── page-builder.ts   # Assembles blocks
│   ├── components/           # React renderers
│   │   ├── HeroBlock.tsx
│   │   ├── FeaturesBlock.tsx
│   │   ├── TestimonialsBlock.tsx
│   │   ├── CTABlock.tsx
│   │   └── PageBuilder.tsx   # Renders block array
│   └── types.ts
├── package.json
└── README.md
```

## Block Schema Example

```typescript
// src/schemas/hero.ts
export const heroBlock = {
  name: 'hero',
  type: 'object',
  title: 'Hero Section',
  fields: [
    { name: 'headline', type: 'string' },
    { name: 'subheadline', type: 'text' },
    { name: 'backgroundImage', type: 'image' },
    { name: 'ctas', type: 'array', of: [{ type: 'cta' }] },
  ],
};
```

## Page Builder Pattern

```typescript
// src/components/PageBuilder.tsx
import { HeroBlock } from './HeroBlock';
import { FeaturesBlock } from './FeaturesBlock';

const blockComponents = {
  hero: HeroBlock,
  features: FeaturesBlock,
  testimonials: TestimonialsBlock,
  cta: CTABlock,
};

export function PageBuilder({ blocks }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockComponents[block._type];
        return Component ? <Component key={block._key} {...block} /> : null;
      })}
    </>
  );
}
```

## Multi-Tenant Support

```typescript
// Brand-specific overrides
const brandVariants = {
  'acme-corp': {
    hero: AcmeHeroVariant,
    cta: AcmeCTAVariant,
  },
  default: {
    hero: HeroBlock,
    cta: CTABlock,
  },
};
```

## References

- [Sanity marketing demo](https://github.com/sanity-io/demo-marketing-site-nextjs)
- [Sanity page builder guide](https://www.sanity.io/guides/page-builder)
