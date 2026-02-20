import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: "category",
      label: "🚀 Getting Started",
      collapsed: false,
      items: [
        "intro",
        "quick-start",
        "getting-started",
        "prerequisites",
        "installation",
        "configuration",
        "running-locally",
      ],
    },
    {
      type: "category",
      label: "🏗️ Platform Overview",
      collapsed: false,
      items: ["architecture"],
    },
    {
      type: "category",
      label: "📦 Asset Tokenization (ATS)",
      collapsed: true,
      items: ["ats/overview", "ats/installation", "ats/how-it-works", "ats/api-guide", "ats/smart-contracts"],
    },
    {
      type: "category",
      label: "💰 Primary Market",
      collapsed: true,
      items: [
        "primary-market/overview",
        "primary-market/installation",
        "primary-market/how-it-works",
        "primary-market/api-guide",
        "primary-market/smart-contracts",
      ],
    },
    {
      type: "category",
      label: "🏦 Treasury",
      collapsed: true,
      items: [
        "treasury/overview",
        "treasury/installation",
        "treasury/how-it-works",
        "treasury/api-guide",
        "treasury/smart-contracts",
      ],
    },
    {
      type: "category",
      label: "🌐 API Gateway",
      collapsed: true,
      items: ["gateway/overview", "gateway/installation", "gateway/how-it-works", "gateway/api-guide"],
    },
    {
      type: "category",
      label: "📤 Transaction Sender",
      collapsed: true,
      items: [
        "transaction-sender/overview",
        "transaction-sender/installation",
        "transaction-sender/how-it-works",
        "transaction-sender/api-guide",
      ],
    },
    {
      type: "category",
      label: "👨‍💻 Development",
      collapsed: true,
      items: ["development/testing", "development/deployment", "development/contributing"],
    },
  ],
};

export default sidebars;
