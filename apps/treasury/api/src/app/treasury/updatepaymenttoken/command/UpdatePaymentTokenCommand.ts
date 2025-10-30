// SPDX-License-Identifier: Apache-2.0

import { IsDefined, IsInt, IsNotEmpty, IsString, Min } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class UpdatePaymentTokenCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  paymentTokenContractId: string

  @IsInt()
  @IsDefined()
  @Min(0)
  dissociationError: number

  constructor(treasuryContractId: string, paymentTokenContractId: string, dissociationError: number) {
    super()
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
    this.dissociationError = dissociationError
  }
}
