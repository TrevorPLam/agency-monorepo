# ADR: Webhook Security with HMAC-SHA256

## Status
Accepted

## Context
Webhooks are used for outbound notifications to external systems. Without proper security:
- Attackers can forge webhook requests
- Replay attacks can re-trigger actions
- Secrets can leak through timing attacks

Industry standard (2026): HMAC-SHA256 with timestamp validation.

## Decision
Implement HMAC-SHA256 signature verification with replay attack prevention.

## Security Requirements

### 1. Signature Generation
```typescript
import { createHmac } from "node:crypto";

function generateSignature(
  payload: NotificationPayload,
  secret: string,
  timestamp: number
): string {
  const data = `${timestamp}.${JSON.stringify(payload)}`;
  return createHmac("sha256", secret).update(data).digest("hex");
}
```

### 2. Signature Verification
```typescript
import { timingSafeEqual } from "node:crypto";

function verifySignature(
  payload: NotificationPayload,
  secret: string,
  signature: string,
  timestamp: number,
  toleranceSeconds = 300
): boolean {
  // Prevent replay attacks: reject old timestamps
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) {
    return false;
  }
  
  const expected = generateSignature(payload, secret, timestamp);
  
  // Prevent timing attacks: use constant-time comparison
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
```

### 3. Webhook Request Format
```http
POST /webhook-endpoint
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>
X-Webhook-Timestamp: <unix-timestamp>

{
  "payload": { ... }
}
```

## Design Decisions

### Why HMAC-SHA256?
- Industry standard (AWS, Stripe, GitHub use similar)
- Available in Node.js crypto module (no dependencies)
- Fast and widely supported

### Why Timestamp Validation?
- Prevents replay attacks (re-using old signatures)
- 5-minute window balances security and clock drift
- Industry standard approach

### Why timingSafeEqual?
- Prevents timing side-channel attacks
- Without it, attackers could guess signature byte-by-byte
- Critical for security even with HTTPS

## Secret Management

### Generation
- Minimum 32 characters
- Cryptographically random
- Example: `whsec_` + 48 random alphanumeric chars

### Storage
```env
# .env.local (never commit)
WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz123456
```

### Rotation
- Rotate quarterly recommended
- Support dual secrets during transition (accept both for 24h)

## Error Handling

### Verification Failures
```typescript
if (!verifySignature(payload, secret, signature, timestamp)) {
  // Log for monitoring
  logger.warn("Webhook signature verification failed", {
    timestamp,
    signaturePrefix: signature.slice(0, 8)
  });
  
  // Return 401 (don't expose which check failed)
  return new Response("Unauthorized", { status: 401 });
}
```

### Clock Drift
- 5-minute tolerance handles most drift
- NTP synchronization recommended on servers
- Log warnings if drift detected

## Alternatives Considered

### Option 1: Plain HTTPS Only
- **Rejected**: HTTPS encrypts but doesn't authenticate sender
- Attackers with valid URL can forge requests

### Option 2: API Key in Header
- **Rejected**: Keys don't prove payload integrity
- Replay attacks possible

### Option 3: JWT Tokens
- **Rejected**: Overkill for webhooks
- Adds complexity without benefit over HMAC

### Option 4: mTLS (Mutual TLS)
- **Rejected**: Complex certificate management
- Harder to rotate than shared secrets

## Implementation Checklist
- [ ] HMAC-SHA256 generation implemented
- [ ] Timestamp validation with 5-min window
- [ ] timingSafeEqual comparison
- [ ] Secret generation script created
- [ ] Documentation for webhook consumers
- [ ] Failed verification logging
- [ ] Secret rotation procedure documented

## References
- [Stripe Webhook Signatures](https://stripe.com/docs/webhooks/signatures)
- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
- [Node.js crypto.timingSafeEqual](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b)
