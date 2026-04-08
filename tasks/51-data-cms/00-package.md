# 51-data-cms/00-package: CMS Schemas & Types

## Purpose
Reusable Sanity schema fragments and shared content models for Sanity-backed client sites.

## Files
```
packages/data/cms-schemas/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── schemas/
    │   ├── author.ts
    │   ├── post.ts
    │   ├── seo.ts
    │   └── image-gallery.ts
    └── fragments/
        └── seo-fields.ts
```

### `package.json`
```json
{
  "name": "@agency/data-cms",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./author": "./src/schemas/author.ts",
    "./post": "./src/schemas/post.ts",
    "./seo": "./src/schemas/seo.ts",
    "./image-gallery": "./src/schemas/image-gallery.ts",
    "./fragments/seo": "./src/fragments/seo-fields.ts"
  },
  "dependencies": {
    "sanity": "5.19.0",
    "next-sanity": "12.1.5"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/fragments/seo-fields.ts`
```ts
import { defineField } from "sanity";

export const seoFields = [
  defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    fields: [
      defineField({
        name: "title",
        title: "Meta Title",
        type: "string",
        description: "Override the default page title",
        validation: (Rule) => Rule.max(60).warning("Longer than 60 characters may be truncated")
      }),
      defineField({
        name: "description",
        title: "Meta Description",
        type: "text",
        rows: 2,
        validation: (Rule) => Rule.max(160).warning("Longer than 160 characters may be truncated")
      }),
      defineField({
        name: "ogImage",
        title: "Open Graph Image",
        type: "image",
        options: { hotspot: true }
      }),
      defineField({
        name: "noIndex",
        title: "No Index",
        type: "boolean",
        description: "Prevent search engines from indexing this page",
        initialValue: false
      })
    ]
  })
];
```

### `src/schemas/author.ts`
```ts
import { defineType, defineField } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true }
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 3
    })
  ],
  preview: {
    select: { title: "name", media: "image" }
  }
});
```

### `src/schemas/post.ts`
```ts
import { defineType, defineField } from "sanity";
import { seoFields } from "../fragments/seo-fields";

export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(200)
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }]
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true }
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }]
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" }
    }),
    ...seoFields
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage"
    },
    prepare({ title, author, media }) {
      return { title, subtitle: author ? `by ${author}` : undefined, media };
    }
  }
});
```

### `src/schemas/image-gallery.ts`
```ts
import { defineType, defineField } from "sanity";

export const imageGallery = defineType({
  name: "imageGallery",
  title: "Image Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "caption",
              title: "Caption",
              type: "string"
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Describe the image for screen readers",
              validation: (Rule) => Rule.required()
            })
          ]
        })
      ]
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3
    }),
    defineField({
      name: "gap",
      title: "Gap",
      type: "string",
      options: { list: ["small", "medium", "large"] },
      initialValue: "medium"
    })
  ]
});
```

### `src/index.ts`
```ts
export { author } from "./schemas/author";
export { post } from "./schemas/post";
export { imageGallery } from "./schemas/image-gallery";
export { seoFields } from "./fragments/seo-fields";
```

### README
```md
# @agency/data-cms
Reusable Sanity schemas for CMS-backed client sites.
## Usage (Sanity Config)
```ts
import { defineConfig } from "sanity";
import { author, post } from "@agency/data-cms";

export default defineConfig({
  // ...
  schema: { types: [author, post] }
});
```
## When to Build
Only create this package when two or more client sites share content structure. Do not create speculatively.
```
