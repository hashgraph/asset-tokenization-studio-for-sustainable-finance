// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { TransferType } from "@domain/shared/model/TransferType"

export interface EnvironmentalAssetTransferRepository {
  save(transfer: EnvironmentalAssetTransfer): Promise<EnvironmentalAssetTransfer>

  findByEnvironmentalAssetId(
    environmentalAssetId: string,
    options: PageOptions,
    type?: TransferType,
  ): Promise<Page<EnvironmentalAssetTransfer>>
}
