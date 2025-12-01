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
│   ├── detect-changes.js                 # Intelligent change detection
│   ├── format-changed.js                 # Format only changed files
│   ├── lint-js-changed.js                # Lint only changed JS/TS files
│   └── lint-sol-changed.js               # Lint only changed Solidity files
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

**Status:** ✅ **OPTIMIZED** - Three-layer quality enforcement with conditional execution

Runs code quality checks with smart optimization for faster feedback.

#### 🎯 Three-Layer Quality Enforcement

**1. Pre-commit Hooks (Local)**

- Runs on staged files only (fastest)
- Auto-fixes issues before commit
- Uses Husky + lint-staged
- Blocks commits with quality issues

**2. Changed-File Scripts (Local/PR)**

- Checks only files changed vs base branch
- Used in CI for pull requests
- 60-70% faster than full checks
- Provides quick local feedback

**3. Full Repository Checks (Push)**

- Runs on entire monorepo
- Only on push to main/develop
- Ensures overall codebase quality
- Catches edge cases

#### 📝 Conditional Execution

**Pull Request Mode** (Changed files only):

```yaml
if: github.event_name == 'pull_request'
run: npm run format:changed:check  # Only changed files
run: npm run lint:js:changed       # Only changed JS/TS
run: npm run lint:sol:changed      # Only changed Solidity
```

**Push Mode** (Full repository):

```yaml
if: github.event_name == 'push'
run: npm run format:check          # All files
run: npm run lint:js               # All JS/TS
run: npm run lint:sol              # All Solidity
```

#### ✅ Quality Checks

- **ESLint** - TypeScript/JavaScript linting
- **Prettier** - Code formatting consistency
- **Solhint** - Solidity linting and best practices

#### 🚀 Performance Impact

| Mode         | Scope           | Typical Time | Use Case             |
| ------------ | --------------- | ------------ | -------------------- |
| Pre-commit   | Staged files    | 3-10s        | Before every commit  |
| Changed-file | Changed vs base | 30-60s       | Pull requests        |
| Full         | Entire repo     | 2-5min       | Push to main/develop |

#### 🛠️ Supporting Scripts

**Format Changed Files:**

```bash
# Check formatting
npm run format:changed:check

# Auto-fix formatting
npm run format:changed
```

**Lint Changed Files:**

```bash
# Lint JS/TS
npm run lint:js:changed
npm run lint:js:changed:fix

# Lint Solidity
npm run lint:sol:changed
npm run lint:sol:changed:fix

# Lint all languages
npm run lint:changed
npm run lint:changed:fix
```

#### 🔧 Pre-commit Hook Configuration

**Managed by:** Husky 9 + lint-staged 15

**Staged file checks:**

- **JS/TS files**: ESLint --fix + Prettier --write
- **Solidity files**: Solhint --fix + Prettier --write
- **JSON/YAML/MD**: Prettier --write

**Bypass hook** (use sparingly):

```bash
git commit --no-verify -m "message"
```

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
    node-version: "22"
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

### Optional Secrets

Add these secrets to your GitHub repository for enhanced features:

1. **`CODECOV_TOKEN`** (Optional - Recommended for Phase 2)
   - Get from: https://codecov.io/
   - Used for: Coverage reporting and PR comments
   - Used by: `_reusable-test-contracts.yml`
   - **If not configured**: Coverage is still checked locally, but not uploaded to Codecov
   - **Benefit**: Historical tracking, visual reports, PR comments with coverage diffs

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

| Module                   | Threshold | Enforcement |
| ------------------------ | --------- | ----------- |
| Treasury Contracts       | 90%       | ✅ Enforced |
| ATS Contracts            | 90%       | ✅ Enforced |
| Primary Market Contracts | 90%       | ✅ Enforced |
| APIs                     | 80%       | ✅ Enforced |
| Shared Libraries         | 80%       | ✅ Enforced |

### Coverage Reports

Coverage is reported via:

1. **Codecov Dashboard** - Historical trends and PR comments
2. **GitHub Actions Summary** - Inline summary in workflow run
3. **PR Status Checks** - Pass/fail based on thresholds

## 🎯 Implemented Features

### ✅ Infrastructure & Foundation

- Change detection script with dependency graph
- Code quality workflow (ESLint, Prettier, Solhint)
- Main PR orchestrator workflow
- Reusable workflow templates

### ✅ Smart Contract Testing

- Full Hardhat test execution
- Coverage threshold enforcement (90%)
- Codecov integration with PR comments
- Smart dependency building (Treasury → ATS → Primary Market)

### ✅ API & Library Testing

**NestJS Module Testing:**

- ✅ Full test execution for 7 modules (ATS API, Primary Market API, Treasury API, Shared Core, Blockchain Listener, Gateway, Transaction Sender)
- ✅ Coverage validation with 80% threshold (configurable per module)
- ✅ Smart dependency building (Treasury contracts → Shared Core → Blockchain Listener → APIs)
- ✅ Jest memory optimization (4GB heap with `--max-old-space-size=4096`, limited to 2 workers with `--maxWorkers=2`)
- ✅ E2E tests removed from automatic workflow (manual trigger only - see E2E Testing Strategy below)
- ✅ Coverage reporting with json-summary, lcov, text, and html formats
- ✅ Dependency-aware build order prevents import errors

#### E2E Testing Strategy

**Decision**: E2E tests removed from automatic PR workflow.

**Rationale:**

- Too slow and resource-intensive for PR checks (15+ minutes per module)
- Blocks other PR checks from running efficiently
- Better suited for manual trigger or scheduled runs

**Recommendation**: Create separate manual-trigger workflow for E2E tests if needed in future.

## 🔮 Future Enhancements

### Planned Improvements

**Build Validation:**

- TypeScript compilation checks
- Solidity compilation validation
- Build failure detection

**Optimization:**

- PR comment with test results
- Cache optimization
- Performance improvements
- Workflow status badges

**Release & Deploy:**

- Changesets integration
- NPM publishing
- Container builds

---

## ⚠️ Manual Action Required: GitHub Branch Protection Update

**Job Name Change**: "CI Success" renamed to "All Checks Complete".

**GitHub Branch Protection Rules** must be updated manually:

1. Go to Repository Settings → Branches → Branch protection rules
2. Edit rule for `develop` or `main` branch
3. Under "Require status checks to pass before merging", find and update:
   - **Remove**: "CI Success" (old name)
   - **Add**: "All Checks Complete" (new name)
4. Save changes

**Impact**: Without this update, PRs will show incorrect merge status and may be blocked from merging even when all checks pass.

**Priority**: HIGH - Must be completed before merging these CI workflow changes to develop/main.

---

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
MODULE_PATHS["new-module-contracts"] = "packages/new-module/contracts";
DEPENDENCIES["new-module-contracts"] = ["ats-contracts"];
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

## 🔧 Pre-commit Hooks Troubleshooting

### Hook Not Running

**Symptom:** Commits succeed without running quality checks

**Solutions:**

1. **Verify Husky installation:**

   ```bash
   ls -la .husky/pre-commit
   # Should show executable file with #!/bin/sh
   ```

2. **Reinstall Husky:**

   ```bash
   npm run prepare
   # This runs: husky
   ```

3. **Check Git hooks path:**
   ```bash
   git config core.hooksPath
   # Should show: .husky
   ```

### Hook Fails on Unstaged Changes

**Symptom:** `lint-staged` reports "No staged files match"

**Cause:** You have changes but haven't staged them

**Solution:**

```bash
# Stage your changes first
git add .

# Then commit
git commit -m "your message"
```

### ESLint/Prettier Conflicts

**Symptom:** Hook runs but reports formatting conflicts

**Cause:** ESLint and Prettier have different formatting rules

**Solution:**

1. **Auto-fix all issues:**

   ```bash
   npm run lint:fix
   ```

2. **Stage the fixes:**

   ```bash
   git add .
   ```

3. **Commit again:**
   ```bash
   git commit -m "your message"
   ```

### Solhint Errors Cannot Be Auto-Fixed

**Symptom:** Hook fails with Solidity linting errors

**Cause:** Some Solidity linting rules require manual fixes

**Solution:**

1. **Review the error output** - it will show file and line number

2. **Fix manually** in your editor

3. **Stage and commit:**
   ```bash
   git add packages/*/contracts/**/*.sol
   git commit -m "your message"
   ```

### Hook Takes Too Long

**Symptom:** Pre-commit hook runs for 30+ seconds

**Cause:** Too many staged files or complex linting rules

**Solutions:**

1. **Commit smaller changesets:**

   ```bash
   # Instead of staging everything
   git add specific/files/only
   git commit -m "focused change"
   ```

2. **Skip hook temporarily** (use sparingly):

   ```bash
   git commit --no-verify -m "WIP: will fix later"
   ```

3. **Run checks before staging:**
   ```bash
   npm run quality:changed  # Check only changed files
   npm run lint:fix         # Fix all issues
   git add .
   git commit -m "message"  # Hook will be fast
   ```

### Changed-File Scripts Report No Changes

**Symptom:** Scripts report "No changed files detected"

**Cause:** Working from main/develop branch without commits

**Solution:**

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make and commit changes:**

   ```bash
   # Make changes
   git add .
   git commit -m "feat: your feature"
   ```

3. **Now changed-file scripts work:**
   ```bash
   npm run lint:changed
   # Compares feature branch vs origin/develop
   ```

### Base Branch Detection Fails

**Symptom:** Scripts error with "Neither origin/develop nor origin/main exists"

**Cause:** Remote branches not fetched

**Solution:**

```bash
# Fetch remote branches
git fetch origin

# Verify branches exist
git branch -r | grep -E "origin/(develop|main)"

# If they don't exist, fetch all
git fetch --all
```

### Permission Denied on Pre-commit Hook

**Symptom:** `bash: .husky/pre-commit: Permission denied`

**Cause:** Hook file is not executable

**Solution:**

```bash
chmod +x .husky/pre-commit
git add .husky/pre-commit
git commit -m "fix: make pre-commit hook executable"
```

### Windows Line Ending Issues

**Symptom:** Hook fails with `\r` or CRLF errors

**Cause:** Git converting LF to CRLF on Windows

**Solution:**

```bash
# Configure Git to not convert line endings
git config core.autocrlf false

# Reinstall Husky
npm run prepare

# Verify hook has LF endings
file .husky/pre-commit
# Should show: ASCII text (not "ASCII text, with CRLF line terminators")
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

**Last Updated:** December 2025
**Status:** All testing and quality features complete. Future enhancements planned for build validation and optimization.
