# Green Bond Platform Documentation

This folder contains the complete documentation for the Green Bond Platform, built with [Docusaurus](https://docusaurus.io/).

## 📚 Documentation Structure

```
docs/
├── docs/                           # Documentation content
│   ├── intro.md                    # Main introduction & overview
│   ├── quick-start.md              # ⚡ 10-minute quick setup
│   ├── getting-started.md          # Complete step-by-step guide
│   ├── prerequisites.md            # Required software & accounts
│   ├── installation.md             # Installation & troubleshooting
│   ├── configuration.md            # Environment configuration
│   ├── running-locally.md          # Running & testing locally
│   ├── architecture.md             # System architecture
│   ├── ats/                        # Asset Tokenization Studio docs
│   ├── primary-market/             # Primary Market docs
│   ├── treasury/                   # Treasury docs
│   ├── gateway/                    # Gateway docs
│   ├── transaction-sender/         # Transaction Sender docs
│   └── development/                # Development guides
├── src/                            # Docusaurus theme & components
├── static/                         # Static assets (images, etc.)
├── docusaurus.config.ts            # Docusaurus configuration
├── sidebars.ts                     # Sidebar navigation structure
└── package.json                    # Dependencies
```

## Documentation Paths

### For First-Time Users

**Complete Setup Path** (30-45 minutes):

1. [intro.md](docs/intro.md) - Understand the platform
2. [prerequisites.md](docs/prerequisites.md) - Install required software
3. [getting-started.md](docs/getting-started.md) - Full setup guide
4. [running-locally.md](docs/running-locally.md) - Run and test

**Quick Setup Path** (10 minutes):

1. [quick-start.md](docs/quick-start.md) - Fast-track for experienced devs

### For Business Stakeholders

1. [intro.md](docs/intro.md) - What are green bonds & why blockchain?
2. [architecture.md](docs/architecture.md) - System design overview
3. Component overviews:
   - [ats/overview](docs/ats/overview.md)
   - [primary-market/overview](docs/primary-market/overview.md)
   - [treasury/overview](docs/treasury/overview.md)

### For Developers

1. [getting-started.md](docs/getting-started.md) - Setup environment
2. [running-locally.md](docs/running-locally.md) - Development workflow
3. [development/testing.md](docs/development/testing.md) - Testing guide
4. [development/contributing.md](docs/development/contributing.md) - Contribution guide

### For DevOps Engineers

1. [prerequisites.md](docs/prerequisites.md) - Infrastructure requirements
2. [installation.md](docs/installation.md) - Installation & troubleshooting
3. [configuration.md](docs/configuration.md) - Environment variables
4. [development/deployment.md](docs/development/deployment.md) - Deployment guide

## Running Documentation Locally

### Development Mode

Start the documentation server with hot-reload:

```bash
# From root directory
npm run docs

# Or from docs directory
cd docs
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

Build static site:

```bash
# From root directory
npm run docs:build

# Or from docs directory
cd docs
npm run build
```

Output will be in `docs/build/`

### Serve Production Build

Test the production build locally:

```bash
# From root directory
npm run docs:serve

# Or from docs directory
cd docs
npm run serve
```

### Clear Cache

If you have build issues:

```bash
# From root directory
npm run docs:clear

# Or from docs directory
cd docs
npm run clear
```

## Contributing to Documentation

### Adding a New Page

1. **Create the markdown file**:

   ```bash
   touch docs/docs/your-new-page.md
   ```

2. **Add frontmatter**:

   ```markdown
   ---
   sidebar_position: 10
   ---

   # Your Page Title

   Content goes here...
   ```

3. **Add to sidebar** in `sidebars.ts`:
   ```typescript
   items: [
     "your-new-page",
     // ...
   ];
   ```

### Editing Existing Pages

1. Find the page in `docs/docs/`
2. Edit the markdown file
3. Save and the dev server will auto-reload

### Adding Images

1. Place image in `docs/static/img/`
2. Reference in markdown:
   ```markdown
   ![Alt text](/img/your-image.png)
   ```

### Code Blocks

Use syntax highlighting:

````markdown
```typescript
const example = "code";
```
````

Supported languages: `typescript`, `javascript`, `bash`, `json`, `solidity`, `sql`, etc.

### Admonitions (Callouts)

```markdown
:::tip
This is a helpful tip!
:::

:::warning
This is a warning!
:::

:::danger
This is dangerous!
:::

:::info
This is informational!
:::

:::note
This is a note!
:::
```

### Links

**Internal links** (to other docs):

```markdown
[Link text](./other-page.md)
[Link text](../category/page.md)
```

**External links**:

```markdown
[Link text](https://example.com)
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

## Documentation Standards

### File Naming

- Use kebab-case: `getting-started.md`, `quick-start.md`
- Be descriptive: `smart-contracts.md` not `sc.md`
- Use `.md` extension

### Frontmatter

Always include:

```yaml
---
sidebar_position: 5
---
```

Optional:

```yaml
---
sidebar_position: 5
title: Custom Title
description: Page description for SEO
keywords: [green bonds, blockchain, hedera]
---
```

### Writing Style

- **Use clear, concise language**
- **Write in present tense**: "The service runs" not "The service will run"
- **Use second person**: "You can configure" not "We can configure"
- **Be specific**: Include exact commands, file paths, expected outputs
- **Include examples**: Show, don't just tell
- **Add context**: Explain why, not just how
- **Use headers**: Break content into scannable sections
- **Format code**: Always use code blocks with syntax highlighting

### Code Examples

**Good**: Specific, runnable commands

```bash
npm run ats:api:start:dev
```

**Bad**: Vague instructions

```
Start the ATS API
```

**Good**: Expected output

```bash
npm run api:test
# Expected output:
# PASS  src/app.test.ts
#  ✓ should create app (5 ms)
```

**Bad**: No context

```bash
npm run api:test
```

## Documentation Review Checklist

Before submitting documentation changes:

- [ ] Content is accurate and tested
- [ ] Code examples work correctly
- [ ] Links are not broken
- [ ] Images load properly
- [ ] Spelling and grammar checked
- [ ] Frontmatter includes `sidebar_position`
- [ ] Added to `sidebars.ts` if new page
- [ ] Builds without errors (`npm run docs:build`)
- [ ] Renders correctly in dev mode
- [ ] Mobile-friendly (test responsive design)

## Documentation Statistics

Current documentation includes:

- **Main pages**: 7 (intro, quick-start, getting-started, prerequisites, installation, configuration, running-locally)
- **Component guides**: 5 (ATS, Primary Market, Treasury, Gateway, Transaction Sender)
- **Development guides**: 3 (testing, deployment, contributing)
- **Total pages**: 30+
- **Code examples**: 100+
- **Troubleshooting solutions**: 50+

## Reporting Documentation Issues

Found a problem in the docs?

1. **Check existing issues**: [GitHub Issues](https://github.com/hashgraph/green-bond-platform/issues)
2. **Create new issue**: Use the "Documentation" label
3. **Include**:
   - Page URL or file path
   - Description of the issue
   - Suggested fix (if you have one)

## Additional Resources

### Docusaurus Documentation

- [Docusaurus Docs](https://docusaurus.io/docs)
- [Markdown Features](https://docusaurus.io/docs/markdown-features)
- [Diagrams with Mermaid](https://docusaurus.io/docs/markdown-features/diagrams)

### Writing Guides

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/)

### Markdown

- [Markdown Guide](https://www.markdownguide.org/)
- [CommonMark Spec](https://commonmark.org/)

## Customization

### Theme Colors

Edit in `docusaurus.config.ts`:

```typescript
themeConfig: {
  colorMode: {
    defaultMode: 'light',
    disableSwitch: false,
  },
}
```

### Logo

Replace files in `static/img/`:

- `logo.svg` - Main logo
- `favicon.ico` - Browser favicon

### Footer

Edit in `docusaurus.config.ts`:

```typescript
footer: {
  // ... configuration
}
```

## License

Documentation is licensed under Apache 2.0, same as the project.

## Get Help

- **Docusaurus Issues**: [Docusaurus GitHub](https://github.com/facebook/docusaurus/issues)
- **Platform Issues**: [Green Bond Platform Issues](https://github.com/hashgraph/green-bond-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hashgraph/green-bond-platform/discussions)
