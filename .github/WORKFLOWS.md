# CI/CD Workflows Documentation

This document describes the GitHub Actions CI/CD workflows for the Green Bonds Platform monorepo.

## 📁 Structure

```
.github/
├── workflows/
│   ├── ci-pr.yml                         # Main PR orchestrator
│   ├── ci-quality.yml                    # Code quality checks
│   ├── _reusable-test-contracts.yml      # Reusable contract test workflow
│   └── _reusable-test-nestjs.yml         # Reusable NestJS test workflow
├── scripts/
│   └── detect-changes.js                 # Intelligent change detection
└── WORKFLOWS.md                          # This file
```

## 🚀 Workflows

### CI - Pull Request (`ci-pr.yml`)

Main workflow that orchestrates all CI checks for pull requests.

**Triggers:**
- Pull requests to `develop` or `main` branches
- Manual trigger via `workflow_dispatch`

**Features:**
- 🔍 Intelligent change detection
- 🧪 Selective testing (only affected modules)
- 📦 Dependency-aware testing
- ✅ Aggregated status check

**Modules Tested:**
- **Smart Contracts:** ATS, Treasury, Primary Market
- **APIs:** ATS API, Primary Market API, Treasury API
- **Shared Libraries:** Core, Blockchain Listener
- **Shared Apps:** Gateway, Transaction Sender

### Code Quality (`ci-quality.yml`)

Runs code quality checks on every PR.

**Checks:**
- ESLint (TypeScript)
- Prettier (Formatting)
- Solhint (Solidity)

**Always runs** - not affected by change detection.

## 🧪 Testing Workflows

### Contract Testing (`_reusable-test-contracts.yml`)

**Status:** ✅ **PHASE 2 COMPLETE** - Fully implemented

Reusable workflow for testing Solidity smart contracts.

**Features:**
- 🔨 Hardhat compilation
- 🧪 Automated test execution
- 📊 Coverage generation
- 🎯 Coverage threshold enforcement (90%)
- 📤 Codecov integration
- 🏗️ Dependency building (Treasury → ATS → Primary Market)

**Usage:**
```yaml
test-ats-contracts:
  uses: ./.github/workflows/_reusable-test-contracts.yml
  with:
    module: ats
    coverage-threshold: 90
    node-version: '22'
  secrets:
    codecov-token: ${{ secrets.CODECOV_TOKEN }}
```

**Supported Modules:**
- `ats` - Asset Tokenization Studio contracts
- `treasury` - Treasury management contracts
- `primary-market` - Primary market offering contracts

**Coverage Files:**
- `packages/{module}/contracts/coverage/lcov.info`
- `packages/{module}/contracts/coverage/coverage-summary.json`

### NestJS Testing (`_reusable-test-nestjs.yml`)

**Status:** ⏳ **PHASE 3 PENDING** - Placeholder only

Reusable workflow for testing NestJS applications and libraries.

**Planned Features:**
- Jest unit tests
- E2E tests (for APIs)
- Coverage reporting
- Codecov integration

## 📝 Change Detection

The `detect-changes.js` script intelligently detects which modules have changed and determines which tests to run.

**Key Features:**

### 1. File-to-Module Mapping
Maps changed files to affected modules:
```javascript
'ats-contracts': 'packages/ats/contracts/**'
'primary-market-api': 'apps/primary-market/api/**'
```

### 2. Dependency Graph
Automatically tests dependent modules:
- Treasury changes → Tests ATS + Primary Market
- ATS changes → Tests Primary Market
- Shared Core changes → Tests ALL modules

### 3. Special Rules
- Root config changes → Quality checks only
- Shared Core changes → Test all modules
- Workflow changes → Quality checks only

**Testing Locally:**
```bash
node .github/scripts/detect-changes.js
```

**Output Format:**
```json
{
  "contracts": ["ats", "treasury"],
  "apis": ["primary-market"],
  "shared": ["core"]
}
```

## 🔧 Configuration

### Required Secrets

Add these secrets to your GitHub repository:

1. **`CODECOV_TOKEN`** (Required for Phase 2)
   - Get from: https://codecov.io/
   - Used for: Coverage reporting
   - Required by: `_reusable-test-contracts.yml`

### Runner Configuration

All workflows use the self-hosted runner:
```yaml
runs-on: token-studio-linux-large
```

**Requirements:**
- Node.js 22
- npm workspaces support
- Hardhat
- Git

## 📊 Coverage Requirements

### Thresholds by Module

| Module | Threshold | Enforcement |
|--------|-----------|-------------|
| Treasury Contracts | 90% | ✅ Enforced |
| ATS Contracts | 90% | ✅ Enforced |
| Primary Market Contracts | 90% | ✅ Enforced |
| APIs | 80% | ⏳ Phase 3 |
| Shared Libraries | 85% | ⏳ Phase 3 |

### Coverage Reports

Coverage is reported via:
1. **Codecov Dashboard** - Historical trends and PR comments
2. **GitHub Actions Summary** - Inline summary in workflow run
3. **PR Status Checks** - Pass/fail based on thresholds

## 🎯 Implementation Phases

### ✅ Phase 1: Foundation (Complete)
- Change detection script
- Quality checks workflow
- Main orchestrator with placeholders
- Reusable workflow templates

### ✅ Phase 2: Contract Testing (Complete)
- Full contract test implementation
- Hardhat test execution
- Coverage threshold enforcement
- Codecov integration
- Dependency building

### ⏳ Phase 3: API & Library Testing (Pending)
- NestJS unit test execution
- E2E test support
- Jest coverage reporting
- Cross-layer dependency testing

### ⏳ Phase 4: Build Validation (Pending)
- TypeScript compilation checks
- Solidity compilation validation
- Build failure detection

### ⏳ Phase 5: Optimization (Pending)
- PR comment with test results
- Cache optimization
- Performance improvements
- Workflow status badges

### ⏳ Phase 6: Release & Deploy (Deferred)
- Changesets integration
- NPM publishing
- Container builds
- Smart contract deployments

## 🔍 Debugging Workflows

### View Workflow Runs
```bash
gh run list --workflow=ci-pr.yml
gh run view <run-id>
```

### Test Change Detection Locally
```bash
# See what modules would be affected
node .github/scripts/detect-changes.js

# Test against specific branch
GITHUB_BASE_REF=develop node .github/scripts/detect-changes.js
```

### Manual Workflow Trigger
```bash
# Trigger from GitHub UI
# Or via CLI:
gh workflow run ci-pr.yml
```

### Check Workflow Syntax
```bash
# Using actionlint (if installed)
actionlint .github/workflows/*.yml
```

## 📚 Examples

### Adding a New Contract Module

1. **Update change detection** (`.github/scripts/detect-changes.js`):
```javascript
MODULE_PATHS['new-module-contracts'] = 'packages/new-module/contracts'
DEPENDENCIES['new-module-contracts'] = ['ats-contracts']
```

2. **Add job to ci-pr.yml**:
```yaml
test-new-module-contracts:
  name: 🧪 New Module Contracts
  needs: detect-changes
  if: contains(needs.detect-changes.outputs.contracts, 'new-module')
  uses: ./.github/workflows/_reusable-test-contracts.yml
  with:
    module: new-module
    coverage-threshold: 90
  secrets:
    codecov-token: ${{ secrets.CODECOV_TOKEN }}
```

3. **Add to root package.json** (if needed):
```json
"new-module:contracts:test": "npm run test --workspace=@hashgraph/green-bonds-platform-new-module-contracts"
```

## 🐛 Common Issues

### Issue: Cache miss on Hardhat artifacts
**Solution:** Hardhat cache keys include Solidity file hashes. Changes to contracts invalidate cache (expected behavior).

### Issue: Coverage threshold fails unexpectedly
**Solution:** Check `coverage/coverage-summary.json` for actual coverage. Threshold is based on **line coverage**.

### Issue: Dependency build fails
**Solution:** Ensure build order is correct. Check `detect-changes.js` dependency graph.

### Issue: npm ci fails
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` locally to regenerate lock file.

## 📞 Support

- **Documentation:** See plan file at `/Users/work/.claude/plans/typed-whistling-petal.md`
- **Issues:** Report workflow issues to the team
- **Questions:** Check this README first, then ask the team

## 🎉 Quick Start

### For Developers

1. **Create a PR** - Workflows trigger automatically
2. **Wait for checks** - Quality + affected module tests run
3. **Review results** - Check GitHub Actions tab or PR checks
4. **Fix issues** - Push new commits to re-trigger workflows

### For Workflow Maintainers

1. **Review plan file** - Complete strategy in `.claude/plans/typed-whistling-petal.md`
2. **Test locally** - Use `detect-changes.js` script
3. **Make changes** - Edit workflows in `.github/workflows/`
4. **Validate** - Trigger manually via `workflow_dispatch`

---

> **Note:** This documentation file is named `WORKFLOWS.md` (not `README.md`) to avoid conflicts with GitHub's default README behavior.

**Last Updated:** Phase 2 Complete
**Next Phase:** Phase 3 - API & Library Testing
