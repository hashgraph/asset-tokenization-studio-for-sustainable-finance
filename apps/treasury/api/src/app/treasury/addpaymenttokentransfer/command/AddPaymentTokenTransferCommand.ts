// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddPaymentTokenTransferCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  recipientAccountId: string

  @IsNotEmpty()
  amount: bigint

  constructor(treasuryContractId: string, recipientAccountId: string, amount: bigint) {
    super()
    this.treasuryContractId = treasuryContractId
    this.recipientAccountId = recipientAccountId
    this.amount = amount
  }
}
