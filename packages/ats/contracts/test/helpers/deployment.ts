// SPDX-License-Identifier: Apache-2.0

import { ContractReceipt } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { IFactorySuite, MockTreasuryFacet } from "@contract-types";
import { MockTreasuryFacet__factory } from "@contract-types";
import type { IFactory } from "@contract-types";

/**
 * Deploys a bond suite and extracts contract addresses from the BondSuiteDeployed event.
 *
 * This helper function encapsulates the common pattern of:
 * 1. Deploying a bond suite via FactorySuite.deployBondSuite()
 * 2. Extracting addresses from the BondSuiteDeployed event
 * 3. Instantiating the Treasury contract for assertions
 *
 * Use this helper to reduce duplication when testing bond suite deployments with varying parameters.
 *
 * @param factorySuite FactorySuite proxy contract instance
 * @param signer Signer to execute the deployment transaction
 * @param factoryAddress ATS Bond Factory contract address
 * @param bondData Bond configuration data
 * @param regulationData Factory regulation data for compliance
 * @param treasuryData Treasury configuration data
 * @param kpiData KPI configuration data
 * @returns Object containing deployed contract addresses, Treasury instance, and transaction receipt
 * @throws Error if BondSuiteDeployed event is not found in transaction receipt
 *
 * @example
 * ```typescript
 * const { bondAddress, treasury } = await deployBondSuiteAndExtractContracts(
 *   factorySuite,
 *   admin,
 *   mockAtsFactory.address,
 *   validBondData,
 *   validFactoryRegulationData,
 *   validTreasuryData,
 *   validKpiData
 * );
 *
 * expect(await treasury.bondAddress()).to.equal(bondAddress);
 * ```
 */
export async function deployBondSuiteAndExtractContracts(
  factorySuite: IFactorySuite,
  signer: SignerWithAddress,
  factoryAddress: string,
  bondData: IFactory.BondDataStruct,
  regulationData: any,
  treasuryData: any,
  kpiData: any,
): Promise<{
  bondAddress: string;
  treasuryAddress: string;
  kpiAddress: string;
  treasury: MockTreasuryFacet;
  receipt: ContractReceipt;
}> {
  const tx = await factorySuite
    .connect(signer)
    .deployBondSuite(factoryAddress, bondData, regulationData, treasuryData, kpiData);

  const receipt = await tx.wait();

  const event = receipt.events?.find((e) => e.event === "BondSuiteDeployed");
  if (!event || !event.args) {
    throw new Error("BondSuiteDeployed event not found in transaction receipt");
  }

  const bondAddress = event.args[1];
  const treasuryAddress = event.args[2];
  const kpiAddress = event.args[3];

  const treasury = MockTreasuryFacet__factory.connect(treasuryAddress, signer);

  return {
    bondAddress,
    treasuryAddress,
    kpiAddress,
    treasury,
    receipt,
  };
}
