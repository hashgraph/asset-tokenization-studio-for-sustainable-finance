---
title: How Transaction Sender Works
sidebar_position: 3
sidebar_label: How It Works
description: Detailed explanation of transaction queue processing, retry strategies, status tracking, and Hedera transaction submission
keywords: [transaction processing, queue workflow, retry mechanism, transaction tracking, hedera]
---

# How Transaction Sender Works

Detailed explanation of transaction processing.

## Transaction Flow

1. **Request Received**: API receives transaction request
2. **Validation**: Transaction parameters validated
3. **Queue**: Transaction added to Bull queue
4. **Processing**: Worker picks up transaction
5. **Submission**: Transaction submitted to Hedera
6. **Confirmation**: Transaction receipt received
7. **Notification**: Callback/webhook triggered

## Queue Processing

```typescript
@Process('transaction')
async processTransaction(job: Job<TransactionData>) {
  const { type, params } = job.data;
  const receipt = await this.submitToHedera(type, params);
  return receipt;
}
```

## Retry Strategy

Failed transactions are retried with:

- Exponential backoff
- Maximum retry attempts (default: 3)
- Error categorization (retry vs. permanent failure)

## Transaction Types

Supported transaction types:

- Token transfers
- Smart contract calls
- Token creation
- Token association
- Account updates

## Status Tracking

Transaction statuses:

- `QUEUED`: In queue
- `PROCESSING`: Being processed
- `SUBMITTED`: Sent to network
- `CONFIRMED`: Receipt received
- `FAILED`: Permanently failed

## Next Steps

- [API Guide](api-guide.md)
