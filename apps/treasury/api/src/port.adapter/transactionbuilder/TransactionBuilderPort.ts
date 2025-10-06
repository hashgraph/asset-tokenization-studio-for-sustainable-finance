// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"

export interface TransactionBuilderPort {
  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse
  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): BuildTransactionResponse
}
