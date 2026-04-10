# b4-tools-content-pipeline: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | CMS content requires transformation pipeline |
| **Minimum Consumers** | 1+ apps with CMS content needs |
| **Dependencies** | Node.js 20.9.0, CMS SDK (Contentful/Strapi/Sanity) |
| **Exit Criteria** | Pipeline working and content flowing |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit CMS need |
| **Version Authority** | `DEPENDENCY.md` §1 — Node.js 20.9.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Content pipeline `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Conditional; only needed when using CMS with transformations

## Files

```
tools/content-pipeline/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── generators/
│   │   ├── outline.ts
│   │   ├── prompts.ts
│   │   └── templates.ts
│   ├── workflows/
│   │   ├── draft-review.ts
│   │   └── publish.ts
│   ├── validation/
│   │   ├── quality.ts
│   │   └── seo.ts
│   └── types.ts
├── templates/
│   ├── blog-post.md
│   ├── landing-page.md
│   └── product-description.md
└── bin/
    └── content-pipeline.ts
```

### `package.json`

```json
{
  "name": "@agency/tools-content-pipeline",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "content-pipeline": "./bin/content-pipeline.ts"
  },
  "exports": {
    ".": "./src/index.ts",
    "./generators": "./src/generators/index.ts",
    "./workflows": "./src/workflows/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "commander": "14.0.3",
    "inquirer": "13.4.1",
    "chalk": "5.6.2"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/generators/outline.ts`

```typescript
// Content outline generator

export interface OutlineSection {
  heading: string;
  keyPoints: string[];
  wordCount: number;
  aiPrompt?: string;
}

export interface ContentOutline {
  title: string;
  description: string;
  targetAudience: string;
  sections: OutlineSection[];
  totalWordCount: number;
  seoKeywords: string[];
  tone: 'professional' | 'casual' | 'technical' | 'persuasive';
}

export function generateBlogOutline(topic: string, keywords: string[]): ContentOutline {
  return {
    title: `Comprehensive Guide to ${topic}`,
    description: `An in-depth exploration of ${topic} for professionals.`,
    targetAudience: 'Marketing professionals and business owners',
    tone: 'professional',
    seoKeywords: keywords,
    sections: [
      {
        heading: 'Introduction',
        keyPoints: [`Hook: Why ${topic} matters`, 'Problem statement'],
        wordCount: 150,
        aiPrompt: 'Write an engaging introduction that establishes authority'
      },
      {
        heading: 'What is {Topic}?',
        keyPoints: ['Definition', 'Key concepts', 'Industry context'],
        wordCount: 300,
        aiPrompt: 'Explain the concept clearly with examples'
      },
      {
        heading: 'Why {Topic} Matters',
        keyPoints: ['Benefits', 'Statistics', 'Use cases'],
        wordCount: 400,
        aiPrompt: 'Include 2-3 compelling statistics with sources'
      },
      {
        heading: 'Best Practices',
        keyPoints: ['Strategy 1', 'Strategy 2', 'Common mistakes to avoid'],
        wordCount: 500,
        aiPrompt: 'Provide actionable advice with specific examples'
      },
      {
        heading: 'How to Get Started',
        keyPoints: ['Step-by-step guide', 'Tools needed', 'Timeline'],
        wordCount: 400,
        aiPrompt: 'Create a practical implementation guide'
      },
      {
        heading: 'Conclusion',
        keyPoints: ['Summary', 'Call to action', 'Next steps'],
        wordCount: 150
      }
    ],
    totalWordCount: 1900
  };
}

export function generateLandingPageOutline(
  productName: string,
  valueProposition: string
): ContentOutline {
  return {
    title: `${productName} - ${valueProposition}`,
    description: `Landing page for ${productName}`,
    targetAudience: 'Potential customers',
    tone: 'persuasive',
    sections: [
      {
        heading: 'Hero Section',
        keyPoints: ['Headline with value prop', 'Subheadline', 'Primary CTA'],
        wordCount: 100
      },
      {
        heading: 'Problem Agitation',
        keyPoints: ['Pain points', 'Current frustration', 'Cost of inaction'],
        wordCount: 200
      },
      {
        heading: 'Solution',
        keyPoints: ['Product introduction', 'How it works', 'Key benefits'],
        wordCount: 300
      },
      {
        heading: 'Social Proof',
        keyPoints: ['Testimonials', 'Logos', 'Statistics'],
        wordCount: 150
      },
      {
        heading: 'Features',
        keyPoints: ['Feature 1', 'Feature 2', 'Feature 3'],
        wordCount: 300
      },
      {
        heading: 'FAQ',
        keyPoints: ['Common questions', 'Objection handling'],
        wordCount: 250
      },
      {
        heading: 'Final CTA',
        keyPoints: ['Urgency', 'Risk reversal', 'Strong CTA'],
        wordCount: 100
      }
    ],
    totalWordCount: 1400,
    seoKeywords: []
  };
}
```

### `src/generators/prompts.ts`

```typescript
// AI prompt templates

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  model: 'gpt-4' | 'claude' | 'default';
  maxTokens: number;
}

export const contentPrompts: PromptTemplate[] = [
  {
    id: 'blog-expand',
    name: 'Blog Section Expander',
    description: 'Expand an outline section into full content',
    template: `Write a {wordCount}-word section for a blog post about {topic}.

Section: {heading}
Key points to cover:
{keyPoints}

Tone: {tone}
Target audience: {audience}

Requirements:
- Use clear, scannable formatting with subheadings
- Include specific examples
- End with a transition to the next section
- Use keywords naturally: {keywords}`,
    variables: ['wordCount', 'topic', 'heading', 'keyPoints', 'tone', 'audience', 'keywords'],
    model: 'gpt-4',
    maxTokens: 2000
  },
  
  {
    id: 'meta-description',
    name: 'SEO Meta Description',
    description: 'Generate click-worthy meta descriptions',
    template: `Write a meta description for a page about {topic}.

Content: {contentSummary}
Target keyword: {primaryKeyword}

Requirements:
- 150-160 characters
- Include target keyword near the beginning
- Include a clear value proposition
- End with a call to action
- No quotes`,
    variables: ['topic', 'contentSummary', 'primaryKeyword'],
    model: 'default',
    maxTokens: 200
  },
  
  {
    id: 'social-variants',
    name: 'Social Media Variants',
    description: 'Create platform-specific social posts',
    template: `Create {count} social media posts promoting this content:

Title: {title}
URL: {url}
Key takeaways: {takeaways}

Platforms: {platforms}

Requirements per platform:
- Twitter: Under 280 chars, 2-3 hashtags
- LinkedIn: Professional tone, engaging hook
- Facebook: Conversational, emoji-friendly`,
    variables: ['count', 'title', 'url', 'takeaways', 'platforms'],
    model: 'default',
    maxTokens: 1000
  }
];

export function renderPrompt(
  templateId: string,
  variables: Record<string, string>
): string {
  const template = contentPrompts.find(p => p.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  
  let rendered = template.template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return rendered;
}
```

### `src/workflows/draft-review.ts`

```typescript
// Human-in-the-loop review workflow

export interface DraftReview {
  draftId: string;
  content: string;
  outline: ContentOutline;
  aiGenerated: boolean;
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  reviewer?: string;
  feedback?: string;
  revisions: number;
}

export class ReviewWorkflow {
  private drafts: Map<string, DraftReview> = new Map();

  createDraft(outline: ContentOutline, aiContent?: string): DraftReview {
    const draft: DraftReview = {
      draftId: crypto.randomUUID(),
      content: aiContent || '',
      outline,
      aiGenerated: !!aiContent,
      reviewStatus: 'pending',
      revisions: 0
    };
    
    this.drafts.set(draft.draftId, draft);
    return draft;
  }

  submitForReview(draftId: string, content: string): void {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error('Draft not found');
    
    draft.content = content;
    draft.reviewStatus = 'in_review';
  }

  approve(draftId: string, reviewer: string): void {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error('Draft not found');
    
    draft.reviewStatus = 'approved';
    draft.reviewer = reviewer;
  }

  reject(draftId: string, reviewer: string, feedback: string): void {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error('Draft not found');
    
    draft.reviewStatus = 'rejected';
    draft.reviewer = reviewer;
    draft.feedback = feedback;
    draft.revisions++;
  }

  getStatus(draftId: string): DraftReview | undefined {
    return this.drafts.get(draftId);
  }

  listPending(): DraftReview[] {
    return Array.from(this.drafts.values())
      .filter(d => d.reviewStatus === 'in_review');
  }
}
```

### `bin/content-pipeline.ts`

```typescript
#!/usr/bin/env tsx

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateBlogOutline, generateLandingPageOutline } from '../src/generators/outline';
import { renderPrompt } from '../src/generators/prompts';

const program = new Command();

program
  .name('content-pipeline')
  .description('AI content workflow tool')
  .version('0.1.0');

program
  .command('outline')
  .description('Generate content outline')
  .option('-t, --type <type>', 'Content type', 'blog')
  .argument('<topic>', 'Content topic')
  .action(async (topic, options) => {
    console.log(chalk.blue(`Generating ${options.type} outline for: ${topic}`));
    
    const { keywords } = await inquirer.prompt([{
      type: 'input',
      name: 'keywords',
      message: 'Target keywords (comma-separated):'
    }]);
    
    const keywordList = keywords.split(',').map((k: string) => k.trim());
    
    const outline = options.type === 'blog'
      ? generateBlogOutline(topic, keywordList)
      : generateLandingPageOutline(topic, '');
    
    console.log(chalk.green('\nOutline generated:'));
    console.log(JSON.stringify(outline, null, 2));
  });

program
  .command('prompt')
  .description('Generate AI prompt from template')
  .option('-t, --template <id>', 'Template ID', 'blog-expand')
  .action(async (options) => {
    const variables: Record<string, string> = {};
    
    // Interactive variable collection
    const answers = await inquirer.prompt([
      { type: 'input', name: 'wordCount', message: 'Word count:', default: '300' },
      { type: 'input', name: 'topic', message: 'Topic:' },
      { type: 'input', name: 'heading', message: 'Section heading:' },
      { type: 'input', name: 'tone', message: 'Tone:', default: 'professional' }
    ]);
    
    Object.assign(variables, answers);
    
    const prompt = renderPrompt(options.template, variables);
    
    console.log(chalk.green('\nGenerated prompt:'));
    console.log(chalk.gray('---'));
    console.log(prompt);
    console.log(chalk.gray('---'));
  });

program.parse();
```

### README

```markdown
# @agency/tools-content-pipeline

AI-assisted content workflow scaffolding.

## Commands

```bash
# Generate blog outline
npx content-pipeline outline "Content Marketing Strategy" --type blog

# Generate AI prompt
npx content-pipeline prompt --template blog-expand
```

## Workflow

1. **Outline**: Generate structured outline with AI prompts per section
2. **Draft**: AI expands each section using generated prompts
3. **Review**: Human editor reviews, approves, or requests revisions
4. **Validate**: SEO and quality checks
5. **Publish**: Automated CMS upload

## Templates

Available prompt templates:
- `blog-expand` - Expand outline to full content
- `meta-description` - Generate SEO meta descriptions
- `social-variants` - Create platform-specific posts

## Integration

Works with Sanity CMS:

```typescript
import { publishToSanity } from '@agency/tools-content-pipeline/workflows';

await publishToSanity(draft, {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production'
});
```
```


## Related Tasks

- `51-data-cms` - CMS publishing
- `40-seo` - SEO optimization
- `51b-data-ai-enrichment` - AI content processing
