// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateOfferingTransactionRequest } from "./model/BuildCreateOfferingTransactionRequest"
import { BuildGrantRoleTransactionRequest } from "./model/BuildGrantRoleTransactionRequest"
import { BuildSubmitSubscriptionTransactionRequest } from "./model/BuildSubmitSubscriptionTransactionRequest"
import { BuildExecuteOfferingTransactionRequest } from "./model/BuildExecuteOfferingTransactionRequest"
import { BuildCancelOfferingTransactionRequest } from "./model/BuildCancelOfferingTransactionRequest"

export interface TransactionBuilderPort {
  createOffering(request: BuildCreateOfferingTransactionRequest): Promise<BuildTransactionResponse>
  grantRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse>
  submitSubscription(request: BuildSubmitSubscriptionTransactionRequest): Promise<BuildTransactionResponse>
  executeOffering(request: BuildExecuteOfferingTransactionRequest): Promise<BuildTransactionResponse>
  cancelOffering(request: BuildCancelOfferingTransactionRequest): Promise<BuildTransactionResponse>
}
