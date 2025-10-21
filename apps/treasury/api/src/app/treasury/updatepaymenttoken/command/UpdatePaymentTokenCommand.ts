// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class UpdatePaymentTokenCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  paymentTokenContractId: string

  constructor(treasuryContractId: string, paymentTokenContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
  }
}
