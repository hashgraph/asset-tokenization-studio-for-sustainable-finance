---
title: Contributing Guide
sidebar_position: 3
sidebar_label: Contributing
description: Guide for contributing to Green Bond Platform - bug reports, feature requests, pull requests, and coding standards
keywords: [contributing, pull requests, code of conduct, development guidelines, open source]
---

# Contributing

Thank you for your interest in contributing to Green Bond Platform! This guide will help you get started.

## Code of Conduct

All participants must adhere to our [Code of Conduct](https://github.com/hashgraph/green-bond-platform/blob/main/CODE_OF_CONDUCT.md).

## How to Contribute

### Report Bugs

1. Verify that the bug has not been reported before in [Issues](https://github.com/hashgraph/green-bond-platform/issues)
2. If it does not exist, create a new issue using the bug report template
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Node.js, npm, and operating system version
   - Relevant logs

### Suggest Improvements

1. Verify that the improvement has not been suggested before
2. Create an issue using the feature request template
3. Describe:
   - Use case
   - Expected benefits
   - Possible implementation

### Pull Requests

#### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-user/green-bond-platform.git
   cd green-bond-platform
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/hashgraph/green-bond-platform.git
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b feature/my-feature
   ```

#### Development

1. Make your changes
2. Follow the project's ESLint configuration
3. Write tests for your changes
4. Ensure all tests pass:
   ```bash
   npm run test
   ```
5. Format your code:
   ```bash
   npm run format
   ```

#### Submit PR

1. Commit your changes:
   ```bash
   git commit -m "feat: add new feature"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/my-feature
   ```
3. Create a Pull Request on GitHub
4. Wait for review

## Coding Standards

- **TypeScript**: Use strict mode
- **Naming**: Use camelCase for variables, PascalCase for classes
- **Comments**: Document complex logic
- **Testing**: Minimum 80% coverage
- **Commits**: Follow conventional commits

## License

By contributing, you agree that your contributions will be licensed under Apache 2.0.
