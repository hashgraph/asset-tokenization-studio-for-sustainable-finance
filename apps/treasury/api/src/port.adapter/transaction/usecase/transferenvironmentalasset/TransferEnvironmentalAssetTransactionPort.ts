// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { TransferEnvironmentalAssetTransactionRequest } from "./model/TransferEnvironmentalAssetTransactionRequest"

export interface TransferEnvironmentalAssetTransactionPort {
  transferEnvironmentalAsset(
    treasuryContractId: string,
    assetContractId: string,
    request: TransferEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse>
}
