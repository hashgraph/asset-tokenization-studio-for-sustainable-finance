import { Kpi, Kpi__factory, IResolverProxy, ProxyAdmin } from "@contract-types";
import { configureLogger, deployProxy, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { processAddressableArgs } from "@scripts";
import { Signer } from "ethers";

/**
 * Deploy KPI contract with proxy pattern.
 *
 * @param signer - Ethers.js signer
 * @param proxyAdmin - ProxyAdmin contract for upgrade control
 * @param rbac - Role-based access control configuration
 * @returns Promise resolving to KPI proxy and implementation contracts
 */
export async function deployKpi(
  signer: Signer,
  proxyAdmin: ProxyAdmin,
  rbac: IResolverProxy.RbacStruct[],
): Promise<{
  kpi: Kpi;
  kpiLogic: Kpi;
}> {
  configureLogger({ level: LogLevel.SILENT });
  const kpiLogic = await deployKpiLogic(signer);
  const processedRbac = (await processAddressableArgs(rbac)) as IResolverProxy.RbacStruct[];
  const initData = kpiLogic.interface.encodeFunctionData("initialize", [processedRbac]);

  const kpiFactory = new Kpi__factory(signer);
  const result = await deployProxy(signer, {
    implementationFactory: kpiFactory,
    proxyAdminAddress: proxyAdmin.address,
    initData,
  });

  const kpi = Kpi__factory.connect(result.proxyAddress, signer);

  return { kpi, kpiLogic };
}

/**
 * Deploy KPI implementation contract (logic).
 *
 * @param signer - Ethers.js signer
 * @returns Promise resolving to deployed KPI implementation
 */
export async function deployKpiLogic(signer: Signer): Promise<Kpi> {
  const kpiFactory = new Kpi__factory(signer);
  const kpiLogic = await kpiFactory.deploy();
  await kpiLogic.deployed();

  return kpiLogic;
}
