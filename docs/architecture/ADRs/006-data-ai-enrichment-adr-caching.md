# ADR 006: Data AI Enrichment - Caching & Cost Optimization Strategy

## Status

Accepted

## Date

2026-04-08

## Context

The `@agency/data-ai-enrichment` package provides AI-powered content processing: summarization, keyword extraction, SEO metadata generation, and content classification. These operations call LLM APIs (OpenAI, Anthropic) which have significant costs and latency.

Without caching, every content piece would incur full API costs on every enrichment run. For high-volume content workflows, this becomes prohibitively expensive.

Modern AI caching has evolved beyond simple exact-match to **semantic caching** (meaning-based matching) and **context-enabled caching** (personalized results based on user context).

## Decision

Implement a **three-tier AI caching strategy** with cost controls:

```
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1: EXACT MATCH CACHE (Redis String)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Key: hash(prompt + model + temperature)                    ││
│  │  TTL: 24 hours                                            ││
│  │  Hit Rate: ~40% for repeated content                        ││
│  │  Cost Savings: 100% (no API call)                         ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  TIER 2: SEMANTIC CACHE (RedisVL - Vector Search)              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Key: embedding vector of prompt                          ││
│  │  Similarity Threshold: 0.85                                ││
│  │  Hit Rate: ~30% for similar content                       ││
│  │  Cost Savings: 100% (cached response reused)              ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  TIER 3: CONTEXT-ENABLED CACHE (CESC)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Semantic match + personalization layer                   ││
│  │  Uses cheaper model (gpt-4o-mini) for final synthesis     ││
│  │  Hit Rate: ~20% with context matching                     ││
│  │  Cost Savings: 70% (cheap model vs expensive LLM)         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FALLBACK: LIVE API CALL                                        │
│  Full LLM call with rate limiting and cost tracking             │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Pattern

### Cache Configuration

```typescript
// packages/data/ai-enrichment/src/cache/config.ts
export interface AICacheConfig {
  // Tier 1: Exact match
  exactMatchTtl: number;        // 24 hours
  
  // Tier 2: Semantic match
  semanticSimilarity: number;   // 0.85 (85% similar)
  embeddingModel: string;       // 'text-embedding-3-small'
  
  // Tier 3: Context-enabled
  personalizationModel: string; // 'gpt-4o-mini' (cheap)
  
  // Rate limiting
  maxRequestsPerMinute: number; // 60
  maxTokensPerHour: number;      // 100,000
  
  // Cost limits
  dailyBudgetUsd: number;        // 50.00
}

export const DEFAULT_CACHE_CONFIG: AICacheConfig = {
  exactMatchTtl: 24 * 60 * 60,  // 24 hours
  semanticSimilarity: 0.85,
  embeddingModel: 'text-embedding-3-small',
  personalizationModel: 'gpt-4o-mini',
  maxRequestsPerMinute: 60,
  maxTokensPerHour: 100000,
  dailyBudgetUsd: 50.00,
};
```

### Enrichment Pipeline with Caching

```typescript
// packages/data/ai-enrichment/src/pipelines/enrich.ts
import { createHash } from 'crypto';
import { redis } from '../cache/redis';
import { redisVL } from '../cache/redis-vl';

export async function enrichWithCache<T>(
  content: string,
  operation: string,
  config: EnrichmentConfig,
  cacheConfig: AICacheConfig = DEFAULT_CACHE_CONFIG
): Promise<T> {
  const cacheKey = createCacheKey(content, operation, config);
  
  // Tier 1: Exact match
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  
  // Tier 2: Semantic match
  const embedding = await generateEmbedding(content);
  const similar = await redisVL.searchSimilar(embedding, cacheConfig.semanticSimilarity);
  if (similar.length > 0) {
    // Store as exact match for future
    await redis.setex(cacheKey, cacheConfig.exactMatchTtl, similar[0].result);
    return JSON.parse(similar[0].result) as T;
  }
  
  // Tier 3: Check rate limits and budget
  const withinLimits = await checkLimits(cacheConfig);
  if (!withinLimits) {
    throw new EnrichmentRateLimitError('Daily budget or rate limit exceeded');
  }
  
  // Live API call
  const result = await callLLM(content, config);
  
  // Store in both caches
  await redis.setex(cacheKey, cacheConfig.exactMatchTtl, JSON.stringify(result));
  await redisVL.storeEmbedding(cacheKey, embedding, JSON.stringify(result));
  
  // Track cost
  await trackCost(config.model, result.tokensUsed);
  
  return result;
}
```

### Cost Tracking

```typescript
// packages/data/ai-enrichment/src/cost/tracker.ts
const MODEL_PRICING = {
  'gpt-4o': { input: 0.005, output: 0.015 },           // per 1K tokens
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },  // per 1K tokens
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }, // per 1K tokens
  'claude-3-sonnet': { input: 0.003, output: 0.015 }, // per 1K tokens
};

export async function trackCost(model: string, tokensUsed: number) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o'];
  const cost = (tokensUsed / 1000) * (pricing.input + pricing.output);
  
  // Store in Redis with daily key
  const dailyKey = `costs:${new Date().toISOString().split('T')[0]}`;
  await redis.incrbyfloat(dailyKey, cost);
  await redis.expire(dailyKey, 7 * 24 * 60 * 60); // 7 day retention
  
  // Alert if approaching budget
  const dailyTotal = await redis.get(dailyKey);
  if (parseFloat(dailyTotal) > 0.8 * DEFAULT_CACHE_CONFIG.dailyBudgetUsd) {
    await sendBudgetAlert(parseFloat(dailyTotal));
  }
}
```

## Cost Optimization Strategies

### 1. Model Tiering

| Use Case | Model | Cost vs GPT-4o |
|----------|-------|----------------|
| Summarization | gpt-3.5-turbo | 10% |
| SEO metadata | gpt-4o-mini | 3% |
| Keyword extraction | gpt-3.5-turbo | 10% |
| Quality assessment | gpt-4o-mini | 3% |
| Complex analysis | gpt-4o | 100% (baseline) |

### 2. Token Optimization

```typescript
// Truncate content to reduce token usage
const MAX_INPUT_TOKENS = 4000;
const truncatedContent = content.slice(0, MAX_INPUT_TOKENS * 4); // ~4 chars per token
```

### 3. Batch Processing

```typescript
// Batch multiple operations into single API call
const operations = ['summarize', 'extract-keywords', 'generate-meta'];
const batchedResult = await callLLMWithMultipleTasks(content, operations);
```

### 4. Fallback Chain

```typescript
async function enrichWithFallback<T>(content: string, config: EnrichmentConfig): Promise<T> {
  try {
    // Try primary model
    return await enrichWithCache(content, config);
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      // Fallback to cheaper model
      return await enrichWithCache(content, { ...config, model: 'gpt-4o-mini' });
    }
    if (error instanceof RateLimitError) {
      // Queue for later processing
      await enqueueForLater(content, config);
      throw new EnrichmentDeferredError();
    }
    throw error;
  }
}
```

## Expected Savings

| Strategy | Cache Hit Rate | Cost Reduction |
|----------|----------------|----------------|
| Exact match | 40% | 40% |
| Semantic match | 30% | 30% |
| Model tiering | N/A | 50-70% |
| Token optimization | N/A | 20-30% |
| **Combined** | **70%** | **80-90%** |

## Decision Rationale

### Why three tiers?

1. **Exact match**: Fastest, handles repeated identical content
2. **Semantic match**: Catches similar content without exact match
3. **Context-enabled**: Personalizes cached responses for specific use cases

### Why RedisVL for semantic search?

1. **Performance**: Sub-10ms vector similarity search
2. **Integration**: Native Redis module, no separate infrastructure
3. **Scalability**: Handles millions of embeddings efficiently
4. **Cost**: Included with Redis Cloud, no additional vendors

### Why track costs in real-time?

1. **Budget Protection**: Prevent runaway spending from bugs or attacks
2. **Alerting**: Notify when approaching limits
3. **Optimization**: Identify expensive operations for improvement
4. **Reporting**: Track ROI of AI enrichment features

## Consequences

### Positive

- 70-90% cost reduction for typical content workflows
- Faster response times (cache hits in <10ms)
- Budget protection with hard limits
- Semantic matching improves cache hit rate significantly

### Negative

- Additional Redis infrastructure required
- Embedding generation adds small latency (~50ms)
- Cache invalidation complexity when content changes
- RedisVL requires Redis Cloud or self-hosted with module

### Neutral

- Semantic cache requires periodic rebalancing
- Cost tracking adds minor overhead to each request
- Budget alerts may require PagerDuty/Slack integration

## Redis Configuration

```yaml
# redis.conf or Redis Cloud settings
maxmemory-policy: allkeys-lru  # Evict least recently used
maxmemory: 1gb                 # Adjust based on content volume

# RedisVL specific
loadmodule: /path/to/redisvl.so
```

## Monitoring & Alerting

```typescript
// Alert thresholds
const ALERTS = {
  dailyBudget80: 'Daily budget 80% consumed',
  dailyBudget100: 'Daily budget exhausted - enrichment paused',
  cacheHitRateLow: 'Cache hit rate below 50% - investigate',
  errorRateHigh: 'Error rate above 5% - check API health',
};
```

## Alternatives Considered

### Alternative: No Caching

**Why rejected**: Would result in 10x higher API costs, unacceptable for high-volume content workflows.

### Alternative: File-Based Caching

**Why rejected**: File I/O too slow, no semantic matching capability, harder to distribute across instances.

### Alternative: Third-Party Semantic Cache (e.g., GPTCache)

**Why rejected**: Additional vendor dependency, RedisVL provides same functionality with existing infrastructure.

### Alternative: Pre-generate All Enrichments

**Why rejected**: Content changes frequently, pre-generation would waste API calls on unused content.

## References

- `docs/tasks/51b-data-ai-enrichment/`
- `docs/DEPENDENCY.md` §12 Testing (Redis configuration)
- [RedisVL Documentation](https://redis.io/docs/stack/search/reference/vectors/)
- [OpenAI Pricing](https://openai.com/pricing)
- [Semantic Caching with Redis](https://redis.io/blog/building-a-context-enabled-semantic-cache-with-redis/)

## Migration Path

Existing AI enrichment implementations can add caching incrementally:

1. Add Redis connection and exact-match caching
2. Implement cost tracking and limits
3. Add RedisVL for semantic matching
4. Tune similarity thresholds based on hit rates
5. Add CESC for personalization if needed

## Verification Checklist

- [ ] Redis connection configured and tested
- [ ] Exact-match caching implemented for all operations
- [ ] Semantic cache (RedisVL) configured with embeddings
- [ ] Cost tracking storing daily totals
- [ ] Rate limiting preventing API abuse
- [ ] Budget alerts sending at 80% threshold
- [ ] Fallback to cheaper model on budget exceeded
- [ ] Cache hit rate monitoring dashboard
- [ ] Cache invalidation strategy for content updates
