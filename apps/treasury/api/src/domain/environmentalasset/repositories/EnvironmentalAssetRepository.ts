// SPDX-License-Identifier: Apache-2.0
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset, transactionId?: string): Promise<EnvironmentalAsset>

  findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<EnvironmentalAsset | null>

  findByContractId(contractId: string): Promise<EnvironmentalAsset | null>

  findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<EnvironmentalAsset>>

  existsByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
    removed?: boolean,
  ): Promise<boolean>

  findByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<EnvironmentalAsset | null>

  findAllRemovedByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<EnvironmentalAsset[]>
}
