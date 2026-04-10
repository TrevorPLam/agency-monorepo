# c12-infra-rate-limiting: Rate Limiting for Public Endpoints

## Purpose
Add rate limiting as part of 2026 production monorepo standards. Critical for lead forms, newsletter signups, preview routes, and webhook endpoints. Prevents abuse and ensures fair resource usage.

## Dependencies
- `00-foundation` - Root scaffolding
- `50-data-db` - Storage for rate limit tracking
- `e3-apps-agency-website` - First app with forms to protect
- `82-lead-capture` - Lead form package

## Scope

### Endpoints Requiring Rate Limiting

1. **Lead Capture Forms**
   - `/api/leads/submit`
   - Limit: 5 submissions per IP per hour
   - Burst: 1 submission per 10 seconds

2. **Email Signup**
   - `/api/newsletter/subscribe`
   - Limit: 3 attempts per IP per hour

3. **Preview Routes**
   - `/api/preview` (CMS preview)
   - Limit: 100 requests per IP per minute

4. **Webhooks**
   - `/api/webhooks/*`
   - Limit: 1000 requests per source per minute

### Implementation Options

**Option 1: Vercel KV (Recommended)**
```typescript
// packages/config/rate-limit/src/index.ts
import { kv } from '@vercel/kv';

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const current = await kv.incr(key);
  
  if (current === 1) {
    await kv.expire(key, windowSeconds);
  }
  
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}
```

**Option 2: In-Memory (Edge Runtime)**
```typescript
// Using LRU cache for edge functions
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});
```

### Middleware Integration

```typescript
// apps/agency-website/middleware.ts
import { rateLimit } from '@agency/config-rate-limit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/leads/')) {
    const ip = request.ip ?? 'anonymous';
    const { success } = await rateLimit(
      `leads:${ip}`,
      5,
      3600 // 1 hour
    );
    
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
  }
  
  return NextResponse.next();
}
```

## Critical Requirements

1. **IP-Based + User-Based**
   - Anonymous: IP tracking
   - Authenticated: User ID tracking
   - Stricter limits for anonymous

2. **Response Headers**
   ```
   X-RateLimit-Limit: 5
   X-RateLimit-Remaining: 3
   X-RateLimit-Reset: 1699999999
   Retry-After: 3600
   ```

3. **Graceful Degradation**
   - If rate limiter fails, allow request (fail open)
   - Log rate limiter errors
   - Alert on rate limiter outages

## Build Condition

**Add immediately** - Rate limiting is part of 2026 production pattern, especially critical for marketing forms.

## Verification

```bash
# Test rate limiting
curl -X POST https://agency-website.vercel.app/api/leads/submit
# Repeat 6 times, 6th should return 429
```
