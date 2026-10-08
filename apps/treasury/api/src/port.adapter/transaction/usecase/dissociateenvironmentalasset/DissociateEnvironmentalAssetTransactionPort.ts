// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociateEnvironmentalAssetTransactionRequest } from "./model/DissociateEnvironmentalAssetTransactionRequest"

export interface DissociateEnvironmentalAssetTransactionPort {
  dissociateEnvironmentalAsset(
    treasuryContractId: string,
    assetContractId: string,
    request: DissociateEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse>
}
