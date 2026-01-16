---
title: API Gateway Overview
sidebar_position: 1
sidebar_label: Overview
description: API Gateway for unified access, authentication, routing, and rate limiting across all Green Bond Platform microservices
keywords: [api gateway, authentication, JWT, routing, rate limiting, microservices gateway]
---

# Gateway Overview

The Gateway is the API Gateway that provides unified access, authentication, and routing for all Green Bond Platform services.

## Purpose

Gateway acts as a single entry point for all client requests, handling:

- Authentication and authorization
- Request routing to microservices
- Rate limiting and throttling
- CORS configuration
- Request/response transformation

## Key Features

- **JWT Authentication**: Secure token-based authentication
- **Service Routing**: Dynamic routing to ATS, Primary Market, Treasury APIs
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Load Balancing**: Distribute requests across service instances
- **Centralized Logging**: Request/response logging and monitoring
- **API Versioning**: Support multiple API versions

## Architecture

```
Client → Gateway → [ATS API | Primary Market API | Treasury API]
           ↓
      Auth Service
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Authentication**: Passport.js, JWT
- **Rate Limiting**: @nestjs/throttler
- **Routing**: HTTP Proxy Middleware
- **Monitoring**: Winston, Prometheus

## Quick Start

```bash
cd apps/shared/gateway
npm install
cp .env.sample .env
npm run start:dev
```

## Next Steps

- [Installation](installation.md)
- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
