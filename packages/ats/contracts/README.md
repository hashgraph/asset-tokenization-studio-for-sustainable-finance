# ATS Smart Contracts

Asset Tokenization Studio (ATS) smart contracts for the Evercity green bonds platform.

## Overview

This package contains smart contracts for the ATS domain, including:

- **FactorySuite**: Atomic deployment of Bond + Treasury + KPI contract suites
- **KPI**: Oracle data storage for variable-rate bonds with transparent proxy pattern

## Development Commands

```shell
# Compilation
npm run compile                    # Compile contracts
npm run compile:force              # Clean and compile

# Testing
npm run test                       # Run test suite
npm run coverage                   # Generate coverage report

# Code Quality
npm run lint                       # Run linting (ESLint + Solhint)
npm run format                     # Check code formatting
npm run fix                        # Auto-fix linting and formatting

# Cleanup
npm run clean                      # Clean build artifacts
```

## Testing Strategy

### Framework & Tools

- **Hardhat 2.26.3**: Core development environment
- **TypeChain + Ethers V5**: Type-safe contract interactions
- **Chai + Hardhat Matchers**: Ethereum-specific assertions
- **Solidity Coverage**: Code coverage analysis

### Testing Architecture

#### Primary Approach: TypeScript Testing
- **Language**: TypeScript for type safety and rich tooling
- **Pattern**: Fixture-based isolation using `loadFixture`
- **Performance**: Automatic state snapshots between tests
- **Assertions**: Ethereum-specific matchers for events, balances, reverts

#### Secondary Approach: Solidity Testing (Future)
- **Use Case**: Gas-optimized scenarios and fuzz testing
- **Benefits**: EVM-native execution and cheatcodes access
- **Integration**: Complementary to TypeScript tests

### Test Organization

```
test/
├── fixtures/           # Reusable deployment fixtures
├── mocks/             # Mock contracts for testing
├── factorySuite.test.ts   # Core factory functionality
└── factorySuiteFacet.test.ts  # Facet-specific tests
```

### Coverage Standards

- **Target**: 100% line and branch coverage
- **Rationale**: Critical deployment infrastructure requires complete testing
- **Areas**: Happy paths, error conditions, edge cases, access control
- **Tools**: `npx hardhat coverage` for detailed coverage reports

### Testing Patterns

#### Fixture Pattern
```typescript
async function deployFactorySuiteFixture() {
  // Setup contracts and return state
  return { factorySuite, mockFactory, accounts };
}

describe('FactorySuite', () => {
  beforeEach(async () => {
    ({ factorySuite, mockFactory } = await loadFixture(deployFactorySuiteFixture));
  });
});
```

#### Event Testing
```typescript
await expect(contract.deployBondSuite(...args))
  .to.emit(contract, 'BondSuiteDeployed')
  .withArgs(expectedArgs);
```

#### Error Testing
```typescript
await expect(contract.invalidCall())
  .to.be.revertedWithCustomError(contract, 'InvalidTreasuryData');
```

#### Access Control Testing
```typescript
await expect(contract.connect(unauthorizedUser).restrictedFunction())
  .to.be.revertedWith('AccessControl: account 0x... is missing role 0x...');
```

### Best Practices

1. **Isolation**: Each test starts from clean fixture state
2. **Specificity**: One assertion per test when possible
3. **Descriptive**: Test names explain the scenario and expected outcome
4. **Comprehensive**: Cover all execution paths including error conditions
5. **Performance**: Use `loadFixture` to optimize deployment costs

### CI Integration

Tests are integrated into the development workflow:
- **Pre-commit**: Automated testing on code changes
- **Coverage Gates**: Minimum coverage thresholds enforced
- **Gas Analysis**: Monitor deployment and execution costs
- **Security**: Automated vulnerability scanning
