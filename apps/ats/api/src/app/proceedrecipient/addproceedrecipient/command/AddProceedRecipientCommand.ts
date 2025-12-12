// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddProceedRecipientCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  proceedRecipientAddress: string

  @IsString()
  data: string

  constructor(bondContractId: string, proceedRecipientAddress: string, data: string) {
    super()
    this.bondContractId = bondContractId
    this.proceedRecipientAddress = proceedRecipientAddress
    this.data = data
  }
}
