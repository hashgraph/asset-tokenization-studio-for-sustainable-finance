---
title: Primary Market API Reference
sidebar_position: 4
sidebar_label: API Guide
description: Complete REST API reference for Primary Market - offerings, subscriptions, allocations endpoints with examples
keywords: [primary market API, REST API, offerings API, subscriptions API, allocations]
---

# Primary Market API Guide

Complete API reference.

## Offerings

### Create Offering

```http
POST /offerings
```

**Request:**

```json
{
  "bondId": "BOND001",
  "totalAmount": 1000000,
  "minSubscription": 1000,
  "startDate": "2024-01-01",
  "endDate": "2024-01-15"
}
```

### Get Offerings

```http
GET /offerings
```

## Subscriptions

### Submit Subscription

```http
POST /subscriptions
```

**Request:**

```json
{
  "offeringId": "123",
  "amount": 50000,
  "investorId": "INV001"
}
```

### Get My Subscriptions

```http
GET /subscriptions/me
```

## Allocations

### Get Allocation

```http
GET /allocations/:offeringId
```

## Next Steps

- [Smart Contracts](smart-contracts.md)
