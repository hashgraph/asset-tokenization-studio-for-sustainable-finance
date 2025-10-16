// SPDX-License-Identifier: Apache-2.0
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface EnvironmentalAssetRepository {
  save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset>

  findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<EnvironmentalAsset | null>

  findByContractId(contractId: string): Promise<EnvironmentalAsset | null>

  findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<EnvironmentalAsset>>

  existsByContractIdAndTreasuryContractId(contractId: string, treasuryContractId: string): Promise<boolean>
}
