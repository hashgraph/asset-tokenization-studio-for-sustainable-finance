// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetTransactionRequest } from "./model/RemoveEnvironmentalAssetTransactionRequest"

export interface RemoveEnvironmentalAssetTransactionPort {
  removeEnvironmentalAsset(
    treasuryContractId: string,
    assetContractId: string,
    request: RemoveEnvironmentalAssetTransactionRequest,
  ): TransactionResponse
}
