import { ProxyAdmin, Kpi, Kpi__factory } from "@contract-types";
import { deployKpiLogic } from "./kpiDeploy";
import { upgradeProxy } from "@hashgraph/asset-tokenization-contracts/scripts";
import { Signer } from "ethers";

/**
 * Upgrade KPI proxy to new implementation.
 *
 * @param signer - Ethers.js signer
 * @param proxyAdmin - ProxyAdmin contract with upgrade permissions
 * @param proxyAddress - Address of KPI proxy to upgrade
 * @returns Promise resolving to upgraded KPI proxy and new implementation
 */
export async function upgradeKpiProxy(
  signer: Signer,
  proxyAdmin: ProxyAdmin,
  proxyAddress: string,
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  const logic = await deployKpiLogic(signer);
  await upgradeProxy(proxyAdmin, {
    proxyAddress: proxyAddress,
    newImplementationAddress: logic.address,
  });

  const kpi = Kpi__factory.connect(proxyAddress, signer);

  return {
    kpi,
    kpiLogic: logic,
  };
}
