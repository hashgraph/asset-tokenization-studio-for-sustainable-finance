// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class DissociatePaymentTokenTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly paymentTokenContractId: string

  constructor(paymentTokenContractId: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.paymentTokenContractId = paymentTokenContractId
  }
}
