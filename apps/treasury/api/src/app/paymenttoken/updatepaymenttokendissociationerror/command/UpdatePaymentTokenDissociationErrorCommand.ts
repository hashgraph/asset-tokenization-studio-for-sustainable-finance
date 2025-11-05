// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class UpdatePaymentTokenDissociationErrorCommand extends Command<void> {
  @IsNotEmpty()
  treasuryContractId: string

  @IsNotEmpty()
  paymentTokenContractId: string

  constructor(treasuryContractId: string, paymentTokenContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
  }
}
