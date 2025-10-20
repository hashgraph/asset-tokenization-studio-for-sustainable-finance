// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class UpdatePaymentTokenTransactionRequest extends BaseTransactionRequest {
  @IsNotEmpty()
  paymentTokenContractId: string

  constructor(format: string, accountId: string, paymentTokenContractId: string) {
    super(format, accountId)
    this.paymentTokenContractId = paymentTokenContractId
  }
}
