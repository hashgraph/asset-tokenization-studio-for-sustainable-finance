// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class RemoveProceedRecipientCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  proceedRecipientAddress: string

  constructor(bondContractId: string, proceedRecipientAddress: string) {
    super()
    this.bondContractId = bondContractId
    this.proceedRecipientAddress = proceedRecipientAddress
  }
}
