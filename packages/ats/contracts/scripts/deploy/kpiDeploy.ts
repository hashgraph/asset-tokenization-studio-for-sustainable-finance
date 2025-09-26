import { KPI } from '@contracts/contracts';
import { ProxyAdmin } from '@contracts/index';
import { deployProxy } from '@scripts/proxy/deployProxy';
import { upgradeContract } from '@scripts/proxy/upgradeProxy';
import { ethers } from 'hardhat';

export async function deployKPI(proxyAdmin: ProxyAdmin): Promise<{
  kpi: KPI;
  kpiLogic: KPI;
}> {
  const kpiLogic = await deployKpiLogic();
  const kpi = (await deployProxy(
    proxyAdmin,
    kpiLogic,
    'KPI',
    [],
  )) as unknown as KPI;

  return { kpi, kpiLogic };
}

export async function deployKpiLogic() {
  const kpiLogic = await (await ethers.getContractFactory('KPI')).deploy();
  await kpiLogic.deployed();

  return kpiLogic;
}

export async function upgradeKPIProxy(
  proxyAdmin: ProxyAdmin,
  proxyAddress: string,
): Promise<{
  kpi: KPI;
  kpiLogic: KPI;
}> {
  const logic = await deployKpiLogic();
  await upgradeContract(proxyAdmin, proxyAddress, logic);
  return {
    kpi: await ethers.getContractAt('KPI', proxyAddress),
    kpiLogic: logic,
  };
}
