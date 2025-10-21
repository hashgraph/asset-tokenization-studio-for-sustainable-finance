import { ProxyAdmin, Kpi } from "@contracts";

import { ethers } from "hardhat";
import { deployKpiLogic } from "./kpiDeploy";
import { DeploymentProvider, upgradeProxy } from "@hashgraph/asset-tokenization-contracts/scripts";

/**
 * Upgrade KPI proxy to new implementation.
 *
 * @param provider - Deployment provider
 * @param proxyAdmin - ProxyAdmin contract with upgrade permissions
 * @param proxyAddress - Address of KPI proxy to upgrade
 * @returns Promise resolving to upgraded KPI proxy and new implementation
 */
export async function upgradeKpiProxy(
  provider: DeploymentProvider,
  proxyAdmin: ProxyAdmin,
  proxyAddress: string,
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  const logic = await deployKpiLogic();
  await upgradeProxy(provider, {
    proxyAddress: proxyAddress,
    newImplementationAddress: logic.address,
    proxyAdminAddress: proxyAdmin.address,
  });

  return {
    kpi: await ethers.getContractAt("Kpi", proxyAddress),
    kpiLogic: logic,
  };
}
