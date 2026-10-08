import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

interface FeatureItem {
  title: string;
  emoji: string;
  description: string;
  link: string;
}

const FeatureList: FeatureItem[] = [
  {
    title: "ATS",
    emoji: "🏦",
    description: "Asset Tokenization Studio for managing tokenized bonds on blockchain",
    link: "/docs/ats/overview",
  },
  {
    title: "Primary Market",
    emoji: "📈",
    description: "Primary market operations and investor subscriptions",
    link: "/docs/primary-market/overview",
  },
  {
    title: "Treasury",
    emoji: "💰",
    description: "Treasury management and financial reporting for bonds",
    link: "/docs/treasury/overview",
  },
  {
    title: "Gateway",
    emoji: "🚪",
    description: "API Gateway for request routing and authentication",
    link: "/docs/gateway/overview",
  },
  {
    title: "Transaction Sender",
    emoji: "📡",
    description: "Service for sending and managing blockchain transactions",
    link: "/docs/transaction-sender/overview",
  },
  {
    title: "Smart Contracts",
    emoji: "📜",
    description: "Solidity contracts for issuance, trading, and lifecycle management",
    link: "/docs/architecture",
  },
];

function Feature({ title, emoji, description, link }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <div className={styles.featureEmoji}>{emoji}</div>
        <Heading as="h3">
          <Link to={link}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Green Bond Platform Documentation - An open-source platform for digitalizing the entire lifecycle of a green bond asset on Hedera Network blockchain"
    >
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
