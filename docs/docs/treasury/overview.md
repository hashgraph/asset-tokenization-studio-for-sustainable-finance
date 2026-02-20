---
title: Treasury Module Overview
sidebar_position: 1
sidebar_label: Overview
description: Treasury component for managing bond payments, coupon distributions, redemptions, and environmental impact distributions
keywords: [treasury, payments, coupon payments, redemption, distributions, payment scheduling]
---

# Treasury Overview

The Treasury component manages payments, distributions, and redemptions for green bonds.

## Purpose

Treasury handles:

- Coupon payments to bondholders
- Principal redemptions
- Environmental impact distributions
- Payment scheduling
- Transaction reconciliation

## Key Features

- **Payment Orchestration**: Automated coupon and principal payments
- **Distribution Management**: Environmental token distributions
- **Redemption Processing**: Bond redemption at maturity
- **Payment Scheduling**: Automated payment calendars
- **Reconciliation**: Payment tracking and verification
- **Multi-currency**: Support for multiple payment tokens

## Architecture

```
Payment Schedule → Payment Execution → Blockchain Transaction → Reconciliation
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Hedera SDK
- **Smart Contracts**: Solidity
- **Scheduler**: Bull Queue

## Quick Start

```bash
cd apps/treasury/api
npm install
cp .env.example .env
npm run start:dev
```

## Next Steps

- [Installation](installation.md)
- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
- [Smart Contracts](smart-contracts.md)
