// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetTransactionRequest } from "./model/RemoveEnvironmentalAssetTransactionRequest"

export interface RemoveEnvironmentalAssetTransactionPort {
  removeEnvironmentalAsset(
    treasuryId: string,
    assetId: string,
    request: RemoveEnvironmentalAssetTransactionRequest,
  ): TransactionResponse
}
