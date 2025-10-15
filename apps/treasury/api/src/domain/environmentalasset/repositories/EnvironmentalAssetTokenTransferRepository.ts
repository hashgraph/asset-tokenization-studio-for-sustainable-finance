// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetTokenTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTokenTransfer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface EnvironmentalAssetTokenTransferRepository {
  save(transfer: EnvironmentalAssetTokenTransfer): Promise<EnvironmentalAssetTokenTransfer>
  findById(id: string): Promise<EnvironmentalAssetTokenTransfer | null>
  findByEnvironmentalAssetTokenId(
    environmentalAssetTokenId: string,
    options: PageOptions,
  ): Promise<Page<EnvironmentalAssetTokenTransfer>>
  findByAccountId(accountId: string, options: PageOptions): Promise<Page<EnvironmentalAssetTokenTransfer>>
}
