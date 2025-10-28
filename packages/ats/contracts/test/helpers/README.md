# Test Helpers Guide

## Fixtures vs Helper Functions

When writing tests, choosing between fixtures and helper functions is important for maintainability and performance.

### Fixtures (`loadFixture` pattern)

**Purpose**: Setup expensive initial state that can be snapshotted and reused across tests.

**Use fixtures when:**
- Deploying infrastructure (BLR, ProxyAdmin, Diamond facets) - expensive operations
- Setting up initial contracts that remain the same across tests
- Creating test accounts and initial data structures
- The setup is part of **"Arrange"** in arrange-act-assert pattern

**Key benefit**: State is snapshotted once and restored quickly for each test.

**Examples in this codebase:**
```typescript
// From factorySuiteFixtures.ts
deployFactorySuiteInfrastructureFixture()  // Deploys Diamond proxy, BLR, facets
deployFactorySuiteWithMocksForBusinessLogic()  // Deploys + configures mocks
```

### Helper Functions

**Purpose**: Encapsulate repeated operations that happen during tests with varying parameters.

**Use helper functions when:**
- Operations need **different parameters** for each test
- The operation is the actual **"Act"** being tested (not just setup)
- Operations happen **multiple times** or **mid-test**
- No benefit from snapshotting (parameters change each time)

**Key benefit**: DRY principle without forcing identical state across tests.

**Examples in this codebase:**
```typescript
// From data.ts
createTestDataSets()  // Generates test data with different parameters

// From deployment.ts
deployBondSuiteAndExtractContracts()  // Deploys with varying parameters during test
```

### Rule of Thumb

**If you need to call it with different arguments in each test → Helper Function**

**If it's expensive setup that's identical across tests → Fixture**

### Example Comparison

```typescript
// ❌ WRONG: Using fixture for varying parameters
it("test with 1 asset", async () => {
  const { suite } = await loadFixture(deploySuiteWith1Asset);  // Dedicated fixture
});

it("test with 2 assets", async () => {
  const { suite } = await loadFixture(deploySuiteWith2Assets);  // Another fixture
});

// ✅ RIGHT: Using helper function
it("test with 1 asset", async () => {
  const { suite } = await deployBondSuiteAndExtractContracts(..., [asset1]);
});

it("test with 2 assets", async () => {
  const { suite } = await deployBondSuiteAndExtractContracts(..., [asset1, asset2]);
});
```

### Testing Pattern

```
Arrange: Setup environment (fixtures)
Act:     Perform operation (helper functions)
Assert:  Verify results
```

Fixtures are for **"Arrange"**, helpers are often for **"Act"**.
