## Description

<!--
Clearly explain **what** changes you made and **why** they were needed.

Start with a brief summary of the change and its motivation, linking to any relevant issue(s).
Explain the context or problem being solved, the approach taken, and any dependencies introduced.

Focus on *what* and *why* rather than *how*, but you can briefly note implementation details if they help reviewers understand the impact.

Example: Implemented Treasury coupon distribution logic with batch processing to reduce gas costs and improve reliability.

Fixes #(issue)
-->

## Affected Modules

<!--
Check all modules that are modified in this PR.
This helps reviewers understand the scope and triggers the appropriate CI workflows.
-->

### Smart Contracts
- [ ] ATS Contracts (`packages/ats/contracts/`)
- [ ] Treasury Contracts (`packages/treasury/contracts/`)
- [ ] Primary Market Contracts (`packages/primary-market/contracts/`)
- [ ] Shared Contracts (`packages/shared/contracts/`)

### APIs
- [ ] ATS API (`apps/ats/api/`)
- [ ] Primary Market API (`apps/primary-market/api/`)
- [ ] Treasury API (`apps/treasury/api/`)

### Shared Libraries
- [ ] Shared Core (`packages/shared/core/`)
- [ ] Blockchain Listener (`packages/shared/blockchain-listener/`)

### Shared Applications
- [ ] Gateway (`apps/shared/gateway/`)
- [ ] Transaction Sender (`apps/shared/transaction-sender/`)

### Infrastructure
- [ ] CI/CD Workflows (`.github/workflows/`)
- [ ] Scripts (`scripts/`)
- [ ] Root Configuration

## Type of Change

- [ ] Bug fix 🐞
- [ ] New feature ✨
- [ ] Breaking change 💥
- [ ] Documentation update 📖
- [ ] Refactor 🔧
- [ ] Performance improvement ⚡
- [ ] Test improvement 🧪

## Testing

<!--
Describe how you verified your changes work and steps for reviewers to confirm. 🧪

### Automated Tests
- Smart Contracts: `npm run <module>:contracts:test` or `npm run <module>:contracts:coverage`
- APIs/Libraries: `npm run test --workspace=<workspace-name>`
- All: `npm run ats:test` (when available)

### Manual Verification
Describe any manual testing performed (e.g., API calls, contract interactions, UI testing)

### CI/CD Verification
Our CI workflows automatically:
✅ Run quality checks (lint, format, Solidity lint)
✅ Detect affected modules and run their tests
✅ Enforce coverage thresholds (90% contracts, 80% APIs, 85% shared)
✅ Upload coverage to Codecov

For example:
- Changes to `packages/ats/contracts/` → ATS contract tests run automatically
- Changes to `packages/shared/core/` → ALL dependent tests run (Core + APIs)

### Test Results

**Node version**: 22 (required)

**Local test execution**:
```bash
# Command used
npm run ...

# Result
✅ All tests passed
✅ Coverage: XX%
```
-->

## Coverage Impact

<!--
For contract changes, verify coverage meets requirements:
- Contracts: ≥ 90%
- APIs: ≥ 80%
- Shared Libraries: ≥ 85%

Check coverage report after running tests:
- Contracts: `packages/<module>/contracts/coverage/coverage-summary.json`
- APIs/Libraries: Coverage report in terminal

Our CI will automatically fail if coverage drops below thresholds.
-->

- [ ] Coverage meets or exceeds threshold for affected modules
- [ ] No reduction in coverage from previous version

## Changesets

<!--
**REQUIRED for all PRs to develop/main branches**

If your PR includes user-facing changes (features, fixes, breaking changes):

1. Create a changeset:
   ```bash
   npm run changeset
   ```
2. Select affected packages
3. Choose version bump type (patch/minor/major)
4. Describe the change for the changelog

**Bypass labels** (if no changeset needed):
- `no-changeset` - Infrastructure/internal changes
- `docs-only` - Documentation only
- `chore` - Maintenance tasks
- `hotfix` - Emergency fixes

Our CI will check for changesets automatically.
-->

- [ ] Changeset created (if required)
- [ ] Bypass label applied (if no changeset needed)

## Checklist

### Code Quality
- [ ] Style guidelines followed ✅
- [ ] ESLint passed - No new warnings ⚠️
- [ ] Prettier formatted - Code formatted correctly 💅
- [ ] Solidity linting passed (if contracts changed) 🔒

### Testing
- [ ] Local tests pass ✅
- [ ] Effective tests added for new functionality ✔️
- [ ] Coverage meets thresholds (see Coverage Impact above) 📊
- [ ] E2E tests added/updated (if API changes) 🔄

### Documentation
- [ ] Code comments added for complex logic 📝
- [ ] JSDoc/TSDoc added for public APIs 📚
- [ ] README updated (if user-facing changes) 📖
- [ ] ADR created (if architectural decision) 🏗️

### Dependencies & Build
- [ ] No new dependencies added OR new dependencies justified ⚖️
- [ ] Build passes (`npm run build` for affected modules) 🏗️
- [ ] No TypeScript errors ✅
- [ ] Dependency graph respected (Treasury → ATS → Primary Market) 🔗

### Security & Compliance
- [ ] No secrets or sensitive data in code 🔐
- [ ] PGP signed commits (`-S` flag) ✍️
- [ ] DCO sign-off (`--signoff` flag) ✅
- [ ] No AI references in commits or code 🤖

### Hedera/Blockchain (if applicable)
- [ ] Gas costs optimized ⛽
- [ ] Smart contract security reviewed 🛡️
- [ ] Event emissions appropriate 📡
- [ ] Upgradability considerations addressed 🔄

## Additional Context

<!--
Add any other context, screenshots, or information that would help reviewers.

Examples:
- Screenshots of UI changes
- Gas cost comparisons for contract changes
- Performance benchmarks
- Migration strategy for breaking changes
- Rollback plan for risky changes
-->

---

## For Reviewers

<!--
Guidance for reviewers:

### What to Check
1. **Correctness**: Does the code solve the stated problem?
2. **Tests**: Are there adequate tests? Do they cover edge cases?
3. **Coverage**: Does coverage meet thresholds? (CI will enforce)
4. **Architecture**: Does it follow DDD, Hexagonal, CQS patterns?
5. **Security**: Any security concerns? (especially for contracts)
6. **Dependencies**: Is the dependency graph respected?
7. **Documentation**: Is the code self-documenting? Are complex parts explained?

### CI/CD Expectations
- ✅ Quality checks must pass (lint, format, Solidity lint)
- ✅ All affected module tests must pass
- ✅ Coverage thresholds must be met
- ✅ Changeset required (unless bypass label applied)

The CI will automatically:
- Detect which modules changed
- Run only affected tests
- Check coverage thresholds
- Report results in PR comments
-->
