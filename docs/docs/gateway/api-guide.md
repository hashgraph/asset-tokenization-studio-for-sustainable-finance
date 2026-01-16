---
title: Gateway API Reference
sidebar_position: 4
sidebar_label: API Guide
description: Complete API reference for Gateway - authentication, authorization, and service proxying endpoints
keywords: [gateway API, authentication API, JWT, API proxy, API reference]
---

# Gateway API Guide

Complete API reference for the Gateway.

## Authentication

### Login

```http
POST /auth/login
```

**Request:**

```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

## Protected Endpoints

All other endpoints require JWT:

```http
Authorization: Bearer <token>
```

## Service Proxying

Gateway forwards requests to services:

- `GET /api/ats/bonds` → ATS API
- `POST /api/primary-market/subscriptions` → Primary Market API
- `GET /api/treasury/payments` → Treasury API

## Next Steps

- [How It Works](how-it-works.md)
