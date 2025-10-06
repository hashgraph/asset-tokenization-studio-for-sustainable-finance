// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetTransactionRequest } from "./model/AddEnvironmentalAssetTransactionRequest"

export interface AddEnvironmentalAssetTransactionPort {
  addEnvironmentalAsset(
    treasuryId: string,
    assetId: string,
    request: AddEnvironmentalAssetTransactionRequest,
  ): TransactionResponse
}
