---
title: How Gateway Works
sidebar_position: 3
sidebar_label: How It Works
description: Detailed explanation of API Gateway request flow, authentication, authorization, rate limiting, and service routing
keywords: [gateway workflow, API gateway, request routing, authentication flow, rate limiting]
---

# How Gateway Works

Detailed explanation of the Gateway's functionality.

## Request Flow

1. **Client Request**: Client sends request to Gateway
2. **Authentication**: JWT token validated
3. **Authorization**: Check user permissions
4. **Rate Limiting**: Verify request limits
5. **Routing**: Forward to appropriate service
6. **Response**: Return service response to client

## Authentication

```typescript
@UseGuards(JwtAuthGuard)
@Get('/bonds')
async getBonds() {
  return this.proxyService.forward('/bonds', 'ats');
}
```

## Service Routing

Gateway routes requests based on path:

- `/api/ats/*` → ATS API
- `/api/primary-market/*` → Primary Market API
- `/api/treasury/*` → Treasury API

## Rate Limiting

Configured per endpoint:

- Standard endpoints: 100 requests/minute
- Auth endpoints: 10 requests/minute
- Admin endpoints: 200 requests/minute

## Next Steps

- [API Guide](api-guide.md)
