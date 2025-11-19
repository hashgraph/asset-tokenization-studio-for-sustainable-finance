// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdatePaymentTokenTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Payment token contract id", example: "0.0.44567", required: true })
  @IsNotEmpty()
  paymentTokenContractId: string

  constructor(format: string, accountId: string, paymentTokenContractId: string) {
    super(format, accountId)
    this.paymentTokenContractId = paymentTokenContractId
  }
}
