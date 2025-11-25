// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionBuilderPort, BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateOfferingTransactionRequest } from "./model/BuildCreateOfferingTransactionRequest"
import { BuildSubmitSubscriptionTransactionRequest } from "./model/BuildSubmitSubscriptionTransactionRequest"
import { BuildExecuteOfferingTransactionRequest } from "./model/BuildExecuteOfferingTransactionRequest"
import { BuildCancelOfferingTransactionRequest } from "./model/BuildCancelOfferingTransactionRequest"
import { BuildCancelSubscriptionTransactionRequest } from "./model/BuildCancelSubscriptionTransactionRequest"
import { BuildDeployPrimaryMarketTransactionRequest } from "./model/BuildDeployPrimaryMarketTransactionRequest"

export interface TransactionBuilderPort extends BaseTransactionBuilderPort {
  createOffering(request: BuildCreateOfferingTransactionRequest): Promise<BuildTransactionResponse>
  submitSubscription(request: BuildSubmitSubscriptionTransactionRequest): Promise<BuildTransactionResponse>
  cancelSubscription(request: BuildCancelSubscriptionTransactionRequest): Promise<BuildTransactionResponse>
  executeOffering(request: BuildExecuteOfferingTransactionRequest): Promise<BuildTransactionResponse>
  cancelOffering(request: BuildCancelOfferingTransactionRequest): Promise<BuildTransactionResponse>
  deployPrimaryMarket(request: BuildDeployPrimaryMarketTransactionRequest): Promise<BuildTransactionResponse>
}
