---
title: Treasury API Reference
sidebar_position: 4
sidebar_label: API Guide
description: Complete REST API reference for Treasury - payments, redemptions, and distribution endpoints with examples
keywords: [treasury API, payments API, redemption API, distributions, API reference]
---

# Treasury API Guide

Complete API reference.

## Payments

### Schedule Coupon Payment

```http
POST /payments/coupon
```

**Request:**

```json
{
  "bondId": "BOND001",
  "paymentDate": "2024-06-30",
  "amount": 50000
}
```

### Get Payment History

```http
GET /payments/:bondId
```

## Redemptions

### Request Redemption

```http
POST /redemptions
```

**Request:**

```json
{
  "bondId": "BOND001",
  "amount": 100000
}
```

### Get Redemption Status

```http
GET /redemptions/:id
```

## Distributions

### Distribute Environmental Tokens

```http
POST /distributions
```

**Request:**

```json
{
  "bondId": "BOND001",
  "impactData": {...},
  "totalAmount": 1000
}
```

## Next Steps

- [Smart Contracts](smart-contracts.md)
