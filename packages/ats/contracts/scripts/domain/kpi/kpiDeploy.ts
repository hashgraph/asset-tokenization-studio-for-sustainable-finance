import { Kpi } from "@contracts/contracts";
import { IResolverProxy } from "@contracts/contracts/Kpi";
import { ProxyAdmin } from "@contracts/index";
import {
  configureLogger,
  DeploymentProvider,
  deployProxy,
  LogLevel,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { processAddressableArgs } from "@scripts/utils";

import { ethers } from "hardhat";

export async function deployKpi(
  provider: DeploymentProvider,
  proxyAdmin: ProxyAdmin,
  rbac: IResolverProxy.RbacStruct[],
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  configureLogger({ level: LogLevel.SILENT });
  const kpiLogic = await deployKpiLogic();
  const processedRbac = (await processAddressableArgs(rbac)) as IResolverProxy.RbacStruct[];
  const initData = kpiLogic.interface.encodeFunctionData("initialize", [processedRbac]);

  const result = await deployProxy(provider, {
    implementationContract: "Kpi",
    proxyAdminAddress: proxyAdmin.address,
    initData,
  });
  const kpi = await ethers.getContractAt("Kpi", result.proxy.address);

  return { kpi, kpiLogic };
}

export async function deployKpiLogic() {
  const kpiLogic = await (await ethers.getContractFactory("Kpi")).deploy();
  await kpiLogic.deployed();

  return kpiLogic;
}
