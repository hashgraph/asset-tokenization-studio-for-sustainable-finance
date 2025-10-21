// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateOfferingTransactionRequest } from "./model/BuildCreateOfferingTransactionRequest"
import { BuildGrantRoleTransactionRequest } from "./model/BuildGrantRoleTransactionRequest"

export interface TransactionBuilderPort {
  createOffering(request: BuildCreateOfferingTransactionRequest): BuildTransactionResponse
  grantRole(request: BuildGrantRoleTransactionRequest): BuildTransactionResponse
}
