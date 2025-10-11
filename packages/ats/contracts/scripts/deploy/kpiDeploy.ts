import { Kpi } from "@contracts/contracts";
import { IResolverProxy } from "@contracts/contracts/Kpi";
import { ProxyAdmin } from "@contracts/index";
import { deployProxy } from "@scripts/proxy/deployProxy";
import { upgradeContract } from "@scripts/proxy/upgradeProxy";
import { ethers } from "hardhat";

export async function deployKpi(
  proxyAdmin: ProxyAdmin,
  rbac: IResolverProxy.RbacStruct[],
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  const kpiLogic = await deployKpiLogic();
  const kpi = (await deployProxy(proxyAdmin, kpiLogic, "Kpi", [rbac])) as unknown as Kpi;

  return { kpi, kpiLogic };
}

export async function deployKpiLogic() {
  const kpiLogic = await (await ethers.getContractFactory("Kpi")).deploy();
  await kpiLogic.deployed();

  return kpiLogic;
}

export async function upgradeKpiProxy(
  proxyAdmin: ProxyAdmin,
  proxyAddress: string,
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  const logic = await deployKpiLogic();
  await upgradeContract(proxyAdmin, proxyAddress, logic);
  return {
    kpi: await ethers.getContractAt("Kpi", proxyAddress),
    kpiLogic: logic,
  };
}
