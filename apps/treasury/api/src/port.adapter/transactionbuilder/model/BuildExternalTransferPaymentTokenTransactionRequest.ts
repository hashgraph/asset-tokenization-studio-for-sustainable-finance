// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, NotEquals, IsNotEmpty } from "class-validator"

export class BuildExternalTransferPaymentTokenTransactionRequest extends BaseBuildTransactionRequest {
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
