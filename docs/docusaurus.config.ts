import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Green Bond Platform",
  tagline: "Open-source platform for digitalizing green bond lifecycles on Hedera blockchain",
  favicon: "img/favicon.ico",

  url: "https://hashgraph.github.io",
  baseUrl: "/green-bond-platform/",

  organizationName: "hashgraph",
  projectName: "green-bond-platform",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    {
      tagName: "meta",
      attributes: {
        name: "keywords",
        content:
          "green bonds, blockchain, hedera, sustainability, tokenization, DeFi, smart contracts, NestJS, TypeScript",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "description",
        content:
          "Production-ready platform for managing green bond assets on Hedera blockchain with tokenization, primary market, treasury, and environmental impact tracking.",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:type",
        content: "website",
      },
    },
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/hashgraph/green-bond-platform/tree/main/docs/",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: "/docs",
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
      },
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    metadata: [
      {
        name: "keywords",
        content: "green bonds, blockchain, hedera, sustainability, tokenization, environmental finance",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    navbar: {
      title: "Green Bond Platform",
      logo: {
        alt: "Green Bond Platform Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://github.com/hashgraph/green-bond-platform",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
            {
              label: "Quick Start",
              to: "/docs/quick-start",
            },
            {
              label: "Architecture",
              to: "/docs/architecture",
            },
            {
              label: "Installation",
              to: "/docs/installation",
            },
          ],
        },
        {
          title: "Components",
          items: [
            {
              label: "Asset Tokenization (ATS)",
              to: "/docs/ats/overview",
            },
            {
              label: "Primary Market",
              to: "/docs/primary-market/overview",
            },
            {
              label: "Treasury",
              to: "/docs/treasury/overview",
            },
            {
              label: "API Gateway",
              to: "/docs/gateway/overview",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Hedera",
              href: "https://hedera.com",
            },
            {
              label: "Discord",
              href: "https://hedera.com/discord",
            },
            {
              label: "Portal",
              href: "https://portal.hedera.com",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/hashgraph/green-bond-platform",
            },
            {
              label: "Contributing",
              to: "/docs/development/contributing",
            },
            {
              label: "License",
              href: "https://github.com/hashgraph/green-bond-platform/blob/main/LICENSE",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hedera Hashgraph, LLC. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["solidity", "bash", "json", "typescript", "javascript", "docker"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
