// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface EnvironmentalAssetTokenTransferRepository {
  save(transfer: EnvironmentalAssetTransfer): Promise<EnvironmentalAssetTransfer>

  findByEnvironmentalAssetId(
    environmentalAssetId: string,
    options: PageOptions,
  ): Promise<Page<EnvironmentalAssetTransfer>>
}
