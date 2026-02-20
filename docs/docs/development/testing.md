---
title: Testing Guide
sidebar_position: 1
sidebar_label: Testing
description: Complete testing guide for Green Bond Platform - unit tests, integration tests, E2E tests, and coverage reports
keywords: [testing, unit tests, integration tests, e2e tests, test coverage, TDD]
---

# Testing

Complete testing guide for Green Bond Platform.

## Test Types

### Unit Tests

Tests that test individual units of code in isolation.

```bash
# Run all unit tests
npm run api:test

# Run tests for a specific component
npm run ats:api:test
npm run primary-market:api:test
npm run treasury:api:test
npm run gateway:test
npm run transaction-sender:test
```

### Integration Tests

Tests that test the integration between multiple components.

```bash
# Run all integration tests
npm run api:test:integration

# Run integration tests per component
npm run ats:api:test:integration
npm run primary-market:api:test:integration
npm run treasury:api:test:integration
```

### E2E Tests

End-to-end tests that test complete user flows.

```bash
# Run E2E tests
npm run test:e2e
```

## Coverage

Generate test coverage reports:

```bash
# Run tests with coverage
npm run api:test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Best Practices

1. **Write tests first** (TDD)
2. **Test business logic** thoroughly
3. **Mock external dependencies**
4. **Use descriptive test names**
5. **Keep tests independent**
6. **Test edge cases**
7. **Maintain high coverage** (>80%)
