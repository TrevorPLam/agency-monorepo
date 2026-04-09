# 51b-data-ai-enrichment: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | CMS content requires AI-powered enrichment |
| **Minimum Consumers** | 1+ apps with AI content processing needs |
| **Dependencies** | OpenAI API OR Anthropic API, TypeScript 6.0 |
| **Exit Criteria** | AI enrichment package exported and used |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit AI need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — AI enrichment `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Sub-task of 51-data-cms; optional AI content enhancement

## Files

```
packages/data/ai-enrichment/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── pipelines/
│   │   ├── summarize.ts
│   │   ├── seo.ts
│   │   ├── classify.ts
│   │   └── image.ts
│   ├── providers/
│   │   ├── openai.ts
│   │   └── anthropic.ts
│   ├── queue.ts
│   └── types.ts
└── workers/
    └── enrichment-worker.ts
```

### `package.json`

```json
{
  "name": "@agency/data-ai-enrichment",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./pipelines": "./src/pipelines/index.ts",
    "./providers": "./src/providers/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "openai": "6.34.0",
    "@anthropic-ai/sdk": "0.86.1",
    "bullmq": "5.73.3"  // Job queue
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/types.ts`

```typescript
// AI enrichment types

export interface EnrichmentJob {
  id: string;
  contentId: string;
  contentType: 'article' | 'product' | 'image' | 'video';
  rawContent: string;
  operations: EnrichmentOperation[];
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: EnrichmentResult;
  error?: string;
}

export type EnrichmentOperation = 
  | 'summarize'
  | 'extract-keywords'
  | 'generate-meta'
  | 'classify'
  | 'image-alt-text'
  | 'readability-score'
  | 'quality-assess';

export interface EnrichmentResult {
  summary?: string;
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  category?: string;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  readabilityScore?: number;  // Flesch Reading Ease
  qualityScore?: number;  // 0-100
  suggestedImprovements?: string[];
  processingTime: number;
  model: string;
}

export interface AIProvider {
  name: string;
  generate(prompt: string, options?: any): Promise<string>;
  generateJSON<T>(prompt: string, schema: any): Promise<T>;
}
```

### `src/pipelines/summarize.ts`

```typescript
// Content summarization pipeline

import type { AIProvider, EnrichmentResult } from '../types';

export async function summarizeContent(
  content: string,
  provider: AIProvider,
  options: { maxLength?: number; focus?: string } = {}
): Promise<Partial<EnrichmentResult>> {
  const maxLength = options.maxLength || 200;
  
  const prompt = `Summarize the following content in ${maxLength} characters or less.
${options.focus ? `Focus on: ${options.focus}` : ''}

Content:
${content.slice(0, 4000)}  // Limit input size

Summary:`;

  const summary = await provider.generate(prompt, {
    maxTokens: Math.ceil(maxLength / 4),  // Rough char-to-token ratio
    temperature: 0.3
  });

  return {
    summary: summary.trim()
  };
}

export async function extractKeywords(
  content: string,
  provider: AIProvider,
  count: number = 10
): Promise<Partial<EnrichmentResult>> {
  const prompt = `Extract ${count} relevant keywords/tags from this content.
Return as a JSON array of strings.

Content:
${content.slice(0, 4000)}

Keywords (JSON format):`;

  const keywords = await provider.generateJSON<string[]>(prompt, {
    type: 'array',
    items: { type: 'string' }
  });

  return { keywords: keywords.slice(0, count) };
}
```

### `src/pipelines/seo.ts`

```typescript
// SEO metadata generation pipeline

import type { AIProvider, EnrichmentResult } from '../types';

export async function generateSEOMetadata(
  content: string,
  title: string,
  provider: AIProvider
): Promise<Partial<EnrichmentResult>> {
  const metaPrompt = `Generate SEO-optimized title and meta description.

Original Title: ${title}
Content: ${content.slice(0, 3000)}

Requirements:
- Title: 50-60 characters, compelling, include primary keyword
- Description: 150-160 characters, include call-to-action

Return as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "primaryKeyword": "..."
}`;

  const seo = await provider.generateJSON<{
    metaTitle: string;
    metaDescription: string;
    primaryKeyword: string;
  }>(metaPrompt, {
    type: 'object',
    properties: {
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
      primaryKeyword: { type: 'string' }
    }
  });

  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: [seo.primaryKeyword]
  };
}
```

### `src/pipelines/classify.ts`

```typescript
// Content classification pipeline

import type { AIProvider, EnrichmentResult } from '../types';

export interface Taxonomy {
  categories: string[];
  topics: string[];
  audience: string[];
  intent: 'informational' | 'transactional' | 'navigational';
}

export async function classifyContent(
  content: string,
  title: string,
  provider: AIProvider,
  availableCategories?: string[]
): Promise<Partial<EnrichmentResult>> {
  const categoryList = availableCategories?.join(', ') || 'any relevant category';
  
  const prompt = `Classify this content into the taxonomy.

Title: ${title}
Content: ${content.slice(0, 3000)}

Available categories: ${categoryList}

Return JSON:
{
  "category": "best matching category",
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive|neutral|negative",
  "readabilityScore": 0-100
}`;

  const classification = await provider.generateJSON<{
    category: string;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    readabilityScore: number;
  }>(prompt, {
    type: 'object',
    properties: {
      category: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
      readabilityScore: { type: 'number', minimum: 0, maximum: 100 }
    }
  });

  return {
    category: classification.category,
    tags: classification.tags,
    sentiment: classification.sentiment,
    readabilityScore: classification.readabilityScore
  };
}
```

### `src/queue.ts`

```typescript
// Enrichment job queue using BullMQ

import { Queue, Worker } from 'bullmq';
import type { EnrichmentJob, EnrichmentResult } from './types';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

export const enrichmentQueue = new Queue('content-enrichment', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export async function enqueueEnrichment(job: Omit<EnrichmentJob, 'id' | 'status'>): Promise<string> {
  const bullJob = await enrichmentQueue.add(
    job.contentType,
    job,
    {
      priority: job.priority === 'high' ? 1 : job.priority === 'low' ? 3 : 2
    }
  );
  
  return bullJob.id!;
}

// Worker implementation
export function createEnrichmentWorker(
  processor: (job: EnrichmentJob) => Promise<EnrichmentResult>
) {
  return new Worker(
    'content-enrichment',
    async (bullJob) => {
      const job = bullJob.data as EnrichmentJob;
      
      try {
        const result = await processor(job);
        return { success: true, result };
      } catch (error) {
        console.error('Enrichment failed:', error);
        throw error;
      }
    },
    { connection: redisConnection }
  );
}
```

### README

```markdown
# @agency/data-ai-enrichment

AI-powered content processing pipelines.

## Usage

```typescript
import { enqueueEnrichment } from '@agency/data-ai-enrichment';

const jobId = await enqueueEnrichment({
  contentId: 'post-123',
  contentType: 'article',
  rawContent: articleBody,
  operations: ['summarize', 'extract-keywords', 'generate-meta'],
  priority: 'normal'
});

// Check status
const job = await enrichmentQueue.getJob(jobId);
console.log(job.returnvalue); // Enrichment result
```

## Enrichment Operations

| Operation | Output | Use Case |
|-----------|--------|----------|
| summarize | 200-char summary | Card previews, social sharing |
| extract-keywords | 10 tags | SEO, content discovery |
| generate-meta | Title + description | Search results |
| classify | Category + sentiment | Content organization |
| image-alt-text | Alt description | Accessibility |
| readability-score | 0-100 score | Content quality |
| quality-assess | Score + suggestions | Editorial review |

## Pipeline Example

```typescript
import { summarizeContent, extractKeywords, generateSEOMetadata } from '@agency/data-ai-enrichment/pipelines';

async function enrichArticle(content: string, title: string) {
  const provider = new OpenAIProvider(apiKey);
  
  const [summary, keywords, seo] = await Promise.all([
    summarizeContent(content, provider),
    extractKeywords(content, provider),
    generateSEOMetadata(content, title, provider)
  ]);
  
  return { ...summary, ...keywords, ...seo };
}
```

## Cost Control

- Input limited to 4000 chars per operation
- Job queue with concurrency limits
- Result caching (24hr TTL)
- Priority queues (high/normal/low)

## Models

- **Fast/cheap**: GPT-3.5-turbo for summarization
- **Quality**: GPT-4 for SEO metadata
- **Vision**: GPT-4-vision for image alt-text
```


## Related Tasks

- `51-data-cms` - Content management
- `b4-tools-content-pipeline` - Content workflows
- `40-seo` - SEO package
