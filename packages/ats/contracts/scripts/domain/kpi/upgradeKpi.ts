import { ProxyAdmin, Kpi } from "@contracts";

import { ethers } from "hardhat";
import { deployKpiLogic } from "./kpiDeploy";
import { DeploymentProvider, upgradeProxy } from "@hashgraph/asset-tokenization-contracts/scripts";

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
