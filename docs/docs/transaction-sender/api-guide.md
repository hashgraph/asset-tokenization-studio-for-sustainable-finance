---
title: Transaction Sender API Reference
sidebar_position: 4
sidebar_label: API Guide
description: Complete API reference for Transaction Sender - submit transactions, track status, and configure webhooks
keywords: [transaction API, hedera API, transaction submission, webhooks, API reference]
---

# Transaction Sender API Guide

Complete API reference.

## Submit Transaction

### Token Transfer

```http
POST /transactions/token-transfer
```

**Request:**

```json
{
  "tokenId": "0.0.12345",
  "from": "0.0.11111",
  "to": "0.0.22222",
  "amount": 1000,
  "callbackUrl": "https://api.example.com/callback"
}
```

**Response:**

```json
{
  "transactionId": "tx_abc123",
  "status": "QUEUED"
}
```

### Contract Call

```http
POST /transactions/contract-call
```

**Request:**

```json
{
  "contractId": "0.0.54321",
  "functionName": "transfer",
  "parameters": ["0x...", 1000],
  "gas": 100000
}
```

## Get Transaction Status

```http
GET /transactions/:id
```

**Response:**

```json
{
  "id": "tx_abc123",
  "status": "CONFIRMED",
  "transactionId": "0.0.12345@1234567890.123456789",
  "receipt": {...}
}
```

## Webhooks

Configure callback URL to receive transaction updates:

```json
{
  "transactionId": "tx_abc123",
  "status": "CONFIRMED",
  "receipt": {...}
}
```

## Next Steps

- [How It Works](how-it-works.md)
