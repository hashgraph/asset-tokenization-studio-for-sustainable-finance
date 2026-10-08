// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class ExternalTransferPaymentTokenTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  treasuryContractId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, contractId: string, treasuryContractId: string, amount: string) {
    super(format, accountId, contractId)
    this.treasuryContractId = treasuryContractId
    this.amount = amount
    this.accountId = accountId
  }
}
