---
title: Gateway Installation
sidebar_position: 2
sidebar_label: Installation
description: Installation and configuration guide for API Gateway - authentication, routing, and rate limiting setup
keywords: [gateway installation, API gateway setup, JWT configuration, rate limiting setup]
---

# Gateway Installation

Installation and configuration guide for the API Gateway.

## Prerequisites

- Node.js v22+
- Running instances of: ATS API, Primary Market API, Treasury API

## Installation Steps

### 1. Navigate to Gateway

```bash
cd apps/shared/gateway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Service URLs
ATS_API_URL=http://localhost:3001
PRIMARY_MARKET_API_URL=http://localhost:3002
TREASURY_API_URL=http://localhost:3003

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### 4. Start Service

```bash
npm run start:dev
```

### 5. Verify Installation

```bash
curl http://localhost:3000/health
```

## Next Steps

- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
