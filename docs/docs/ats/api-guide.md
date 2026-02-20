---
title: ATS API Reference
sidebar_position: 4
sidebar_label: API Guide
description: Complete REST API reference for Asset Tokenization Studio - endpoints, authentication, request/response examples, and error handling
keywords: [ATS API, REST API, API reference, endpoints, authentication, API documentation]
---

# ATS API Guide

Complete endpoint reference for the Asset Tokenization Studio API.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints require JWT authentication except health check.

```bash
# Get access token
POST /auth/login
{
  "username": "user@example.com",
  "password": "password"
}

# Use token in requests
Authorization: Bearer <token>
```

## Bonds

### Create Bond

Create a new tokenized bond.

```http
POST /bonds
```

**Request Body:**

```json
{
  "name": "Green Energy Bond 2026",
  "symbol": "GEB26",
  "totalSupply": 1000000,
  "denomination": 1000,
  "maturityDate": "2026-12-31T00:00:00Z",
  "interestRate": 4.5,
  "currency": "USD",
  "issuer": {
    "name": "Green Energy Corp",
    "accountId": "0.0.12345"
  },
  "environmental": {
    "category": "renewable_energy",
    "projectDescription": "Solar farm installation",
    "expectedImpact": "500 tons CO2 reduction annually"
  }
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tokenId": "0.0.98765",
  "name": "Green Energy Bond 2026",
  "symbol": "GEB26",
  "state": "draft",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### Get Bond

Retrieve bond details.

```http
GET /bonds/{bondId}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tokenId": "0.0.98765",
  "name": "Green Energy Bond 2026",
  "symbol": "GEB26",
  "totalSupply": 1000000,
  "issuedSupply": 750000,
  "denomination": 1000,
  "maturityDate": "2026-12-31T00:00:00Z",
  "interestRate": 4.5,
  "state": "active",
  "environmental": {
    "category": "renewable_energy",
    "projectDescription": "Solar farm installation",
    "expectedImpact": "500 tons CO2 reduction annually",
    "actualImpact": "350 tons CO2 reduced"
  },
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T14:30:00Z"
}
```

### List Bonds

Get all bonds with filtering.

```http
GET /bonds?state=active&page=1&limit=10
```

**Query Parameters:**

- `state`: Filter by bond state (draft, active, matured, etc.)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (createdAt, name, maturityDate)
- `order`: Sort order (asc, desc)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Green Energy Bond 2026",
      "tokenId": "0.0.98765",
      "state": "active",
      "maturityDate": "2026-12-31T00:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Update Bond

Update bond information.

```http
PATCH /bonds/{bondId}
```

**Request Body:**

```json
{
  "environmental": {
    "actualImpact": "400 tons CO2 reduced"
  }
}
```

**Response:** `200 OK`

### Approve Bond

Approve a bond for issuance.

```http
POST /bonds/{bondId}/approve
```

**Response:** `200 OK`

### Suspend Bond

Suspend an active bond.

```http
POST /bonds/{bondId}/suspend
```

**Response:** `200 OK`

## Tokens

### Issue Tokens

Issue bond tokens to an investor.

```http
POST /bonds/{bondId}/issue
```

**Request Body:**

```json
{
  "investorAccountId": "0.0.54321",
  "amount": 10000,
  "memo": "Initial allocation"
}
```

**Response:** `201 Created`

```json
{
  "transactionId": "0.0.12345@1642253400.123456789",
  "bondId": "550e8400-e29b-41d4-a716-446655440000",
  "investorAccountId": "0.0.54321",
  "amount": 10000,
  "status": "success"
}
```

### Transfer Tokens

Transfer tokens between accounts.

```http
POST /bonds/{bondId}/transfer
```

**Request Body:**

```json
{
  "fromAccountId": "0.0.54321",
  "toAccountId": "0.0.98765",
  "amount": 5000,
  "memo": "Secondary market sale"
}
```

**Response:** `200 OK`

### Get Token Balance

Get token balance for an account.

```http
GET /bonds/{bondId}/balance/{accountId}
```

**Response:** `200 OK`

```json
{
  "accountId": "0.0.54321",
  "bondId": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 5000,
  "updatedAt": "2026-01-15T15:00:00Z"
}
```

## Transactions

### Get Transaction History

Retrieve transaction history for a bond.

```http
GET /bonds/{bondId}/transactions?page=1&limit=20
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "trans-123",
      "transactionId": "0.0.12345@1642253400.123456789",
      "type": "transfer",
      "from": "0.0.54321",
      "to": "0.0.98765",
      "amount": 5000,
      "timestamp": "2026-01-15T15:00:00Z",
      "status": "success"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

## Swagger Documentation

Complete interactive API documentation:

```
http://localhost:3001/api/docs
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "totalSupply",
      "message": "must be a positive number"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Bond not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks

Subscribe to events:

```http
POST /webhooks
```

**Request Body:**

```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["bond.created", "tokens.issued", "tokens.transferred"],
  "secret": "webhook-secret"
}
```

## Next Steps

- [Smart Contracts](smart-contracts.md)
- [Testing Guide](../development/testing.md)
