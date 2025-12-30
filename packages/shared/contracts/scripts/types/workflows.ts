// SPDX-License-Identifier: Apache-2.0

/** GBP workflow types extending ATS workflows. */

import type { WorkflowType as ATSWorkflowType } from "@hashgraph/asset-tokenization-contracts/scripts";
import type { DeploymentWithExistingBlrOutput } from "@hashgraph/asset-tokenization-contracts/scripts";
import type { DeployFactorySuiteOutput } from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import type { DeployTreasuryOutput } from "@hashgraph/green-bonds-platform-treasury-contracts/scripts";
import type { DeployFactoryPrimaryMarketOutput } from "@hashgraph/green-bonds-platform-primarymarket-contracts/scripts";

/** Callable contract metadata in GBP deployment output. */
export interface CallableContract {
  description: string;
  address: string;
  contractId?: string;
  proxyType?: string;
  implementation?: {
    address: string;
    contractId?: string;
  };
  resolver?: {
    address: string;
    contractId?: string;
  };
}

/** GBP-specific workflow types extending ATS workflows. */
export type GbpWorkflowType = ATSWorkflowType | "gbpInfrastructure" | "gbpUpgrade";

/** GBP infrastructure deployment output from deployGbpInfrastructure workflow. */
export interface GbpInfrastructureOutput {
  /** Deployment timestamp (ISO 8601) */
  timestamp: string;
  /** Network identifier */
  network: string;
  /** User-facing callable contract addresses and metadata */
  callableContracts: {
    proxyAdmin: {
      description: string;
      address: string;
      contractId?: string;
    };
    businessLogicResolver: {
      description: string;
      address: string;
      contractId?: string;
      proxyType: string;
      implementation: {
        address: string;
        contractId?: string;
      };
    };
    atsFactory: {
      description: string;
      address: string;
      contractId?: string;
      proxyType: string;
      implementation: {
        address: string;
        contractId?: string;
      };
    };
    factorySuite?: {
      description: string;
      address: string;
      contractId?: string;
      proxyType: string;
      resolver: {
        address: string;
        contractId?: string;
      };
    };
    primaryMarketFactory?: {
      description: string;
      address: string;
      contractId?: string;
      proxyType: string;
      resolver: {
        address: string;
        contractId?: string;
      };
    };
  };
  /** Complete deployment result with all domain outputs */
  result: {
    proxyAdmin: string;
    blr: string;
    blrImplementationAddress: string;
    bondDeployment: DeploymentWithExistingBlrOutput;
    treasuryDeployment: DeployTreasuryOutput;
    factorySuiteDeployment: DeployFactorySuiteOutput;
    primaryMarketDeployment: DeployFactoryPrimaryMarketOutput;
  };
}

/** GBP configuration upgrade output from upgradeGbpConfigurations workflow. */
export interface GbpUpgradeOutput {
  /** Network identifier */
  network: string;
  /** Upgrade timestamp (ISO 8601) */
  timestamp: string;
  /** Deployer address */
  deployer: string;
  /** BLR configuration */
  blr: {
    address: string;
    isExternal: boolean;
  };
  /** Per-domain upgrade results */
  domainResults: Array<{
    domain: string;
    success: boolean;
    version?: number;
    configId?: string;
    facetsDeployed?: number;
    proxiesUpdated?: number;
    proxiesFailed?: number;
    upgradeTime?: number;
    error?: string;
  }>;
  /** Aggregated upgrade summary */
  summary: {
    totalDomains: number;
    successfulUpgrades: number;
    failedUpgrades: number;
    totalFacetsDeployed: number;
    totalProxiesUpdated: number;
    totalProxiesFailed: number;
    totalUpgradeTime: number;
    allSuccess: boolean;
  };
}
